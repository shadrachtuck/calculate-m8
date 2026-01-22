-- Supabase Database Schema for Calculate M8
-- Use this if you need to recreate the table structure

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create computations table
CREATE TABLE IF NOT EXISTS computations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  computation text NOT NULL,
  result numeric NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_computations_created_at ON computations(created_at DESC);

-- Add comment to table
COMMENT ON TABLE computations IS 'Stores calculator computation history';

-- Add comments to columns
COMMENT ON COLUMN computations.id IS 'Unique identifier for each computation';
COMMENT ON COLUMN computations.computation IS 'The computation string (e.g., "5+3=8")';
COMMENT ON COLUMN computations.result IS 'The numeric result of the computation';
COMMENT ON COLUMN computations.created_at IS 'Timestamp when the computation was created';
