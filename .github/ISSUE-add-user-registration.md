# Add user registration (sign-up)

**Type:** feature  
**Priority:** normal  
**Effort:** medium  

---

## TL;DR

Add a sign-up flow so new users can create an account (email/password). Today only login exists; there’s no way to register.

---

## Current state

- Login page (`/login`) uses `supabase.auth.signInWithPassword`.
- No sign-up page or flow.
- New users cannot create an account.

---

## Expected outcome

- Users can register with email + password (e.g. via `supabase.auth.signUp`).
- Clear UX: sign-up form, validation, error handling, success path (e.g. redirect to `/app` or “check your email” if Supabase email confirmation is on).
- Optional: link from Login to Sign-up and vice versa.

---

## Relevant files

- `src/pages/Login.tsx` — reference for form + error handling.
- **New:** `src/pages/SignUp.tsx` (or `Register.tsx`) — sign-up form.
- `src/router.tsx` — add route (e.g. `/signup`).
- `src/components/layout/Header.tsx` — add “Sign up” link when logged out (optional).

---

## Risk / notes

- If Supabase project has **email confirmation** enabled, `signUp` may not set session immediately; handle “confirm your email” messaging and/or redirect to login.
- Reuse patterns from Login (controlled inputs, error state, `navigate` on success) for consistency.
