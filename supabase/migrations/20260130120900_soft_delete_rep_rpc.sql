-- Owner-only soft delete via RPC so UPDATE runs without returning the row (avoids SELECT RLS on updated row).
-- Caller must be authenticated; only rows where user_id = auth.uid() are updated.

create or replace function public.soft_delete_rep(rep_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reps
  set audio_deleted_at = now()
  where id = rep_id and user_id = auth.uid();
end;
$$;

grant execute on function public.soft_delete_rep(uuid) to authenticated;
