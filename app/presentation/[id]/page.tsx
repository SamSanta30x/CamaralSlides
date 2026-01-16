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
  const [editingSlide, setEditingSlide] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [imageLoading, setImageLoading] = useState(true)

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

  // Reset image loading when slide changes
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

  const handleEditSlide = (slide: Slide) => {
    setEditingSlide(slide.id)
    setEditTitle(slide.title || '')
    setEditDescription(slide.description || '')
  }

  const handleSaveEdit = async () => {
    if (!editingSlide) return

    const { error } = await updateSlide(editingSlide, editTitle, editDescription)
    
    if (!error) {
      await loadPresentation()
      setEditingSlide(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingSlide(null)
    setEditTitle('')
    setEditDescription('')
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingSlide) {
        if (e.key === 'Escape') {
          handleCancelEdit()
        }
        return
      }

      if (e.key === 'ArrowLeft') {
        handlePrevSlide()
      } else if (e.key === 'ArrowRight') {
        handleNextSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlideIndex, presentation, editingSlide])

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
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col">
      {/* Header */}
      <header className="w-full bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image 
              src="/Camaral Logo.svg" 
              alt="Camaral" 
              width={90}
              height={20}
              priority
              className="h-[20px] w-auto brightness-0 invert"
            />
          </Link>
          {presentation && (
            <>
              <span className="text-[#5f5f5d] text-[14px]">|</span>
              <h1 className="font-['Inter',sans-serif] text-[14px] font-medium text-white">
                {presentation.title}
              </h1>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/"
            className="px-4 py-2 bg-[#2a2a2a] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-white hover:bg-[#3a3a3a] transition-colors"
          >
            Close
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Viewer */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0d0d0d] p-8 relative">
          {/* Slide Container */}
          <div className="relative w-full max-w-[1400px] aspect-[16/9]">
            {loading || !currentSlide ? (
              /* Loading State - Show empty slide with spinner */
              <div className="w-full h-full bg-[#1a1a1a] rounded-[12px] border border-[#2a2a2a] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
                  <p className="font-['Inter',sans-serif] text-[14px] text-white">
                    Loading slides...
                  </p>
                </div>
              </div>
            ) : (
              /* Slide Image */
              <div className="relative w-full h-full bg-[#1a1a1a] rounded-[12px] border border-[#2a2a2a] overflow-hidden">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
          </div>

          {/* Navigation Controls */}
          {!loading && totalSlides > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-[999px] px-6 py-3 shadow-lg">
              <button
                onClick={handlePrevSlide}
                disabled={currentSlideIndex === 0}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <span className="font-['Inter',sans-serif] text-[14px] text-white min-w-[60px] text-center">
                {currentSlideIndex + 1} / {totalSlides}
              </span>

              <button
                onClick={handleNextSlide}
                disabled={currentSlideIndex === totalSlides - 1}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-[#2a2a2a] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 12L10 8L6 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar - Slide Details */}
        <div className="w-[360px] border-l border-[#2a2a2a] bg-[#1a1a1a] p-6 overflow-y-auto">
          {loading ? (
            /* Loading state for sidebar */
            <div className="flex flex-col gap-4">
              <div className="h-[24px] bg-[#2a2a2a] rounded animate-pulse"></div>
              <div className="h-[60px] bg-[#2a2a2a] rounded animate-pulse"></div>
              <div className="h-[200px] bg-[#2a2a2a] rounded animate-pulse"></div>
            </div>
          ) : currentSlide ? (
            editingSlide === currentSlide.id ? (
              /* Edit Mode */
              <div className="flex flex-col gap-4">
                <h2 className="font-['Inter',sans-serif] text-[18px] font-medium text-white">
                  Edit Slide
                </h2>

                <div className="flex flex-col gap-2">
                  <label className="font-['Inter',sans-serif] text-[14px] text-[#9f9f9f]">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-[8px] px-3 py-2 font-['Inter',sans-serif] text-[14px] text-white outline-none focus:border-[#66e7f5]"
                    placeholder="Slide title"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-['Inter',sans-serif] text-[14px] text-[#9f9f9f]">
                    Description
                  </label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-[8px] px-3 py-2 font-['Inter',sans-serif] text-[14px] text-white outline-none focus:border-[#66e7f5] min-h-[100px] resize-none"
                    placeholder="Slide description"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2 bg-[#66e7f5] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] hover:bg-[#56d7e5] transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-2 bg-[#2a2a2a] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-white hover:bg-[#3a3a3a] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-['Inter',sans-serif] text-[18px] font-medium text-white">
                    Slide Details
                  </h2>
                  <button
                    onClick={() => handleEditSlide(currentSlide)}
                    className="px-3 py-1 bg-[#2a2a2a] rounded-[6px] font-['Inter',sans-serif] text-[12px] text-white hover:bg-[#3a3a3a] transition-colors"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-['Inter',sans-serif] text-[16px] font-medium text-white">
                    {currentSlide.title || `Slide ${currentSlideIndex + 1}`}
                  </span>
                  {currentSlide.description && (
                    <p className="font-['Inter',sans-serif] text-[14px] text-[#9f9f9f]">
                      {currentSlide.description}
                    </p>
                  )}
                </div>

                {/* Thumbnail List */}
                {presentation?.slides && presentation.slides.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-['Inter',sans-serif] text-[14px] font-medium text-white mb-3">
                      All Slides ({totalSlides})
                    </h3>
                    <div className="flex flex-col gap-2">
                      {presentation.slides.map((slide, index) => (
                        <button
                          key={slide.id}
                          onClick={() => setCurrentSlideIndex(index)}
                          className={`flex gap-3 p-2 rounded-[8px] transition-colors ${
                            index === currentSlideIndex 
                              ? 'bg-[#2a2a2a] border border-[#66e7f5]' 
                              : 'hover:bg-[#2a2a2a] border border-transparent'
                          }`}
                        >
                          <div className="w-[80px] h-[45px] bg-[#0d0d0d] border border-[#3a3a3a] rounded-[4px] overflow-hidden flex-shrink-0">
                            <img 
                              src={slide.image_url}
                              alt={slide.title || `Slide ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-['Inter',sans-serif] text-[13px] font-medium text-white truncate">
                              {slide.title || `Slide ${index + 1}`}
                            </p>
                            <p className="font-['Inter',sans-serif] text-[11px] text-[#9f9f9f]">
                              Slide {index + 1}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}
