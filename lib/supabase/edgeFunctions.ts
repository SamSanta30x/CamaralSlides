import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface ProcessPDFResponse {
  success: boolean
  slides?: Array<{
    id: string
    presentation_id: string
    slide_order: number
    image_url: string
    title: string
    description: string
  }>
  pageCount?: number
  error?: string
  warning?: string
}

/**
 * Call Edge Function to process a PDF file
 * The PDF must already be uploaded to Supabase Storage
 */
export async function processPDFWithEdgeFunction(
  presentationId: string,
  pdfPath: string
): Promise<ProcessPDFResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('process-pdf', {
      body: {
        presentationId,
        pdfPath,
      },
    })

    if (error) {
      console.error('Edge function error:', error)
      return {
        success: false,
        error: error.message || 'Failed to process PDF',
      }
    }

    return data as ProcessPDFResponse
  } catch (error) {
    console.error('Error calling edge function:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Upload PDF to temporary storage and process it
 */
export async function uploadAndProcessPDF(
  presentationId: string,
  pdfFile: File
): Promise<ProcessPDFResponse> {
  try {
    // Upload PDF to temporary location
    const tempPath = `temp/${presentationId}/${pdfFile.name}`
    
    const { error: uploadError } = await supabase.storage
      .from('slides')
      .upload(tempPath, pdfFile, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      throw new Error(`Failed to upload PDF: ${uploadError.message}`)
    }

    console.log('PDF uploaded, processing...')

    // Call Edge Function to process
    const result = await processPDFWithEdgeFunction(presentationId, tempPath)

    // Clean up temporary file
    if (result.success) {
      await supabase.storage.from('slides').remove([tempPath])
    }

    return result
  } catch (error) {
    console.error('Error uploading and processing PDF:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
