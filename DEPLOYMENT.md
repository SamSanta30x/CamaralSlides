# Deployment Guide

## Quick Start

### 1. Deploy Edge Function

The PDF processing happens server-side via Supabase Edge Functions. You **must** deploy this before PDFs will work.

```bash
# Login to Supabase
npx supabase login

# Link your project (get PROJECT_REF from Supabase dashboard URL)
npx supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
npx supabase functions deploy process-pdf
```

After deployment, you'll see:
```
Deployed Function process-pdf
  URL: https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-pdf
```

### 2. Test the Function

Upload a PDF from your dashboard. Check the browser console for logs:
- ✅ "Processing PDF with Edge Function..."
- ✅ "PDF processed successfully: X slides"

If it fails, check Edge Function logs:
```bash
npx supabase functions logs process-pdf --follow
```

### 3. Deploy Frontend (Vercel)

```bash
git push origin main
```

Vercel will automatically deploy your changes.

## What Changed

### Before (Client-Side Processing ❌)
- PDFs processed in browser with pdfjs-dist
- Slow for large PDFs
- High memory usage
- Timeout issues
- Not scalable

### After (Server-Side Processing ✅)
- PDFs processed on Supabase Edge Functions
- Fast and reliable
- Scales automatically
- Handles thousands of PDFs per day
- No browser limitations

## Architecture

```
┌─────────────┐
│   Browser   │
│  (Upload)   │
└──────┬──────┘
       │
       │ 1. Upload PDF
       ▼
┌─────────────────┐
│ Supabase Storage│
│    (Temp)       │
└──────┬──────────┘
       │
       │ 2. Invoke Edge Function
       ▼
┌────────────────────┐
│  Edge Function     │
│  - Download PDF    │
│  - Extract pages   │
│  - Upload slides   │
│  - Create DB records│
└──────┬─────────────┘
       │
       │ 3. Return slide data
       ▼
┌──────────────┐
│   Browser    │
│  (Redirect)  │
└──────────────┘
```

## Costs

### Edge Functions (Supabase)
- **Free**: 500K invocations/month
- **Paid**: $0.00000002 per request after free tier
- **Example**: 10K PDFs/day = ~$3/month after free tier

### Storage (Supabase)
- **Free**: 1GB storage
- **Paid**: $0.021/GB/month after free tier

### Hosting (Vercel)
- **Free**: Unlimited bandwidth for personal projects
- **Pro**: $20/month for teams (if needed)

## Environment Variables

Required in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The Edge Function automatically receives:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

No additional configuration needed!

## Monitoring

### View Edge Function Logs
```bash
npx supabase functions logs process-pdf --follow
```

### Check Function Status
```bash
npx supabase functions list
```

### Monitor Performance
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. Click on `process-pdf`
4. View metrics (invocations, errors, duration)

## Troubleshooting

### Problem: "Function not found"
**Solution**: Deploy the function first
```bash
npx supabase functions deploy process-pdf
```

### Problem: "Permission denied" when processing PDF
**Solution**: Check Storage RLS policies. The service role should have access.

### Problem: PDF processing times out
**Solution**: Edge Functions have 150s timeout. If PDFs are huge (100+ pages), consider:
- Splitting processing into chunks
- Using a background job queue
- Optimizing the conversion process

### Problem: Can't deploy Edge Function
**Solution**: Make sure you're linked to the right project
```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

## Next Steps

1. ✅ Deploy Edge Function (`npx supabase functions deploy process-pdf`)
2. ✅ Test with a PDF upload
3. ✅ Monitor logs to ensure it works
4. ✅ Push to main branch for Vercel deployment

For detailed Edge Functions documentation, see [EDGE_FUNCTIONS_SETUP.md](./EDGE_FUNCTIONS_SETUP.md)
