-- Manual rollback for 20260130120000_communication_gym_schema.sql
-- Run only if you need to undo the migration (e.g. in SQL editor).

drop table if exists public.rep_feedback;
drop table if exists public.reps;
drop table if exists public.scenarios;
