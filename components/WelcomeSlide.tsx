'use client'

import { useState } from 'react'

interface WelcomeSlideProps {
  presentationTitle: string
  description?: string
  onStartCall: (name: string, email: string) => void
}

export default function WelcomeSlide({ 
  presentationTitle, 
  description,
  onStartCall 
}: WelcomeSlideProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleStartCall = () => {
    if (name.trim() && email.trim()) {
      onStartCall(name, email)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartCall()
    }
  }

  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-[24px] max-w-[520px] w-full px-[40px]">
        {/* Title */}
        <h1 
          className="font-['Inter',sans-serif] text-[18px] text-[#000] text-center self-stretch"
          style={{
            fontWeight: 590,
            lineHeight: '26px',
            letterSpacing: '-0.45px',
            fontFeatureSettings: "'ss01' on, 'cv01' on"
          }}
        >
          {presentationTitle}
        </h1>

        {/* Description - Only show if exists */}
        {description && (
          <p 
            className="font-['Inter',sans-serif] text-[16px] text-[#000] text-center self-stretch"
            style={{
              fontWeight: 400,
              lineHeight: '26px',
              letterSpacing: '-0.4px'
            }}
          >
            {description}
          </p>
        )}

        {/* Form */}
        <div className="flex flex-col gap-[12px] w-full">
          {/* Name Input */}
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex items-center self-stretch flex-shrink-0 bg-white border border-[#e5e5e5] rounded-[999px] px-[16px] py-[12px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] placeholder:text-[#999] focus:outline-none focus:border-[#0d0d0d] transition-colors"
            style={{
              height: '42px',
              minWidth: '120px'
            }}
          />

          {/* Email Input */}
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex items-center self-stretch flex-shrink-0 bg-white border border-[#e5e5e5] rounded-[999px] px-[16px] py-[12px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] placeholder:text-[#999] focus:outline-none focus:border-[#0d0d0d] transition-colors"
            style={{
              height: '42px',
              minWidth: '120px'
            }}
          />

          {/* Add Question Link */}
          <button className="text-center font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] hover:text-[#666] transition-colors py-[8px]">
            + Add a new question
          </button>

          {/* Start Call Button */}
          <button
            onClick={handleStartCall}
            disabled={!name.trim() || !email.trim()}
            className="w-full bg-[#0d0d0d] text-white rounded-[999px] px-[20px] py-[14px] font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#2e2e2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              Takes X minutes
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
