-- Privacy: track when rep audio is removed from storage (e.g. after 7-day retention).

alter table public.reps
  add column if not exists audio_deleted_at timestamptz null;
