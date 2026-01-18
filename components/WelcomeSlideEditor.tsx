'use client'

import { useState, useEffect } from 'react'

interface WelcomeSlideEditorProps {
  welcomeTitle?: string | null
  presentationTitle: string // Used as fallback if welcomeTitle is empty
  description?: string
  slideCount?: number // Number of slides in the presentation
  onDescriptionChange?: (description: string) => void
  onTitleChange?: (title: string) => void
}

export default function WelcomeSlideEditor({ 
  welcomeTitle,
  presentationTitle, 
  description = '',
  slideCount = 0,
  onDescriptionChange,
  onTitleChange
}: WelcomeSlideEditorProps) {
  const [localDescription, setLocalDescription] = useState(description)
  // Use welcomeTitle if available, otherwise use presentationTitle as default
  const [localTitle, setLocalTitle] = useState(welcomeTitle || presentationTitle)

  useEffect(() => {
    setLocalDescription(description)
  }, [description])

  useEffect(() => {
    // Update local title when welcomeTitle or presentationTitle changes
    setLocalTitle(welcomeTitle || presentationTitle)
  }, [welcomeTitle, presentationTitle])

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

  return (
    <div className="w-full h-full bg-white flex items-center justify-center rounded-[16px] border border-[#e5e5e5] p-[40px]">
      <div className="flex flex-col items-center gap-[24px] max-w-[520px] w-full">
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
          >
            {localTitle}
          </h1>
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
          >
            {localDescription}
          </div>
        </div>

        {/* Form Preview */}
        <div className="flex flex-col gap-[12px] w-full opacity-50 pointer-events-none">
          {/* Name Input */}
          <input
            type="text"
            placeholder="Your name"
            disabled
            className="flex items-center self-stretch flex-shrink-0 bg-white border border-[#e5e5e5] rounded-[999px] px-[16px] py-[12px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] placeholder:text-[#999]"
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
            className="flex items-center self-stretch flex-shrink-0 bg-white border border-[#e5e5e5] rounded-[999px] px-[16px] py-[12px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] placeholder:text-[#999]"
            style={{
              height: '42px',
              minWidth: '120px'
            }}
          />

          {/* Add Question Link */}
          <button disabled className="text-center font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] py-[8px]">
            + Add a new question
          </button>

          {/* Start Call Button */}
          <button
            disabled
            className="w-full bg-[#0d0d0d] text-white rounded-[999px] px-[20px] py-[14px] font-['Inter',sans-serif] text-[16px] font-medium"
          >
            Start call
          </button>

          {/* Helper Text */}
          <div className="flex items-center justify-center gap-[8px] text-[#999] py-[4px]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 3.5V7L9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className="font-['Inter',sans-serif] text-[12px]">
              Takes {slideCount} minute{slideCount !== 1 ? 's' : ''}
            </span>
            <span className="font-['Inter',sans-serif] text-[12px] mx-[4px]">•</span>
            <span className="font-['Inter',sans-serif] text-[12px]">
              press Enter ↵ to start
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
