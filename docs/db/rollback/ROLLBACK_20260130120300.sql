-- Manual rollback for 20260130120300_rep_audio_policies.sql

drop policy if exists "rep_audio_insert_own" on storage.objects;
drop policy if exists "rep_audio_select_own" on storage.objects;
drop policy if exists "rep_audio_update_own" on storage.objects;

delete from storage.buckets where id = 'rep-audio';
