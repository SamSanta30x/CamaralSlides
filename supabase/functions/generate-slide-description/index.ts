import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GenerateDescriptionRequest {
  slideId: string
  imageUrl: string
  presentationObjective?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Received request:', { method: req.method })

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

    console.log('👤 User verification:', { userId: user?.id, authError })

    if (authError || !user) {
      throw new Error('Invalid authorization token')
    }

    // Parse request body
    const { slideId, imageUrl, presentationObjective }: GenerateDescriptionRequest = await req.json()
    console.log('📦 Request body:', { slideId, imageUrl, presentationObjective })

    // Validate input
    if (!slideId || !imageUrl) {
      throw new Error('Missing required fields: slideId and imageUrl')
    }

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Check if imageUrl is a PDF or an image
    const isPDF = imageUrl.toLowerCase().endsWith('.pdf')
    
    let systemPrompt = `You are a professional presentation narrator. Your job is to describe what a presenter should say when showing this slide. 
Provide a clear, engaging description that a presenter can use.
Keep it concise but informative (2-3 sentences). Focus on the key points.`

    let userPrompt: string
    let messages: any[]

    if (presentationObjective) {
      systemPrompt += `\n\nPresentation Objective: ${presentationObjective}`
    }

    if (isPDF) {
      // For PDFs, we can't use vision API directly
      // Instead, ask the AI to generate a generic description based on slide number and objective
      userPrompt = `Generate a professional presenter description for slide ${slideId.split('-')[0]} of a presentation.`
      if (presentationObjective) {
        userPrompt += ` The presentation's objective is: "${presentationObjective}".`
      }
      userPrompt += ` Create an engaging 2-3 sentence description that a presenter could use to introduce this slide.`
      
      messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ]
    } else {
      // For images, use vision API
      userPrompt = 'Analyze this slide and provide a description of what the presenter should say.'
      if (presentationObjective) {
        userPrompt += ` Keep in mind the presentation's objective: "${presentationObjective}"`
      }
      
      messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high'
              }
            }
          ]
        }
      ]
    }

    // Call OpenAI API
    console.log(`🤖 Calling OpenAI API (${isPDF ? 'text' : 'vision'} mode)...`)
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const openaiData = await openaiResponse.json()
    const generatedDescription = openaiData.choices[0]?.message?.content?.trim()

    if (!generatedDescription) {
      throw new Error('No description generated')
    }

    console.log('✅ Generated description:', generatedDescription)

    // Update slide description in database
    const { error: updateError } = await supabase
      .from('slides')
      .update({ description: generatedDescription })
      .eq('id', slideId)

    if (updateError) {
      console.error('Error updating slide:', updateError)
      throw new Error(`Failed to update slide: ${updateError.message}`)
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        description: generatedDescription,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('💥 Error in generate-slide-description:', error)
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
