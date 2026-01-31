// Process rep audio: transcribe (Whisper) + evaluate (gpt-4o-mini) → rep_feedback.
// Auth: JWT required; rep must belong to caller (reps.user_id === auth.uid()).
// Idempotent: if rep already ready and feedback exists, return success.
// Retry once on transient OpenAI failure.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BUCKET = 'rep-audio'
const MAX_ERROR_LEN = 200
const OPENAI_TRANSCRIPTIONS = 'https://api.openai.com/v1/audio/transcriptions'
const OPENAI_CHAT = 'https://api.openai.com/v1/chat/completions'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type RepRow = {
  id: string
  user_id: string
  scenario_id: string
  audio_path: string | null
  status: string
  error_message: string | null
}

type FeedbackPayload = {
  bullets: string[]
  coaching: string
  score?: number
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 3) + '...'
}

function isTransientOpenAIError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  if (/5\d\d|ECONNRESET|ETIMEDOUT|network|timeout/i.test(msg)) return true
  return false
}

async function transcribe(apiKey: string, audioBlob: Blob, filename: string): Promise<string> {
  const form = new FormData()
  form.append('file', audioBlob, filename)
  form.append('model', 'whisper-1')
  const res = await fetch(OPENAI_TRANSCRIPTIONS, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Whisper ${res.status}: ${text}`)
  }
  const data = (await res.json()) as { text?: string }
  return typeof data.text === 'string' ? data.text : ''
}

async function evaluateTranscript(apiKey: string, transcript: string): Promise<FeedbackPayload> {
  const sys = `You evaluate short speech transcripts and return ONLY valid JSON (no markdown, no explanation).
Output exactly: { "bullets": string[], "coaching": string, "score": number }
- bullets: 3–6 concise takeaways (strings).
- coaching: one short paragraph of actionable coaching.
- score: optional number 1–10.`
  const body = {
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: `Transcript:\n${transcript}` },
    ],
  }
  const res = await fetch(OPENAI_CHAT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Chat ${res.status}: ${text}`)
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const rawContent = data.choices?.[0]?.message?.content
  if (!rawContent) throw new Error('Empty chat response')
  const parsed = JSON.parse(rawContent) as FeedbackPayload
  if (!Array.isArray(parsed.bullets) || typeof parsed.coaching !== 'string') {
    throw new Error('Invalid feedback shape')
  }
  return parsed
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }
  const fail = (status: number, message: string) =>
    new Response(JSON.stringify({ error: message }), { headers: jsonHeaders, status })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return fail(401, 'Missing or invalid Authorization')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) return fail(500, 'OPENAI_API_KEY not set')

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (userError || !user) return fail(401, 'Invalid or expired token')

    let body: { rep_id?: string }
    try {
      body = (await req.json()) as { rep_id?: string }
    } catch {
      return fail(400, 'Invalid JSON body')
    }
    const repId = body.rep_id
    if (!repId || typeof repId !== 'string') return fail(400, 'rep_id required')

    const admin = createClient(supabaseUrl, serviceKey)

    const { data: rep, error: repErr } = await admin
      .from('reps')
      .select('id, user_id, scenario_id, audio_path, status, error_message')
      .eq('id', repId)
      .single()
    if (repErr || !rep) return fail(404, 'Rep not found')
    const row = rep as RepRow
    if (row.user_id !== user.id) return fail(403, 'Rep does not belong to caller')

    if (row.status === 'ready') {
      const { data: fb } = await admin.from('rep_feedback').select('rep_id').eq('rep_id', repId).single()
      if (fb) return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders, status: 200 })
    }

    if (!row.audio_path?.trim()) return fail(400, 'Rep has no audio_path')

    if (row.status === 'uploading') {
      await admin.from('reps').update({ status: 'processing' }).eq('id', repId)
    }

    const { data: audioBlob, error: dlErr } = await admin.storage.from(BUCKET).download(row.audio_path)
    if (dlErr || !audioBlob) {
      await admin.from('reps').update({
        status: 'failed',
        error_message: truncate(dlErr?.message ?? 'Failed to download audio', MAX_ERROR_LEN),
      }).eq('id', repId)
      return fail(502, 'Storage download failed')
    }

    const filename = row.audio_path.split('/').pop() ?? 'audio.webm'

    let transcript = ''
    let payload: FeedbackPayload = { bullets: [], coaching: '' }
    const run = async () => {
      transcript = await transcribe(openaiKey, audioBlob, filename)
      payload = await evaluateTranscript(openaiKey, transcript)
    }
    try {
      await run()
    } catch (openaiErr) {
      if (isTransientOpenAIError(openaiErr)) {
        try {
          await run()
        } catch (retryErr) {
          const msg = truncate(retryErr instanceof Error ? retryErr.message : String(retryErr), MAX_ERROR_LEN)
          await admin.from('reps').update({ status: 'failed', error_message: msg }).eq('id', repId)
          return fail(502, msg)
        }
      } else {
        const msg = truncate(openaiErr instanceof Error ? openaiErr.message : String(openaiErr), MAX_ERROR_LEN)
        await admin.from('reps').update({ status: 'failed', error_message: msg }).eq('id', repId)
        return fail(502, msg)
      }
    }

    const raw = { bullets: payload.bullets, coaching: payload.coaching, score: payload.score }
    await admin.from('rep_feedback').upsert(
      {
        rep_id: repId,
        transcript,
        bullets: payload.bullets,
        coaching: payload.coaching ?? '',
        score: payload.score ?? null,
        raw,
      },
      { onConflict: 'rep_id' }
    )
    await admin.from('reps').update({ status: 'ready', error_message: null }).eq('id', repId)

    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders, status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { headers: jsonHeaders, status: 500 }
    )
  }
})
