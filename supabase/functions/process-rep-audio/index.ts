// Process rep audio: transcribe (gpt-4o-mini-transcribe) + evaluate (gpt-4o-mini) → rep_feedback.
// Auth: JWT required; rep must belong to caller (reps.user_id === auth.uid()).
// Idempotent: if rep already ready and feedback exists, return success.
// Retry once on transient OpenAI failure.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BUCKET = 'rep-audio'
const MAX_ERROR_LEN = 200
const DELIVERY_EVAL_TIMEOUT_MS = 60_000
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
  duration_secs?: number | null
}

type FeedbackPayload = {
  bullets: string[]
  coaching: string
  score: number | null
}

type DeliveryDimensions = {
  pace?: string
  clarity?: string
  fillers?: string
  confidence?: string
  pauses?: string
  tone?: string
}

type DeliveryEvaluationResult = {
  overall_score: number
  dimensions: DeliveryDimensions
  summary: string
  coaching: string[]
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s
  return s.slice(0, max - 3) + '...'
}

function isTransientOpenAIError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  if (/429|quota|rate limit/i.test(msg)) return false
  if (/5\d\d|ECONNRESET|ETIMEDOUT|network|timeout/i.test(msg)) return true
  return false
}

function openAIErrorMessage(status: number, bodyText: string): string {
  if (status === 429) {
    return 'OpenAI quota exceeded. Check your plan and billing: https://platform.openai.com/account/billing'
  }
  try {
    const j = JSON.parse(bodyText) as { error?: { message?: string } }
    const msg = j?.error?.message
    if (typeof msg === 'string' && msg.length > 0) return msg
  } catch {
    // ignore
  }
  return bodyText.length > 200 ? `${bodyText.slice(0, 200)}…` : bodyText
}

async function transcribe(apiKey: string, audioBlob: Blob, filename: string): Promise<string> {
  const form = new FormData()
  form.append('file', audioBlob, filename)
  form.append('model', 'gpt-4o-mini-transcribe')
  const res = await fetch(OPENAI_TRANSCRIPTIONS, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })
  if (!res.ok) {
    const text = await res.text()
    const msg = openAIErrorMessage(res.status, text)
    throw new Error(`Transcribe ${res.status}: ${msg}`)
  }
  const data = (await res.json()) as { text?: string }
  return typeof data.text === 'string' ? data.text : ''
}

async function evaluateTranscript(apiKey: string, transcript: string): Promise<FeedbackPayload> {
  const sys = `You evaluate short speech transcripts and return ONLY valid JSON (no markdown, no explanation).
Output exactly: { "bullets": string[], "coaching": string, "score": number | null }
- bullets: 3–6 concise takeaways (strings).
- coaching: one short paragraph of actionable coaching.
- score: must be a number between 1 and 10 inclusive, or null. If omitted, use null.`
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
    const msg = openAIErrorMessage(res.status, text)
    throw new Error(`Chat ${res.status}: ${msg}`)
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const rawContent = data.choices?.[0]?.message?.content
  if (!rawContent) throw new Error('Empty chat response')
  const parsed = JSON.parse(rawContent) as FeedbackPayload
  if (!Array.isArray(parsed.bullets) || typeof parsed.coaching !== 'string') {
    throw new Error('Invalid feedback shape')
  }
  const score = parsed.score
  if (score != null) {
    if (typeof score !== 'number' || score < 1 || score > 10) {
      throw new Error('Invalid score: must be number 1–10 or null')
    }
  }
  return {
    bullets: parsed.bullets,
    coaching: parsed.coaching,
    score: score ?? null,
  }
}

/** Delivery signals inferred from transcript (and optional duration). No audio. */
function computeDeliverySignals(transcript: string, durationSecs: number | null | undefined): {
  word_count: number
  words_per_minute: number | null
  filler_word_count: number
  sentence_length_variance: number
} {
  const trimmed = transcript.trim()
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : []
  const wordCount = words.length

  const fillerRegex = /\b(um|uh|like|you\s+know)\b/gi
  const fillerWordCount = (trimmed.match(fillerRegex) ?? []).length

  const sentences = trimmed
    ? trimmed.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean)
    : []
  const sentenceLengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length)
  let sentenceLengthVariance = 0
  if (sentenceLengths.length > 1) {
    const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
    const sqDiffs = sentenceLengths.map((n) => (n - mean) ** 2)
    sentenceLengthVariance = sqDiffs.reduce((a, b) => a + b, 0) / sentenceLengths.length
  }

  let wordsPerMinute: number | null = null
  if (durationSecs != null && durationSecs > 0 && wordCount > 0) {
    wordsPerMinute = Math.round((wordCount / durationSecs) * 60)
  }

  return {
    word_count: wordCount,
    words_per_minute: wordsPerMinute,
    filler_word_count: fillerWordCount,
    sentence_length_variance: Math.round(sentenceLengthVariance * 100) / 100,
  }
}

/**
 * Best-effort delivery evaluation inferred from transcript and timing heuristics only.
 * No audio is sent. One text-only OpenAI call produces the same output shape for raw.audio_delivery.
 */
