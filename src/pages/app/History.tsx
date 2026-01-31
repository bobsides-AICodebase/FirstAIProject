import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import type { Rep, Scenario } from '../../types/rep'

export function History() {
  const { user } = useAuth()
  const [reps, setReps] = useState<Rep[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    const userId = user.id
    let cancelled = false
    async function load() {
      const [repsRes, scenariosRes] = await Promise.all([
        supabase
          .from('reps')
          .select('id, user_id, scenario_id, audio_path, duration_secs, status, error_message, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase.from('scenarios').select('id, slug, title, prompt, created_at').order('slug'),
      ])
      if (cancelled) return
      if (repsRes.error) {
        setError(repsRes.error.message)
        setReps([])
      } else {
        setReps((repsRes.data as Rep[]) ?? [])
      }
      if (scenariosRes.error) {
        setScenarios([])
      } else {
        setScenarios((scenariosRes.data as Scenario[]) ?? [])
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user])

  const scenarioTitleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of scenarios) map.set(s.id, s.title)
    return map
  }, [scenarios])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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

  if (loading) {
    return <p className="text-gray-600">Loading history…</p>
  }

  if (error) {
    return <p className="text-red-600">{error}</p>
  }

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-gray-900">History</h1>
      <p className="mt-1 text-gray-600">Your reps, newest first.</p>

      {reps.length === 0 ? (
        <p className="mt-6 text-gray-500">No reps yet. Record one from Train.</p>
      ) : (
        <ul className="mt-6 list-none space-y-3 p-0">
          {reps.map((rep) => (
            <li
              key={rep.id}
              className="rounded border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline rounded px-2 py-0.5 text-sm font-medium ${statusBadgeClass(rep.status)}`}
                >
                  {rep.status}
                </span>
                <span className="text-sm text-gray-500">{formatDate(rep.created_at)}</span>
              </div>
              <p className="mt-1 font-medium text-gray-900">
                {scenarioTitleById.get(rep.scenario_id) ?? rep.scenario_id}
              </p>
              {rep.duration_secs != null && (
                <p className="mt-0.5 text-sm text-gray-600">{rep.duration_secs}s</p>
              )}
              {rep.status === 'failed' && rep.error_message && (
                <p className="mt-1 text-sm text-red-600">{rep.error_message}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
