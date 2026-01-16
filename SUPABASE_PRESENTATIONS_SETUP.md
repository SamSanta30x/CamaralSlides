# Supabase Presentations Setup

This guide explains how to set up the presentations and slides database schema in Supabase.

## Prerequisites

- Supabase project created
- Supabase credentials configured in `.env.local`

## Setup Instructions

### 1. Run the SQL Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of `supabase-schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** to execute the schema

This will create:
- `presentations` table
- `slides` table
- `slides` storage bucket
- Row Level Security (RLS) policies
- Indexes for performance
- Triggers for `updated_at` timestamps

### 2. Verify Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Verify that the `slides` bucket was created
3. The bucket should be set to **public** (anyone can view)
4. Storage policies should allow:
   - Authenticated users to upload
   - Anyone to view
   - Authenticated users to update/delete their own files

### 3. Test the Setup

After running the schema, you can test by:

1. Logging into your app
2. Uploading a PDF or image file
3. The app will:
   - Create a presentation record
   - Upload the file(s) to Supabase Storage
   - Create slide records with image URLs
   - Redirect you to the presentation viewer

## Database Schema

### presentations

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| title | TEXT | Presentation title |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### slides

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| presentation_id | UUID | Foreign key to presentations |
| image_url | TEXT | Public URL of slide image |
| title | TEXT | Slide title (nullable) |
| description | TEXT | Slide description (nullable) |
| slide_order | INTEGER | Order in presentation |
| created_at | TIMESTAMP | Creation timestamp |

## Security

All tables use Row Level Security (RLS) to ensure:
- Users can only see their own presentations
- Users can only modify their own presentations and slides
- Storage files are accessible to all for viewing
- Only authenticated users can upload files

## Troubleshooting

### "Permission denied" errors
- Verify RLS policies are enabled
- Check that you're logged in
- Ensure your user ID matches the presentation's user_id

### Images not displaying
- Check that the `slides` bucket is public
- Verify the storage policies allow SELECT for everyone
- Ensure the image URLs are correct

### Upload fails
- Check storage policies allow INSERT for authenticated users
- Verify file size limits (default 50MB in Supabase)
- Ensure file types are supported (PDF, PNG, JPG, WEBP)
