'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/auth/AuthContext'
import { getPresentation, updateSlide, updatePresentationCTA, updatePresentationTitle, updatePresentationObjective, updateEndTitle, updateEndDescription, deleteSlide, deleteEndPage, type Presentation, type Slide } from '@/lib/supabase/presentations'
import { generateSlideDescription } from '@/lib/supabase/edgeFunctions'
import DashboardHeader from '@/components/DashboardHeader'
import DescriptionTextarea from '@/components/DescriptionTextarea'
import WelcomeSlideEditor from '@/components/WelcomeSlideEditor'
import EndSlideEditor from '@/components/EndSlideEditor'
import { createClient } from '@/lib/supabase/client'

export default function PresentationPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(-1) // Start at -1 for welcome slide
  const [imageLoading, setImageLoading] = useState(true)
  const [welcomeDescription, setWelcomeDescription] = useState('')
  const welcomeDescriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)
  const thumbnailRefs = useRef<{ [key: number]: HTMLDivElement | null }>({})
  const [showMenu, setShowMenu] = useState(false)
  const [descriptionValue, setDescriptionValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedSlides, setProcessedSlides] = useState(0)
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null)
  const [dragCurrentPos, setDragCurrentPos] = useState<{ x: number; y: number } | null>(null)
  const [draggedSlideRect, setDraggedSlideRect] = useState<DOMRect | null>(null)
  const dragThreshold = 5 // Minimum pixels to move before starting drag
  const [isEditingCTA, setIsEditingCTA] = useState(false)
  const [ctaText, setCtaText] = useState('')
  const [ctaUrl, setCtaUrl] = useState('')
  const [showUrlPopup, setShowUrlPopup] = useState(false)
  const [ctaInputWidth, setCtaInputWidth] = useState<number>(0)
  const ctaButtonRef = useRef<HTMLDivElement>(null)
  const ctaTextRef = useRef<HTMLSpanElement>(null)
  const urlSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [presentationObjective, setPresentationObjective] = useState('')
  const [expectedSlideCount, setExpectedSlideCount] = useState<number | null>(null)
  const [totalSlidesExpected, setTotalSlidesExpected] = useState<number>(0)
  const [endTitleValue, setEndTitleValue] = useState('')
  const [endDescriptionValue, setEndDescriptionValue] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const endTitleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const endDescriptionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [hoveredThumbnail, setHoveredThumbnail] = useState<number | null>(null)
  const [slideTransition, setSlideTransition] = useState(false)

  const presentationId = params.id as string

  useEffect(() => {
    if (!authLoading && !user) {
      // Redirect to public share page if not authenticated
      router.push(`/share/${presentationId}`)
    }
  }, [user, authLoading, router, presentationId])

  useEffect(() => {
    if (user && presentationId) {
      loadPresentation()
      subscribeToSlideUpdates()
    }
  }, [user, presentationId])

  useEffect(() => {
    // Only set loading for regular slides (not Welcome or End)
    const totalSlides = presentation?.slides?.length || 0
    const isRegularSlide = currentSlideIndex >= 0 && currentSlideIndex < totalSlides
    console.log('🔍 Image Loading Effect:', {
      currentSlideIndex,
      totalSlides,
      isRegularSlide,
      currentSlide: presentation?.slides?.[currentSlideIndex],
      imageUrl: presentation?.slides?.[currentSlideIndex]?.image_url
    })
    if (isRegularSlide) {
      setImageLoading(true)
    } else {
      setImageLoading(false)
    }
  }, [currentSlideIndex, presentation?.slides?.length])

  // Update description when slide changes or presentation data updates
  useEffect(() => {
    if (presentation?.slides?.[currentSlideIndex]) {
      setDescriptionValue(presentation.slides[currentSlideIndex].description || '')
    }
  }, [currentSlideIndex, presentation?.slides])

  useEffect(() => {
    if (presentation) {
      setCtaText(presentation.cta_text || 'Add call to action')
      setCtaUrl(presentation.cta_url || '')
      setEndTitleValue(presentation.end_title || '')
      setEndDescriptionValue(presentation.end_description || '')
      setTitleValue(presentation.title)
      setPresentationObjective(presentation.objective || '')
      setWelcomeDescription(presentation.objective || '')
    }
  }, [presentation])

  // Handle welcome slide description changes
  const handleWelcomeDescriptionChange = (description: string) => {
    setWelcomeDescription(description)
    
    // Debounce save
    if (welcomeDescriptionTimeoutRef.current) {
      clearTimeout(welcomeDescriptionTimeoutRef.current)
    }

    welcomeDescriptionTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await updatePresentationObjective(presentationId, description)
        if (error) {
          console.error('Error saving welcome description:', error)
        }
      } catch (error) {
        console.error('Error saving welcome description:', error)
      }
    }, 500)
  }

  // Handle welcome slide title changes (independent from presentation title)
  const handleWelcomeTitleChange = (title: string) => {
    // Update local presentation state with welcome_title
    if (presentation) {
      setPresentation({ ...presentation, welcome_title: title })
    }
    
    // Debounce save
    if (welcomeDescriptionTimeoutRef.current) {
      clearTimeout(welcomeDescriptionTimeoutRef.current)
    }

    welcomeDescriptionTimeoutRef.current = setTimeout(async () => {
      try {
        const { updateWelcomeTitle } = await import('@/lib/supabase/presentations')
        const { error } = await updateWelcomeTitle(presentationId, title)
        if (error) {
          console.error('Error saving welcome title:', error)
        }
      } catch (error) {
        console.error('Error saving welcome title:', error)
      }
    }, 500)
  }

  // Handle estimated minutes changes
  const handleEstimatedMinutesChange = (minutes: number) => {
    // Update local presentation state
    if (presentation) {
      setPresentation({ ...presentation, estimated_minutes: minutes })
    }
    
    // Debounce save
    if (welcomeDescriptionTimeoutRef.current) {
      clearTimeout(welcomeDescriptionTimeoutRef.current)
    }

    welcomeDescriptionTimeoutRef.current = setTimeout(async () => {
      try {
        const { updateEstimatedMinutes } = await import('@/lib/supabase/presentations')
        const { error } = await updateEstimatedMinutes(presentationId, minutes)
        if (error) {
          const supabaseError = error as any
          console.error('❌ Error saving estimated minutes:', {
            error,
            message: error.message,
            details: supabaseError.details,
            hint: supabaseError.hint,
            code: supabaseError.code,
            presentationId,
            minutes
          })
        }
      } catch (error) {
        console.error('❌ Caught error saving estimated minutes:', error)
      }
    }, 500)
  }

  // Handle end title changes
  const handleEndTitleChange = (title: string) => {
    setEndTitleValue(title)
    
    // Update local presentation state (use null for empty strings)
    if (presentation) {
      setPresentation({ ...presentation, end_title: title.trim() || null })
    }
    
    // Debounce save
    if (endTitleTimeoutRef.current) {
      clearTimeout(endTitleTimeoutRef.current)
    }

    endTitleTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await updateEndTitle(presentationId, title.trim() || null)
        if (error) {
          console.error('Error saving end title:', error)
        }
      } catch (error) {
        console.error('Error saving end title:', error)
      }
    }, 500)
  }

  // Handle end description changes
  const handleEndDescriptionChange = (description: string) => {
    setEndDescriptionValue(description)
    
    // Update local presentation state (use null for empty strings)
    if (presentation) {
      setPresentation({ ...presentation, end_description: description.trim() || null })
    }
    
    // Debounce save
    if (endDescriptionTimeoutRef.current) {
      clearTimeout(endDescriptionTimeoutRef.current)
    }

    endDescriptionTimeoutRef.current = setTimeout(async () => {
      try {
        const { error } = await updateEndDescription(presentationId, description.trim() || null)
        if (error) {
          console.error('Error saving end description:', error)
        }
      } catch (error) {
        console.error('Error saving end description:', error)
      }
    }, 500)
  }

  // Handle logo upload
  const handleLogoUpload = async (file: File) => {
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${presentationId}-${Date.now()}.${fileExt}`
      const filePath = `${presentationId}/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('slides')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Error uploading logo:', uploadError)
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('slides')
        .getPublicUrl(filePath)

      setLogoUrl(publicUrl)

      // TODO: Save logo URL to database when schema is updated
      console.log('Logo uploaded:', publicUrl)
    } catch (error) {
      console.error('Error uploading logo:', error)
    }
  }

  // Handle slide deletion
  const handleDeleteSlide = async (slideId: string, slideIndex: number) => {
    if (!confirm('Are you sure you want to delete this slide?')) {
      return
    }

    try {
      const { error } = await deleteSlide(slideId)
      if (error) {
        console.error('Error deleting slide:', error)
        alert('Failed to delete slide. Please try again.')
        return
      }

      // Update local state
      if (presentation?.slides) {
        const updatedSlides = presentation.slides.filter((_, i) => i !== slideIndex)
        setPresentation({
          ...presentation,
          slides: updatedSlides.map((slide, index) => ({
            ...slide,
            slide_order: index + 1
          }))
        })

        // Adjust current slide index if needed
        if (currentSlideIndex >= updatedSlides.length) {
          setCurrentSlideIndex(Math.max(-1, updatedSlides.length - 1))
        }
      }
    } catch (error) {
      console.error('Error deleting slide:', error)
      alert('Failed to delete slide. Please try again.')
    }
  }

  // Handle end page deletion
  const handleDeleteEndPage = async () => {
    if (!confirm('Are you sure you want to delete the End Page?')) {
      return
    }

    try {
      const { error } = await deleteEndPage(presentationId)
      if (error) {
        console.error('Error deleting end page:', error)
        alert('Failed to delete end page. Please try again.')
        return
      }

      // Update local state
      if (presentation) {
        setPresentation({
          ...presentation,
          end_title: null,
          end_description: null
        })
        setEndTitleValue('')
        setEndDescriptionValue('')

        // Navigate back to last slide if on end page
        if (currentSlideIndex === totalSlides) {
          setCurrentSlideIndex(totalSlides - 1)
        }
      }
    } catch (error) {
      console.error('Error deleting end page:', error)
      alert('Failed to delete end page. Please try again.')
    }
  }

  const loadPresentation = async () => {
    setLoading(true)
    const { data, error } = await getPresentation(presentationId)
    
    if (error) {
      console.error('Error loading presentation:', error)
      router.push('/')
      return
    }

    if (data) {
      setPresentation(data)
      
      // Check if this is a fresh upload with expected count
      const expectedCount = (data as any)._expectedSlideCount
      if (expectedCount && expectedCount > 1) {
        setTotalSlidesExpected(expectedCount)
        setIsProcessing(true)
        console.log(`📊 Expecting ${expectedCount} slides total, currently have ${data.slides?.length || 0}`)
      }
      
      // Check if presentation has no slides (still processing)
      if (!data.slides || data.slides.length === 0) {
        setIsProcessing(true)
        setProcessedSlides(0)
      } else {
        // If we have some slides but expecting more, keep processing
        if (totalSlidesExpected > 0 && data.slides.length < totalSlidesExpected) {
          setIsProcessing(true)
        } else {
          setIsProcessing(false)
        }
        setProcessedSlides(data.slides.length)
      }
    }
    setLoading(false)
  }

  const subscribeToSlideUpdates = () => {
    const supabase = createClient()
    
    // Subscribe to new slides being added
    const channel = supabase
      .channel(`presentation-${presentationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'slides',
          filter: `presentation_id=eq.${presentationId}`,
        },
        (payload) => {
          console.log('New slide added:', payload.new)
          setPresentation((prev) => {
            if (!prev) return prev
            const newSlide = payload.new as Slide
            const existingSlides = prev.slides || []
            // Add new slide and sort by order
            const updatedSlides = [...existingSlides, newSlide].sort(
              (a, b) => a.slide_order - b.slide_order
            )
            
            // Update processed count
            setProcessedSlides(updatedSlides.length)
            
            // Check if we've reached the expected total
            setTotalSlidesExpected((expectedTotal) => {
              if (expectedTotal > 0 && updatedSlides.length >= expectedTotal) {
                console.log(`✅ All ${expectedTotal} slides loaded!`)
                setIsProcessing(false)
              } else {
                setIsProcessing(true)
              }
              return expectedTotal
            })
            
            // Clear any existing timeout
            if (processingTimeoutRef.current) {
              clearTimeout(processingTimeoutRef.current)
            }
            
            // Set a timeout to turn off processing flag after 3 seconds of no new slides
            // (fallback in case we don't know the expected count)
            processingTimeoutRef.current = setTimeout(() => {
              setIsProcessing(false)
            }, 3000)
            
            return { ...prev, slides: updatedSlides }
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  // Auto-scroll carousel to current slide
  useEffect(() => {
    if (carouselRef.current && thumbnailRefs.current[currentSlideIndex]) {
      const thumbnail = thumbnailRefs.current[currentSlideIndex]
      if (thumbnail) {
        // For the first few slides (including Welcome), scroll to start
        // For later slides, center them
        const totalSlides = presentation?.slides?.length || 0
        const isEarlySlide = currentSlideIndex <= 1 // Welcome (-1), Slide 1 (0), Slide 2 (1)
        
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: isEarlySlide ? 'start' : 'center'
        })
      }
    }
  }, [currentSlideIndex, presentation?.slides?.length])

  const changeSlideWithAnimation = (newIndex: number) => {
    if (newIndex === currentSlideIndex) return
    
    // Start fade out animation
    setSlideTransition(true)
    
    // After animation, change slide and reset transition
    setTimeout(() => {
      setCurrentSlideIndex(newIndex)
    }, 150)
    
    // Reset transition after slide change
    setTimeout(() => {
      setSlideTransition(false)
    }, 160)
  }

  const handlePrevSlide = () => {
    if (currentSlideIndex > -1) {
      changeSlideWithAnimation(currentSlideIndex - 1)
    }
  }

  const handleNextSlide = () => {
    // Allow going to end page (slides.length index) after last slide
    const maxIndex = presentation?.slides ? presentation.slides.length : -1
    if (currentSlideIndex < maxIndex) {
      changeSlideWithAnimation(currentSlideIndex + 1)
    }
  }

  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    // Prevent drag on right click
    if (e.button !== 0) return
    
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    
    setDragStartPos({ x: e.clientX, y: e.clientY })
    setDragCurrentPos({ x: e.clientX, y: e.clientY })
    setDraggedSlideRect(rect)
    setDraggedIndex(index)
    e.preventDefault()
  }

  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (draggedIndex === null || !dragStartPos) return

    const deltaX = e.clientX - dragStartPos.x
    const deltaY = e.clientY - dragStartPos.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Start dragging only after moving threshold distance
    if (!isDragging && distance > dragThreshold) {
      setIsDragging(true)
    }

    if (isDragging || distance > dragThreshold) {
      setDragCurrentPos({ x: e.clientX, y: e.clientY })

      // Detect which thumbnail we're hovering over
      const thumbnails = Object.entries(thumbnailRefs.current)
        .filter(([key]) => parseInt(key) >= 0) // Only actual slides, not welcome
        .map(([key, el]) => ({ index: parseInt(key), el }))

      let foundTarget = false
      for (const { index, el } of thumbnails) {
        if (el && index !== draggedIndex) {
          const rect = el.getBoundingClientRect()
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            setDragOverIndex(index)
            foundTarget = true
            break
          }
        }
      }
      if (!foundTarget) {
        setDragOverIndex(null)
      }
    }
  }

  const handleGlobalMouseUp = async () => {
    if (!isDragging || draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex || !presentation?.slides) {
      // Reset state
      setDraggedIndex(null)
      setDragOverIndex(null)
      setIsDragging(false)
      setDragStartPos(null)
      setDragCurrentPos(null)
      setDraggedSlideRect(null)
      return
    }

    const supabase = createClient()
    const slides = [...presentation.slides]
    const [draggedSlide] = slides.splice(draggedIndex, 1)
    slides.splice(dragOverIndex, 0, draggedSlide)

    // Update slide_order for all affected slides
    const updates = slides.map((slide, index) => ({
      id: slide.id,
      slide_order: index + 1
    }))

    try {
      // Update all slides in parallel
      await Promise.all(
        updates.map(({ id, slide_order }) =>
          supabase
            .from('slides')
            .update({ slide_order })
            .eq('id', id)
        )
      )

      // Update local state
      setPresentation({
        ...presentation,
        slides: slides.map((slide, index) => ({
          ...slide,
          slide_order: index + 1
        }))
      })

      // Adjust current slide index if needed
      if (currentSlideIndex === draggedIndex) {
        setCurrentSlideIndex(dragOverIndex)
      } else if (draggedIndex < currentSlideIndex && dragOverIndex >= currentSlideIndex) {
        setCurrentSlideIndex(currentSlideIndex - 1)
      } else if (draggedIndex > currentSlideIndex && dragOverIndex <= currentSlideIndex) {
        setCurrentSlideIndex(currentSlideIndex + 1)
      }
    } catch (error) {
      console.error('Error reordering slides:', error)
      // Reload presentation on error
      loadPresentation()
    }

    // Reset state
    setDraggedIndex(null)
    setDragOverIndex(null)
    setIsDragging(false)
    setDragStartPos(null)
    setDragCurrentPos(null)
    setDraggedSlideRect(null)
  }

  // Add global mouse listeners to handle drag anywhere on screen
  useEffect(() => {
    if (draggedIndex !== null) {
      window.addEventListener('mousemove', handleGlobalMouseMove)
      window.addEventListener('mouseup', handleGlobalMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove)
        window.removeEventListener('mouseup', handleGlobalMouseUp)
      }
    }
  }, [draggedIndex, dragStartPos, isDragging, dragOverIndex, presentation, currentSlideIndex])

  const handleCTAClick = () => {
    // Measure current text width before switching to input
    if (ctaTextRef.current) {
      setCtaInputWidth(ctaTextRef.current.offsetWidth)
    }
    setIsEditingCTA(true)
    setShowUrlPopup(true)
  }

  const handleCTABlur = async () => {
    if (!presentation || !ctaText.trim()) {
      // Reset to saved value if empty
      setCtaText(presentation?.cta_text || 'Add call to action')
      setIsEditingCTA(false)
      return
    }

    // Save if text changed
    if (ctaText !== presentation.cta_text) {
      try {
        const { error } = await updatePresentationCTA(presentationId, ctaText, ctaUrl)
        
        if (error) {
          console.error('Error saving CTA:', error)
        } else {
          setPresentation({
            ...presentation,
            cta_text: ctaText,
            cta_url: ctaUrl
          })
        }
      } catch (error) {
        console.error('Error saving CTA:', error)
      }
    }
    setIsEditingCTA(false)
  }

  const handleUrlChange = (newUrl: string) => {
    setCtaUrl(newUrl)
    
    // Clear existing timeout
    if (urlSaveTimeoutRef.current) {
      clearTimeout(urlSaveTimeoutRef.current)
    }

    // Debounce save for 500ms
    urlSaveTimeoutRef.current = setTimeout(async () => {
      if (!presentation) return

      try {
        const { error } = await updatePresentationCTA(presentationId, ctaText, newUrl)
        
        if (error) {
          console.error('Error saving CTA URL:', error)
        } else {
          setPresentation({
            ...presentation,
            cta_text: ctaText,
            cta_url: newUrl
          })
        }
      } catch (error) {
        console.error('Error saving CTA URL:', error)
      }
    }, 500)
  }

  const handleUrlPopupClose = () => {
    setShowUrlPopup(false)
  }

  const handleTitleChange = (newTitle: string) => {
    setTitleValue(newTitle)
    
    // Clear existing timeout
    if (titleSaveTimeoutRef.current) {
      clearTimeout(titleSaveTimeoutRef.current)
    }

    // Debounce save for 500ms
    titleSaveTimeoutRef.current = setTimeout(async () => {
      if (!presentation || !newTitle.trim()) return

      try {
        const { error } = await updatePresentationTitle(presentationId, newTitle.trim())
        
        if (error) {
          console.error('Error saving title:', error)
        } else {
          setPresentation({
            ...presentation,
            title: newTitle.trim()
          })
        }
      } catch (error) {
        console.error('Error saving title:', error)
      }
    }, 500)
  }

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    // If empty, restore original title
    if (!titleValue.trim() && presentation) {
      setTitleValue(presentation.title)
    }
  }

  const handleGenerateDescription = async (mode: 'single' | 'all' = 'single') => {
    if (!presentation?.slides) return

    if (mode === 'all') {
      // Check if any slides already have descriptions
      const slidesWithDescriptions = presentation.slides.filter(s => s.description && s.description.trim() !== '')
      
      if (slidesWithDescriptions.length > 0) {
        const confirmed = confirm(
          `${slidesWithDescriptions.length} slide(s) already have descriptions. Do you want to regenerate all descriptions? This will overwrite existing ones.`
        )
        if (!confirmed) return
      }

      // Generate descriptions for all slides
      setIsGeneratingDescription(true)
      try {
        console.log(`🚀 Generating descriptions for all ${presentation.slides.length} slides...`)
        
        const results = await Promise.all(
          presentation.slides.map(async (slide, index) => {
            try {
              console.log(`📝 Generating description for slide ${index + 1}/${presentation.slides!.length}...`)
              const result = await generateSlideDescription(
                slide.id,
                slide.image_url,
                presentationObjective || undefined
              )
              
              if (result.success && result.description) {
                console.log(`✅ Slide ${index + 1} description generated`)
                return { ...slide, description: result.description }
              } else {
                console.error(`❌ Failed to generate description for slide ${index + 1}:`, result.error)
                return slide
              }
            } catch (error) {
              console.error(`❌ Error generating description for slide ${index + 1}:`, error)
              return slide
            }
          })
        )

        // Update all slides
        setPresentation({
          ...presentation,
          slides: results
        })

        // Update current slide description
        if (results[currentSlideIndex]) {
          setDescriptionValue(results[currentSlideIndex].description || '')
        }

        console.log('✅ All descriptions generated successfully')
      } catch (error) {
        console.error('Error generating all descriptions:', error)
        alert('Failed to generate descriptions for all slides')
      } finally {
        setIsGeneratingDescription(false)
      }
    } else {
      // Generate description for current slide only
      if (!presentation.slides[currentSlideIndex]) return

      const currentSlide = presentation.slides[currentSlideIndex]
      
      setIsGeneratingDescription(true)
      try {
        const result = await generateSlideDescription(
          currentSlide.id,
          currentSlide.image_url,
          presentationObjective || undefined
        )

        if (result.success && result.description) {
          setDescriptionValue(result.description)
          // Update local state
          const updatedSlides = [...presentation.slides]
          updatedSlides[currentSlideIndex] = {
            ...currentSlide,
            description: result.description
          }
          setPresentation({
            ...presentation,
            slides: updatedSlides
          })
        } else {
          alert(`Failed to generate description: ${result.error}`)
        }
      } catch (error) {
        console.error('Error generating description:', error)
        alert('Failed to generate description')
      } finally {
        setIsGeneratingDescription(false)
      }
    }
  }

  const handleImproveDescription = async () => {
    if (!presentation?.slides || !presentation.slides[currentSlideIndex]) return
    if (!descriptionValue.trim()) {
      alert('Please enter a description first')
      return
    }

    const currentSlide = presentation.slides[currentSlideIndex]
    
    setIsGeneratingDescription(true)
    try {
      const result = await generateSlideDescription(
        currentSlide.id,
        currentSlide.image_url,
        presentationObjective || undefined,
        'improve',
        descriptionValue
      )

      if (result.success && result.description) {
        setDescriptionValue(result.description)
        // Update local state
        const updatedSlides = [...presentation.slides]
        updatedSlides[currentSlideIndex] = {
          ...currentSlide,
          description: result.description
        }
        setPresentation({
          ...presentation,
          slides: updatedSlides
        })
      } else {
        alert(`Failed to improve description: ${result.error}`)
      }
    } catch (error) {
      console.error('Error improving description:', error)
      alert('Failed to improve description')
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevSlide()
      } else if (e.key === 'ArrowRight') {
        handleNextSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlideIndex, presentation])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (urlSaveTimeoutRef.current) {
        clearTimeout(urlSaveTimeoutRef.current)
      }
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current)
      }
    }
  }, [])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12"></div>
          <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">Loading...</p>
        </div>
      </div>
    )
  }

  const currentSlide = currentSlideIndex >= 0 && currentSlideIndex < (presentation?.slides?.length || 0) ? presentation?.slides?.[currentSlideIndex] : null
  const totalSlides = presentation?.slides?.length || 0
  const hasSlides = totalSlides > 0
  const isWelcomeSlide = currentSlideIndex === -1
  const isEndSlide = currentSlideIndex === totalSlides

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Menu and Tabs */}
      <DashboardHeader showMenu={true} showTabs={true} presentationId={presentationId} activeTab="content" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Slide Viewer Area */}
        <div className="flex-1 flex flex-col items-center px-8 py-2">
          {/* Carousel with 3 Slides Visible */}
          <div className="relative w-full max-w-[1200px] mb-6 flex items-center justify-center">
            {loading ? (
              /* Initial Loading State */
              <div className="flex items-center justify-center gap-4">
                <div className="w-[756px] h-[423px] bg-white border border-[#e5e5e5] rounded-[16px] opacity-30"></div>
                <div className="w-[840px] h-[470px] bg-white border border-[#e5e5e5] rounded-[16px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#e5e5e5] border-t-[#66e7f5]"></div>
                    <div className="text-center">
                      <p className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d] mb-1">
                        Loading...
                      </p>
                      <p className="font-['Inter',sans-serif] text-[14px] text-[#999]">
                        Please wait
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-[756px] h-[423px] bg-white border border-[#e5e5e5] rounded-[16px] opacity-30"></div>
              </div>
            ) : !hasSlides ? (
              /* Processing State - Show message but allow UI to render */
              <div className="flex items-center justify-center gap-4">
                <div className="w-[756px] h-[423px] bg-white border border-[#e5e5e5] rounded-[16px] opacity-30"></div>
                <div className="w-[840px] h-[470px] bg-white border border-[#e5e5e5] rounded-[16px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-[#e5e5e5] border-t-[#66e7f5]"></div>
                    <div className="text-center">
                      <p className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d] mb-1">
                        Processing PDF...
                      </p>
                      <p className="font-['Inter',sans-serif] text-[14px] text-[#999]">
                        First slide will appear shortly
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-[756px] h-[423px] bg-white border border-[#e5e5e5] rounded-[16px] opacity-30"></div>
              </div>
            ) : (
              <>
                {/* Carousel Container */}
                <div className="flex items-center justify-center gap-4 relative overflow-x-hidden">
                  {/* Previous Slide Space (Left) */}
                  {currentSlideIndex === -1 ? (
                    /* No previous slide for Welcome */
                    <div className="w-[756px] h-[423px] flex-shrink-0"></div>
                  ) : currentSlideIndex === 0 && presentation ? (
                    /* Show Welcome Slide as previous when on first real slide */
                    <button
                      onClick={handlePrevSlide}
                      className="w-[756px] h-[423px] bg-white rounded-[16px] border border-[#e5e5e5] overflow-hidden opacity-50 hover:opacity-70 transition-all flex-shrink-0"
                    >
                      <div className="w-full h-full scale-[0.8] origin-center">
                        <WelcomeSlideEditor
                          welcomeTitle={presentation.welcome_title}
                          presentationTitle={presentation.title}
                          description={welcomeDescription}
                          slideCount={presentation.slides?.length || 0}
                          estimatedMinutes={presentation.estimated_minutes ?? undefined}
                          onDescriptionChange={handleWelcomeDescriptionChange}
                          onTitleChange={handleWelcomeTitleChange}
                          onEstimatedMinutesChange={handleEstimatedMinutesChange}
                        />
                      </div>
                    </button>
                  ) : currentSlideIndex > 0 && currentSlideIndex < totalSlides && presentation?.slides?.[currentSlideIndex - 1] ? (
                    <button
                      onClick={handlePrevSlide}
                      className="w-[756px] h-[423px] bg-white rounded-[16px] border border-[#e5e5e5] overflow-hidden opacity-50 hover:opacity-70 transition-all flex-shrink-0"
                    >
                      {presentation.slides[currentSlideIndex - 1].image_url.endsWith('.pdf') ? (
                        <iframe
                          src={`${presentation.slides[currentSlideIndex - 1].image_url}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full pointer-events-none"
                        />
                      ) : (
                        <img
                          src={presentation.slides[currentSlideIndex - 1].image_url}
                          alt={`Slide ${currentSlideIndex}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ) : currentSlideIndex === totalSlides && presentation?.slides?.[totalSlides - 1] ? (
                    /* Show last slide as previous when on end page */
                    <button
                      onClick={handlePrevSlide}
                      className="w-[756px] h-[423px] bg-white rounded-[16px] border border-[#e5e5e5] overflow-hidden opacity-50 hover:opacity-70 transition-all flex-shrink-0"
                    >
                      {presentation.slides[totalSlides - 1].image_url.endsWith('.pdf') ? (
                        <iframe
                          src={`${presentation.slides[totalSlides - 1].image_url}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full pointer-events-none"
                        />
                      ) : (
                        <img
                          src={presentation.slides[totalSlides - 1].image_url}
                          alt={`Slide ${totalSlides}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ) : (
                    <div className="w-[756px] h-[423px] flex-shrink-0"></div>
                  )}

                  {/* Current Slide (Center - 100% size) */}
                  {isWelcomeSlide && presentation ? (
                    /* Welcome Slide */
                    <div className="flex flex-col gap-3 flex-shrink-0">
                      
                      <div className={`relative w-[840px] h-[650px] transition-all duration-300 ${
                        slideTransition ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
                      }`}>
                        <WelcomeSlideEditor
                          welcomeTitle={presentation.welcome_title}
                          presentationTitle={presentation.title}
                          description={welcomeDescription}
                          slideCount={presentation.slides?.length || 0}
                          estimatedMinutes={presentation.estimated_minutes ?? undefined}
                          logoUrl={logoUrl}
                          onDescriptionChange={handleWelcomeDescriptionChange}
                          onTitleChange={handleWelcomeTitleChange}
                          onEstimatedMinutesChange={handleEstimatedMinutesChange}
                          onLogoUpload={handleLogoUpload}
                        />
                      </div>
                    </div>
                  ) : isEndSlide && presentation ? (
                    /* End Slide */
                    <div className="flex flex-col gap-3 flex-shrink-0">
                      
                      <div className={`relative w-[840px] h-[650px] bg-white rounded-[16px] border border-[#dcdcdc] overflow-hidden transition-all duration-300 ${
                        slideTransition ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
                      }`}>
                        <EndSlideEditor
                          endTitle={presentation.end_title ?? undefined}
                          presentationTitle={presentation.title}
                          description={endDescriptionValue}
                          ctaText={ctaText === 'Add call to action' ? 'Start for free' : ctaText}
                          ctaUrl={ctaUrl || 'https://camaral.ai'}
                          logoUrl={logoUrl}
                          onTitleChange={handleEndTitleChange}
                          onDescriptionChange={handleEndDescriptionChange}
                          onLogoUpload={handleLogoUpload}
                        />
                      </div>
                    </div>
                  ) : currentSlide ? (
                    /* Regular Slide */
                    <div className={`relative w-[840px] h-[472.5px] bg-white rounded-[16px] border border-[#e5e5e5] overflow-hidden flex-shrink-0 transition-all duration-300 ${
                      slideTransition ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
                    }`}>
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#e5e5e5] border-t-[#66e7f5]"></div>
                        </div>
                      )}
                      {currentSlide.image_url.endsWith('.pdf') ? (
                        <iframe
                          src={`${currentSlide.image_url}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full"
                          onLoad={() => setImageLoading(false)}
                        />
                      ) : (
                        <img
                          key={`slide-${currentSlideIndex}-${currentSlide.id}`}
                          src={currentSlide.image_url}
                          alt={currentSlide.title || `Slide ${currentSlideIndex + 1}`}
                          className={`w-full h-full object-cover transition-opacity duration-300 ${
                            imageLoading ? 'opacity-0' : 'opacity-100'
                          }`}
                          onLoad={() => {
                            console.log('✅ Image loaded successfully:', currentSlide.image_url)
                            setImageLoading(false)
                          }}
                          onError={(e) => {
                            console.error('❌ Image failed to load:', currentSlide.image_url, e)
                            setImageLoading(false)
                          }}
                        />
                      )}
                    </div>
                  ) : null}

                  {/* Next Slide (Right - 90% size) */}
                  {currentSlideIndex === -1 && presentation?.slides?.[0] && (
                    /* Show first real slide as next when on welcome slide */
                    <button
                      onClick={handleNextSlide}
                      className="w-[756px] h-[423px] bg-white rounded-[16px] border border-[#e5e5e5] overflow-hidden opacity-50 hover:opacity-70 transition-all flex-shrink-0"
                    >
                      {presentation.slides[0].image_url.endsWith('.pdf') ? (
                        <iframe
                          src={`${presentation.slides[0].image_url}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full pointer-events-none"
                        />
                      ) : (
                        <img
                          src={presentation.slides[0].image_url}
                          alt="Slide 1"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  )}
                  {currentSlideIndex >= 0 && currentSlideIndex < totalSlides - 1 && presentation?.slides?.[currentSlideIndex + 1] && (
                    <button
                      onClick={handleNextSlide}
                      className="w-[756px] h-[423px] bg-white rounded-[16px] border border-[#e5e5e5] overflow-hidden opacity-50 hover:opacity-70 transition-all flex-shrink-0"
                    >
                      {presentation.slides[currentSlideIndex + 1].image_url.endsWith('.pdf') ? (
                        <iframe
                          src={`${presentation.slides[currentSlideIndex + 1].image_url}#toolbar=0&navpanes=0&scrollbar=0`}
                          className="w-full h-full pointer-events-none"
                        />
                      ) : (
                        <img
                          src={presentation.slides[currentSlideIndex + 1].image_url}
                          alt={`Slide ${currentSlideIndex + 2}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  )}
                  {currentSlideIndex === totalSlides - 1 && presentation && !presentation.end_title && !presentation.end_description && (
                    /* Show "Add an End page" button on last slide only if no end page exists */
                    <button
                      onClick={handleNextSlide}
                      className="w-[756px] h-[423px] bg-white rounded-[16px] border-2 border-dashed border-[#e5e5e5] hover:border-[#66e7f5] hover:bg-[#f9feff] transition-all flex-shrink-0 flex flex-col items-center justify-center gap-3 group"
                    >
                      <div className="w-16 h-16 rounded-full bg-[#f5f5f5] group-hover:bg-[#66e7f5] transition-colors flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5V19M5 12H19" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="font-['Inter',sans-serif] text-[16px] font-medium text-[#666] group-hover:text-[#0d0d0d] transition-colors">
                        Add an End page
                      </span>
                    </button>
                  )}
                  {currentSlideIndex === totalSlides - 1 && presentation && (presentation.end_title || presentation.end_description) && (
                    /* Show End Page preview on last slide if end page exists */
                    <button
                      onClick={handleNextSlide}
                      className="w-[756px] h-[423px] bg-white rounded-[16px] border border-[#e5e5e5] overflow-hidden opacity-50 hover:opacity-70 transition-all flex-shrink-0"
                    >
                      <div className="w-full h-full scale-[0.8] origin-center">
                        <EndSlideEditor
                          endTitle={presentation.end_title ?? undefined}
                          presentationTitle={presentation.title}
                          description={endDescriptionValue}
                          ctaText={ctaText === 'Add call to action' ? 'Start for free' : ctaText}
                          ctaUrl={ctaUrl || 'https://camaral.ai'}
                          onTitleChange={handleEndTitleChange}
                          onDescriptionChange={handleEndDescriptionChange}
                        />
                      </div>
                    </button>
                  )}
                  {currentSlideIndex === totalSlides ? (
                    /* No next slide for End Page */
                    <div className="w-[756px] h-[423px] flex-shrink-0"></div>
                  ) : null}
                </div>

                {/* Navigation Arrows */}
                {(totalSlides > 0 || isWelcomeSlide) && (
                  <>
                    {/* Previous Arrow - Only show if not on Welcome slide */}
                    {currentSlideIndex > -1 && (
                      <button
                        onClick={handlePrevSlide}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-[56px] h-[56px] bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-all z-10"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18L9 12L15 6" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}

                    {/* Next Arrow - Only show if not on End page */}
                    {currentSlideIndex < totalSlides && (
                      <button
                        onClick={handleNextSlide}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-[56px] h-[56px] bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-all z-10"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M9 18L15 12L9 6" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Description/Prompt Area - Only show for regular slides */}
          {!isWelcomeSlide && !isEndSlide && (
            <div className="w-full max-w-[840px] mb-6">
              <DescriptionTextarea 
                value={descriptionValue}
                onChange={setDescriptionValue}
                onGenerateAI={handleGenerateDescription}
                onImproveAI={handleImproveDescription}
                isGenerating={isGeneratingDescription}
              />
            </div>
          )}

          {/* Bottom Carousel - Thumbnails */}
          <div className="w-full max-w-[840px] flex justify-center">
            {loading ? (
              <div className="flex gap-[12px] overflow-x-auto pb-2 justify-center">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[105px] h-[59px] bg-[#f5f5f5] rounded-[16px] border-[1.713px] border-[#dcdcdc] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#e5e5e5] border-t-[#66e7f5]"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                ref={carouselRef} 
                className="flex gap-[12px] overflow-x-auto pb-2 scrollbar-hide justify-center"
              >
                {/* Welcome Slide Thumbnail */}
                {presentation && (
                  <div
                    key="welcome-slide"
                    ref={(el) => { thumbnailRefs.current[-1] = el }}
                    onClick={() => changeSlideWithAnimation(-1)}
                    className="flex-shrink-0 relative cursor-pointer transition-all"
                  >
                    <div className={`relative w-[105px] h-[59px] rounded-[16px] border-[1.713px] overflow-hidden transition-all ${
                      currentSlideIndex === -1
                        ? 'border-[#0d0d0d]'
                        : 'border-[#dcdcdc] opacity-60 hover:opacity-100'
                    }`}>
                      <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-1 p-2">
                        <div className="w-8 h-8 rounded-full bg-[#66e7f5] flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-[8px] font-['Inter',sans-serif] font-medium text-[#666] text-center">Welcome</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Render actual slides */}
                {presentation?.slides?.map((slide, index) => {
                  const isBeingDragged = draggedIndex === index && isDragging
                  const isDropTarget = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index
                  const isHovered = hoveredThumbnail === index
                  
                  return (
                  <div
                    key={slide.id}
                    ref={(el) => { thumbnailRefs.current[index] = el }}
                    onMouseDown={(e) => handleMouseDown(e, index)}
                    onMouseEnter={() => setHoveredThumbnail(index)}
                    onMouseLeave={() => setHoveredThumbnail(null)}
                    onClick={() => {
                      if (!isDragging) {
                        changeSlideWithAnimation(index)
                      }
                    }}
                    className={`flex-shrink-0 relative select-none transition-all duration-200 ${
                      isBeingDragged 
                        ? 'opacity-30' 
                        : 'cursor-grab hover:scale-105'
                    } ${
                      isDropTarget
                        ? 'scale-95 opacity-50'
                        : ''
                    }`}
                  >
                    <div className={`relative w-[105px] h-[59px] rounded-[16px] border-[1.713px] overflow-hidden transition-all ${
                      index === currentSlideIndex
                        ? 'border-[#0d0d0d]'
                        : 'border-[#dcdcdc] opacity-60 hover:opacity-100'
                    } ${
                      dragOverIndex === index && draggedIndex !== index
                        ? 'border-[#66e7f5] border-[3px]'
                        : ''
                    }`}>
                      <div className="w-full h-full bg-white">
                        {slide.image_url.endsWith('.pdf') ? (
                          <iframe
                            src={`${slide.image_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                            className="w-full h-full pointer-events-none"
                          />
                        ) : (
                          <img
                            src={slide.image_url}
                            alt={slide.title || `Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      
                      {/* Delete button */}
                      {isHovered && !isDragging && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSlide(slide.id, index)
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="absolute top-2 right-2 w-6 h-6 bg-[#ff4444] hover:bg-[#ff0000] rounded-full flex items-center justify-center transition-colors z-10 shadow-lg"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M9 3L3 9M3 3L9 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                      
                      {/* Drop target indicator */}
                      {isDropTarget && (
                        <div className="absolute inset-0 border-2 border-dashed border-[#66e7f5] rounded-[16px] pointer-events-none"></div>
                      )}
                    </div>
                  </div>
                  )
                })}

                {/* End Page Thumbnail - Show if end page exists */}
                {presentation && (presentation.end_title || presentation.end_description) && (
                  <div
                    key="end-slide"
                    ref={(el) => { thumbnailRefs.current[totalSlides] = el }}
                    onMouseEnter={() => setHoveredThumbnail(totalSlides)}
                    onMouseLeave={() => setHoveredThumbnail(null)}
                    onClick={() => changeSlideWithAnimation(totalSlides)}
                    className="flex-shrink-0 relative cursor-pointer transition-all select-none"
                  >
                    <div className={`relative w-[105px] h-[59px] rounded-[16px] border-[1.713px] overflow-hidden transition-all ${
                      currentSlideIndex === totalSlides
                        ? 'border-[#0d0d0d]'
                        : 'border-[#dcdcdc] opacity-60 hover:opacity-100'
                    }`}>
                      <div className="w-full h-full bg-white flex flex-col items-center justify-center gap-1 p-2">
                        <div className="w-8 h-8 rounded-full bg-[#0d0d0d] flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 11l3 3L22 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="text-[8px] font-['Inter',sans-serif] font-medium text-[#666] text-center">End Page</span>
                      </div>

                      {/* Delete button */}
                      {hoveredThumbnail === totalSlides && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteEndPage()
                          }}
                          className="absolute top-2 right-2 w-6 h-6 bg-[#ff4444] hover:bg-[#ff0000] rounded-full flex items-center justify-center transition-colors z-10 shadow-lg"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M9 3L3 9M3 3L9 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Loading placeholders for slides being processed */}
                {isProcessing && presentation?.slides && totalSlidesExpected > 0 && (
                  <>
                    {[...Array(Math.max(0, totalSlidesExpected - presentation.slides.length))].map((_, i) => (
                      <div
                        key={`loading-${i}`}
                        className="flex-shrink-0 w-[105px] h-[59px] bg-[#f5f5f5] rounded-[16px] border-[1.713px] border-dashed border-[#dcdcdc] flex flex-col items-center justify-center gap-2"
                      >
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#e5e5e5] border-t-[#66e7f5]"></div>
                        <span className="text-[10px] text-[#999] font-['Inter',sans-serif]">
                          Loading...
                        </span>
                      </div>
                    ))}
                  </>
                )}
                
                {/* Fallback: Show 3 placeholders if we don't know the expected count */}
                {isProcessing && presentation?.slides && totalSlidesExpected === 0 && (
                  <>
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={`loading-fallback-${i}`}
                        className="flex-shrink-0 w-[105px] h-[59px] bg-[#f5f5f5] rounded-[16px] border-[1.713px] border-dashed border-[#dcdcdc] flex flex-col items-center justify-center gap-2"
                      >
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#e5e5e5] border-t-[#66e7f5]"></div>
                        <span className="text-[10px] text-[#999] font-['Inter',sans-serif]">
                          Loading...
                        </span>
                      </div>
                    ))}
                  </>
                )}

                {/* Add New Slide Button */}
                {!isProcessing && (
                  <button className="flex-shrink-0 w-[105px] h-[59px] bg-[#fafafa] border-[1.713px] border-[#dcdcdc] rounded-[16px] flex items-center justify-center hover:bg-[#f0f0f0] transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 6V18M6 12H18" stroke="#999999" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Dragged Slide Portal - Renders outside carousel */}
      {isDragging && draggedIndex !== null && dragCurrentPos && draggedSlideRect && presentation?.slides?.[draggedIndex] && (
        <div
          style={{
            position: 'fixed',
            left: dragCurrentPos.x - (draggedSlideRect.width / 2),
            top: dragCurrentPos.y - (draggedSlideRect.height / 2),
            width: draggedSlideRect.width,
            height: draggedSlideRect.height,
            zIndex: 9999,
            pointerEvents: 'none',
            cursor: 'grabbing'
          }}
          className="transition-none"
        >
          <div className="relative w-full h-full scale-110 opacity-90 shadow-2xl">
            <div className="relative w-[105px] h-[59px] rounded-[16px] border-[1.713px] border-[#0d0d0d] overflow-hidden">
              <div className="w-full h-full bg-white">
                {presentation.slides[draggedIndex].image_url.endsWith('.pdf') ? (
                  <iframe
                    src={`${presentation.slides[draggedIndex].image_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                    className="w-full h-full pointer-events-none"
                  />
                ) : (
                  <img
                    src={presentation.slides[draggedIndex].image_url}
                    alt={presentation.slides[draggedIndex].title || `Slide ${draggedIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              {/* Drag indicator */}
              <div className="absolute inset-0 bg-[#66e7f5] bg-opacity-20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H15M9 12H15M9 19H15" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
