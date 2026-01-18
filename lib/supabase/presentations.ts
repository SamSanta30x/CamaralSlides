import { createClient } from '@/lib/supabase/client'
import { uploadAndProcessPDF } from '@/lib/supabase/edgeFunctions'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Upload remaining slides in background
 */
async function uploadRemainingSlides(
  presentationId: string,
  files: File[],
  supabase: SupabaseClient
): Promise<void> {
  console.log(`🔄 Starting background upload of ${files.length} remaining slides...`)

  // Upload all slides in parallel
  const uploadPromises = files.map(async (file, index) => {
    const slideNumber = index + 2 // +2 because first slide is already uploaded
    const fileExt = file.name.split('.').pop()
    const fileName = `${presentationId}/slide_${slideNumber}.${fileExt}`

    try {
      console.log(`⬆️ Uploading slide ${slideNumber}...`)

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('slides')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error(`Failed to upload slide ${slideNumber}:`, uploadError)
        return null
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('slides').getPublicUrl(fileName)

      // Create slide record
      const { data: slide, error: slideError } = await supabase
        .from('slides')
        .insert({
          presentation_id: presentationId,
          image_url: publicUrl,
          title: `Slide ${slideNumber}`,
          description: null,
          slide_order: slideNumber,
        })
        .select()
        .single()

      if (slideError) {
        console.error(`Failed to create slide ${slideNumber} record:`, slideError)
        return null
      }

      console.log(`✅ Slide ${slideNumber} uploaded successfully`)
      return slide
    } catch (error) {
      console.error(`Error uploading slide ${slideNumber}:`, error)
      return null
    }
  })

  // Wait for all uploads to complete
  const results = await Promise.all(uploadPromises)
  const successCount = results.filter(r => r !== null).length
  console.log(`✅ Background upload complete: ${successCount}/${files.length} slides uploaded`)
}

export interface Slide {
  id: string
  presentation_id: string
  image_url: string
  title: string | null
  description: string | null
  slide_order: number
  created_at: string
}

export interface Presentation {
  id: string
  user_id: string
  title: string
  objective: string | null
  cta_text: string | null
  cta_url: string | null
  created_at: string
  updated_at: string
  slides?: Slide[]
}

/**
 * Create a new presentation with slides
 * For PDFs: Uses Edge Function for server-side processing
 * For images: Uploads directly
 */
