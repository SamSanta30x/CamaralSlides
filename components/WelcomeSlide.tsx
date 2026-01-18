'use client'

import { useState } from 'react'
import Image from 'next/image'

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
    <div className="w-full h-full bg-[#f5f5f5] flex items-center justify-center">
      <div className="flex flex-col items-center gap-[40px] max-w-[600px] w-full px-[40px]">
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

        {/* Description */}
        {description && (
          <p className="font-['Inter',sans-serif] text-[16px] text-[#666] text-center tracking-[-0.32px]">
            {description}
          </p>
        )}

        {/* Form */}
        <div className="flex flex-col gap-[16px] w-full">
          {/* Name Input */}
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-white border border-[#e5e5e5] rounded-[12px] px-[20px] py-[14px] font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] placeholder:text-[#999] focus:outline-none focus:border-[#0d0d0d] transition-colors"
          />

          {/* Email Input */}
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full bg-white border border-[#e5e5e5] rounded-[12px] px-[20px] py-[14px] font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] placeholder:text-[#999] focus:outline-none focus:border-[#0d0d0d] transition-colors"
          />

          {/* Add Question Link */}
          <button className="text-center font-['Inter',sans-serif] text-[14px] text-[#666] hover:text-[#0d0d0d] transition-colors">
            + Add a new question
          </button>

          {/* Start Call Button */}
          <button
            onClick={handleStartCall}
            disabled={!name.trim() || !email.trim()}
            className="w-full bg-[#0d0d0d] text-white rounded-[12px] px-[20px] py-[14px] font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#2e2e2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  )
}
