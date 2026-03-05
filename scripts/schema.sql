-- Supabase Database Schema for Calculate M8
-- Use this if you need to recreate the table structure

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create computations table
CREATE TABLE IF NOT EXISTS computations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  computation text NOT NULL,
  result numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_computations_created_at ON computations(created_at DESC);

-- Create index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_computations_user_id ON computations(user_id);

-- Add comment to table
COMMENT ON TABLE computations IS 'Stores calculator computation history';

-- Add comments to columns
COMMENT ON COLUMN computations.id IS 'Unique identifier for each computation';
COMMENT ON COLUMN computations.user_id IS 'Foreign key to auth.users table - identifies the user who created this computation';
COMMENT ON COLUMN computations.computation IS 'The computation string (e.g., "5+3=8")';
COMMENT ON COLUMN computations.result IS 'The numeric result of the computation';
COMMENT ON COLUMN computations.created_at IS 'Timestamp when the computation was created';

-- Enable Row Level Security (RLS)
ALTER TABLE computations ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own computations
CREATE POLICY "Users can view own computations" ON computations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own computations
CREATE POLICY "Users can insert own computations" ON computations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own computations
CREATE POLICY "Users can update own computations" ON computations
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own computations
CREATE POLICY "Users can delete own computations" ON computations
  FOR DELETE
  USING (auth.uid() = user_id);
