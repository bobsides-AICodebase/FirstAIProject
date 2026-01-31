# Verify rep-audio bucket RLS

After applying `20260130120300_rep_audio_policies.sql`:

1. **Apply migration** (local): `supabase db reset` or `supabase migration up`
2. **Log in** to the app at `/login`
3. **Open DevTools → Console** and run the script below (uses the same Supabase client as the app).

## Browser console script (run while logged in)

```js
(async () => {
  const bucket = 'rep-audio';
  const { data: { user } } = await window.__supabase?.auth.getUser?.() ?? { data: { user: null } };
  if (!user) {
    console.error('Not logged in. Log in at /login first.');
    return;
  }
  const ownPath = `${user.id}/test.webm`;
  const otherPath = `00000000-0000-0000-0000-000000000000/test.webm`;

  // 1) Upload to own path (expect success)
  const fakeBlob = new Blob(['test'], { type: 'audio/webm' });
  const { data: up, error: upErr } = await window.__supabase.storage.from(bucket).upload(ownPath, fakeBlob, { upsert: true });
  console.log('Upload own path:', upErr ? 'FAIL ' + upErr.message : 'OK', up);

  // 2) Try to read another user's file (expect 403 or empty)
  const { data: list, error: listErr } = await window.__supabase.storage.from(bucket).list('00000000-0000-0000-0000-000000000000');
  console.log('List other user folder:', listErr ? 'Expected fail: ' + listErr.message : (list?.length ? 'UNEXPECTED: saw files' : 'OK (empty)'), list ?? listErr);
})();
```

The app exposes `window.__supabase` in development (`src/lib/supabaseClient.ts`) so this script works without changes.

## Expected result

- **Upload** to `{auth.uid()}/test.webm`: succeeds (no error).
- **List** or **download** path under another user's id (e.g. `00000000-0000-0000-0000-000000000000/`): fails with 403 / "Permission denied" or returns empty.
