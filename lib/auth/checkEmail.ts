import { createClient } from '@/lib/supabase/client'

export async function checkEmailExists(email: string): Promise<{
  exists: boolean
  isGoogleAccount: boolean
  error?: string
}> {
  try {
    const supabase = createClient()
    
    // Check if email is a Google account by checking the provider
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    })

    if (error) {
      // If error is "User not found", email doesn't exist
      if (error.message.includes('User not found') || error.message.includes('not found')) {
        return { exists: false, isGoogleAccount: false }
      }
      return { exists: false, isGoogleAccount: false, error: error.message }
    }

    // For now, we'll use a simple check: if email domain is gmail.com, assume it could be Google
    const isGmail = email.toLowerCase().endsWith('@gmail.com')
    
    return { exists: true, isGoogleAccount: isGmail }
  } catch (error) {
    console.error('Error checking email:', error)
    return { exists: false, isGoogleAccount: false, error: 'Failed to check email' }
  }
}

// Alternative: Check if user exists by trying to get user metadata
export async function checkUserExists(email: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    // This is a workaround - in production you'd want a server-side endpoint
    // that checks the auth.users table
    const { data, error } = await supabase.rpc('check_user_exists', { user_email: email })
    
    if (error) {
      console.error('Error checking user:', error)
      return false
    }
    
    return data as boolean
  } catch (error) {
    console.error('Error:', error)
    return false
  }
}
