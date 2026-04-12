-- ============================================================
-- IELTS Coach — Writing Module
-- Adds writing_sessions and personal_essays tables,
-- weekly_writing_goal to profiles
-- ============================================================

-- ============================================================
-- 1. WRITING SESSIONS
-- ============================================================
create table if not exists public.writing_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  task int check (task in (1, 2)) not null,
  level int default 3 check (level in (1, 2, 3)),
  topic_id text,
  topic_text text,
  essay_type text,
  chart_type text,
  chart_data jsonb,
  personal_ideas jsonb,
  user_essay text,
  model_essay text,
  model_essay_data jsonb,
  word_count int,
  scores jsonb,
  feedback jsonb,
  time_spent_seconds int,
  created_at timestamptz default now()
);

alter table public.writing_sessions enable row level security;

create policy "Users can read own writing sessions"
  on public.writing_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own writing sessions"
  on public.writing_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own writing sessions"
  on public.writing_sessions for update
  using (auth.uid() = user_id);

create index if not exists idx_writing_sessions_user_id
  on public.writing_sessions(user_id);

create index if not exists idx_writing_sessions_created_at
  on public.writing_sessions(created_at desc);


-- ============================================================
-- 2. PERSONAL ESSAYS (parallel to personal_answers)
-- ============================================================
create table if not exists public.personal_essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic_id text not null,
  task int check (task in (1, 2)) not null,
  essay_type text,
  personal_ideas jsonb,
  model_essay text not null,
  model_essay_data jsonb,
  times_practiced int default 0,
  best_band numeric(2,1),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, topic_id)
);

alter table public.personal_essays enable row level security;

create policy "Users can read own personal essays"
  on public.personal_essays for select
  using (auth.uid() = user_id);

create policy "Users can insert own personal essays"
  on public.personal_essays for insert
  with check (auth.uid() = user_id);

create policy "Users can update own personal essays"
  on public.personal_essays for update
  using (auth.uid() = user_id);

create policy "Users can delete own personal essays"
  on public.personal_essays for delete
  using (auth.uid() = user_id);

create index if not exists idx_personal_essays_user_id
  on public.personal_essays(user_id);

create index if not exists idx_personal_essays_user_topic
  on public.personal_essays(user_id, topic_id);


-- ============================================================
-- 3. ADD WEEKLY WRITING GOAL TO PROFILES
-- ============================================================
alter table public.profiles
  add column if not exists weekly_writing_goal int default 2;