async function evaluateDelivery(
  apiKey: string,
  transcript: string,
  durationSecs: number | null | undefined
): Promise<DeliveryEvaluationResult> {
  const signals = computeDeliverySignals(transcript, durationSecs)

  const systemPrompt = `You infer DELIVERY quality from speech patterns in a transcript and from the provided numeric signals. This is NOT acoustic analysis—no audio was used. Base your assessment only on:
- Transcript wording and structure
- words_per_minute (if present): speaking rate
- filler_word_count: count of um, uh, like, you know
- sentence_length_variance: variation in sentence length (higher can suggest run-ons or choppiness)

Return ONLY valid JSON (no markdown, no explanation). Output exactly:
{
  "overall_score": number,
  "dimensions": { "pace": string, "clarity": string, "fillers": string, "confidence": string, "pauses": string, "tone": string },
  "summary": string,
  "coaching": string[]
}
- overall_score: 1–10 (inferred delivery only).
- dimensions: short assessment per dimension (pace, clarity, fillers, confidence, pauses, tone) based on transcript and signals.
- summary: one short paragraph on inferred delivery.
- coaching: 0–4 actionable delivery tips (strings).`

  const userContent = `Signals (inferred from transcript${signals.words_per_minute != null ? ' and duration' : ''}):
- word_count: ${signals.word_count}
- words_per_minute: ${signals.words_per_minute ?? 'not available (no duration)'}
- filler_word_count: ${signals.filler_word_count}
- sentence_length_variance: ${signals.sentence_length_variance}

Transcript:
${transcript}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DELIVERY_EVAL_TIMEOUT_MS)

  try {
    const body = {
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' as const },
      messages: [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userContent },
      ],
    }
    const res = await fetch(OPENAI_CHAT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(openAIErrorMessage(res.status, text))
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
    const rawContent = data.choices?.[0]?.message?.content
    if (!rawContent) throw new Error('Empty delivery response')
    const parsed = JSON.parse(rawContent) as DeliveryEvaluationResult
    if (typeof parsed.overall_score !== 'number' || parsed.overall_score < 1 || parsed.overall_score > 10) {
      throw new Error('Invalid delivery overall_score')
    }
    if (typeof parsed.summary !== 'string' || !Array.isArray(parsed.coaching)) {
      throw new Error('Invalid delivery shape: summary and coaching required')
    }
    if (!parsed.dimensions || typeof parsed.dimensions !== 'object') {
      throw new Error('Invalid delivery dimensions')
    }
    return {
      overall_score: parsed.overall_score,
      dimensions: parsed.dimensions as DeliveryDimensions,
      summary: parsed.summary,
      coaching: parsed.coaching,
    }
  } finally {
    clearTimeout(timeoutId)
  }
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

    const admin = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: `Bearer ${serviceKey}` } },
    })

    const { data: rep, error: repErr } = await admin
      .from('reps')
      .select('id, user_id, scenario_id, audio_path, status, error_message, duration_secs')
      .eq('id', repId)
      .single()
    if (repErr || !rep) return fail(404, 'Rep not found')
    const row = rep as RepRow
    if (row.user_id !== user.id) return fail(403, 'Rep does not belong to caller')

    const betaMsg = 'Beta access required. This account is not whitelisted yet.'
    const userEmailLower = (user.email ?? '').toLowerCase()
    const { data: whitelistRow } = await admin
      .from('beta_whitelist')
      .select('email')
      .ilike('email', userEmailLower)
      .maybeSingle()
    if (!whitelistRow) {
      await admin.from('reps').update({ status: 'failed', error_message: betaMsg }).eq('id', repId)
      return fail(403, betaMsg)
    }

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
    let payload: FeedbackPayload = { bullets: [], coaching: '', score: null }
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
        score: payload.score,
        raw,
      },
      { onConflict: 'rep_id' }
    )
    await admin.from('reps').update({ status: 'ready', error_message: null }).eq('id', repId)

    // Best-effort delivery evaluation (inferred from transcript + heuristics); persist to rep_feedback.raw
    const { data: fbRow } = await admin
      .from('rep_feedback')
      .select('raw')
      .eq('rep_id', repId)
      .single()
    const existingRaw = (fbRow?.raw as Record<string, unknown>) ?? {}
    try {
      const deliveryResult = await evaluateDelivery(openaiKey, transcript, row.duration_secs)
      await admin
        .from('rep_feedback')
        .update({ raw: { ...existingRaw, audio_delivery: deliveryResult } })
        .eq('rep_id', repId)
    } catch (deliveryErr) {
      const errMsg = truncate(deliveryErr instanceof Error ? deliveryErr.message : String(deliveryErr), MAX_ERROR_LEN)
      await admin
        .from('rep_feedback')
        .update({ raw: { ...existingRaw, audio_delivery_error: errMsg } })
        .eq('rep_id', repId)
    }

    return new Response(JSON.stringify({ ok: true }), { headers: jsonHeaders, status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { headers: jsonHeaders, status: 500 }
    )
  }
})
