-- UP
create table if not exists public.beta_whitelist (
  email text primary key,
  added_at timestamptz not null default now()
);

alter table public.beta_whitelist enable row level security;

-- prevent reads by normal clients
create policy "beta_whitelist_no_select"
on public.beta_whitelist for select
to authenticated
using (false);

-- DOWN (manual)
-- drop table if exists public.beta_whitelist;
