import { createClient } from './client'

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
  pageCount?: number // Total number of slides expected
  processedCount?: number // Number of slides processed so far (1 on immediate return)
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
    const supabase = createClient()
    
    // Verify user is authenticated
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('No active session found')
      return {
        success: false,
        error: 'User not authenticated. Please log in again.',
      }
    }
    
    console.log('Calling Edge Function...')
    console.log('Session access_token:', session.access_token.substring(0, 20) + '...')
    
    // Explicitly send the Authorization header
    const { data, error } = await supabase.functions.invoke('process-pdf', {
      body: {
        presentationId,
        pdfPath,
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (error) {
      console.error('Edge function error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // FunctionsHttpError has a context property with the actual response
      if (error.context) {
        console.error('Error status:', error.context.status)
        console.error('Error statusText:', error.context.statusText)
      }
      
      return {
        success: false,
        error: error.message || 'Failed to process PDF',
      }
    }

    // Check if data is null (can happen with non-2xx responses)
    if (!data) {
      console.error('Edge function returned null data')
      return {
        success: false,
        error: 'Edge function returned no data',
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
    const supabase = createClient()
    
    // Upload PDF to temporary location
    const tempPath = `temp/${presentationId}/${pdfFile.name}`
    
    console.log(`Uploading PDF to: ${tempPath}`)
    const { error: uploadError } = await supabase.storage
      .from('slides')
      .upload(tempPath, pdfFile, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Upload error details:', uploadError)
      throw new Error(`Failed to upload PDF: ${uploadError.message}`)
    }

    console.log('PDF uploaded, processing...')

    // Call Edge Function to process
    const result = await processPDFWithEdgeFunction(presentationId, tempPath)

    if (!result.success) {
      console.error('Edge function processing failed:', result.error)
      // Don't clean up on failure so we can debug
      return result
    }

    // Clean up temporary file only on success
    try {
      await supabase.storage.from('slides').remove([tempPath])
      console.log('Temporary file cleaned up')
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file:', cleanupError)
      // Don't fail the whole operation if cleanup fails
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
