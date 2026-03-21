-- ============================================================
-- IELTS Coach V2 — Learning Ladder
-- Adds personal_answers table and level column to speaking_sessions
-- ============================================================

-- ============================================================
-- 1. PERSONAL ANSWERS
-- ============================================================
create table if not exists public.personal_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic text not null,
  part int check (part in (1, 2, 3)) not null,
  question text not null,
  personal_details jsonb not null,
  model_answer text not null,
  upgrade_phrases jsonb,
  grammar_patterns jsonb,
  speaking_tips jsonb,
  times_practiced int default 0,
  best_band numeric(2,1),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, topic, question)
);

alter table public.personal_answers enable row level security;

create policy "Users can read own personal answers"
  on public.personal_answers for select
  using (auth.uid() = user_id);

create policy "Users can insert own personal answers"
  on public.personal_answers for insert
  with check (auth.uid() = user_id);

create policy "Users can update own personal answers"
  on public.personal_answers for update
  using (auth.uid() = user_id);

create policy "Users can delete own personal answers"
  on public.personal_answers for delete
  using (auth.uid() = user_id);


-- ============================================================
-- 2. INDEXES FOR PERSONAL ANSWERS
-- ============================================================
create index if not exists idx_personal_answers_user_id
  on public.personal_answers(user_id);

create index if not exists idx_personal_answers_user_topic
  on public.personal_answers(user_id, topic);


-- ============================================================
-- 3. ADD LEVEL COLUMN TO SPEAKING SESSIONS
-- ============================================================
alter table public.speaking_sessions
  add column if not exists level int default 3 check (level in (1, 2, 3));
