/** Scenario row from public.scenarios */
export type Scenario = {
  id: string
  slug: string
  title: string
  prompt: string
  created_at: string
}

/** Rep row from public.reps (scenario-only, no prompt_text) */
export type Rep = {
  id: string
  user_id: string
  scenario_id: string
  audio_path: string | null
  duration_secs: number | null
  status: 'uploading' | 'processing' | 'ready' | 'failed'
  error_message: string | null
  created_at: string
}

/** Rep feedback row from public.rep_feedback */
export type RepFeedback = {
  rep_id: string
  transcript: string | null
  bullets: unknown[]
  coaching: string
  score: number | null
  raw: unknown
  created_at: string
}
