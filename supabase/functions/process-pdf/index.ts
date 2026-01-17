// Supabase Edge Function to process PDF files
// Extracts each page as a separate PDF file

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1'

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
    console.log('Edge Function invoked')
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    console.log('Auth header present:', !!authHeader)
    
    // Create service role client for operations
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
    console.log(`Attempting to download PDF from: slides/${pdfPath}`)
    const { data: pdfData, error: downloadError } = await supabaseClient.storage
      .from('slides')
      .download(pdfPath)

    if (downloadError) {
      console.error('Download error:', downloadError)
      throw new Error(`Failed to download PDF: ${downloadError.message}`)
    }

    if (!pdfData) {
      throw new Error('PDF data is null')
    }

    console.log('PDF downloaded successfully, extracting pages...')

    // Load PDF with pdf-lib
    const arrayBuffer = await pdfData.arrayBuffer()
    console.log(`PDF size: ${arrayBuffer.byteLength} bytes`)
    
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pageCount = pdfDoc.getPageCount()
    
    console.log(`PDF has ${pageCount} pages`)

    // Process FIRST slide immediately and return response
    // Then process remaining slides asynchronously
    
    const processSlide = async (pageIndex: number) => {
      try {
        console.log(`Processing slide ${pageIndex + 1}/${pageCount}...`)
        
        // Create a new PDF with just this page
        const singlePagePdf = await PDFDocument.create()
        const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [pageIndex])
        singlePagePdf.addPage(copiedPage)
        
        const pdfBytes = await singlePagePdf.save()
        
        // Upload the single-page PDF
        const fileName = `${presentationId}/slide_${pageIndex + 1}.pdf`
        const { error: uploadError } = await supabaseClient.storage
          .from('slides')
          .upload(fileName, pdfBytes, {
            contentType: 'application/pdf',
            upsert: true
          })

        if (uploadError) {
          console.error(`Failed to upload slide ${pageIndex + 1}:`, uploadError)
          return null
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
            slide_order: pageIndex + 1,
            image_url: publicUrl,
            title: `Slide ${pageIndex + 1}`,
            description: ''
          })
          .select()
          .single()

        if (slideError) {
          console.error(`Failed to create slide record for slide ${pageIndex + 1}:`, slideError)
          return null
        }

        console.log(`✓ Processed slide ${pageIndex + 1}/${pageCount}`)
        return slide
      } catch (error) {
        console.error(`Error processing slide ${pageIndex + 1}:`, error)
        return null
      }
    }

    // Process FIRST slide immediately
    console.log('Processing first slide for immediate display...')
    const firstSlide = await processSlide(0)
    const slides = firstSlide ? [firstSlide] : []

    // Process remaining slides in background (don't await)
    if (pageCount > 1) {
      console.log(`Starting background processing of ${pageCount - 1} remaining slides...`)
      
      // Process remaining slides asynchronously - fire and forget
      void (async () => {
        for (let i = 1; i < pageCount; i++) {
          const slide = await processSlide(i)
          if (slide) {
            slides.push(slide)
          }
          // Small delay between slides
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        console.log(`✓ Background processing complete: ${slides.length} total slides`)
      })()
    }

    // Return immediately after first slide is processed
    // Background processing will continue for remaining slides
    console.log(`✓ First slide processed, returning response. Background processing ${pageCount - 1} remaining slides...`)

    // Clean up temp PDF in background (don't block response)
    supabaseClient.storage.from('slides').remove([pdfPath]).catch(error => {
      console.error('Failed to clean up temp file:', error)
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        slides,
        pageCount: pageCount, // Total expected slides
        processedCount: slides.length // Currently processed (should be 1 on immediate return)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error processing PDF:', error)
    
    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
