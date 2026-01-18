import { createClient } from '@/lib/supabase/client'

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
  // Agent fields
  agent_name: string | null
  agent_voice: string | null
  agent_language: string | null
  agent_first_message: string | null
  agent_description: string | null
  // Welcome Slide fields
  welcome_title: string | null
  estimated_minutes: number | null
  // End Slide fields
  end_title: string | null
  end_description: string | null
}

/**
 * Get a presentation by ID (for public viewing)
 * This version doesn't import PDF utilities to avoid SSR issues
 */
export async function getPublicPresentation(
  presentationId: string
): Promise<{ data: Presentation | null; error: Error | null }> {
  try {
    const supabase = createClient()

    const { data: presentation, error: presentationError } = await supabase
      .from('presentations')
      .select('*')
      .eq('id', presentationId)
      .single()

    if (presentationError) {
      return { data: null, error: presentationError }
    }

    // Fetch slides for this presentation, ordered by slide_order
    const { data: slides, error: slidesError } = await supabase
      .from('slides')
      .select('*')
      .eq('presentation_id', presentationId)
      .order('slide_order', { ascending: true })

    if (slidesError) {
      return { data: null, error: slidesError }
    }

    return {
      data: {
        ...presentation,
        slides: slides || [],
      },
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}
