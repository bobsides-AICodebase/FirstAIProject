-- Communication Gym: scenarios, reps, rep_feedback
-- Run with: supabase db push (or supabase migration up)

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  prompt text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scenario_id uuid references public.scenarios(id),
  prompt_text text,
  audio_path text,
  duration_secs smallint,
  status text not null default 'uploading' check (status in ('uploading','processing','ready','failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create table if not exists public.rep_feedback (
  rep_id uuid primary key references public.reps(id) on delete cascade,
  transcript text,
  bullets jsonb not null default '[]'::jsonb,
  coaching text not null default '',
  score int,
  raw jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reps_user_created_idx on public.reps (user_id, created_at desc);

alter table public.scenarios enable row level security;
alter table public.reps enable row level security;
alter table public.rep_feedback enable row level security;

-- scenarios: readable by all authenticated users
create policy "scenarios_select_auth"
on public.scenarios for select
to authenticated
using (true);

-- reps: user owns row
create policy "reps_select_own"
on public.reps for select
to authenticated
using (auth.uid() = user_id);

create policy "reps_insert_own"
on public.reps for insert
to authenticated
with check (auth.uid() = user_id);

create policy "reps_update_own"
on public.reps for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- rep_feedback: join ownership via reps.user_id
create policy "rep_feedback_select_own"
on public.rep_feedback for select
to authenticated
using (
  exists (
    select 1 from public.reps r
    where r.id = rep_feedback.rep_id and r.user_id = auth.uid()
  )
);

create policy "rep_feedback_insert_own"
on public.rep_feedback for insert
to authenticated
with check (
  exists (
    select 1 from public.reps r
    where r.id = rep_feedback.rep_id and r.user_id = auth.uid()
  )
);

create policy "rep_feedback_update_own"
on public.rep_feedback for update
to authenticated
using (
  exists (
    select 1 from public.reps r
    where r.id = rep_feedback.rep_id and r.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.reps r
    where r.id = rep_feedback.rep_id and r.user_id = auth.uid()
  )
);

-- seed 3 scenarios
insert into public.scenarios (slug, title, prompt)
values
('interview-tell-me', 'Interview: Tell me about yourself', 'Give a 60–90 second answer. Keep it structured: present → past → why next.'),
('sales-value', 'Sales: Explain your value', 'In 60–90 seconds, explain what you do and the value you create. Use a clear before/after.'),
('leadership-update', 'Leadership: Project update', 'In 60–90 seconds, give a project update: context, progress, risks, next steps.')
on conflict (slug) do nothing;
