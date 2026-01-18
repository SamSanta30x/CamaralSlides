-- Add estimated_minutes column to presentations table
-- This allows manually setting the estimated duration of the presentation

ALTER TABLE presentations
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER;

-- Add comment to document the new column
COMMENT ON COLUMN presentations.estimated_minutes IS 'Manually set estimated duration in minutes (defaults to slide count if not set)';
