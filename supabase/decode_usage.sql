-- Run this once in the Supabase SQL editor (Dashboard > SQL Editor).
-- There's no migration tooling in this repo yet (see subscriptions.sql,
-- created the same way) — this file is the source of truth to copy-paste
-- from, not something a CLI applies automatically.

-- Tracks how many times each user has called /api/decode on a given UTC
-- day, so functions/api/decode.ts can cap it (3/day unsubscribed, 50/day
-- subscribed — see hasAccess in _supabase.ts). One row per user per day;
-- usage_date is a plain date compared against the UTC date the server
-- computes at request time, not the user's local day.
create table if not exists public.decode_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  usage_date date not null,
  count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, usage_date)
);

alter table public.decode_usage enable row level security;

-- Matches subscriptions.sql: all writes come from decode.ts using the
-- service role key, which bypasses RLS — there is intentionally no
-- insert/update policy for regular users, only read access to their own
-- rows (not used by any client code yet, but harmless and consistent with
-- how the other tables in this file expose self-read).
create policy "Users can read their own decode usage"
  on public.decode_usage for select
  using (auth.uid() = user_id);

-- Atomically increments today's count, creating the row on the first call
-- of the day. Called only after a successful OpenAI response — a plain
-- SELECT is used for the pre-call limit check (see decode.ts), which is
-- fine to be non-atomic since worst case under a race is one extra request
-- slipping through, not a lost increment.
create or replace function public.increment_decode_usage(p_user_id uuid, p_usage_date date)
returns integer
language plpgsql
as $$
declare
  new_count integer;
begin
  insert into public.decode_usage (user_id, usage_date, count)
  values (p_user_id, p_usage_date, 1)
  on conflict (user_id, usage_date)
  do update set count = decode_usage.count + 1, updated_at = now()
  returning count into new_count;
  return new_count;
end;
$$;
