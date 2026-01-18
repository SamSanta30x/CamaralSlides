# Agent Configuration Setup

## Database Migration Required

To enable agent configuration persistence, you need to run the SQL migration.

### Steps:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/vogxtprdcnmlzvuxmbss
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `add-agent-columns.sql`
5. Click **Run** or press `Cmd/Ctrl + Enter`

### What this migration does:

Adds the following columns to the `presentations` table:
- `agent_name` - Name of the AI agent (default: 'Max')
- `agent_voice` - Voice selection (default: 'Alejandro')
- `agent_language` - Language setting (default: 'Spanish')
- `agent_first_message` - First message the agent will say
- `agent_description` - Description of what the agent should do/say

### After running the migration:

All agent configuration inputs on the `/presentation/[id]/agent` page will automatically save to the database and persist across page reloads.

### Features:
- ✅ Auto-save with 500ms debouncing
- ✅ Functional Voice dropdown (Alejandro, Emma, Max, Sofia, James)
- ✅ Functional Language dropdown (Spanish, English, French, German, Portuguese)
- ✅ Agent name input
- ✅ First message textarea
- ✅ Agent description textarea
- ✅ Presentation objective (already working)

### Verification:

After running the migration, you can verify it worked by:
1. Going to any presentation's Agent page
2. Filling in the agent configuration
3. Refreshing the page
4. Confirming all values are still there
