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
      // Reload presentation to get updated data
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
      if (e.key === 'ArrowLeft') {
        handlePrevSlide()
      } else if (e.key === 'ArrowRight') {
        handleNextSlide()
      } else if (e.key === 'Escape') {
        handleCancelEdit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlideIndex, presentation])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">Loading...</p>
      </div>
    )
  }

  if (!presentation || !presentation.slides || presentation.slides.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">Presentation not found</p>
      </div>
    )
  }

  const currentSlide = presentation.slides[currentSlideIndex]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-[#eceae4] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Image 
              src="/Camaral Logo.svg" 
              alt="Camaral" 
              width={90}
              height={20}
              priority
              className="h-[20px] w-auto"
            />
          </Link>
          <span className="text-[#5f5f5d] text-[14px]">|</span>
          <h1 className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d]">
            {presentation.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-[#f5f5f5] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] hover:bg-[#eceae4]">
            Share
          </button>
          <Link 
            href="/"
            className="px-4 py-2 bg-[#1c1c1c] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-white hover:bg-[#333]"
          >
            Close
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Slide Viewer */}
        <div className="flex-1 flex flex-col items-center justify-center bg-[#f9f9f9] p-8 relative">
          {/* Slide Image */}
          <div className="relative w-full max-w-[1200px] aspect-[16/9] bg-white rounded-[12px] shadow-lg overflow-hidden">
            <img 
              src={currentSlide.image_url}
              alt={currentSlide.title || `Slide ${currentSlideIndex + 1}`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Navigation Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white rounded-[999px] px-6 py-3 shadow-lg">
            <button
              onClick={handlePrevSlide}
              disabled={currentSlideIndex === 0}
              className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-[#f5f5f5] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <span className="font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] min-w-[60px] text-center">
              {currentSlideIndex + 1} / {presentation.slides.length}
            </span>

            <button
              onClick={handleNextSlide}
              disabled={currentSlideIndex === presentation.slides.length - 1}
              className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-[#f5f5f5] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar - Slide Details */}
        <div className="w-[400px] border-l border-[#eceae4] bg-white p-6 overflow-y-auto">
          {editingSlide === currentSlide.id ? (
            /* Edit Mode */
            <div className="flex flex-col gap-4">
              <h2 className="font-['Inter',sans-serif] text-[18px] font-medium text-[#0d0d0d]">
                Edit Slide
              </h2>

              <div className="flex flex-col gap-2">
                <label className="font-['Inter',sans-serif] text-[14px] text-[#5f5f5d]">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="border border-[#eceae4] rounded-[8px] px-3 py-2 font-['Inter',sans-serif] text-[14px] outline-none focus:border-[#1c1c1c]"
                  placeholder="Slide title"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-['Inter',sans-serif] text-[14px] text-[#5f5f5d]">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="border border-[#eceae4] rounded-[8px] px-3 py-2 font-['Inter',sans-serif] text-[14px] outline-none focus:border-[#1c1c1c] min-h-[100px] resize-none"
                  placeholder="Slide description"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-4 py-2 bg-[#1c1c1c] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-white hover:bg-[#333]"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 bg-[#f5f5f5] rounded-[8px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] hover:bg-[#eceae4]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-['Inter',sans-serif] text-[18px] font-medium text-[#0d0d0d]">
                  Slide Details
                </h2>
                <button
                  onClick={() => handleEditSlide(currentSlide)}
                  className="px-3 py-1 bg-[#f5f5f5] rounded-[6px] font-['Inter',sans-serif] text-[12px] text-[#0d0d0d] hover:bg-[#eceae4]"
                >
                  Edit
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-['Inter',sans-serif] text-[14px] font-medium text-[#0d0d0d]">
                  {currentSlide.title || `Slide ${currentSlideIndex + 1}`}
                </span>
                {currentSlide.description && (
                  <p className="font-['Inter',sans-serif] text-[14px] text-[#5f5f5d]">
                    {currentSlide.description}
                  </p>
                )}
              </div>

              {/* Thumbnail List */}
              <div className="mt-6">
                <h3 className="font-['Inter',sans-serif] text-[14px] font-medium text-[#0d0d0d] mb-3">
                  All Slides
                </h3>
                <div className="flex flex-col gap-2">
                  {presentation.slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlideIndex(index)}
                      className={`flex gap-3 p-2 rounded-[8px] hover:bg-[#f5f5f5] ${
                        index === currentSlideIndex ? 'bg-[#f5f5f5]' : ''
                      }`}
                    >
                      <div className="w-[60px] h-[40px] bg-[#f9f9f9] rounded-[4px] overflow-hidden flex-shrink-0">
                        <img 
                          src={slide.image_url}
                          alt={slide.title || `Slide ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-['Inter',sans-serif] text-[12px] font-medium text-[#0d0d0d] truncate">
                          {slide.title || `Slide ${index + 1}`}
                        </p>
                        <p className="font-['Inter',sans-serif] text-[11px] text-[#5f5f5d]">
                          Slide {index + 1}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
