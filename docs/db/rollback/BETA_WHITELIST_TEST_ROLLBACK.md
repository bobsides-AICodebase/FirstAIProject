# Beta whitelist: manual test + rollback

## Manual test

1. **Non-whitelisted email**
   - Sign in with an email that is **not** in `public.beta_whitelist`.
   - Go to Train, pick a scenario, record a short rep, stop.
   - Rep should move to `failed` quickly (no OpenAI calls). Error message: "Beta access required. This account is not whitelisted yet."
   - UI shows "Beta access required" and "Request access" (link to `/`).

2. **Whitelisted email**
   - Add the test email: `insert into public.beta_whitelist (email) values ('your@email.com');` (run as service role or in SQL Editor with sufficient privileges).
   - Sign in with that email, record a rep. Full flow should run (upload → process-rep-audio → transcribe + evaluate → feedback).

## Rollback

1. **Revert migration**
   - Run the DOWN SQL: `drop table if exists public.beta_whitelist;`
   - Or run `supabase/migrations/ROLLBACK_20260130120600.sql`.

2. **Remove gate in Edge Function**
   - In `supabase/functions/process-rep-audio/index.ts`, delete the block that queries `beta_whitelist` and returns 403 (the block starting with `const betaMsg = ...` and ending with `return fail(403, betaMsg)`).
   - Redeploy: `supabase functions deploy process-rep-audio`.

3. **Frontend**
   - Optionally remove or simplify the "Beta access required" / "Request access" UI in `src/pages/app/Train.tsx` (leave generic error handling as-is).

**Spend risk:** With the gate removed, any signed-in user can trigger the function and consume OpenAI quota. Re-enable the whitelist or another access control before opening signups.
