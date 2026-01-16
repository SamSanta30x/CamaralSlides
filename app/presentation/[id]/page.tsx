'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth/AuthContext'
import { getPresentation, updateSlide, type Presentation, type Slide } from '@/lib/supabase/presentations'

export default function PresentationPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)

  const presentationId = params.id as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && presentationId) {
      loadPresentation()
    }
  }, [user, presentationId])

  useEffect(() => {
    setImageLoading(true)
  }, [currentSlideIndex])

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
    }
    setLoading(false)
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c1c1c]"></div>
          <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">Loading...</p>
        </div>
      </div>
    )
  }

  const currentSlide = presentation?.slides?.[currentSlideIndex]
  const totalSlides = presentation?.slides?.length || 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="w-full border-b border-[#e5e5e5] px-6 py-3 flex items-center justify-between bg-white">
        {/* Left - Logo */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/Camaral Logo.svg" 
            alt="Camaral" 
            width={90}
            height={20}
            priority
            className="h-[24px] w-auto"
          />
        </Link>

        {/* Center - Tabs */}
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] border-b-2 border-[#0d0d0d]">
            Agent
          </button>
          <button className="px-4 py-2 font-['Inter',sans-serif] text-[14px] text-[#666] hover:text-[#0d0d0d]">
            Content
          </button>
          <button className="px-4 py-2 font-['Inter',sans-serif] text-[14px] text-[#666] hover:text-[#0d0d0d]">
            Analytics
          </button>
          <button className="px-4 py-2 font-['Inter',sans-serif] text-[14px] text-[#666] hover:text-[#0d0d0d] flex items-center gap-1">
            Responses
            <span className="bg-[#f5f5f5] px-2 py-0.5 rounded-full text-[12px]">12</span>
          </button>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[#66e7f5] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] hover:bg-[#56d7e5] flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Upgrade Now
          </button>
          <button className="px-4 py-2 border border-[#e5e5e5] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] hover:bg-[#f5f5f5] flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 10v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2M11 5L8 2m0 0L5 5m3-3v9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Share
          </button>
          <div className="w-[32px] h-[32px] rounded-full border-[1.125px] border-[#fbff00] overflow-hidden cursor-pointer">
            <img 
              src="/assets/avatar-demo.png" 
              alt="User avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </nav>

      {/* Presentation Header */}
      <div className="w-full bg-white border-b border-[#e5e5e5]">
        <div className="max-w-[1400px] mx-auto px-8 py-6">
          {presentation ? (
            <div className="flex items-start gap-4">
              {/* Presentation Icon */}
              <div className="w-[48px] h-[48px] bg-white border border-[#e5e5e5] rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <rect x="4" y="4" width="20" height="20" rx="2" stroke="#0d0d0d" strokeWidth="2"/>
                  <path d="M9 9h10M9 14h8M9 19h6" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Title and Description */}
              <div className="flex-1 min-w-0">
                <h1 className="font-['Inter',sans-serif] text-[22px] font-semibold text-[#0d0d0d] mb-1 leading-tight">
                  {presentation.title}
                </h1>
                <button className="font-['Inter',sans-serif] text-[14px] text-[#999] hover:text-[#666] transition-colors text-left">
                  Click here to change the description of this presentation
                </button>
              </div>

              {/* Call to Action Button */}
              <button className="px-5 py-2.5 bg-[#0d0d0d] rounded-[10px] font-['Inter',sans-serif] text-[14px] font-medium text-white hover:bg-[#2a2a2a] transition-colors flex items-center gap-2 flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3.5V12.5M3.5 8H12.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Add call to action
              </button>
            </div>
          ) : (
            /* Loading State */
            <div className="flex items-start gap-4">
              <div className="w-[48px] h-[48px] bg-[#f5f5f5] rounded-[10px] animate-pulse"></div>
              <div className="flex-1">
                <div className="h-[28px] w-[300px] bg-[#f5f5f5] rounded animate-pulse mb-2"></div>
                <div className="h-[20px] w-[400px] bg-[#f5f5f5] rounded animate-pulse"></div>
              </div>
              <div className="w-[180px] h-[42px] bg-[#f5f5f5] rounded-[10px] animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Slide Viewer with Bottom Carousel */}
        <div className="flex-1 bg-[#f9f9f9] flex flex-col items-center justify-center px-8 pt-8 pb-4">
          {/* Main Slide Container */}
          <div className="relative w-full max-w-[1100px] flex-1 flex items-center justify-center">
            {loading || !currentSlide ? (
              /* Loading State */
              <div className="w-full h-full max-h-[600px] aspect-[16/9] bg-white rounded-[12px] shadow-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-[#1c1c1c]"></div>
                  <p className="font-['Inter',sans-serif] text-[14px] text-[#666]">
                    Loading slides...
                  </p>
                </div>
              </div>
            ) : (
              /* Slide Display */
              <>
                <div className="relative w-full h-full max-h-[600px] aspect-[16/9] bg-white rounded-[12px] shadow-lg overflow-hidden">
                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c1c1c]"></div>
                    </div>
                  )}
                  <img
                    src={currentSlide.image_url}
                    alt={currentSlide.title || `Slide ${currentSlideIndex + 1}`}
                    className={`w-full h-full object-contain transition-opacity duration-300 ${
                      imageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onLoad={() => setImageLoading(false)}
                    onError={() => setImageLoading(false)}
                  />
                </div>

                {/* Navigation Arrows - Outside Slide */}
                {totalSlides > 0 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={handlePrevSlide}
                      disabled={currentSlideIndex === 0}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-[48px] h-[48px] bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={handleNextSlide}
                      disabled={currentSlideIndex === totalSlides - 1}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-[48px] h-[48px] bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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

          {/* Bottom Carousel - Thumbnails */}
          <div className="w-full max-w-[1100px] mt-6">
            <div className="bg-white rounded-[12px] border border-[#e5e5e5] p-4">
              {loading ? (
                <div className="flex gap-3 overflow-x-auto">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-[140px] h-[90px] bg-[#f5f5f5] rounded-[8px] animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#d0d0d0] scrollbar-track-transparent">
                  {presentation?.slides?.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlideIndex(index)}
                      className={`flex-shrink-0 w-[140px] rounded-[8px] overflow-hidden border-2 transition-all ${
                        index === currentSlideIndex
                          ? 'border-[#0d0d0d] shadow-md'
                          : 'border-[#e5e5e5] hover:border-[#d0d0d0]'
                      }`}
                    >
                      <div className="relative aspect-[16/9] bg-[#fafafa] p-2 group">
                        <img
                          src={slide.image_url}
                          alt={slide.title || `Slide ${index + 1}`}
                          className="w-full h-full object-contain"
                        />
                        {/* Slide Number Overlay */}
                        <div className={`absolute bottom-1 right-1 px-2 py-0.5 rounded-[4px] text-[10px] font-['Inter',sans-serif] font-medium ${
                          index === currentSlideIndex
                            ? 'bg-[#0d0d0d] text-white'
                            : 'bg-white text-[#666] border border-[#e5e5e5]'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Add New Slide Button */}
                  <button className="flex-shrink-0 w-[140px] aspect-[16/9] border-2 border-dashed border-[#d0d0d0] rounded-[8px] flex items-center justify-center hover:border-[#66e7f5] hover:bg-[#fafafa] transition-all">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 6V18M6 12H18" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Powered by */}
      <div className="w-full bg-white border-t border-[#e5e5e5] py-3 flex items-center justify-center">
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
