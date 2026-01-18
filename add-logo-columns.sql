-- Add logo URL columns to presentations table
-- Run this in your Supabase SQL Editor

ALTER TABLE presentations
ADD COLUMN IF NOT EXISTS welcome_logo_url TEXT,
ADD COLUMN IF NOT EXISTS end_logo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN presentations.welcome_logo_url IS 'URL to the logo image displayed on the welcome slide';
COMMENT ON COLUMN presentations.end_logo_url IS 'URL to the logo image displayed on the end slide';
