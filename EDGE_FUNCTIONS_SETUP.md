# Supabase Edge Functions Setup

This guide explains how to deploy and use the PDF processing Edge Function.

## What is an Edge Function?

Edge Functions are serverless functions that run on Supabase's infrastructure. They allow you to:
- Execute code without managing servers
- Scale automatically to handle any load
- Access Supabase Storage and Database directly
- Process files server-side for better performance and security

## Prerequisites

1. Supabase project (you should already have this)
2. Supabase CLI installed (already done via `npm install supabase --save-dev`)
3. Supabase project linked to your local environment

## Setup Steps

### 1. Link your local project to Supabase

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

To find your `PROJECT_REF`:
1. Go to https://supabase.com/dashboard
2. Select your project
3. The URL will be: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### 2. Set Environment Variables

The Edge Function needs access to your Supabase project. These are set automatically when deployed, but for local testing:

```bash
# These are already available in your Edge Function:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
```

### 3. Test Locally (Optional)

```bash
npx supabase functions serve process-pdf
```

Then test with:

```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-pdf' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"presentationId":"test-123","pdfPath":"temp/test.pdf"}'
```

### 4. Deploy to Production

```bash
npx supabase functions deploy process-pdf
```

This will:
- Upload your function code to Supabase
- Make it available at `https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-pdf`
- Automatically set up environment variables

### 5. Verify Deployment

After deployment, you should see:

```
Deployed Function process-pdf
  URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-pdf
```

## How It Works

### Upload Flow:

1. **User uploads PDF** → Frontend
2. **Upload to temp storage** → `lib/supabase/edgeFunctions.ts`
3. **Call Edge Function** → Processes PDF server-side
4. **Extract pages** → Each page becomes a slide
5. **Upload slide images** → Supabase Storage
6. **Create slide records** → Supabase Database
7. **Return slide data** → Frontend redirects to viewer

### Code Flow:

```typescript
// Frontend calls:
uploadAndProcessPDF(presentationId, pdfFile)
  ↓
// Uploads PDF to temp storage
  ↓
// Invokes Edge Function
supabase.functions.invoke('process-pdf', { presentationId, pdfPath })
  ↓
// Edge Function:
// 1. Downloads PDF from storage
// 2. Uses pdf-lib to extract pages
// 3. Creates individual PDFs for each page
// 4. Uploads to storage
// 5. Creates slide records in DB
  ↓
// Returns slide data to frontend
  ↓
// Frontend redirects to /presentation/[id]
```

## Current Implementation

The current Edge Function extracts each PDF page and saves it as a separate PDF file. This is because:

1. **No dependencies needed** - pdf-lib works natively in Deno
2. **Fast processing** - No image rendering required
3. **Small file sizes** - PDFs are already optimized

### Why PDF instead of PNG?

- PDFs maintain vector quality
- Smaller file sizes for text-heavy slides
- Faster processing (no image rendering)
- The presentation viewer can display PDFs directly

If you need PNG images instead, you can:
1. Add a conversion service (like Cloudinary)
2. Use a Deno library with canvas support
3. Set up a Docker-based solution with ImageMagick

## Monitoring & Debugging

### View Logs:

```bash
npx supabase functions logs process-pdf
```

### Check Function Status:

```bash
npx supabase functions list
```

### Common Issues:

1. **Function not found**: Make sure you deployed with `npx supabase functions deploy process-pdf`
2. **Permission denied**: Check that your Storage RLS policies allow the service role to read/write
3. **Timeout**: Edge Functions have a 150s timeout. Very large PDFs might need chunking.

## Costs

- **Free Tier**: 500,000 invocations per month
- **After Free Tier**: $0.00000002 per request (~$2 per 100M requests)
- **Execution Time**: $0.00001667 per GB-second

### Example Cost:
- 10,000 PDFs/day
- Average 5 pages each
- ~2 seconds processing per PDF
- **Monthly cost**: ~$3

## Scaling

Edge Functions automatically scale to handle:
- Thousands of concurrent requests
- Millions of requests per day
- No infrastructure management needed

## Next Steps

1. Deploy the function with `npx supabase functions deploy process-pdf`
2. Test with a real PDF from your dashboard
3. Monitor the logs to ensure it's working correctly
4. Adjust the function if you need PNG output instead of PDF pages

## Alternative: PNG Conversion

If you need PNG images instead of PDF pages, here are your options:

### Option 1: Use Cloudinary (Recommended for MVP)
```typescript
// Add to Edge Function
const cloudinaryUpload = await fetch(
  `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
  {
    method: 'POST',
    body: formData
  }
)
```

### Option 2: Use pdf.co API
- Sign up at https://pdf.co
- Add API key to your Supabase secrets
- Update Edge Function to use their conversion API

### Option 3: Deploy Custom Docker Container
- Use Supabase with external compute (AWS Lambda, etc.)
- Run ImageMagick or Ghostscript
- More complex but gives full control

## Support

- Supabase Edge Functions Docs: https://supabase.com/docs/guides/functions
- Supabase CLI Reference: https://supabase.com/docs/reference/cli
- pdf-lib Documentation: https://pdf-lib.js.org/
