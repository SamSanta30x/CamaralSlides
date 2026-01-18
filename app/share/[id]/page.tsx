'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getPublicPresentation, type Presentation } from '@/lib/supabase/publicPresentations'

export default function SharePresentationPage() {
  const params = useParams()
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isVideoOn, setIsVideoOn] = useState(false)
  const [isCaptionsOn, setIsCaptionsOn] = useState(false)
  const [isScreenShareOn, setIsScreenShareOn] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showFullscreenButton, setShowFullscreenButton] = useState(false)

  const presentationId = params.id as string

  useEffect(() => {
    loadPresentation()
  }, [presentationId])

  const loadPresentation = async () => {
    try {
      const { data, error } = await getPublicPresentation(presentationId)
      if (error) {
        console.error('Error loading presentation:', error)
        return
      }
      setPresentation(data)
    } catch (error) {
      console.error('Error loading presentation:', error)
    } finally {
      setLoading(false)
    }
  }

  const currentSlide = presentation?.slides?.[currentSlideIndex]

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && presentation?.slides) {
        setCurrentSlideIndex((prev) => Math.min(prev + 1, presentation.slides!.length - 1))
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen()
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [presentation, isFullscreen])

  // Fullscreen functions
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      exitFullscreen()
    }
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
    setIsFullscreen(false)
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d0d0d]"></div>
      </div>
    )
  }

  if (!presentation || !presentation.slides || presentation.slides.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">
          Presentation not found
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white flex flex-col items-center relative h-screen w-full overflow-hidden">
      {/* Header */}
      <div className="flex h-[60px] items-center justify-between px-[32px] py-[6px] w-full shrink-0">
        <div className="flex gap-[20px] items-center">
          <Link href="/" className="h-[24px] w-[96px] relative">
            <Image
              src="/Camaral Logo.svg"
              alt="Camaral"
              width={96}
              height={24}
              className="object-contain"
            />
          </Link>
          <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.32px]">
            {presentation.title}
          </p>
        </div>
        <div className="flex gap-[6px] items-center">
          <Link
            href="/signup"
            className="bg-[#0d0d0d] flex items-center justify-center px-[14px] py-[8px] rounded-[999px] hover:bg-[#2e2e2e] transition-colors"
          >
            <span className="font-['Inter',sans-serif] text-[16px] text-white tracking-[-0.32px]">
              Start for free
            </span>
          </Link>
          <button
            onClick={() => {
              const url = window.location.href
              navigator.clipboard.writeText(url)
              alert('Link copied to clipboard!')
            }}
            className="w-[40px] h-[40px] flex items-center justify-center hover:bg-[#f5f5f5] rounded-full transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M13.3333 8C13.3333 9.84095 12.5869 11.6043 11.2538 12.9374C9.92073 14.2705 8.15734 15.0169 6.31639 15.0169C4.47544 15.0169 2.71205 14.2705 1.37899 12.9374C0.0459303 11.6043 -0.700439 9.84095 -0.700439 8C-0.700439 6.15905 0.0459303 4.39566 1.37899 3.06259C2.71205 1.72953 4.47544 0.983167 6.31639 0.983167C8.15734 0.983167 9.92073 1.72953 11.2538 3.06259C12.5869 4.39566 13.3333 6.15905 13.3333 8Z"
                stroke="#0d0d0d"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.3333 8H15.3333"
                stroke="#0d0d0d"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.33331 8H8.33331"
                stroke="#0d0d0d"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.33331 8L1.33331 12"
                stroke="#0d0d0d"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.33331 8L1.33331 4"
                stroke="#0d0d0d"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Slide Container */}
      <div className="flex flex-col items-center justify-center flex-1 px-[40px] w-full">
        <div 
          className="flex items-start justify-center w-full max-w-[1200px] h-full relative"
          onMouseEnter={() => setShowFullscreenButton(true)}
          onMouseLeave={() => setShowFullscreenButton(false)}
        >
          <div className="border-[0.956px] border-[#0d0d0d] border-solid w-full h-full max-h-[calc(100vh-200px)] relative rounded-[15.289px] overflow-hidden bg-[#0d0d0d]">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0d]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            {currentSlide && (
              <Image
                src={currentSlide.image_url}
                alt={currentSlide.title || `Slide ${currentSlideIndex + 1}`}
                fill
                className="object-contain"
                onLoad={() => setImageLoading(false)}
                onLoadStart={() => setImageLoading(true)}
                priority
              />
            )}
            
            {/* Fullscreen Button - Shows on hover */}
            {showFullscreenButton && !isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 right-4 bg-[rgba(0,0,0,0.6)] hover:bg-[rgba(0,0,0,0.8)] text-white p-2 rounded-lg transition-all z-10"
                title="Fullscreen (F)"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M2 7V3C2 2.44772 2.44772 2 3 2H7M13 2H17C17.5523 2 18 2.44772 18 3V7M18 13V17C18 17.5523 17.5523 18 17 18H13M7 18H3C2.44772 18 2 17.5523 2 17V13"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#2e2e2e] border-[1.4px] border-[rgba(255,255,255,0.4)] border-solid flex gap-[12px] items-center justify-center p-[12px] rounded-[100px] mb-3 shrink-0">
        {/* Microphone */}
        <button
          onClick={() => setIsMicOn(!isMicOn)}
          className={`relative rounded-[100px] w-[44px] h-[44px] flex items-center justify-center transition-colors ${
            isMicOn ? 'bg-[#0d0d0d]' : 'bg-[rgba(255,255,255,0.07)]'
          }`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19 12C19 15.866 15.866 19 12 19M12 19C8.13401 19 5 15.866 5 12M12 19V22"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Video Camera */}
        <button
          onClick={() => setIsVideoOn(!isVideoOn)}
          className={`relative rounded-[100px] w-[44px] h-[44px] flex items-center justify-center transition-colors ${
            isVideoOn ? 'bg-[#0d0d0d]' : 'bg-[rgba(255,255,255,0.07)]'
          }`}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M18 10L24 6V22L18 18M4 8C4 6.89543 4.89543 6 6 6H16C17.1046 6 18 6.89543 18 8V20C18 21.1046 17.1046 22 16 22H6C4.89543 22 4 21.1046 4 20V8Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Closed Captioning */}
        <button
          onClick={() => setIsCaptionsOn(!isCaptionsOn)}
          className={`relative rounded-[100px] w-[44px] h-[44px] flex items-center justify-center transition-colors ${
            isCaptionsOn ? 'bg-[#0d0d0d]' : 'bg-[rgba(255,255,255,0.07)]'
          }`}
        >
          <svg width="23" height="23" viewBox="0 0 23 23" fill="none">
            <rect
              x="2"
              y="4"
              width="19"
              height="15"
              rx="2"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 13C7 13.5523 6.55228 14 6 14C5.44772 14 5 13.5523 5 13C5 12.4477 5.44772 12 6 12C6.55228 12 7 12.4477 7 13Z"
              fill="white"
            />
            <path
              d="M10 13C10 13.5523 9.55228 14 9 14C8.44772 14 8 13.5523 8 13C8 12.4477 8.44772 12 9 12C9.55228 12 10 12.4477 10 13Z"
              fill="white"
            />
            <path
              d="M13 13C13 13.5523 12.5523 14 12 14C11.4477 14 11 13.5523 11 13C11 12.4477 11.4477 12 12 12C12.5523 12 13 12.4477 13 13Z"
              fill="white"
            />
          </svg>
        </button>

        {/* Screen Share */}
        <button
          onClick={() => setIsScreenShareOn(!isScreenShareOn)}
          className={`relative rounded-[100px] w-[44px] h-[44px] flex items-center justify-center transition-colors ${
            isScreenShareOn ? 'bg-[#0d0d0d]' : 'bg-[rgba(255,255,255,0.07)]'
          }`}
        >
          <svg width="25" height="24" viewBox="0 0 25 24" fill="none">
            <path
              d="M8.5 12L12.5 8M12.5 8L16.5 12M12.5 8V16M21.5 12C21.5 16.9706 17.4706 21 12.5 21C7.52944 21 3.5 16.9706 3.5 12C3.5 7.02944 7.52944 3 12.5 3C17.4706 3 21.5 7.02944 21.5 12Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Footer - Powered by Camaral */}
      <div className="flex h-[50px] items-center justify-center w-full shrink-0">
        <div className="flex gap-[4px] items-center justify-center">
          <p className="font-['Inter',sans-serif] text-[11px] text-[#0d0d0d] tracking-[-0.22px]">
            Powered by
          </p>
          <Link href="/" className="flex items-center">
            <Image
              src="/Camaral Logo.svg"
              alt="Camaral"
              width={56}
              height={10}
              className="object-contain"
            />
          </Link>
        </div>
      </div>
    </div>
  )
}
