-- Manual rollback for 20260130120200_reps_scenario_required.sql

alter table public.reps
  drop constraint if exists reps_duration_max;

alter table public.reps
  add column prompt_text text;

alter table public.reps
  alter column scenario_id drop not null;