export async function createPresentation(
  title: string,
  files: File[]
): Promise<{ data: Presentation | null; error: Error | null }> {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    // Create presentation
    const { data: presentation, error: presentationError } = await supabase
      .from('presentations')
      .insert({
        user_id: user.id,
        title,
      })
      .select()
      .single()

    if (presentationError) {
      return { data: null, error: presentationError }
    }

    // Check if it's a PDF - convert to PNG images first
    let filesToUpload = files
    
    // Dynamic import to avoid SSR issues with pdf.js
    const isPDF = files.length === 1 && (files[0].type === 'application/pdf' || files[0].name.toLowerCase().endsWith('.pdf'))
    
    if (isPDF) {
      console.log('📄 PDF detected, converting to PNG images...')
      try {
        // Dynamic import only when needed (client-side only)
        const { convertPDFToImages } = await import('@/lib/utils/pdfToImages')
        const { images } = await convertPDFToImages(files[0], 2)
        console.log(`✅ Converted PDF to ${images.length} PNG images`)
        filesToUpload = images
      } catch (error) {
        console.error('❌ Failed to convert PDF to images:', error)
        return {
          data: null,
          error: new Error('Failed to convert PDF to images. Please try again.'),
        }
      }
    }

    // Upload FIRST slide immediately and wait for it
    const firstFile = filesToUpload[0]
    const firstFileExt = firstFile.name.split('.').pop()
    const firstFileName = `${presentation.id}/slide_1.${firstFileExt}`

    console.log('⚡ Uploading first slide immediately...')

    const { error: firstUploadError } = await supabase.storage
      .from('slides')
      .upload(firstFileName, firstFile, {
        cacheControl: '3600',
        upsert: false,
      })

    if (firstUploadError) {
      console.error('Failed to upload first slide:', firstUploadError)
      return {
        data: null,
        error: new Error('Failed to upload first slide'),
      }
    }

    // Get public URL for first slide
    const {
      data: { publicUrl: firstPublicUrl },
    } = supabase.storage.from('slides').getPublicUrl(firstFileName)

    // Create first slide record
    const { data: firstSlide, error: firstSlideError } = await supabase
      .from('slides')
      .insert({
        presentation_id: presentation.id,
        image_url: firstPublicUrl,
        title: 'Slide 1',
        description: null,
        slide_order: 1,
      })
      .select()
      .single()

    if (firstSlideError) {
      console.error('Failed to create first slide record:', firstSlideError)
      return {
        data: null,
        error: new Error('Failed to create first slide'),
      }
    }

    console.log('✅ First slide uploaded, processing remaining slides in background...')

    // Upload remaining slides in background (don't await)
    if (filesToUpload.length > 1) {
      uploadRemainingSlides(presentation.id, filesToUpload.slice(1), supabase).catch(error => {
        console.error('Background upload error:', error)
      })
    }

    // Store expected slide count in presentation metadata for UI
    // This helps the UI know how many placeholders to show
    await supabase
      .from('presentations')
      .update({ 
        updated_at: new Date().toISOString(),
        // We'll use a custom metadata field if available, or just rely on realtime
      })
      .eq('id', presentation.id)

    // Return immediately with first slide and total count info
    return {
      data: { 
        ...presentation, 
        slides: [firstSlide],
        // Add a temporary property to indicate expected count
        _expectedSlideCount: filesToUpload.length 
      } as any,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Get all presentations for the current user
 */
export async function getPresentations(): Promise<{
  data: Presentation[] | null
  error: Error | null
}> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('presentations')
      .select(
        `
        *,
        slides (*)
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error }
    }

    // Sort slides by order for each presentation
    if (data) {
      data.forEach((presentation: Presentation) => {
        if (presentation.slides) {
          presentation.slides.sort((a: Slide, b: Slide) => a.slide_order - b.slide_order)
        }
      })
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Get a single presentation by ID
 */
export async function getPresentation(
  id: string
): Promise<{ data: Presentation | null; error: Error | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('presentations')
      .select(
        `
        *,
        slides (*)
      `
      )
      .eq('id', id)
      .single()

    if (error) {
      return { data: null, error }
    }

    // Sort slides by order
    if (data.slides) {
      data.slides.sort((a: Slide, b: Slide) => a.slide_order - b.slide_order)
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Update slide title and description
 */
export async function updateSlide(
  slideId: string,
  title: string,
  description: string
): Promise<{ data: Slide | null; error: Error | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('slides')
      .update({ title, description })
      .eq('id', slideId)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Update presentation title
 */
export async function updatePresentationTitle(
  id: string,
  title: string
): Promise<{ data: Presentation | null; error: Error | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('presentations')
      .update({ title })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Update presentation objective
 */
export async function updatePresentationObjective(
  id: string,
  objective: string
): Promise<{ data: Presentation | null; error: Error | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('presentations')
      .update({ objective })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Update presentation call to action
 */
export async function updatePresentationCTA(
  id: string,
  ctaText: string,
  ctaUrl: string
): Promise<{ data: Presentation | null; error: Error | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('presentations')
      .update({ 
        cta_text: ctaText,
        cta_url: ctaUrl
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Delete a presentation
 */
export async function deletePresentation(
  id: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient()

    // Delete will cascade to slides due to foreign key
    const { error } = await supabase.from('presentations').delete().eq('id', id)

    if (error) {
      return { error }
    }

    // Delete storage files
    const { data: files } = await supabase.storage.from('slides').list(id)

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${id}/${file.name}`)
      await supabase.storage.from('slides').remove(filePaths)
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}
