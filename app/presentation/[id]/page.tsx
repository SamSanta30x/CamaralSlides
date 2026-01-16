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
      <div className="w-full bg-[#fafafa] border-b border-[#e5e5e5] px-8 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center gap-3">
          {/* Presentation Icon/Logo */}
          {presentation && (
            <>
              <div className="w-[40px] h-[40px] bg-white border border-[#e5e5e5] rounded-[8px] flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#0d0d0d" strokeWidth="2"/>
                  <path d="M8 8h8M8 12h6M8 16h4" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <h1 className="font-['Inter',sans-serif] text-[18px] font-semibold text-[#0d0d0d]">
                  {presentation.title}
                </h1>
                <p className="font-['Inter',sans-serif] text-[13px] text-[#666]">
                  Click here to change the description of this presentation
                </p>
              </div>
            </>
          )}
          <button className="ml-auto px-4 py-2 bg-[#0d0d0d] rounded-[8px] font-['Inter',sans-serif] text-[13px] text-white hover:bg-[#1a1a1a]">
            + Add call to action
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Slide Navigation */}
        <div className="w-[280px] bg-white border-r border-[#e5e5e5] overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Describe what your agent should say here or"
                className="w-full px-3 py-2 border border-[#e5e5e5] rounded-[8px] font-['Inter',sans-serif] text-[13px] outline-none focus:border-[#66e7f5]"
              />
              <button className="mt-2 w-full px-3 py-2 border border-[#e5e5e5] rounded-[8px] font-['Inter',sans-serif] text-[13px] text-[#666] hover:bg-[#f5f5f5] flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Generate it with AI
              </button>
            </div>

            {/* Slide Thumbnails */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-full aspect-[16/9] bg-[#f5f5f5] rounded-[8px] animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {presentation?.slides?.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`w-full rounded-[8px] overflow-hidden border-2 transition-all ${
                      index === currentSlideIndex
                        ? 'border-[#66e7f5] shadow-md'
                        : 'border-[#e5e5e5] hover:border-[#d0d0d0]'
                    }`}
                  >
                    <div className="aspect-[16/9] bg-white p-2">
                      <img
                        src={slide.image_url}
                        alt={slide.title || `Slide ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </button>
                ))}
                {/* Add New Slide Button */}
                <button className="w-full aspect-[16/9] border-2 border-dashed border-[#d0d0d0] rounded-[8px] flex items-center justify-center hover:border-[#66e7f5] hover:bg-[#f5f5f5] transition-all">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 8V24M8 16H24" stroke="#999" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Improve with AI Button */}
          <div className="p-4 border-t border-[#e5e5e5]">
            <button className="w-full px-3 py-2 border border-[#e5e5e5] rounded-[8px] font-['Inter',sans-serif] text-[13px] text-[#666] hover:bg-[#f5f5f5] flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L10 6L14 6.5L11 9.5L11.5 14L8 12L4.5 14L5 9.5L2 6.5L6 6L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
              Improve it with AI
            </button>
          </div>
        </div>

        {/* Center - Slide Viewer */}
        <div className="flex-1 bg-[#f9f9f9] flex items-center justify-center p-8 overflow-hidden">
          <div className="relative w-full max-w-[900px]">
            {loading || !currentSlide ? (
              /* Loading State */
              <div className="w-full aspect-[16/9] bg-white rounded-[16px] shadow-lg flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-[#1c1c1c]"></div>
                  <p className="font-['Inter',sans-serif] text-[14px] text-[#666]">
                    Loading slides...
                  </p>
                </div>
              </div>
            ) : (
              /* Slide Display */
              <div className="relative w-full aspect-[16/9] bg-white rounded-[16px] shadow-lg overflow-hidden">
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
            )}

            {/* Navigation Arrows */}
            {!loading && totalSlides > 0 && (
              <>
                {/* Previous Button */}
                {currentSlideIndex > 0 && (
                  <button
                    onClick={handlePrevSlide}
                    className="absolute left-[-80px] top-1/2 -translate-y-1/2 w-[56px] h-[56px] bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}

                {/* Next Button */}
                {currentSlideIndex < totalSlides - 1 && (
                  <button
                    onClick={handleNextSlide}
                    className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-[56px] h-[56px] bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#f5f5f5] transition-colors"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Sidebar - Placeholder */}
        <div className="w-[60px] bg-white border-l border-[#e5e5e5] flex flex-col items-center py-4 gap-4">
          {/* Placeholder for future tools/actions */}
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
