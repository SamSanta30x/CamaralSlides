'use client'

import { useState, useEffect, useRef } from 'react'

interface WelcomeSlideEditorProps {
  welcomeTitle?: string | null
  presentationTitle: string // Used as fallback if welcomeTitle is empty
  description?: string
  slideCount?: number // Number of slides in the presentation
  estimatedMinutes?: number // Estimated duration in minutes (editable)
  logoUrl?: string | null // URL of the uploaded logo
  onDescriptionChange?: (description: string) => void
  onTitleChange?: (title: string) => void
  onEstimatedMinutesChange?: (minutes: number) => void
  onLogoUpload?: (file: File) => void
}

export default function WelcomeSlideEditor({ 
  welcomeTitle,
  presentationTitle, 
  description = '',
  slideCount = 0,
  estimatedMinutes,
  logoUrl,
  onDescriptionChange,
  onTitleChange,
  onEstimatedMinutesChange,
  onLogoUpload
}: WelcomeSlideEditorProps) {
  const [localDescription, setLocalDescription] = useState(description)
  // Use welcomeTitle if available, otherwise use presentationTitle as default
  const [localTitle, setLocalTitle] = useState(welcomeTitle || presentationTitle)
  // Use estimatedMinutes if provided, otherwise default to slideCount
  const [localMinutes, setLocalMinutes] = useState(estimatedMinutes ?? slideCount)
  
  // Refs for contentEditable elements
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // State for minutes input focus/hover
  const [minutesInputActive, setMinutesInputActive] = useState(false)
  
  // State for drag and drop
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    setLocalDescription(description)
    // Update ref content if it differs
    if (descriptionRef.current && descriptionRef.current.textContent !== description) {
      descriptionRef.current.textContent = description
    }
  }, [description])

  useEffect(() => {
    // Update local title when welcomeTitle or presentationTitle changes
    const newTitle = welcomeTitle || presentationTitle
    setLocalTitle(newTitle)
    // Update ref content if it differs
    if (titleRef.current && titleRef.current.textContent !== newTitle) {
      titleRef.current.textContent = newTitle
    }
  }, [welcomeTitle, presentationTitle])

  useEffect(() => {
    // Update local minutes when estimatedMinutes or slideCount changes
    setLocalMinutes(estimatedMinutes ?? slideCount)
  }, [estimatedMinutes, slideCount])

  const handleDescriptionChange = (value: string) => {
    setLocalDescription(value)
    if (onDescriptionChange) {
      onDescriptionChange(value)
    }
  }

  const handleTitleChange = (value: string) => {
    setLocalTitle(value)
    if (onTitleChange) {
      onTitleChange(value)
    }
  }

  const handleMinutesChange = (value: string) => {
    // Only allow numbers
    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 0) {
      setLocalMinutes(numValue)
      if (onEstimatedMinutesChange) {
        onEstimatedMinutesChange(numValue)
      }
    } else if (value === '') {
      setLocalMinutes(0)
      if (onEstimatedMinutesChange) {
        onEstimatedMinutesChange(0)
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/') && onLogoUpload) {
      onLogoUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/') && onLogoUpload) {
      onLogoUpload(file)
    }
  }

  return (
    <div className="w-full h-full bg-white flex flex-col rounded-[16px] border border-[#e5e5e5]">
      {/* Page Title Badge */}
      <div className="px-[40px] pt-[24px] pb-[12px]">
        <div className="inline-flex items-center px-3 py-1.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-md">
          <p className="font-['Inter',sans-serif] text-[14px] font-medium text-[#666]">
            Welcome Page
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-[40px] pb-[40px]">
        <div className="flex flex-col items-center gap-[24px] max-w-[520px] w-full">
        {/* Logo Upload */}
        <div className="w-full flex justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {logoUrl ? (
            <div className="relative group">
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-[80px] w-auto object-contain rounded-lg"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center"
              >
                <span className="text-white text-sm font-medium">Change Logo</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-[200px] h-[80px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                isDragging 
                  ? 'border-[#66e7f5] bg-[#f9feff]' 
                  : 'border-[#dcdcdc] hover:border-[#66e7f5] hover:bg-[#fafafa]'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 8L12 3L7 8" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3V15" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="text-center">
                <p className="font-['Inter',sans-serif] text-[12px] font-medium text-[#666]">
                  Upload Logo
                </p>
                <p className="font-['Inter',sans-serif] text-[10px] text-[#999]">
                  Recommended: 400x100px
                </p>
              </div>
            </button>
          )}
        </div>

        {/* Title - Editable inline with placeholder */}
        <div className="relative self-stretch" style={{ minHeight: '26px' }}>
          {!localTitle?.trim() && (
            <div 
              className="absolute inset-0 font-['Inter',sans-serif] text-[18px] text-[#999] text-center pointer-events-none"
              style={{
                fontWeight: 590,
                lineHeight: '26px',
                letterSpacing: '-0.45px',
                fontFeatureSettings: "'ss01' on, 'cv01' on"
              }}
            >
              Presentation Title
            </div>
          )}
          <h1 
            ref={titleRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              const text = e.currentTarget.textContent || ''
              setLocalTitle(text)
            }}
            onBlur={(e) => handleTitleChange(e.currentTarget.textContent || '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
            className="font-['Inter',sans-serif] text-[18px] text-[#000] text-center self-stretch outline-none cursor-text hover:text-[#666] transition-colors"
            style={{
              fontWeight: 590,
              lineHeight: '26px',
              letterSpacing: '-0.45px',
              fontFeatureSettings: "'ss01' on, 'cv01' on",
              minHeight: '26px'
            }}
          />
        </div>

        {/* Description - Editable inline with placeholder */}
        <div className="relative self-stretch" style={{ minHeight: '26px' }}>
          {!localDescription?.trim() && (
            <div 
              className="absolute inset-0 font-['Inter',sans-serif] text-[16px] text-[#999] text-center pointer-events-none"
              style={{
                fontWeight: 400,
                lineHeight: '26px',
                letterSpacing: '-0.4px'
              }}
            >
              Description (optional)
            </div>
          )}
          <div 
            ref={descriptionRef}
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => {
              const text = e.currentTarget.textContent || ''
              setLocalDescription(text)
            }}
            onBlur={(e) => handleDescriptionChange(e.currentTarget.textContent || '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
            className="font-['Inter',sans-serif] text-[16px] text-[#000] text-center self-stretch outline-none cursor-text hover:text-[#666] transition-colors"
            style={{
              fontWeight: 400,
              lineHeight: '26px',
              letterSpacing: '-0.4px',
              minHeight: '26px'
            }}
          />
        </div>

        {/* Form Preview */}
        <div className="flex flex-col gap-[12px] w-full">
          {/* Name Input */}
          <input
            type="text"
            placeholder="Your name"
            disabled
            className="flex items-center self-stretch flex-shrink-0 bg-white border border-[#e5e5e5] rounded-[999px] px-[16px] py-[12px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] placeholder:text-[#999] opacity-50"
            style={{
              height: '42px',
              minWidth: '120px'
            }}
          />

          {/* Email Input */}
          <input
            type="email"
            placeholder="Your email"
            disabled
            className="flex items-center self-stretch flex-shrink-0 bg-white border border-[#e5e5e5] rounded-[999px] px-[16px] py-[12px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] placeholder:text-[#999] opacity-50"
            style={{
              height: '42px',
              minWidth: '120px'
            }}
          />

          {/* Add Question Link */}
          <div className="text-center font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] py-[8px] opacity-50 pointer-events-none">
            + Add a new question
          </div>

          {/* Start Call Button */}
          <div
            className="w-full bg-[#0d0d0d] text-white rounded-[999px] px-[20px] py-[14px] font-['Inter',sans-serif] text-[16px] font-medium cursor-not-allowed pointer-events-none text-center"
            style={{
              backgroundColor: '#0d0d0d'
            }}
          >
            Start call
          </div>

          {/* Helper Text */}
          <div className="flex items-center justify-center gap-[8px] text-[#0d0d0d] py-[4px]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 3.5V7L9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <div className="flex items-center gap-[2px]">
              <span className="font-['Inter',sans-serif] text-[12px]">Takes</span>
              <div 
                className="relative inline-flex items-center"
                onMouseEnter={() => setMinutesInputActive(true)}
                onMouseLeave={() => setMinutesInputActive(false)}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={localMinutes}
                  onChange={(e) => handleMinutesChange(e.target.value)}
                  onFocus={() => setMinutesInputActive(true)}
                  onBlur={() => setMinutesInputActive(false)}
                  onKeyDown={(e) => {
                    // Handle arrow up/down
                    if (e.key === 'ArrowUp') {
                      e.preventDefault()
                      handleMinutesChange(String(localMinutes + 1))
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault()
                      if (localMinutes > 0) {
                        handleMinutesChange(String(localMinutes - 1))
                      }
                    }
                    // Only allow numbers, backspace, delete, arrow keys
                    else if (
                      !/[0-9]/.test(e.key) &&
                      e.key !== 'Backspace' &&
                      e.key !== 'Delete' &&
                      e.key !== 'ArrowLeft' &&
                      e.key !== 'ArrowRight' &&
                      e.key !== 'Tab'
                    ) {
                      e.preventDefault()
                    }
                  }}
                  className={`w-[32px] pr-[14px] text-center bg-transparent font-['Inter',sans-serif] text-[12px] text-[#0d0d0d] outline-none transition-colors ${
                    minutesInputActive 
                      ? 'border-b border-dashed border-[#0d0d0d]' 
                      : 'border-b border-transparent'
                  }`}
                />
                {/* Arrow buttons - only show when active */}
                {minutesInputActive && (
                  <div className="absolute right-0 flex flex-col gap-[1px]">
                    <button
                      type="button"
                      onClick={() => handleMinutesChange(String(localMinutes + 1))}
                      className="w-[10px] h-[8px] flex items-center justify-center text-[#0d0d0d] hover:text-[#666] transition-colors"
                    >
                      <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
                        <path d="M3 0L6 4H0L3 0Z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (localMinutes > 0) {
                          handleMinutesChange(String(localMinutes - 1))
                        }
                      }}
                      className="w-[10px] h-[8px] flex items-center justify-center text-[#0d0d0d] hover:text-[#666] transition-colors disabled:opacity-30"
                      disabled={localMinutes === 0}
                    >
                      <svg width="6" height="4" viewBox="0 0 6 4" fill="none">
                        <path d="M3 4L0 0H6L3 4Z" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <span className="font-['Inter',sans-serif] text-[12px]">
                minute{localMinutes !== 1 ? 's' : ''}
              </span>
            </div>
            <span className="font-['Inter',sans-serif] text-[12px] mx-[4px]">•</span>
            <span className="font-['Inter',sans-serif] text-[12px]">
              press Enter ↵ to start
            </span>
          </div>
        </div>
      </div>
      
      {/* Powered by Camaral - Bottom Center */}
      <div className="w-full pb-6 flex items-center justify-center">
        <p className="font-['Inter',sans-serif] text-[12px] text-[#999] flex items-center gap-2">
          Powered by
          <img 
            src="/Camaral Logo.svg" 
            alt="Camaral" 
            className="h-[16px] w-auto opacity-60"
          />
        </p>
      </div>
      </div>
    </div>
  )
}
