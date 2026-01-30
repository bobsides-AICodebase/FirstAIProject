# Forgot password

**Type:** feature  
**Priority:** normal  
**Effort:** small  

---

## TL;DR

Let users reset their password via email. Login has no “Forgot password?” path today.

---

## Current state

- Login page has email + password only.
- No way to request a password reset.

---

## Expected outcome

- User can request a reset link (e.g. “Forgot password?” on Login → enter email → Supabase sends reset email).
- Use `supabase.auth.resetPasswordForEmail(email, { redirectTo: ... })` (or equivalent).
- Success: show “Check your email” (don’t reveal whether the email exists). Optional dedicated `/forgot-password` page or inline on Login.
- After clicking link in email, user lands on a reset-password page (Supabase redirect); set new password and redirect to login.

---

## Relevant files

- `src/pages/Login.tsx` — add “Forgot password?” link; optionally host inline email form or link to dedicated page.
- **New (optional):** `src/pages/ForgotPassword.tsx` — email-only form; success message.
- **New:** route/page for Supabase redirect (set new password) — e.g. `/reset-password` or `/update-password`; read token from URL and call `supabase.auth.updateUser({ password })`.
- `src/router.tsx` — add route(s) for forgot-password and reset/update-password.

---

## Risk / notes

- Supabase dashboard: ensure “Email” auth is enabled and (if used) redirect URL for password reset is allowlisted.
- Reuse Login/Register patterns: controlled inputs, error/success state, no revealing whether email exists on success.
