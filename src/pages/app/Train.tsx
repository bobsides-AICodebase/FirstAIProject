import { Link, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import { Recorder, type RecorderResult } from '../../components/audio/Recorder'
import type { Scenario, RepFeedback } from '../../types/rep'

const BUCKET = 'rep-audio'
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 60_000

function extensionFromMime(mimeType: string): string {
  const base = mimeType.split(';')[0].trim().toLowerCase()
  if (base === 'audio/webm') return 'webm'
  if (base === 'audio/mp4' || base === 'audio/m4a') return 'mp4'
  return 'webm'
}

export function Train() {
  const [searchParams] = useSearchParams()
  const scenarioFromQuery = searchParams.get('scenario')
  const { user, session } = useAuth()
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'feedback' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [currentRepId, setCurrentRepId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<RepFeedback | null>(null)
  const [moreTipsOpen, setMoreTipsOpen] = useState(false)
  const [previousFocus, setPreviousFocus] = useState<string | null>(null)
  const [reminderLoading, setReminderLoading] = useState(false)
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-recording reminder: primary improvement focus from latest rep with transcript_focus (read-only, non-blocking)
  useEffect(() => {
    if (!selectedScenarioId || !user) {
      setPreviousFocus(null)
      setReminderLoading(false)
      return
    }
    let cancelled = false
    setReminderLoading(true)
    async function loadReminder() {
      try {
        const { data: reps } = await supabase
          .from('reps')
          .select('id')
          .eq('user_id', user.id)
          .eq('scenario_id', selectedScenarioId)
          .eq('status', 'ready')
          .order('created_at', { ascending: false })
          .limit(5)
        if (cancelled) return
        if (!reps?.length) {
          if (!cancelled) {
            setPreviousFocus(null)
            setReminderLoading(false)
          }
          return
        }
        for (const rep of reps) {
          const { data: fb } = await supabase
            .from('rep_feedback')
            .select('raw')
            .eq('rep_id', rep.id)
            .single()
          if (cancelled) return
          const raw = fb?.raw as { transcript_focus?: { primary_focus?: string } } | null | undefined
          const primaryFocus = raw?.transcript_focus?.primary_focus?.trim()
          if (primaryFocus) {
            if (!cancelled) {
              setPreviousFocus(primaryFocus)
              setReminderLoading(false)
            }
            return
          }
        }
        if (!cancelled) {
          setPreviousFocus(null)
          setReminderLoading(false)
        }
      } catch {
        if (!cancelled) {
          setPreviousFocus(null)
          setReminderLoading(false)
        }
      }
    }
    loadReminder()
    return () => {
      cancelled = true
    }
  }, [selectedScenarioId, user])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error: e } = await supabase
        .from('scenarios')
        .select('id, slug, title, prompt, created_at')
        .order('slug')
      if (cancelled) return
      if (e) {
        setError(e.message)
        setScenarios([])
      } else {
        const list = (data as Scenario[]) ?? []
        setScenarios(list)
        if (list.length > 0) {
          const fromQuery = scenarioFromQuery && list.some((s) => s.id === scenarioFromQuery) ? scenarioFromQuery : null
          setSelectedScenarioId((prev) => fromQuery ?? (prev || list[0].id))
        }
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [scenarioFromQuery])

  const onResult = useCallback(
    async (result: RecorderResult) => {
      if (!user || !selectedScenarioId) return
      setStatus('uploading')
      setStatusMessage('Creating rep…')
      try {
        const { data: rep, error: insertErr } = await supabase
          .from('reps')
          .insert({
            user_id: user.id,
            scenario_id: selectedScenarioId,
            status: 'uploading',
          })
          .select('id')
          .single()

        if (insertErr) {
          setStatus('error')
          setStatusMessage(insertErr.message)
          return
        }
        if (!rep) {
          setStatus('error')
          setStatusMessage('No rep returned')
          return
        }

        setStatusMessage('Uploading audio…')
        const ext = extensionFromMime(result.mimeType)
        const path = `${user.id}/${rep.id}.${ext}`

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, result.blob, { contentType: result.mimeType, upsert: true })

        if (uploadErr) {
          setStatus('error')
          setStatusMessage(uploadErr.message)
          return
        }

        setStatusMessage('Finalizing…')
        const { error: updateErr } = await supabase
          .from('reps')
          .update({
            audio_path: path,
            duration_secs: result.durationSecs,
            status: 'processing',
          })
          .eq('id', rep.id)

        if (updateErr) {
          setStatus('error')
          setStatusMessage(updateErr.message)
          return
        }

        setStatus('processing')
        setStatusMessage('Calling AI…')
        setFeedback(null)
        setCurrentRepId(rep.id)

        const accessToken = session?.access_token
        if (!accessToken) {
          setStatus('error')
          setStatusMessage('Not signed in. Refresh the page and try again.')
          setCurrentRepId(null)
          return
        }
        const { error: invokeErr } = await supabase.functions.invoke('process-rep-audio', {
          body: { rep_id: rep.id },
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (invokeErr) {
          if (import.meta.env.DEV) console.error('Edge Function error:', invokeErr)
          let message = invokeErr.message ?? 'Failed to start processing'
          const ctx = invokeErr && typeof invokeErr === 'object' && 'context' in invokeErr ? (invokeErr as { context?: Response }).context : undefined
          if (ctx && typeof ctx.text === 'function') {
            try {
              const text = await ctx.text()
              if (text) {
                try {
                  const body = JSON.parse(text) as { error?: string }
                  if (typeof body?.error === 'string') message = body.error
                } catch {
                  message = text.length > 200 ? `${text.slice(0, 200)}…` : text
                }
              }
              const status = (ctx as Response).status
              if (status === 403) {
                message = 'Beta access required. This account is not whitelisted yet.'
              } else if (typeof status === 'number' && !message.includes(String(status))) {
                message = `[${status}] ${message}`
              }
            } catch {
              // keep default message
            }
          }
          setStatus('error')
          setStatusMessage(message)
          setCurrentRepId(null)
          return
        }
        setStatusMessage('Processing… (polling for result)')
      } catch (err) {
        setStatus('error')
        setStatusMessage(err instanceof Error ? err.message : 'Unknown error')
        setCurrentRepId(null)
      }
    },
    [user, session, selectedScenarioId]
  )

  // Poll for rep status when processing (every 2s, max 60s)
  useEffect(() => {
    if (!currentRepId || status !== 'processing') return
    const start = Date.now()
    let cancelled = false
    const poll = async () => {
      if (cancelled) return
      if (Date.now() - start > POLL_TIMEOUT_MS) {
        setStatusMessage('Still processing. Check History in a moment.')
        setCurrentRepId(null)
        return
      }
      const { data: rep, error: repErr } = await supabase
        .from('reps')
        .select('status, error_message')
        .eq('id', currentRepId)
        .single()
      if (cancelled) return
      if (repErr || !rep) {
        pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS)
        return
      }
      if (rep.status === 'ready') {
        const { data: fb, error: fbErr } = await supabase
          .from('rep_feedback')
          .select('rep_id, transcript, bullets, coaching, score, raw, created_at')
          .eq('rep_id', currentRepId)
          .single()
        if (cancelled) return
        if (!fbErr && fb) {
          setFeedback(fb as RepFeedback)
          setStatus('feedback')
          setStatusMessage('')
        }
        setCurrentRepId(null)
        return
      }
      if (rep.status === 'failed') {
        setStatus('error')
        setStatusMessage(rep.error_message ?? 'Processing failed')
        setCurrentRepId(null)
        return
      }
      pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS)
    }
    pollTimeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
        pollTimeoutRef.current = null
      }
    }
  }, [currentRepId, status])

  if (loading) {
    return <p className="text-gray-600">Loading scenarios…</p>
  }

  if (error) {
    return (
      <div>
        <p className="text-red-600">{error}</p>
        <Link to="/app" className="mt-2 inline-block text-blue-600 hover:underline">
          Back to app
        </Link>
      </div>
    )
  }

  if (scenarios.length === 0) {
    return (
      <div>
        <p className="text-gray-600">No scenarios yet. Add some in the database.</p>
        <Link to="/app" className="mt-2 inline-block text-blue-600 hover:underline">
          Back to app
        </Link>
      </div>
    )
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900">Train</h1>
      <p className="mt-1 text-gray-600">Record a rep for a scenario (90s max).</p>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">Scenario</label>
        <select
          value={selectedScenarioId}
          onChange={(e) => setSelectedScenarioId(e.target.value)}
          className="mt-1 block w-full max-w-xs rounded border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      {status === 'idle' && (
        <div className="mt-6 rounded border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          {reminderLoading ? (
            <span>Loading focus…</span>
          ) : previousFocus ? (
            <>
              <p className="font-medium text-gray-700">Primary improvement focus</p>
              <p className="mt-1 text-gray-600">{previousFocus}</p>
            </>
          ) : (
            <p>After each rep, we’ll highlight one thing to focus on next time.</p>
          )}
        </div>
      )}

      <div className="mt-6">
        <Recorder
          onResult={onResult}
          disabled={status === 'uploading' || status === 'processing'}
        />
      </div>

      {status === 'feedback' && feedback && (
        <div className="mt-6 rounded border border-green-200 bg-green-50 p-4">
          <p className="font-medium text-gray-900">Feedback</p>
          {(() => {
            const raw = feedback.raw as { transcript_focus?: { primary_focus?: string; secondary_tips?: string[] } } | null | undefined
            const tf = raw?.transcript_focus
            const primaryFocus = tf?.primary_focus?.trim()
            const secondaryTips = Array.isArray(tf?.secondary_tips) ? tf.secondary_tips.filter((t): t is string => typeof t === 'string') : []
            if (primaryFocus) {
              return (
                <>
                  <p className="mt-2 text-sm font-medium text-gray-700">Primary improvement focus</p>
                  <p className="mt-1 text-gray-900">{primaryFocus}</p>
                  {secondaryTips.length > 0 && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => setMoreTipsOpen((o) => !o)}
                        className="text-sm text-gray-600 hover:text-gray-800 underline"
                      >
                        {moreTipsOpen ? 'Less' : 'More tips'}
                      </button>
                      {moreTipsOpen && (
                        <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                          {secondaryTips.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </>
              )
            }
            return (
              <>
                {feedback.bullets.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-gray-700">
                    {feedback.bullets.map((b, i) => (
                      <li key={i}>{typeof b === 'string' ? b : String(b)}</li>
                    ))}
                  </ul>
                )}
                {feedback.coaching && (
                  <p className="mt-2 text-gray-700">{feedback.coaching}</p>
                )}
              </>
            )
          })()}
          {feedback.score != null && (
            <p className="mt-2 font-medium text-gray-900">Score: {feedback.score}/10</p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStatus('idle')
                setFeedback(null)
                setStatusMessage('')
                setMoreTipsOpen(false)
              }}
              className="rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
            >
              Record another
            </button>
            <Link
              to="/app/history"
              className="inline-block rounded border border-gray-300 bg-white px-3 py-1.5 text-gray-700 hover:bg-gray-50"
            >
              Go to history
            </Link>
          </div>
        </div>
      )}

      {status !== 'idle' && status !== 'feedback' && (
        <div className="mt-6 rounded border border-gray-200 bg-gray-50 p-4">
          <p className="font-medium text-gray-900">
            {status === 'error' && statusMessage.includes('Beta access required')
              ? 'Beta access required'
              : status === 'error'
                ? 'Error'
                : status === 'processing'
                  ? 'Processing'
                  : 'Uploading'}
          </p>
          {status === 'error' && statusMessage.includes('Beta access required') ? (
            <>
              <p className="text-gray-600">This account is not whitelisted yet.</p>
              <Link
                to="/request-access"
                className="mt-2 inline-block rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
              >
                Request access
              </Link>
            </>
          ) : (
            <>
              <p className={status === 'error' ? 'text-red-600' : 'text-gray-600'}>{statusMessage}</p>
              {status === 'error' && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus('idle')
                    setStatusMessage('')
                  }}
                  className="mt-2 rounded bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700"
                >
                  Retry (record new rep)
                </button>
              )}
            </>
          )}
          {(status === 'processing' || status === 'uploading') && (
            <Link
              to="/app/history"
              className="mt-2 inline-block text-blue-600 hover:underline"
            >
              Go to history
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
