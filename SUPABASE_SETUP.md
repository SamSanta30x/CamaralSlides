# Supabase Authentication Setup

This project uses Supabase for authentication. Follow these steps to set it up:

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

## 2. Get Your API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**

## 3. Configure Environment Variables

Create a `.env.local` file in the root of your project with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
4. Copy Client ID and Client Secret to Supabase

## 5. Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation email template
3. Set your site URL in **Authentication** → **URL Configuration**:
   - Site URL: `https://yourdomain.com` (production)
   - Redirect URLs: Add `http://localhost:3000/auth/callback` for local dev

## 6. Test Authentication

### Email/Password Authentication:
1. Go to `/signup` to create an account
2. Check your email for confirmation
3. Click the confirmation link
4. Log in at `/login`

### Google OAuth:
1. Click "Continue with Google" on login/signup pages
2. Authorize the app
3. You'll be redirected to `/dashboard`

## Features Implemented

✅ Email/Password signup with email confirmation
✅ Email/Password login
✅ Google OAuth login
✅ Protected routes (Dashboard)
✅ Auto-redirect when logged in
✅ Sign out functionality
✅ Error handling and loading states
✅ Responsive LoginModal with authentication

## File Structure

```
lib/
  auth/
    AuthContext.tsx          # Auth provider and hooks
  supabase/
    client.ts                # Browser client
    server.ts                # Server client
app/
  auth/
    callback/
      route.ts               # OAuth callback handler
  login/
    page.tsx                 # Login page
  signup/
    page.tsx                 # Signup page
  dashboard/
    page.tsx                 # Protected dashboard
```

## Usage in Components

```tsx
import { useAuth } from '@/lib/auth/AuthContext'

function MyComponent() {
  const { user, loading, signIn, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please log in</div>
  
  return (
    <div>
      <p>Welcome {user.email}</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  )
}
```

## Security Notes

- Never commit `.env.local` to git
- Use environment variables for all sensitive data
- Enable Row Level Security (RLS) in Supabase for production
- Configure proper CORS settings in Supabase dashboard
