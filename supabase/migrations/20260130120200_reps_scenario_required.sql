-- UP: require scenario_id, remove prompt_text, enforce duration cap

alter table public.reps
  alter column scenario_id set not null;

alter table public.reps
  drop column if exists prompt_text;

alter table public.reps
  add constraint reps_duration_max check (duration_secs is null or duration_secs <= 90);
