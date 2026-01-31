-- reps: max duration 90s; require either scenario_id or prompt_text

alter table public.reps
  add constraint reps_prompt_or_scenario check (
    (scenario_id is not null) or (prompt_text is not null)
  );
