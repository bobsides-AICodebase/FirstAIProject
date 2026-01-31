-- Private bucket rep-audio: users can only read/write their own {user_id}/... files.

insert into storage.buckets (id, name, public)
values ('rep-audio', 'rep-audio', false)
on conflict (id) do update set public = false;

create policy "rep_audio_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'rep-audio'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "rep_audio_select_own"
on storage.objects for select
to authenticated
using (
  bucket_id = 'rep-audio'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "rep_audio_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'rep-audio'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'rep-audio'
  and (storage.foldername(name))[1] = auth.uid()::text
);
