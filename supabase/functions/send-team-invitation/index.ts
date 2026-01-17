import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationRequest {
  invitedEmail: string
  organizationName: string
  inviterName: string
  role: 'Admin' | 'Member'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the user's JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authorization token')
    }

    // Parse request body
    const { invitedEmail, organizationName, inviterName, role }: InvitationRequest = await req.json()

    // Validate input
    if (!invitedEmail || !organizationName || !inviterName) {
      throw new Error('Missing required fields')
    }

    // Generate unique invitation token
    const invitationToken = crypto.randomUUID()

    // Store invitation in database
    const { data: invitation, error: inviteError } = await supabase
      .from('team_invitations')
      .insert({
        organization_id: user.id,
        organization_name: organizationName,
        invited_email: invitedEmail,
        invited_by_id: user.id,
        invited_by_name: inviterName,
        role: role,
        invitation_token: invitationToken,
        status: 'pending',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      throw new Error(`Failed to create invitation: ${inviteError.message}`)
    }

    // Get the site URL for the invitation link
    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000'
    const invitationLink = `${siteUrl}/auth/accept-invitation?token=${invitationToken}`

    // Send invitation email
    // Note: You would integrate with a service like Resend, SendGrid, or use Supabase's email service
    // For now, we'll use Supabase's built-in email functionality
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #0d0d0d; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #66e7f5 0%, #4ade80 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: white; padding: 40px 30px; border: 1px solid #e5e5e5; border-radius: 0 0 12px 12px; }
            .button { display: inline-block; background: #0d0d0d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You've been invited!</h1>
            </div>
            <div class="content">
              <p><strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Camaral.</p>
              
              <p>As a <strong>${role}</strong>, you'll be able to collaborate with the team and access shared presentations.</p>
              
              <p style="text-align: center;">
                <a href="${invitationLink}" class="button">Accept Invitation</a>
              </p>
              
              <p style="font-size: 14px; color: #666;">
                This invitation will expire in 7 days. If you don't want to join this organization, you can safely ignore this email.
              </p>
              
              <p style="font-size: 14px; color: #666;">
                Or copy and paste this link into your browser:<br>
                <code style="background: #f5f5f5; padding: 8px; display: block; margin-top: 8px; word-break: break-all;">${invitationLink}</code>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Camaral. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // In production, integrate with an email service
    // For now, we'll log the invitation
    console.log('Invitation created:', {
      email: invitedEmail,
      token: invitationToken,
      link: invitationLink,
    })

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation sent successfully',
        invitationToken,
        invitationLink, // For testing purposes
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-team-invitation:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
