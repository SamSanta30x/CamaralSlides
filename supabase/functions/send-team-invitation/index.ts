import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    console.log('🔍 Received request:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries())
    })

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('❌ Missing authorization header')
      throw new Error('Missing authorization header')
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify the user's JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    console.log('👤 User verification:', { userId: user?.id, authError })
    
    if (authError || !user) {
      console.error('❌ Invalid authorization token:', authError)
      throw new Error('Invalid authorization token')
    }

    // Parse request body
    const body = await req.json()
    console.log('📦 Request body:', body)
    
    const { invitedEmail, organizationName, inviterName, role }: InvitationRequest = body

    // Validate input
    if (!invitedEmail || !organizationName || !inviterName) {
      console.error('❌ Missing required fields:', { invitedEmail, organizationName, inviterName })
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

    // Send invitation email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not configured, skipping email')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Invitation created (email not sent - RESEND_API_KEY missing)',
          invitationToken,
          invitationLink,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Create HTML email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
              line-height: 1.6; 
              color: #0d0d0d;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .container { 
              max-width: 600px; 
              margin: 40px auto; 
              background: white;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #66e7f5 0%, #4ade80 100%); 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 { 
              color: white; 
              margin: 0; 
              font-size: 28px;
              font-weight: 700;
            }
            .content { 
              padding: 40px 30px; 
            }
            .content p {
              margin: 0 0 16px 0;
              font-size: 16px;
              color: #0d0d0d;
            }
            .highlight {
              font-weight: 600;
              color: #0d0d0d;
            }
            .role-badge {
              display: inline-block;
              background: #e0f2fe;
              color: #0369a1;
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;
              margin: 8px 0;
            }
            .button-container {
              text-align: center;
              margin: 32px 0;
            }
            .button { 
              display: inline-block; 
              background: #0d0d0d; 
              color: white !important; 
              padding: 14px 32px; 
              text-decoration: none; 
              border-radius: 12px; 
              font-size: 16px;
              font-weight: 600;
            }
            .button:hover {
              background: #2d2d2d;
            }
            .info-box {
              background: #f5f5f5;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
            }
            .info-box p {
              margin: 0;
              font-size: 14px;
              color: #666;
            }
            .link-box {
              background: #f5f5f5;
              padding: 12px;
              border-radius: 8px;
              margin-top: 12px;
              word-break: break-all;
              font-size: 13px;
              color: #666;
              font-family: monospace;
            }
            .footer { 
              text-align: center; 
              padding: 30px;
              color: #666; 
              font-size: 14px;
              border-top: 1px solid #e5e5e5;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You've been invited!</h1>
            </div>
            <div class="content">
              <p>Hi there,</p>
              
              <p><span class="highlight">${inviterName}</span> has invited you to join <span class="highlight">${organizationName}</span> on Camaral.</p>
              
              <p>You'll join as a <span class="role-badge">${role}</span> and be able to collaborate with the team and access shared presentations.</p>
              
              <div class="button-container">
                <a href="${invitationLink}" class="button">Accept Invitation</a>
              </div>
              
              <div class="info-box">
                <p><strong>⏰ This invitation expires in 7 days</strong></p>
                <p style="margin-top: 8px;">If you don't want to join this organization, you can safely ignore this email.</p>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 24px;">
                Having trouble with the button? Copy and paste this link into your browser:
              </p>
              <div class="link-box">${invitationLink}</div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Camaral. All rights reserved.</p>
              <p style="margin-top: 8px; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email via Resend API
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Camaral <no-reply@camaral.ai>',
        to: [invitedEmail],
        subject: `${inviterName} invited you to join ${organizationName} on Camaral`,
        html: emailHtml,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData)
      throw new Error(`Failed to send email: ${resendData.message || 'Unknown error'}`)
    }

    console.log('Email sent successfully via Resend:', resendData)

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation email sent successfully',
        invitationToken,
        emailId: resendData.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    console.error('❌ Error in send-team-invitation:', {
      message: errorMessage,
      stack: errorStack,
      error
    })
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
