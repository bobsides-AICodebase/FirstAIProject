import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { Rep, RepFeedback, Scenario } from '../../types/rep'

const BUCKET = 'rep-audio'
const SIGNED_URL_EXPIRY_SEC = 60

export function RepDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [rep, setRep] = useState<Rep | null>(null)
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [feedback, setFeedback] = useState<RepFeedback | null>(null)
  const [moreTipsOpen, setMoreTipsOpen] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !user) {
      setLoading(false)
      return
    }
    const userId = user.id
    let cancelled = false
    async function load() {
      const { data: repData, error: repErr } = await supabase
        .from('reps')
        .select('id, user_id, scenario_id, audio_path, audio_deleted_at, duration_secs, status, error_message, created_at')
        .eq('id', id)
        .single()
      if (cancelled) return
      if (repErr || !repData) {
        setError(repErr?.message ?? 'Rep not found')
        setRep(null)
        setLoading(false)
        return
      }
      const r = repData as Rep
      if (r.user_id !== userId) {
        setError('Not authorized')
        setRep(null)
        setLoading(false)
        return
      }
      setRep(r)

      const [scenarioRes, feedbackRes] = await Promise.all([
        supabase.from('scenarios').select('id, slug, title, prompt, created_at').eq('id', r.scenario_id).single(),
        supabase.from('rep_feedback').select('rep_id, transcript, bullets, coaching, score, raw, created_at').eq('rep_id', id).single(),
      ])
      if (cancelled) return
      if (!scenarioRes.error && scenarioRes.data) setScenario(scenarioRes.data as Scenario)
      if (!feedbackRes.error && feedbackRes.data) setFeedback(feedbackRes.data as RepFeedback)

      if (r.audio_path && !r.audio_deleted_at) {
        const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(r.audio_path, SIGNED_URL_EXPIRY_SEC)
        if (!cancelled && signed?.signedUrl) setAudioUrl(signed.signedUrl)
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, user])

  const statusBadgeClass = (status: Rep['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-gray-100 text-gray-800'
      case 'processing':
        return 'bg-amber-100 text-amber-800'
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <p className="text-gray-600">Loading…</p>
  }

  if (error || !rep) {
    return (
      <div className="py-6">
        <p className="text-red-600">{error ?? 'Rep not found'}</p>
        <Link to="/app/history" className="mt-2 inline-block text-blue-600 hover:underline">
          Back to history
        </Link>
      </div>
    )
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900">Rep detail</h1>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`inline rounded px-2 py-0.5 text-sm font-medium ${statusBadgeClass(rep.status)}`}>
          {rep.status}
        </span>
        {rep.audio_deleted_at && (
          <span className="inline rounded bg-gray-200 px-2 py-0.5 text-sm text-gray-700">
            Audio expired
          </span>
        )}
        <span className="text-sm text-gray-500">{formatDate(rep.created_at)}</span>
      </div>

      <p className="mt-2 font-medium text-gray-900">{scenario?.title ?? rep.scenario_id}</p>
      {rep.duration_secs != null && <p className="text-sm text-gray-600">{rep.duration_secs}s</p>}
      {rep.status === 'failed' && rep.error_message && (
        <p className="mt-2 text-sm text-red-600">{rep.error_message}</p>
      )}

      {rep.status === 'ready' && feedback && (
        <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-4">
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
                {feedback.coaching && <p className="mt-2 text-gray-700">{feedback.coaching}</p>}
              </>
            )
          })()}
          {feedback.score != null && (
            <p className="mt-2 font-medium text-gray-900">Score: {feedback.score}/10</p>
          )}
        </div>
      )}

      {rep.status === 'ready' && feedback && (
        <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-4">
          <p className="font-medium text-gray-900">Delivery</p>
          {(() => {
            const raw = feedback.raw as { audio_delivery?: { overall_score: number; dimensions?: Record<string, string>; summary?: string; coaching?: string[] }; audio_delivery_error?: string } | null | undefined
            const delivery = raw?.audio_delivery
            const deliveryError = raw?.audio_delivery_error
            if (delivery) {
              const dims = delivery.dimensions ?? {}
              const dimOrder = ['pace', 'clarity', 'fillers', 'confidence', 'pauses', 'tone'] as const
              return (
                <>
                  <p className="mt-2 font-medium text-gray-900">
                    Overall delivery score: {delivery.overall_score} / 10
                  </p>
                  {dimOrder.some((k) => dims[k]) && (
                    <ul className="mt-2 list-inside list-disc text-gray-700">
                      {dimOrder.map((k) => (dims[k] ? <li key={k}><span className="capitalize">{k}</span>: {dims[k]}</li> : null))}
                    </ul>
                  )}
                  {delivery.summary && <p className="mt-2 text-gray-700">{delivery.summary}</p>}
                  {Array.isArray(delivery.coaching) && delivery.coaching.length > 0 && (
                    <ul className="mt-2 list-inside list-disc text-gray-700">
                      {delivery.coaching.map((c, i) => (
                        <li key={i}>{typeof c === 'string' ? c : String(c)}</li>
                      ))}
                    </ul>
                  )}
                </>
              )
            }
            if (deliveryError) {
              return <p className="mt-2 text-gray-500">Delivery analysis unavailable.</p>
            }
            return <p className="mt-2 text-gray-500">Analyzing delivery…</p>
          })()}
        </div>
      )}

      {audioUrl && !rep.audio_deleted_at && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">Audio</p>
          <audio controls src={audioUrl} className="mt-1 w-full max-w-md" />
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <Link
          to={`/app/train?scenario=${rep.scenario_id}`}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Retry this scenario
        </Link>
        <Link
          to="/app/history"
          className="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Back to history
        </Link>
      </div>
    </div>
  )
}
