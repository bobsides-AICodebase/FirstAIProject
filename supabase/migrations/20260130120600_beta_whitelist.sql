-- UP
create table if not exists public.beta_whitelist (
  email text primary key,
  added_at timestamptz not null default now()
);

alter table public.beta_whitelist enable row level security;

-- only service role should manage; authenticated users can't read
create policy "beta_whitelist_no_select"
on public.beta_whitelist for select
to authenticated
using (false);
