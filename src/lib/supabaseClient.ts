import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill values.'
    )
}

// Placeholders so build succeeds without .env; auth will fail at runtime until vars are set (see .env.example)
export const supabase = createClient(supabaseUrl, supabaseKey)

// Dev-only: expose for rep-audio RLS verification (see supabase/migrations/VERIFY_rep_audio.md)
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as { __supabase?: typeof supabase }).__supabase = supabase
}
