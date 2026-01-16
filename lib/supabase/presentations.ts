import { createClient } from '@/lib/supabase/client'
import { uploadAndProcessPDF } from '@/lib/supabase/edgeFunctions'

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

    // Check if it's a PDF
    const isPDF = files.length === 1 && files[0].type === 'application/pdf'

    if (isPDF) {
      // Use Edge Function to process PDF
      console.log('Processing PDF with Edge Function...')
      const result = await uploadAndProcessPDF(presentation.id, files[0])

      if (!result.success || !result.slides) {
        // If Edge Function fails, delete the presentation
        await supabase.from('presentations').delete().eq('id', presentation.id)
        return {
          data: null,
          error: new Error(result.error || 'Failed to process PDF'),
        }
      }

      console.log(`✓ PDF processed successfully: ${result.pageCount} slides`)

      return {
        data: { ...presentation, slides: result.slides },
        error: null,
      }
    }

    // For images, upload directly
    const slides: Slide[] = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${presentation.id}/${i + 1}.${fileExt}`

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('slides')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('slides').getPublicUrl(fileName)

      // Create slide record
      const { data: slide, error: slideError } = await supabase
        .from('slides')
        .insert({
          presentation_id: presentation.id,
          image_url: publicUrl,
          title: `Slide ${i + 1}`,
          description: null,
          slide_order: i + 1,
        })
        .select()
        .single()

      if (!slideError && slide) {
        slides.push(slide)
      }
    }

    return {
      data: { ...presentation, slides },
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
