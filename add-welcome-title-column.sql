-- Add welcome_title column to presentations table
-- This allows the welcome slide title to be independent from the presentation title

ALTER TABLE presentations
ADD COLUMN IF NOT EXISTS welcome_title TEXT;

-- Add comment to document the new column
COMMENT ON COLUMN presentations.welcome_title IS 'Title displayed on the welcome slide (independent from presentation title)';
