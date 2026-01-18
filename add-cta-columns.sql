-- Add Call to Action columns to presentations table
ALTER TABLE presentations 
ADD COLUMN IF NOT EXISTS cta_text TEXT,
ADD COLUMN IF NOT EXISTS cta_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN presentations.cta_text IS 'Text for the call to action button';
COMMENT ON COLUMN presentations.cta_url IS 'URL for the call to action button';
