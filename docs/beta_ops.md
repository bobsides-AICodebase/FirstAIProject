Beta Ops

This doc covers how to:

review new beta access requests

whitelist emails for unlimited access

optionally clean up request rows

remove access if needed

Tables involved

public.beta_requests — public request form inserts here (anon insert-only)

public.beta_whitelist — process-rep-audio checks this table to allow OpenAI processing

1) Review incoming requests

Newest requests (last 7 days):

select
  created_at,
  email
from public.beta_requests
where created_at > now() - interval '7 days'
order by created_at desc
limit 200;


Search by email (case-insensitive):

select created_at, email
from public.beta_requests
where lower(email) = lower('someone@example.com')
order by created_at desc;

2) Add someone to the whitelist

Whitelist a single email (recommended):

insert into public.beta_whitelist (email)
values (lower('someone@example.com'))
on conflict (email) do nothing;


Whitelist multiple emails at once:

insert into public.beta_whitelist (email)
values
  (lower('a@example.com')),
  (lower('b@example.com')),
  (lower('c@example.com'))
on conflict (email) do nothing;


Confirm they are whitelisted:

select email, added_at
from public.beta_whitelist
where email = lower('someone@example.com');

3) Optional: clean up requests after whitelisting

This is optional — you may want to keep requests for auditing.

Delete a request row for an email:

delete from public.beta_requests
where lower(email) = lower('someone@example.com');


Delete request rows older than 30 days:

delete from public.beta_requests
where created_at < now() - interval '30 days';

4) Remove someone from the whitelist

Revoke whitelist access:

delete from public.beta_whitelist
where email = lower('someone@example.com');


Confirm removal:

select email
from public.beta_whitelist
where email = lower('someone@example.com');

5) Troubleshooting
“Beta access required” even after whitelisting

Ensure the whitelist entry is lowercased.

Ensure the signed-in user’s email matches exactly (plus-addressing counts as different: bob+test@gmail.com ≠ bob@gmail.com).

Check what’s in the whitelist:

select email, added_at
from public.beta_whitelist
order by added_at desc
limit 50;

People can submit request form repeatedly

Cooldown is enforced as “one request per email per UTC hour.” Someone could request near the end of the hour and again at the start of the next hour.