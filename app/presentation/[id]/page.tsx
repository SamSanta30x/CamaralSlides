'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/auth/AuthContext'
import { getPresentation, updateSlide, type Presentation, type Slide } from '@/lib/supabase/presentations'
import DashboardHeader from '@/components/DashboardHeader'
import DescriptionTextarea from '@/components/DescriptionTextarea'
import { createClient } from '@/lib/supabase/client'

export default function PresentationPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [descriptionValue, setDescriptionValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedSlides, setProcessedSlides] = useState(0)
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const presentationId = params.id as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && presentationId) {
      loadPresentation()
      subscribeToSlideUpdates()
    }
  }, [user, presentationId])

  useEffect(() => {
    setImageLoading(true)
    setDescriptionValue(presentation?.slides?.[currentSlideIndex]?.description || '')
  }, [currentSlideIndex, presentation])

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
      // Check if presentation has no slides (still processing)
      if (!data.slides || data.slides.length === 0) {
        setIsProcessing(true)
        setProcessedSlides(0)
      } else {
        setIsProcessing(false)
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
            
            // Set processing flag when slides start arriving
            setIsProcessing(true)
            
            // Clear any existing timeout
            if (processingTimeoutRef.current) {
              clearTimeout(processingTimeoutRef.current)
            }
            
            // Set a timeout to turn off processing flag after 3 seconds of no new slides
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
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    }
  }

  const handleNextSlide = () => {
    if (presentation?.slides && currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1)
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

  const currentSlide = presentation?.slides?.[currentSlideIndex]
  const totalSlides = presentation?.slides?.length || 0
  const hasSlides = totalSlides > 0

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

              {/* Title */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <h1 className="font-['Inter',sans-serif] text-[16px] font-semibold text-[#0d0d0d] leading-tight truncate">
                  {presentation.title}
                </h1>
                {isProcessing && processedSlides > 0 && (
                  <div className="flex items-center gap-2 bg-[#66e7f5] px-3 py-1 rounded-full">
                    <div className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-[#0d0d0d] border-t-transparent"></div>
                    <span className="font-['Inter',sans-serif] text-[12px] font-medium text-[#0d0d0d]">
                      Processing... ({processedSlides} slides)
                    </span>
                  </div>
                )}
              </div>

              {/* Call to Action Button */}
              <button className="px-5 py-2 bg-[#0d0d0d] rounded-full font-['Inter',sans-serif] text-[13px] font-medium text-white hover:bg-[#2a2a2a] transition-colors flex items-center gap-2 flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 3V11M3 7H11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Add call to action
              </button>
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
                  {currentSlideIndex === 0 && (
                    <div className="w-[756px] h-[423px]"></div>
                  )}

                  {/* Current Slide (Center - 100% size) */}
                  {currentSlide && (
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
                  )}

                  {/* Next Slide (Right - 90% size) */}
                  {currentSlideIndex < totalSlides - 1 && presentation?.slides?.[currentSlideIndex + 1] && (
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
                {totalSlides > 1 && (
                  <>
                    {/* Previous Arrow */}
                    <button
                      onClick={handlePrevSlide}
                      disabled={currentSlideIndex === 0}
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

          {/* Description/Prompt Area */}
          <div className="w-full max-w-[840px] mb-6">
            <DescriptionTextarea 
              value={descriptionValue}
              onChange={setDescriptionValue}
            />
          </div>

          {/* Bottom Carousel - Thumbnails */}
          <div className="w-full max-w-[840px] flex justify-center">
            {loading || !hasSlides ? (
              <div className="flex gap-[12px] overflow-x-auto pb-2 justify-center">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[156px] h-[88px] bg-[#f5f5f5] rounded-[13.703px] border-[1.713px] border-[#dcdcdc] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#e5e5e5] border-t-[#66e7f5]"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-[12px] overflow-x-auto pb-2 scrollbar-hide justify-center">
                {presentation?.slides?.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(index)}
                    className="flex-shrink-0 relative"
                  >
                    <div className={`relative w-[156px] h-[88px] rounded-[13.703px] border-[1.713px] overflow-hidden transition-all ${
                      index === currentSlideIndex
                        ? 'border-[#0d0d0d]'
                        : 'border-[#dcdcdc] opacity-60 hover:opacity-100'
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
                    </div>
                  </button>
                ))}

                {/* Add New Slide Button */}
                <button className="flex-shrink-0 w-[156px] h-[88px] bg-[#fafafa] border-[1.713px] border-[#dcdcdc] rounded-[13.703px] flex items-center justify-center hover:bg-[#f0f0f0] transition-all">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 6V18M6 12H18" stroke="#999999" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
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
