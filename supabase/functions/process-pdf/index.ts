// Supabase Edge Function to process PDF files
// Extracts each page and saves as PNG image using pdf-lib

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1'
import { encode } from 'https://deno.land/std@0.224.0/encoding/base64.ts'

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
    const { data: pdfData, error: downloadError } = await supabaseClient.storage
      .from('slides')
      .download(pdfPath)

    if (downloadError) {
      throw new Error(`Failed to download PDF: ${downloadError.message}`)
    }

    if (!pdfData) {
      throw new Error('PDF data is null')
    }

    console.log('PDF downloaded successfully')

    // Load PDF with pdf-lib
    const arrayBuffer = await pdfData.arrayBuffer()
    const pdfDoc = await PDFDocument.load(arrayBuffer)
    const pageCount = pdfDoc.getPageCount()
    
    console.log(`PDF has ${pageCount} pages`)

    // Use CloudConvert API to convert PDF pages to PNG
    const cloudConvertApiKey = Deno.env.get('CLOUDCONVERT_API_KEY')
    
    const processSlide = async (pageIndex: number) => {
      try {
        console.log(`Processing slide ${pageIndex + 1}/${pageCount}...`)
        
        // Create a new PDF with just this page
        const singlePagePdf = await PDFDocument.create()
        const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [pageIndex])
        singlePagePdf.addPage(copiedPage)
        
        const pdfBytes = await singlePagePdf.save()
        const base64Pdf = encode(pdfBytes)
        
        let imageUrl: string
        
        // Try to convert to PNG if CloudConvert API key is available
        if (cloudConvertApiKey) {
          try {
            // Use CloudConvert to convert PDF to PNG
            const convertResponse = await fetch('https://api.cloudconvert.com/v2/convert', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${cloudConvertApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                tasks: {
                  'import-pdf': {
                    operation: 'import/base64',
                    file: base64Pdf,
                    filename: `slide_${pageIndex + 1}.pdf`,
                  },
                  'convert-to-png': {
                    operation: 'convert',
                    input: 'import-pdf',
                    output_format: 'png',
                    pixel_density: 150,
                  },
                  'export-png': {
                    operation: 'export/url',
                    input: 'convert-to-png',
                  },
                },
              }),
            })

            const convertData = await convertResponse.json()
            
            if (convertData.data?.tasks?.['export-png']?.result?.files?.[0]?.url) {
              const pngUrl = convertData.data.tasks['export-png'].result.files[0].url
              
              // Download the PNG
              const pngResponse = await fetch(pngUrl)
              const pngBlob = await pngResponse.blob()
              const pngArrayBuffer = await pngBlob.arrayBuffer()
              
              // Upload PNG to Supabase storage
              const pngFileName = `${presentationId}/slide_${pageIndex + 1}.png`
              const { error: uploadError } = await supabaseClient.storage
                .from('slides')
                .upload(pngFileName, pngArrayBuffer, {
                  contentType: 'image/png',
                  upsert: true
                })

              if (uploadError) {
                console.error(`Failed to upload PNG:`, uploadError)
                throw uploadError
              }

              // Get public URL
              const { data: { publicUrl } } = supabaseClient.storage
                .from('slides')
                .getPublicUrl(pngFileName)
              
              imageUrl = publicUrl
              console.log(`✅ Converted to PNG: ${imageUrl}`)
            } else {
              throw new Error('CloudConvert conversion failed')
            }
          } catch (conversionError) {
            console.error(`Conversion error:`, conversionError)
            // Fall back to PDF
            const pdfFileName = `${presentationId}/slide_${pageIndex + 1}.pdf`
            const { error: uploadError } = await supabaseClient.storage
              .from('slides')
              .upload(pdfFileName, pdfBytes, {
                contentType: 'application/pdf',
                upsert: true
              })

            if (uploadError) {
              throw uploadError
            }

            const { data: { publicUrl } } = supabaseClient.storage
              .from('slides')
              .getPublicUrl(pdfFileName)
            
            imageUrl = publicUrl
          }
        } else {
          // No conversion API, save as PDF
          const pdfFileName = `${presentationId}/slide_${pageIndex + 1}.pdf`
          const { error: uploadError } = await supabaseClient.storage
            .from('slides')
            .upload(pdfFileName, pdfBytes, {
              contentType: 'application/pdf',
              upsert: true
            })

          if (uploadError) {
            throw uploadError
          }

          const { data: { publicUrl } } = supabaseClient.storage
            .from('slides')
            .getPublicUrl(pdfFileName)
          
          imageUrl = publicUrl
        }

        // Insert slide record into database
        const { error: dbError } = await supabaseClient
          .from('slides')
          .insert({
            presentation_id: presentationId,
            slide_order: pageIndex + 1,
            image_url: imageUrl,
            title: `Slide ${pageIndex + 1}`,
            description: '',
          })

        if (dbError) {
          throw dbError
        }

        console.log(`✅ Slide ${pageIndex + 1} processed successfully`)
        return { slideNumber: pageIndex + 1, imageUrl }
      } catch (error) {
        console.error(`Error processing slide ${pageIndex + 1}:`, error)
        return null
      }
    }

    // Process first slide immediately
    const firstSlide = await processSlide(0)
    
    if (!firstSlide) {
      throw new Error('Failed to process first slide')
    }

    // Process remaining slides asynchronously
    if (pageCount > 1) {
      Promise.all(
        Array.from({ length: pageCount - 1 }, (_, i) => processSlide(i + 1))
      ).then((results) => {
        const successCount = results.filter(r => r !== null).length
        console.log(`✅ Async processing complete: ${successCount}/${pageCount - 1} slides`)
      }).catch((error) => {
        console.error('Error in async processing:', error)
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        pageCount,
        processedCount: 1,
        warning: pageCount > 1 ? `Processing ${pageCount - 1} more slides in background...` : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error processing PDF:', error)
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
