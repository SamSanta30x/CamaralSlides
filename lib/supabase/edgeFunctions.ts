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

export interface GenerateDescriptionResponse {
  success: boolean
  description?: string
  error?: string
}

export async function generateSlideDescription(
  slideId: string,
  imageUrl: string,
  presentationObjective?: string,
  mode: 'generate' | 'improve' = 'generate',
  currentDescription?: string
): Promise<GenerateDescriptionResponse> {
  try {
    const supabase = createClient()

    // Get current user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        success: false,
        error: 'User not authenticated',
      }
    }

    console.log(`${mode === 'improve' ? '✨' : '🤖'} ${mode === 'improve' ? 'Improving' : 'Generating'} description for slide:`, slideId)
    console.log('Image URL:', imageUrl)
    console.log('Presentation objective:', presentationObjective)
    if (mode === 'improve') {
      console.log('Current description:', currentDescription)
    }

    // Call Edge Function to generate description
    const { data, error } = await supabase.functions.invoke('generate-slide-description', {
      body: {
        slideId,
        imageUrl,
        presentationObjective,
        mode,
        currentDescription,
      },
    })

    if (error) {
      console.error('❌ Edge function error:', error)
      console.error('❌ Error name:', error.name)
      console.error('❌ Error message:', error.message)
      
      // Try to read the response body if it's a FunctionsHttpError
      if (error.context && error.context instanceof Response) {
        try {
          const responseText = await error.context.text()
          console.error('📄 Response body:', responseText)
          
          // Try to parse as JSON
          try {
            const responseJson = JSON.parse(responseText)
            console.error('📄 Parsed error:', responseJson)
            
            // Return the actual error from the Edge Function
            return {
              success: false,
              error: responseJson.error || error.message,
            }
          } catch (parseError) {
            console.error('Could not parse response as JSON')
          }
        } catch (readError) {
          console.error('Could not read response body:', readError)
        }
      }
      
      return {
        success: false,
        error: `Failed to generate description: ${error.message}`,
      }
    }

    console.log('✅ Description generated successfully')
    return data as GenerateDescriptionResponse
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
