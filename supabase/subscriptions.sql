-- Run this once in the Supabase SQL editor (Dashboard > SQL Editor).
-- There's no migration tooling in this repo yet (see delete_user() RPC,
-- which was created the same way) — this file is the source of truth to
-- copy-paste from, not something a CLI applies automatically.

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  polar_customer_id text not null,
  polar_subscription_id text not null unique,
  -- Mirrors Polar's own subscription status values as-is (see
  -- functions/api/polar-webhook.ts) rather than remapping them — "entitled"
  -- is simply status in ('trialing', 'active').
  status text not null check (
    status in (
      'incomplete', 'incomplete_expired', 'trialing', 'active',
      'past_due', 'canceled', 'unpaid'
    )
  ),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- Each user can read only their own subscription row. All writes come from
-- the webhook handler using the service role key, which bypasses RLS —
-- there is intentionally no insert/update/delete policy for regular users.
create policy "Users can read their own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);
