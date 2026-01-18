# OpenAI API Configuration

## Setup Instructions

### 1. Add OpenAI API Key to Supabase

Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets

Add the following secret:

```
Name: OPENAI_API_KEY
Value: [Your OpenAI API Key - starts with sk-proj-...]
```

**Note:** The API key should be added manually in the Supabase Dashboard for security.

### 2. Run Database Migration

Execute in Supabase SQL Editor:

```sql
-- Add objective column to presentations table
ALTER TABLE presentations 
ADD COLUMN IF NOT EXISTS objective TEXT;

-- Add comment for documentation
COMMENT ON COLUMN presentations.objective IS 'The objective or goal of the presentation';
```

Or run the file: `add-objective-column.sql`

### 3. How It Works

1. **User clicks "Generate it with AI"** on a slide description
2. **Edge Function is called** with:
   - Slide ID
   - Image URL
   - Presentation objective (if set)
3. **OpenAI Vision API** analyzes the slide image
4. **AI generates** a presenter-style description
5. **Description is saved** to the database
6. **UI updates** with the generated text

### 4. Context Used

The AI uses:
- ✅ The slide image (high detail)
- ✅ Presentation objective (from Agent page)
- ✅ System prompt: Act as a professional presentation narrator

### 5. Model

- **Model**: gpt-4o (GPT-4 with vision)
- **Max tokens**: 300
- **Temperature**: 0.7
- **Detail**: high (for image analysis)

## Usage

### In Content Page
1. Go to any slide
2. Click "Generate it with AI" in the description field
3. Wait for AI to analyze the slide
4. Description appears automatically

### In Agent Page
1. Set "What's the objective of the presentation?"
2. This context is used when generating descriptions
3. Helps AI understand the presentation's goal

## Features

- ✅ Analyzes slide images with GPT-4 Vision
- ✅ Uses presentation objective as context
- ✅ Generates presenter-style descriptions
- ✅ Auto-saves to database
- ✅ Loading states and error handling
- ✅ Debounced objective saving (500ms)
