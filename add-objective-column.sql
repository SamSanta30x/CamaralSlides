-- Add objective column to presentations table
ALTER TABLE presentations 
ADD COLUMN IF NOT EXISTS objective TEXT;

-- Add comment for documentation
COMMENT ON COLUMN presentations.objective IS 'The objective or goal of the presentation';
