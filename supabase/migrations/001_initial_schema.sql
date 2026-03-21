-- ============================================================
-- IELTS Coach V1 — Initial Schema
-- Run this in Supabase SQL editor
-- ============================================================

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  target_band numeric(2,1) default 7.0 check (target_band between 5.0 and 9.0),
  current_estimated_band numeric(2,1) check (current_estimated_band between 5.0 and 9.0),
  weekly_speaking_goal int default 3,
  weekly_listening_goal int default 2,
  streak_days int default 0,
  last_practice_date date,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- 2. SPEAKING SESSIONS
-- ============================================================
create table if not exists public.speaking_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  part int check (part in (1, 2, 3)) not null,
  questions jsonb not null default '[]',
  responses jsonb,
  scores jsonb,
  model_answers jsonb,
  created_at timestamptz default now()
);

alter table public.speaking_sessions enable row level security;

create policy "Users can read own speaking sessions"
  on public.speaking_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own speaking sessions"
  on public.speaking_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own speaking sessions"
  on public.speaking_sessions for update
  using (auth.uid() = user_id);


-- ============================================================
-- 3. LISTENING SESSIONS
-- ============================================================
create table if not exists public.listening_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  section int check (section in (1, 2, 3, 4)) not null,
  script text not null default '',
  questions jsonb not null default '[]',
  user_answers jsonb,
  correct_answers jsonb not null default '[]',
  score int check (score between 0 and 10),
  band_estimate numeric(2,1) check (band_estimate between 5.0 and 9.0),
  created_at timestamptz default now()
);

alter table public.listening_sessions enable row level security;

create policy "Users can read own listening sessions"
  on public.listening_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own listening sessions"
  on public.listening_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own listening sessions"
  on public.listening_sessions for update
  using (auth.uid() = user_id);


-- ============================================================
-- 4. VOCABULARY
-- ============================================================
create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  word text not null,
  pronunciation text,
  definition text,
  example_sentence text,
  part_of_speech text,
  ielts_topic text,
  source_type text check (source_type in ('speaking', 'listening', 'manual')),
  source_session_id uuid,
  srs_box int default 1 check (srs_box between 1 and 5),
  next_review_date date default current_date,
  times_reviewed int default 0,
  times_correct int default 0,
  created_at timestamptz default now(),
  unique(user_id, word)
);

alter table public.vocabulary enable row level security;

create policy "Users can read own vocabulary"
  on public.vocabulary for select
  using (auth.uid() = user_id);

create policy "Users can insert own vocabulary"
  on public.vocabulary for insert
  with check (auth.uid() = user_id);

create policy "Users can update own vocabulary"
  on public.vocabulary for update
  using (auth.uid() = user_id);

create policy "Users can delete own vocabulary"
  on public.vocabulary for delete
  using (auth.uid() = user_id);


-- ============================================================
-- 5. INDEXES
-- ============================================================
create index if not exists idx_speaking_sessions_user_id
  on public.speaking_sessions(user_id);

create index if not exists idx_speaking_sessions_created_at
  on public.speaking_sessions(created_at desc);

create index if not exists idx_listening_sessions_user_id
  on public.listening_sessions(user_id);

create index if not exists idx_listening_sessions_created_at
  on public.listening_sessions(created_at desc);

create index if not exists idx_vocabulary_user_id
  on public.vocabulary(user_id);

create index if not exists idx_vocabulary_next_review
  on public.vocabulary(user_id, next_review_date);
