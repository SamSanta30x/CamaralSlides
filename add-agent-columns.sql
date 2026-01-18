-- Add agent configuration columns to presentations table
-- This allows storing AI agent settings for each presentation

ALTER TABLE presentations
ADD COLUMN IF NOT EXISTS agent_name TEXT DEFAULT 'Max',
ADD COLUMN IF NOT EXISTS agent_voice TEXT DEFAULT 'Alejandro',
ADD COLUMN IF NOT EXISTS agent_language TEXT DEFAULT 'Spanish',
ADD COLUMN IF NOT EXISTS agent_first_message TEXT DEFAULT 'Hello! I''m Emma, your AI assistant. How can I help you today?',
ADD COLUMN IF NOT EXISTS agent_description TEXT;

-- Add comment to document the new columns
COMMENT ON COLUMN presentations.agent_name IS 'Name of the AI agent for this presentation';
COMMENT ON COLUMN presentations.agent_voice IS 'Voice selection for the AI agent';
COMMENT ON COLUMN presentations.agent_language IS 'Language setting for the AI agent';
COMMENT ON COLUMN presentations.agent_first_message IS 'First message the AI agent will say';
COMMENT ON COLUMN presentations.agent_description IS 'Description of what the AI agent should do/say';
