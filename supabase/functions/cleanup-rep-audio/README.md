# cleanup-rep-audio

Deletes rep audio files older than 7 days from Storage (bucket `rep-audio`) and sets `reps.audio_path = null`, `reps.audio_deleted_at = now()`. Runs with service role; no user JWT.

## Schedule (daily)

**Schedule string:** `0 3 * * *` (daily at 03:00 UTC)

**Where it’s configured:** Supabase Dashboard → **Database** → **Cron Jobs** (or run the SQL below in **SQL Editor**).

Prerequisites: enable **pg_cron** and **pg_net** (Dashboard → Database → Extensions). Store the service role key in Vault so the cron job can invoke the function with it.

1. Store secrets in Vault (run once in SQL Editor):

```sql
select vault.create_secret('https://YOUR_PROJECT_REF.supabase.co', 'project_url');
select vault.create_secret('YOUR_SERVICE_ROLE_KEY', 'service_role_key');
```

2. Schedule the function (run once):

```sql
select cron.schedule(
  'cleanup-rep-audio-daily',
  '0 3 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/cleanup-rep-audio',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
```

To unschedule: `select cron.unschedule('cleanup-rep-audio-daily');`

## Manual invoke (for testing)

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cleanup-rep-audio' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -d '{}'
```

Response: `{ "scanned", "deleted", "updated", "errors" }`

## Verify (test only)

1. Create a rep (e.g. record one in the app) so it has `audio_path` set and a file in Storage.
2. In **SQL Editor** run:
   ```sql
   update public.reps
   set created_at = now() - interval '8 days'
   where id = 'THE_REP_ID';
   ```
3. Invoke the function (curl above or Dashboard → Edge Functions → cleanup-rep-audio → Invoke).
4. Check:
   - Storage bucket `rep-audio`: the object at that rep’s `audio_path` should be gone.
   - `select id, audio_path, audio_deleted_at from public.reps where id = 'THE_REP_ID';` should show `audio_path` null and `audio_deleted_at` set.
