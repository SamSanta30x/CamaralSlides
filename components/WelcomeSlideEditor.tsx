'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface WelcomeSlideEditorProps {
  presentationTitle: string
  description?: string
  onDescriptionChange?: (description: string) => void
}

export default function WelcomeSlideEditor({ 
  presentationTitle, 
  description = '',
  onDescriptionChange
}: WelcomeSlideEditorProps) {
  const [localDescription, setLocalDescription] = useState(description)

  useEffect(() => {
    setLocalDescription(description)
  }, [description])

  const handleDescriptionChange = (value: string) => {
    setLocalDescription(value)
    if (onDescriptionChange) {
      onDescriptionChange(value)
    }
  }

  return (
    <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center rounded-[16px] border border-[#e5e5e5] p-[40px]">
      <div className="flex flex-col items-center gap-[40px] max-w-[600px] w-full">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <Image
            src="/Camaral Logo.svg"
            alt="Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="font-['Inter',sans-serif] text-[32px] font-semibold text-[#0d0d0d] text-center tracking-[-0.64px]">
          {presentationTitle}
        </h1>

        {/* Description - Editable */}
        <div className="w-full">
          <label className="font-['Inter',sans-serif] text-[14px] text-[#666] mb-2 block">
            Description (optional)
          </label>
          <textarea
            value={localDescription}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Enter a description for your presentation..."
            className="w-full bg-white border border-[#e5e5e5] rounded-[12px] px-[20px] py-[14px] font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] placeholder:text-[#999] focus:outline-none focus:border-[#0d0d0d] transition-colors resize-none"
            rows={3}
          />
        </div>

        {/* Form Preview */}
        <div className="flex flex-col gap-[16px] w-full opacity-50 pointer-events-none">
          {/* Name Input */}
          <input
            type="text"
            placeholder="Your name"
            disabled
            className="w-full bg-white border border-[#e5e5e5] rounded-[12px] px-[20px] py-[14px] font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] placeholder:text-[#999]"
          />

          {/* Email Input */}
          <input
            type="email"
            placeholder="Your email"
            disabled
            className="w-full bg-white border border-[#e5e5e5] rounded-[12px] px-[20px] py-[14px] font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] placeholder:text-[#999]"
          />

          {/* Add Question Link */}
          <button disabled className="text-center font-['Inter',sans-serif] text-[14px] text-[#666]">
            + Add a new question
          </button>

          {/* Start Call Button */}
          <button
            disabled
            className="w-full bg-[#0d0d0d] text-white rounded-[12px] px-[20px] py-[14px] font-['Inter',sans-serif] text-[16px] font-medium"
          >
            Start call
          </button>

          {/* Helper Text */}
          <div className="flex items-center justify-center gap-[8px] text-[#999]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 4V8L10.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="font-['Inter',sans-serif] text-[12px]">
              Takes X minutes
            </span>
            <span className="font-['Inter',sans-serif] text-[12px] mx-[8px]">•</span>
            <span className="font-['Inter',sans-serif] text-[12px]">
              press Enter ↵ to start
            </span>
          </div>
        </div>

        {/* Info Note */}
        <div className="text-center">
          <p className="font-['Inter',sans-serif] text-[12px] text-[#999]">
            This is the welcome slide that viewers will see first.
            <br />
            Edit the description above to customize it.
          </p>
        </div>
      </div>
    </div>
  )
}
