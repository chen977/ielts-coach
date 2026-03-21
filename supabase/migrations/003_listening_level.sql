-- Add level column to listening_sessions (mirrors speaking_sessions pattern)
ALTER TABLE public.listening_sessions
  ADD COLUMN IF NOT EXISTS level int DEFAULT 3 CHECK (level IN (1, 2, 3));
