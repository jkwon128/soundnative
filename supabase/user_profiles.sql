-- Run this once in the Supabase SQL editor (Dashboard > SQL Editor).
-- There's no migration tooling in this repo yet (see subscriptions.sql,
-- created the same way) — this file is the source of truth to copy-paste
-- from, not something a CLI applies automatically.

-- Stores the answers from the pre-login 5-step onboarding survey
-- (StatusScreen / LevelScreen / FrequencyScreen / GoalScreen — see
-- src/types.ts for the matching UserStatus/EnglishLevel/VisitFrequency/
-- LearningGoal unions). The survey runs before the user has an account, so
-- the app only has something to write once AuthScreen finishes signup —
-- there is no client code writing to this table yet, only the table itself.
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null check (
    status in ('student', 'workingHoliday', 'immigrant', 'expatWorker', 'preparing')
  ),
  english_level text not null check (
    english_level in ('new', 'basicUnderstanding', 'mostlyFluent')
  ),
  visit_frequency text not null check (
    visit_frequency in ('daily', 'weekdays', 'whenever')
  ),
  learning_goal text not null check (
    learning_goal in ('dailyLifeConfidence', 'nativeConnection', 'nativeLevel')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

-- Unlike subscriptions (server-only writes via the Polar webhook), this data
-- is collected client-side and only ever belongs to the user who answered
-- it — so, matching how a table like `notes` would be set up, the owner is
-- allowed to read/insert/update their own row directly through the
-- authenticated Supabase client rather than going through a server endpoint.
create policy "Users can read their own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = user_id);
