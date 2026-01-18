-- Add logo URL column to presentations table
-- Run this in your Supabase SQL Editor

ALTER TABLE presentations
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN presentations.logo_url IS 'URL to the logo image displayed on both welcome and end slides';
s