'use client'

import { useRef, useEffect, useState } from 'react'

interface EndSlideEditorProps {
  endTitle?: string
  presentationTitle: string
  description?: string
  ctaText?: string
  ctaUrl?: string
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
}

export default function EndSlideEditor({
  endTitle,
  presentationTitle,
  description,
  ctaText = 'Start for free',
  ctaUrl = 'https://camaral.ai',
  onTitleChange,
  onDescriptionChange
}: EndSlideEditorProps) {
  const titleRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)
  const [localTitle, setLocalTitle] = useState(endTitle || '')
  const [localDescription, setLocalDescription] = useState(description || '')
  const [isTitleFocused, setIsTitleFocused] = useState(false)
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false)

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

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center px-8">
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

      {/* CTA Button - Preview only */}
      <div className="bg-[#0d0d0d] text-white font-['Inter',sans-serif] text-[16px] font-medium px-8 py-4 rounded-full pointer-events-none cursor-not-allowed">
        {ctaText}
      </div>

      {/* Helper Text */}
      <p className="font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] mt-3">
        press Enter ↵
      </p>

      {/* Social Share Section - Preview only */}
      <div className="mt-12 opacity-50 pointer-events-none">
        <p className="font-['Inter',sans-serif] text-[14px] text-[#999] text-center mb-4">
          Or share this form in
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
  )
}
