-- Add weekly vocabulary review goal to profiles
alter table public.profiles
  add column if not exists weekly_vocab_goal int default 20;
