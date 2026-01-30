-- Manual rollback for 20260130120100_reps_constraints.sql

alter table public.reps drop constraint if exists reps_prompt_or_scenario;
alter table public.reps drop constraint if exists reps_duration_max;
