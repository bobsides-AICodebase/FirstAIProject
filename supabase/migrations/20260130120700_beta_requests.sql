-- UP
create table if not exists public.beta_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.beta_requests enable row level security;

-- prevent public reads
create policy "beta_requests_no_select"
on public.beta_requests for select
to anon, authenticated
using (false);

-- allow anon inserts
create policy "beta_requests_insert_anon"
on public.beta_requests for insert
to anon
with check (email is not null);

-- cooldown: one request per email per hour (UTC hour; immutable for index)
create unique index if not exists beta_requests_email_hour_idx
on public.beta_requests (lower(email), date_trunc('hour', (created_at at time zone 'UTC')));

-- DOWN (manual)
-- drop table if exists public.beta_requests;

