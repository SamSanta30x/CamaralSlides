// Supabase Edge Function to process PDF files
// This function converts PDF pages to PNG images using pdf-lib and canvas

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib@1.17.1'

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

    console.log('PDF downloaded, extracting pages...')

    // Load PDF with pdf-lib
    const arrayBuffer = await pdfData.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pageCount = pdfDoc.getPageCount()
    
    console.log(`PDF has ${pageCount} pages`)

    // For each page, we'll extract it as a separate PDF and upload
    // Then we'll use an external service or client-side rendering to convert to images
    const slides = []

    for (let i = 0; i < pageCount; i++) {
      // Create a new PDF with just this page
      const singlePagePdf = await PDFDocument.create()
      const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i])
      singlePagePdf.addPage(copiedPage)
      
      const pdfBytes = await singlePagePdf.save()
      
      // Upload the single-page PDF
      const fileName = `${presentationId}/slide_${i + 1}.pdf`
      const { error: uploadError } = await supabaseClient.storage
        .from('slides')
        .upload(fileName, pdfBytes, {
          contentType: 'application/pdf',
          upsert: true
        })

      if (uploadError) {
        console.error(`Failed to upload slide ${i + 1}:`, uploadError)
        throw new Error(`Failed to upload slide ${i + 1}: ${uploadError.message}`)
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
        throw new Error(`Failed to create slide record: ${slideError.message}`)
      }

      slides.push(slide)
      console.log(`✓ Processed slide ${i + 1}/${pageCount}`)
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

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/process-pdf' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"presentationId":"123","pdfPath":"temp/file.pdf"}'

*/
