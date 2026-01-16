-- Enable Realtime for slides table
-- Run this in your Supabase SQL Editor

-- 1. Add slides table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE slides;

-- 2. Verify it's enabled
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- You should see 'slides' in the results
