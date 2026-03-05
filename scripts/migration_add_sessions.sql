-- Migration: Add sessions table and session_id to computations
-- This enables session-based computation saving with custom names

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add session_id column to computations table (nullable for existing rows)
ALTER TABLE computations 
ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES sessions(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_computations_session_id ON computations(session_id);

-- Add comments
COMMENT ON TABLE sessions IS 'Stores user computation sessions with custom names';
COMMENT ON COLUMN sessions.id IS 'Unique identifier for each session';
COMMENT ON COLUMN sessions.user_id IS 'Foreign key to auth.users table - identifies the user who created this session';
COMMENT ON COLUMN sessions.name IS 'Custom name for the session (e.g., "taxes")';
COMMENT ON COLUMN sessions.created_at IS 'Timestamp when the session was created';
COMMENT ON COLUMN sessions.updated_at IS 'Timestamp when the session was last updated';
COMMENT ON COLUMN computations.session_id IS 'Foreign key to sessions table - links computation to a session';

-- Enable Row Level Security (RLS) on sessions table
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own sessions
CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own sessions
CREATE POLICY "Users can delete own sessions" ON sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on sessions
DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
