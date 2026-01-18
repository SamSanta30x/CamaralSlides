-- Add additional columns to presentation_views for detailed tracking
ALTER TABLE presentation_views
ADD COLUMN IF NOT EXISTS viewer_name TEXT,
ADD COLUMN IF NOT EXISTS viewer_email TEXT,
ADD COLUMN IF NOT EXISTS recording_url TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT,
ADD COLUMN IF NOT EXISTS call_status TEXT CHECK (call_status IN ('Successful', 'Failed', 'In Progress', 'No Call')),
ADD COLUMN IF NOT EXISTS transcription JSONB; -- Store transcription as JSON array

-- Add comments
COMMENT ON COLUMN presentation_views.viewer_name IS 'Name of the viewer (if provided during call)';
COMMENT ON COLUMN presentation_views.viewer_email IS 'Email of the viewer (if provided during call)';
COMMENT ON COLUMN presentation_views.recording_url IS 'URL to the call recording from ElevenLabs';
COMMENT ON COLUMN presentation_views.summary IS 'AI-generated summary of the call';
COMMENT ON COLUMN presentation_views.call_status IS 'Status of the call: Successful, Failed, In Progress, or No Call';
COMMENT ON COLUMN presentation_views.transcription IS 'Array of transcription messages with timestamps';

-- Example transcription structure:
-- [
--   {
--     "timestamp": "00:00:12",
--     "speaker": "Agent",
--     "text": "Hello! Welcome to our presentation."
--   },
--   {
--     "timestamp": "00:00:18",
--     "speaker": "User",
--     "text": "Hi, thanks for having me."
--   }
-- ]
