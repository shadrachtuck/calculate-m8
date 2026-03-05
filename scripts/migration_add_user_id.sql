-- Migration: Add user_id column to computations table
-- Run this if you have an existing database without the user_id column

-- Add user_id column (nullable for existing rows)
ALTER TABLE computations 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_computations_user_id ON computations(user_id);

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE computations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own computations" ON computations;
DROP POLICY IF EXISTS "Users can insert own computations" ON computations;
DROP POLICY IF EXISTS "Users can update own computations" ON computations;
DROP POLICY IF EXISTS "Users can delete own computations" ON computations;

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

-- Optional: If you want to clean up old computations without user_id
-- Uncomment the following line to delete all computations without a user_id
-- DELETE FROM computations WHERE user_id IS NULL;
