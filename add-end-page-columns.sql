-- Add end page columns to presentations table
-- This allows customizing the end page title and description

ALTER TABLE presentations
ADD COLUMN IF NOT EXISTS end_title TEXT,
ADD COLUMN IF NOT EXISTS end_description TEXT;

-- Add comments to document the new columns
COMMENT ON COLUMN presentations.end_title IS 'Custom title for the end page, shown after all slides';
COMMENT ON COLUMN presentations.end_description IS 'Custom description for the end page (optional)';
