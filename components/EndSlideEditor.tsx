'use client'

import { useRef, useEffect, useState } from 'react'

interface EndSlideEditorProps {
  endTitle?: string
  presentationTitle: string
  description?: string
  ctaText?: string
  ctaUrl?: string
  logoUrl?: string | null
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onCtaTextChange?: (text: string) => void
  onCtaUrlChange?: (url: string) => void
  onLogoUpload?: (file: File) => void
}

export default function EndSlideEditor({
  endTitle,
  presentationTitle,
  description,
  ctaText = 'Start for free',
  ctaUrl = 'https://camaral.ai',
  logoUrl,
  onTitleChange,
  onDescriptionChange,
  onCtaTextChange,
  onCtaUrlChange,
  onLogoUpload
}: EndSlideEditorProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ctaTextRef = useRef<HTMLSpanElement>(null)
  const ctaButtonRef = useRef<HTMLDivElement>(null)
  const [localTitle, setLocalTitle] = useState(endTitle || '')
  const [localDescription, setLocalDescription] = useState(description || '')
  const [isTitleFocused, setIsTitleFocused] = useState(false)
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isEditingCta, setIsEditingCta] = useState(false)
  const [localCtaText, setLocalCtaText] = useState(ctaText)
  const [showUrlPopup, setShowUrlPopup] = useState(false)
  const [localCtaUrl, setLocalCtaUrl] = useState(ctaUrl)

  const displayTitle = endTitle || `Say bye! Recall information with @${presentationTitle}`

  // Sync title with ref
  useEffect(() => {
    if (titleRef.current && !isTitleFocused) {
      titleRef.current.textContent = localTitle
    }
  }, [localTitle, isTitleFocused])

  // Sync description with ref
  useEffect(() => {
    if (descriptionRef.current && !isDescriptionFocused) {
      descriptionRef.current.textContent = localDescription
    }
  }, [localDescription, isDescriptionFocused])

  const handleTitleInput = () => {
    if (titleRef.current) {
      const newTitle = titleRef.current.textContent || ''
      setLocalTitle(newTitle)
      onTitleChange(newTitle)
    }
  }

  const handleDescriptionInput = () => {
    if (descriptionRef.current) {
      const newDescription = descriptionRef.current.textContent || ''
      setLocalDescription(newDescription)
      onDescriptionChange(newDescription)
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

  const handleCtaClick = () => {
    setIsEditingCta(true)
    setShowUrlPopup(true)
  }

  const handleCtaTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    setLocalCtaText(newText)
    if (onCtaTextChange) {
      onCtaTextChange(newText)
    }
  }

  const handleCtaUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value
    setLocalCtaUrl(newUrl)
    if (onCtaUrlChange) {
      onCtaUrlChange(newUrl)
    }
  }

  const handleCtaTextBlur = () => {
    // Only close editing if URL popup is not shown
    // The URL input will handle its own blur
    if (!showUrlPopup) {
      setIsEditingCta(false)
    }
  }

  const handleUrlBlur = () => {
    // Close both editing and popup when URL loses focus
    setIsEditingCta(false)
    setShowUrlPopup(false)
  }

  const handleCloseEditing = () => {
    setIsEditingCta(false)
    setShowUrlPopup(false)
  }

  // Measure CTA button width for URL popup
  const [ctaButtonWidth, setCtaButtonWidth] = useState(0)
  useEffect(() => {
    if (ctaButtonRef.current) {
      setCtaButtonWidth(ctaButtonRef.current.offsetWidth)
    }
  }, [localCtaText])

  return (
    <div className="w-full h-full bg-white flex flex-col rounded-[16px]">
      {/* Page Title Badge */}
      <div className="px-8 pt-[24px] pb-[12px]">
        <div className="inline-flex items-center px-3 py-1.5 bg-[#f5f5f5] border border-[#e5e5e5] rounded-md">
          <p className="font-['Inter',sans-serif] text-[14px] font-medium text-[#666]">
            End Page
          </p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Logo Upload */}
        <div className="w-full max-w-[600px] flex justify-center mb-6">
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
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-[200px] h-[80px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
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
          </div>
        )}
      </div>
      {/* Title - Editable */}
      <div className="relative w-full max-w-[600px] mb-4" style={{ minHeight: '26px' }}>
        {!localTitle && !isTitleFocused && (
          <div 
            className="absolute inset-0 font-['Inter',sans-serif] text-[18px] text-[#999] text-center pointer-events-none"
            style={{
              fontWeight: 590,
              lineHeight: '26px',
              letterSpacing: '-0.45px',
              fontFeatureSettings: "'ss01' on, 'cv01' on"
            }}
          >
            {displayTitle}
          </div>
        )}
        <div
          ref={titleRef}
          contentEditable
          onInput={handleTitleInput}
          onFocus={() => setIsTitleFocused(true)}
          onBlur={() => setIsTitleFocused(false)}
          suppressContentEditableWarning
          className="font-['Inter',sans-serif] text-[18px] text-[#000] text-center outline-none cursor-text hover:text-[#666] transition-colors"
          style={{
            fontWeight: 590,
            lineHeight: '26px',
            letterSpacing: '-0.45px',
            fontFeatureSettings: "'ss01' on, 'cv01' on",
            minHeight: '26px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        />
      </div>

      {/* Description - Editable */}
      <div className="relative w-full max-w-[500px] mb-8" style={{ minHeight: '26px' }}>
        {!localDescription && !isDescriptionFocused && (
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
          onInput={handleDescriptionInput}
          onFocus={() => setIsDescriptionFocused(true)}
          onBlur={() => setIsDescriptionFocused(false)}
          suppressContentEditableWarning
          className="font-['Inter',sans-serif] text-[16px] text-[#000] text-center outline-none cursor-text hover:text-[#666] transition-colors"
          style={{
            fontWeight: 400,
            lineHeight: '26px',
            letterSpacing: '-0.4px',
            minHeight: '26px',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
        />
      </div>

      {/* CTA Button - Editable */}
      <div className="relative">
        <div
          ref={ctaButtonRef}
          onClick={handleCtaClick}
          className="bg-[#0d0d0d] text-white font-['Inter',sans-serif] text-[16px] font-medium px-8 py-4 rounded-full cursor-pointer hover:bg-[#2d2d2d] transition-colors"
        >
          {isEditingCta ? (
            <input
              type="text"
              value={localCtaText}
              onChange={handleCtaTextChange}
              onBlur={handleCtaTextBlur}
              autoFocus
              className="bg-transparent outline-none text-center w-full"
              style={{ width: ctaTextRef.current?.offsetWidth || 'auto' }}
            />
          ) : (
            <span ref={ctaTextRef}>{localCtaText}</span>
          )}
        </div>

        {/* URL Popup */}
        {showUrlPopup && (
          <div
            className="absolute left-1/2 transform -translate-x-1/2 bg-white border border-[#e5e5e5] rounded-lg shadow-lg p-2 z-50"
            style={{
              top: '-40px',
              minWidth: `${Math.max(ctaButtonWidth, 200)}px`,
              maxWidth: '400px'
            }}
            onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking inside popup
          >
            <input
              type="url"
              value={localCtaUrl}
              onChange={handleCtaUrlChange}
              onBlur={handleUrlBlur}
              autoFocus
              placeholder="https://example.com"
              className="w-full px-3 py-1.5 text-[14px] font-['Inter',sans-serif] text-[#0d0d0d] border border-[#e5e5e5] rounded focus:outline-none focus:border-[#0d0d0d]"
            />
          </div>
        )}
      </div>

      {/* Helper Text */}
      <p className="font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] mt-3">
        press Enter ↵
      </p>

      {/* Social Share Section - Preview only */}
      <div className="mt-12 opacity-50 pointer-events-none">
        <p className="font-['Inter',sans-serif] text-[14px] text-[#999] text-center mb-4">
          Or share this presentation in
        </p>
        <div className="flex items-center gap-4">
          {/* Facebook */}
          <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* LinkedIn */}
          <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="4" cy="4" r="2" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* X (Twitter) */}
          <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Stack */}
          <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="4" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="10" width="18" height="4" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="17" width="18" height="4" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* More */}
          <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5" r="1" fill="#0d0d0d"/>
              <circle cx="12" cy="12" r="1" fill="#0d0d0d"/>
              <circle cx="12" cy="19" r="1" fill="#0d0d0d"/>
            </svg>
          </div>
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
  )
}
