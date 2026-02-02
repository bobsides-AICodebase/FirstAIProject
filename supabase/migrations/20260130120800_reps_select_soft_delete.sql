-- Owner-only soft delete: SELECT only returns rows where owner and not soft-deleted.
-- Soft delete = reps.audio_deleted_at IS NOT NULL.
-- UP: restrict SELECT to auth.uid() = user_id AND audio_deleted_at IS NULL.
-- DOWN: restore original SELECT (auth.uid() = user_id only).

-- UP
drop policy if exists "reps_select_own" on public.reps;
create policy "reps_select_own"
on public.reps for select
to authenticated
using (auth.uid() = user_id and audio_deleted_at is null);

-- DOWN (uncomment to rollback)
-- drop policy if exists "reps_select_own" on public.reps;
-- create policy "reps_select_own"
-- on public.reps for select
-- to authenticated
-- using (auth.uid() = user_id);
