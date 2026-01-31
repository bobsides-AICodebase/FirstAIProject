// Cleanup rep audio older than 7 days (privacy). Runs with service role; no user JWT.
// Invoke via cron or Dashboard. Batch 100 per loop, max 500 per run.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BUCKET = 'rep-audio'
const BATCH_SIZE = 100
const MAX_ROWS = 500

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type RepRow = { id: string; audio_path: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(supabaseUrl, serviceKey, {
      global: { headers: { Authorization: `Bearer ${serviceKey}` } },
    })

    let scanned = 0
    let deleted = 0
    let updated = 0
    const errors: string[] = []

    while (scanned < MAX_ROWS) {
      const limit = Math.min(BATCH_SIZE, MAX_ROWS - scanned)
      const { data: rows, error: queryErr } = await admin
        .from('reps')
        .select('id, audio_path')
        .not('audio_path', 'is', null)
        .is('audio_deleted_at', null)
        .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(limit)

      if (queryErr) {
        errors.push(`query: ${queryErr.message}`)
        break
      }
      const batch = (rows ?? []) as RepRow[]
      if (batch.length === 0) break

      scanned += batch.length

      for (const row of batch) {
        const path = row.audio_path?.trim()
        if (!path) {
          await admin.from('reps').update({ audio_path: null, audio_deleted_at: new Date().toISOString() }).eq('id', row.id)
          updated += 1
          continue
        }
        const { error: delErr } = await admin.storage.from(BUCKET).remove([path])
        if (delErr) {
          errors.push(`${row.id}: ${delErr.message}`)
        } else {
          deleted += 1
        }
        const { error: updateErr } = await admin
          .from('reps')
          .update({ audio_path: null, audio_deleted_at: new Date().toISOString() })
          .eq('id', row.id)
        if (updateErr) {
          errors.push(`${row.id} update: ${updateErr.message}`)
        } else {
          updated += 1
        }
      }
    }

    return new Response(
      JSON.stringify({ scanned, deleted, updated, errors }),
      { headers: jsonHeaders, status: 200 }
    )
  } catch (err) {
    console.error(err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { headers: jsonHeaders, status: 500 }
    )
  }
})
