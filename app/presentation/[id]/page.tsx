'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/auth/AuthContext'
import { getPresentation, updateSlide, updatePresentationCTA, updatePresentationTitle, updatePresentationObjective, type Presentation, type Slide } from '@/lib/supabase/presentations'
import { generateSlideDescription } from '@/lib/supabase/edgeFunctions'
import DashboardHeader from '@/components/DashboardHeader'
import DescriptionTextarea from '@/components/DescriptionTextarea'
import WelcomeSlideEditor from '@/components/WelcomeSlideEditor'
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
  const [showMenu, setShowMenu] = useState(false)
  const [descriptionValue, setDescriptionValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedSlides, setProcessedSlides] = useState(0)
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
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
    setImageLoading(true)
  }, [currentSlideIndex])

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

  const handlePrevSlide = () => {
    if (currentSlideIndex > -1) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const handleNextSlide = () => {
    if (presentation?.slides && currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex || !presentation?.slides) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const supabase = createClient()
    const slides = [...presentation.slides]
    const [draggedSlide] = slides.splice(draggedIndex, 1)
    slides.splice(dropIndex, 0, draggedSlide)

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
        setCurrentSlideIndex(dropIndex)
      } else if (draggedIndex < currentSlideIndex && dropIndex >= currentSlideIndex) {
        setCurrentSlideIndex(currentSlideIndex - 1)
      } else if (draggedIndex > currentSlideIndex && dropIndex <= currentSlideIndex) {
        setCurrentSlideIndex(currentSlideIndex + 1)
      }
    } catch (error) {
      console.error('Error reordering slides:', error)
      // Reload presentation on error
      loadPresentation()
    }

    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
    // Delay clearing isDragging to prevent click from firing
    setTimeout(() => setIsDragging(false), 100)
  }

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

  const currentSlide = currentSlideIndex >= 0 ? presentation?.slides?.[currentSlideIndex] : null
  const totalSlides = presentation?.slides?.length || 0
  const hasSlides = totalSlides > 0
  const isWelcomeSlide = currentSlideIndex === -1

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with Menu and Tabs */}
      <DashboardHeader showMenu={true} showTabs={true} presentationId={presentationId} activeTab="content" />

      {/* Presentation Header - Floating Card */}
      <div className="w-full bg-white py-5">
        <div className="max-w-[840px] mx-auto">
          {presentation ? (
            <div className="w-[840px] h-[65px] bg-white rounded-[16px] border border-[#e5e5e5] bg-white px-6 flex items-center gap-4">
              {/* Presentation Icon */}
              <div className="w-[28px] h-[28px] bg-white border border-[#e5e5e5] rounded-[6px] flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="14" height="14" rx="1.5" stroke="#0d0d0d" strokeWidth="1.5"/>
                  <path d="M5 5h8M5 9h6M5 13h4" stroke="#0d0d0d" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Title - Editable */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={titleValue}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.blur()
                      }
                    }}
                    autoFocus
                    className="font-['Inter',sans-serif] text-[16px] font-semibold text-[#0d0d0d] leading-tight bg-transparent border-b border-[#0d0d0d] outline-none flex-1 min-w-0"
                  />
                ) : (
                  <h1 
                    onClick={() => setIsEditingTitle(true)}
                    className="font-['Inter',sans-serif] text-[16px] font-semibold text-[#0d0d0d] leading-tight truncate cursor-text hover:text-[#666] transition-colors"
                  >
                    {presentation.title}
                  </h1>
                )}
                {isProcessing && processedSlides > 0 && (
                  <div className="flex items-center gap-2 bg-[#66e7f5] px-3 py-1 rounded-full">
                    <div className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-[#0d0d0d] border-t-transparent"></div>
                    <span className="font-['Inter',sans-serif] text-[12px] font-medium text-[#0d0d0d]">
                      Processing... ({processedSlides} slides)
                    </span>
                  </div>
                )}
              </div>

              {/* Call to Action Button - Editable */}
              <div ref={ctaButtonRef} className="relative flex-shrink-0">
                <div 
                  onClick={handleCTAClick}
                  className="px-5 py-2 bg-[#0d0d0d] rounded-full font-['Inter',sans-serif] text-[13px] font-medium text-white hover:bg-[#2a2a2a] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0">
                    <path d="M7 3V11M3 7H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {isEditingCTA ? (
                    <input
                      type="text"
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      onBlur={handleCTABlur}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur()
                        }
                      }}
                      autoFocus
                      style={{ width: `${ctaInputWidth}px` }}
                      className="bg-transparent outline-none text-white font-['Inter',sans-serif] text-[13px] font-medium"
                    />
                  ) : (
                    <span ref={ctaTextRef} className="whitespace-nowrap">{presentation?.cta_text || 'Add call to action'}</span>
                  )}
                </div>

                {/* URL Popup - Small 30px height */}
                {showUrlPopup && ctaButtonRef.current && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={handleUrlPopupClose}
                    />
                    
                    {/* Popup */}
                    <div 
                      className="absolute top-[-40px] left-0 bg-white border border-[#e5e5e5] rounded-[8px] shadow-lg z-50 h-[30px] flex items-center px-3 gap-2"
                      style={{ 
                        minWidth: `${ctaButtonRef.current.offsetWidth}px`,
                        maxWidth: '400px'
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
                        <path d="M5 7L7 5M7 5L5 3M7 5H1M11 1V11" stroke="#666" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                      <input
                        type="url"
                        value={ctaUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 bg-transparent outline-none font-['Inter',sans-serif] text-[12px] text-[#0d0d0d] placeholder:text-[#999] min-w-0"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Loading State */
            <div className="w-[840px] h-[65px] bg-white rounded-[16px] px-6 py-[20px] border border-[#e5e5e5] flex items-center gap-4">
              <div className="w-[28px] h-[28px] bg-[#f5f5f5] rounded-[6px] animate-pulse"></div>
              <div className="flex-1">
                <div className="h-[20px] w-[200px] bg-[#f5f5f5] rounded animate-pulse"></div>
              </div>
              <div className="w-[150px] h-[28px] bg-[#f5f5f5] rounded-[10px] animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Slide Viewer Area */}
        <div className="flex-1 flex flex-col items-center px-8 pb-6">
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
                <div className="flex items-center justify-center gap-4 relative">
                  {/* Previous Slide (Left - 90% size) */}
                  {currentSlideIndex === 0 && presentation && (
                    /* Show Welcome Slide as previous when on first real slide */
                    <button
                      onClick={handlePrevSlide}
                      className="w-[756px] h-[423px] bg-white rounded-[16px] border border-[#e5e5e5] overflow-hidden opacity-50 hover:opacity-70 transition-all flex-shrink-0"
                    >
                      <div className="w-full h-full scale-[0.8] origin-center">
                        <WelcomeSlideEditor
                          presentationTitle={presentation.title}
                          description={welcomeDescription}
                          onDescriptionChange={handleWelcomeDescriptionChange}
                        />
                      </div>
                    </button>
                  )}
                  {currentSlideIndex > 0 && presentation?.slides?.[currentSlideIndex - 1] && (
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
                          className="w-full h-full object-contain p-3"
                        />
                      )}
                    </button>
                  )}
                  {currentSlideIndex < 0 && (
                    <div className="w-[756px] h-[423px]"></div>
                  )}

                  {/* Current Slide (Center - 100% size) */}
                  {isWelcomeSlide && presentation ? (
                    /* Welcome Slide */
                    <div className="relative w-[840px] h-[472.5px] flex-shrink-0">
                      <WelcomeSlideEditor
                        presentationTitle={presentation.title}
                        description={welcomeDescription}
                        onDescriptionChange={handleWelcomeDescriptionChange}
                      />
                    </div>
                  ) : currentSlide ? (
                    /* Regular Slide */
                    <div className="relative w-[840px] h-[472.5px] bg-white rounded-[16px] border border-[#e5e5e5] overflow-hidden flex-shrink-0">
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
                          src={currentSlide.image_url}
                          alt={currentSlide.title || `Slide ${currentSlideIndex + 1}`}
                          className={`w-full h-full object-contain p-4 transition-opacity duration-300 ${
                            imageLoading ? 'opacity-0' : 'opacity-100'
                          }`}
                          onLoad={() => setImageLoading(false)}
                          onError={() => setImageLoading(false)}
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
                          className="w-full h-full object-contain p-3"
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
                          className="w-full h-full object-contain p-3"
                        />
                      )}
                    </button>
                  )}
                  {currentSlideIndex === totalSlides - 1 && (
                    <div className="w-[756px] h-[423px]"></div>
                  )}
                </div>

                {/* Navigation Arrows */}
                {(totalSlides > 0 || isWelcomeSlide) && (
                  <>
                    {/* Previous Arrow */}
                    <button
                      onClick={handlePrevSlide}
                      disabled={currentSlideIndex === -1}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-[56px] h-[56px] bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* Next Arrow */}
                    <button
                      onClick={handleNextSlide}
                      disabled={currentSlideIndex === totalSlides - 1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-[56px] h-[56px] bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* Description/Prompt Area - Only show for regular slides */}
          {!isWelcomeSlide && (
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
                  <div key={i} className="flex-shrink-0 w-[156px] h-[88px] bg-[#f5f5f5] rounded-[13.703px] border-[1.713px] border-[#dcdcdc] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#e5e5e5] border-t-[#66e7f5]"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-[12px] overflow-x-auto pb-2 scrollbar-hide justify-center">
                {/* Welcome Slide Thumbnail */}
                {presentation && (
                  <div
                    key="welcome-slide"
                    onClick={() => setCurrentSlideIndex(-1)}
                    className="flex-shrink-0 relative cursor-pointer transition-all"
                  >
                    <div className={`relative w-[156px] h-[88px] rounded-[13.703px] border-[1.713px] overflow-hidden transition-all ${
                      currentSlideIndex === -1
                        ? 'border-[#0d0d0d]'
                        : 'border-[#dcdcdc] opacity-60 hover:opacity-100'
                    }`}>
                      <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center p-2 scale-[0.6] origin-center">
                        <WelcomeSlideEditor
                          presentationTitle={presentation.title}
                          description={welcomeDescription}
                          onDescriptionChange={handleWelcomeDescriptionChange}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Render actual slides */}
                {presentation?.slides?.map((slide, index) => (
                  <div
                    key={slide.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      if (!isDragging) {
                        setCurrentSlideIndex(index)
                      }
                    }}
                    className={`flex-shrink-0 relative cursor-move transition-all ${
                      draggedIndex === index ? 'opacity-50 scale-95' : ''
                    } ${
                      dragOverIndex === index && draggedIndex !== index
                        ? 'scale-105'
                        : ''
                    }`}
                  >
                    <div className={`relative w-[156px] h-[88px] rounded-[13.703px] border-[1.713px] overflow-hidden transition-all ${
                      index === currentSlideIndex
                        ? 'border-[#0d0d0d]'
                        : 'border-[#dcdcdc] opacity-60 hover:opacity-100'
                    } ${
                      dragOverIndex === index && draggedIndex !== index
                        ? 'border-[#66e7f5] border-[3px]'
                        : ''
                    }`}>
                      <div className="w-full h-full bg-white flex items-center justify-center p-2">
                        {slide.image_url.endsWith('.pdf') ? (
                          <iframe
                            src={`${slide.image_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                            className="w-full h-full pointer-events-none"
                          />
                        ) : (
                          <img
                            src={slide.image_url}
                            alt={slide.title || `Slide ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                      
                      {/* Drag indicator */}
                      {draggedIndex === index && (
                        <div className="absolute inset-0 bg-[#66e7f5] bg-opacity-20 flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M9 5H15M9 12H15M9 19H15" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Loading placeholders for slides being processed */}
                {isProcessing && presentation?.slides && totalSlidesExpected > 0 && (
                  <>
                    {[...Array(Math.max(0, totalSlidesExpected - presentation.slides.length))].map((_, i) => (
                      <div
                        key={`loading-${i}`}
                        className="flex-shrink-0 w-[156px] h-[88px] bg-[#f5f5f5] rounded-[13.703px] border-[1.713px] border-dashed border-[#dcdcdc] flex flex-col items-center justify-center gap-2"
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
                        className="flex-shrink-0 w-[156px] h-[88px] bg-[#f5f5f5] rounded-[13.703px] border-[1.713px] border-dashed border-[#dcdcdc] flex flex-col items-center justify-center gap-2"
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
                  <button className="flex-shrink-0 w-[156px] h-[88px] bg-[#fafafa] border-[1.713px] border-[#dcdcdc] rounded-[13.703px] flex items-center justify-center hover:bg-[#f0f0f0] transition-all">
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

      {/* Bottom Bar - Powered by */}
      <div className="w-full bg-white py-3 flex items-center justify-center">
        <p className="font-['Inter',sans-serif] text-[12px] text-[#999] flex items-center gap-2">
          Powered by
          <Image 
            src="/Camaral Logo.svg" 
            alt="Camaral" 
            width={70}
            height={16}
            className="h-[16px] w-auto"
          />
        </p>
      </div>
    </div>
  )
}
