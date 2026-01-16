// Supabase Edge Function to process PDF files
// Converts PDF pages to PNG images using pdf2pic API

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessPDFRequest {
  presentationId: string
  pdfPath: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { presentationId, pdfPath } = await req.json() as ProcessPDFRequest

    console.log(`Processing PDF for presentation ${presentationId} at path ${pdfPath}`)

    // Download the PDF from storage
    const { data: pdfData, error: downloadError } = await supabaseClient.storage
      .from('slides')
      .download(pdfPath)

    if (downloadError) {
      throw new Error(`Failed to download PDF: ${downloadError.message}`)
    }

    console.log('PDF downloaded, converting to images...')

    // Convert PDF to base64
    const arrayBuffer = await pdfData.arrayBuffer()
    const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

    // Use pdf.co API (free tier: 300 requests/month)
    // Alternative: Use CloudConvert API
    const conversionResponse = await fetch('https://api.pdf.co/v1/pdf/convert/to/png', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('PDF_CO_API_KEY') || 'demo', // Use 'demo' for testing
      },
      body: JSON.stringify({
        file: base64Pdf,
        inline: true,
        pages: '0-',
        async: false
      })
    })

    if (!conversionResponse.ok) {
      const errorText = await conversionResponse.text()
      console.error('PDF conversion failed:', errorText)
      
      // Fallback: Use CloudConvert API
      console.log('Trying CloudConvert as fallback...')
      const cloudConvertResponse = await fetch('https://api.cloudconvert.com/v2/convert', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('CLOUDCONVERT_API_KEY') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks: {
            'import-pdf': {
              operation: 'import/base64',
              file: base64Pdf,
              filename: 'document.pdf'
            },
            'convert-to-png': {
              operation: 'convert',
              input: 'import-pdf',
              output_format: 'png'
            },
            'export-png': {
              operation: 'export/url',
              input: 'convert-to-png'
            }
          }
        })
      })

      if (!cloudConvertResponse.ok) {
        throw new Error('Both conversion services failed. Please configure API keys.')
      }
    }

    const conversionResult = await conversionResponse.json()
    
    if (!conversionResult.urls || conversionResult.urls.length === 0) {
      throw new Error('No pages were converted')
    }

    console.log(`Converting ${conversionResult.urls.length} pages...`)

    // Process each page
    const slides = []
    for (let i = 0; i < conversionResult.urls.length; i++) {
      const imageUrl = conversionResult.urls[i]
      
      try {
        // Download the converted image
        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) {
          console.error(`Failed to download image ${i + 1}`)
          continue
        }
        
        const imageBlob = await imageResponse.blob()
        
        // Upload to Supabase Storage
        const fileName = `${presentationId}/slide_${i + 1}.png`
        const { error: uploadError } = await supabaseClient.storage
          .from('slides')
          .upload(fileName, imageBlob, {
            contentType: 'image/png',
            upsert: true
          })

        if (uploadError) {
          console.error(`Failed to upload slide ${i + 1}:`, uploadError)
          continue
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseClient.storage
          .from('slides')
          .getPublicUrl(fileName)

        // Create slide record in database
        const { data: slide, error: slideError } = await supabaseClient
          .from('slides')
          .insert({
            presentation_id: presentationId,
            slide_order: i + 1,
            image_url: publicUrl,
            title: `Slide ${i + 1}`,
            description: ''
          })
          .select()
          .single()

        if (slideError) {
          console.error(`Failed to create slide record for slide ${i + 1}:`, slideError)
          continue
        }

        slides.push(slide)
        console.log(`✓ Processed slide ${i + 1}/${conversionResult.urls.length}`)
      } catch (error) {
        console.error(`Error processing slide ${i + 1}:`, error)
        continue
      }
    }

    // Clean up temp PDF
    try {
      await supabaseClient.storage.from('slides').remove([pdfPath])
    } catch (error) {
      console.error('Failed to clean up temp file:', error)
    }

    console.log(`✓ Successfully processed ${slides.length} slides`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        slides,
        pageCount: slides.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing PDF:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start`
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-pdf' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"presentationId":"123","pdfPath":"temp/file.pdf"}'

*/
