import { createClient } from '@/lib/supabase/client'

export interface TranscriptionMessage {
  timestamp: string
  speaker: 'Agent' | 'User'
  text: string
}

export interface PresentationView {
  id: string
  presentation_id: string
  viewer_session_id: string
  started_at: string
  ended_at: string | null
  duration_seconds: number | null
  is_active: boolean
  user_agent: string | null
  ip_address: string | null
  viewer_name: string | null
  viewer_email: string | null
  recording_url: string | null
  summary: string | null
  call_status: 'Successful' | 'Failed' | 'In Progress' | 'No Call' | null
  transcription: TranscriptionMessage[] | null
  created_at: string
  updated_at: string
}

export interface PresentationAnalytics {
  id: string
  presentation_id: string
  total_views: number
  active_views: number
  total_duration_seconds: number
  average_duration_seconds: number
  successful_calls: number
  total_calls: number
  success_rate: number
  created_at: string
  updated_at: string
}

/**
 * Generate a unique session ID for tracking anonymous viewers
 */
export function generateSessionId(): string {
  // Check if we already have a session ID in localStorage
  if (typeof window !== 'undefined') {
    const existingSessionId = localStorage.getItem('viewer_session_id')
    if (existingSessionId) {
      return existingSessionId
    }
  }

  // Generate new session ID
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  
  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('viewer_session_id', sessionId)
  }

  return sessionId
}

/**
 * Start tracking a presentation view
 */
export async function startPresentationView(
  presentationId: string
): Promise<{ data: PresentationView | null; error: Error | null }> {
  try {
    const supabase = createClient()
    const sessionId = generateSessionId()

    // Get user agent
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : null

    console.log('📊 Starting presentation view:', {
      presentationId,
      sessionId,
      userAgent: userAgent?.substring(0, 50)
    })

    const { data, error } = await supabase
      .from('presentation_views')
      .insert({
        presentation_id: presentationId,
        viewer_session_id: sessionId,
        user_agent: userAgent,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error starting presentation view:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { data: null, error }
    }

    console.log('✅ Presentation view started:', data.id)

    // Store view ID in sessionStorage for this tab
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`view_id_${presentationId}`, data.id)
    }

    return { data, error: null }
  } catch (error) {
    console.error('❌ Exception starting presentation view:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * End a presentation view
 */
export async function endPresentationView(
  presentationId: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient()

    // Get view ID from sessionStorage
    const viewId = typeof window !== 'undefined' 
      ? sessionStorage.getItem(`view_id_${presentationId}`)
      : null

    if (!viewId) {
      return { error: null } // No active view to end
    }

    const { error } = await supabase
      .from('presentation_views')
      .update({
        ended_at: new Date().toISOString(),
        is_active: false,
      })
      .eq('id', viewId)

    if (error) {
      console.error('Error ending presentation view:', error)
      return { error }
    }

    // Clear view ID from sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`view_id_${presentationId}`)
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Update view activity (heartbeat)
 */
export async function updateViewActivity(
  presentationId: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient()

    // Get view ID from sessionStorage
    const viewId = typeof window !== 'undefined' 
      ? sessionStorage.getItem(`view_id_${presentationId}`)
      : null

    if (!viewId) {
      return { error: null }
    }

    const { error } = await supabase
      .from('presentation_views')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', viewId)

    if (error) {
      console.error('Error updating view activity:', error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Get analytics for a presentation
 */
export async function getPresentationAnalytics(
  presentationId: string
): Promise<{ data: PresentationAnalytics | null; error: Error | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('presentation_analytics')
      .select('*')
      .eq('presentation_id', presentationId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching analytics:', error)
      return { data: null, error }
    }

    // If no analytics exist yet, return default values
    if (!data) {
      return {
        data: {
          id: '',
          presentation_id: presentationId,
          total_views: 0,
          active_views: 0,
          total_duration_seconds: 0,
          average_duration_seconds: 0,
          successful_calls: 0,
          total_calls: 0,
          success_rate: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      }
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
 * Update ElevenLabs call metrics
 */
export async function updateCallMetrics(
  presentationId: string,
  successfulCalls: number,
  totalCalls: number
): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient()

    const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0

    const { error } = await supabase
      .from('presentation_analytics')
      .update({
        successful_calls: successfulCalls,
        total_calls: totalCalls,
        success_rate: successRate,
        updated_at: new Date().toISOString(),
      })
      .eq('presentation_id', presentationId)

    if (error) {
      console.error('Error updating call metrics:', error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Get all views for a presentation (for the Views page)
 */
export async function getPresentationViews(
  presentationId: string
): Promise<{ data: PresentationView[] | null; error: Error | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('presentation_views')
      .select('*')
      .eq('presentation_id', presentationId)
      .order('started_at', { ascending: false })

    if (error) {
      console.error('Error fetching presentation views:', error)
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
 * Update view details (name, email, call status, etc.)
 * This should be called when ElevenLabs provides viewer information
 */
export async function updateViewDetails(
  viewId: string,
  details: {
    viewer_name?: string
    viewer_email?: string
    recording_url?: string
    summary?: string
    call_status?: 'Successful' | 'Failed' | 'In Progress' | 'No Call'
    transcription?: TranscriptionMessage[]
  }
): Promise<{ error: Error | null }> {
  try {
    const supabase = createClient()

    const { error } = await supabase
      .from('presentation_views')
      .update(details)
      .eq('id', viewId)

    if (error) {
      console.error('Error updating view details:', error)
      return { error }
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}

/**
 * Get a single view by ID (for modal details)
 */
export async function getViewById(
  viewId: string
): Promise<{ data: PresentationView | null; error: Error | null }> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('presentation_views')
      .select('*')
      .eq('id', viewId)
      .single()

    if (error) {
      console.error('Error fetching view:', error)
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
 * Format duration in seconds to MM:SS format
 */
export function formatDuration(seconds: number | null): string {
  if (!seconds) return '00:00'
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Format date to readable format
 */
export function formatViewDate(dateString: string): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }
  return date.toLocaleDateString('en-US', options)
}
