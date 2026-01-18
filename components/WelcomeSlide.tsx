'use client'

import { useState } from 'react'

interface WelcomeSlideProps {
  welcomeTitle?: string | null
  presentationTitle: string // Used as fallback if welcomeTitle is empty
  description?: string
  slideCount?: number // Number of slides in the presentation
  estimatedMinutes?: number // Estimated duration in minutes (display only)
  showAddQuestion?: boolean // Show "Add a new question" button (only in editor)
  onStartCall: (name: string, email: string) => void
}

export default function WelcomeSlide({ 
  welcomeTitle,
  presentationTitle, 
  description,
  slideCount = 0,
  estimatedMinutes,
  showAddQuestion = false,
  onStartCall 
}: WelcomeSlideProps) {
  // Use welcomeTitle if available, otherwise use presentationTitle
  const displayTitle = welcomeTitle || presentationTitle
  // Use estimatedMinutes if provided, otherwise default to slideCount
  const displayMinutes = estimatedMinutes ?? slideCount
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [nameError, setNameError] = useState(false)
  const [emailError, setEmailError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Email validation regex
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleStartCall = () => {
    // Reset errors
    setNameError(false)
    setEmailError(false)
    setErrorMessage('')

    // Validate name
    if (!name.trim()) {
      setNameError(true)
      setErrorMessage('Please enter your name')
      return
    }

    // Validate email
    if (!email.trim()) {
      setEmailError(true)
      setErrorMessage('Please enter your email')
      return
    }

    if (!isValidEmail(email)) {
      setEmailError(true)
      setErrorMessage('Please enter a valid email address')
      return
    }

    // All valid, start call
    onStartCall(name, email)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStartCall()
    }
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (nameError && value.trim()) {
      setNameError(false)
      setErrorMessage('')
    }
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (emailError && value.trim() && isValidEmail(value)) {
      setEmailError(false)
      setErrorMessage('')
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
            {displayTitle}
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
            onChange={(e) => handleNameChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`flex items-center self-stretch flex-shrink-0 bg-white rounded-[999px] px-[16px] py-[12px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] placeholder:text-[#999] focus:outline-none transition-colors ${
              nameError 
                ? 'border-2 border-[#ef4444] focus:border-[#ef4444]' 
                : 'border border-[#e5e5e5] focus:border-[#0d0d0d]'
            }`}
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
            onChange={(e) => handleEmailChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className={`flex items-center self-stretch flex-shrink-0 bg-white rounded-[999px] px-[16px] py-[12px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] placeholder:text-[#999] focus:outline-none transition-colors ${
              emailError 
                ? 'border-2 border-[#ef4444] focus:border-[#ef4444]' 
                : 'border border-[#e5e5e5] focus:border-[#0d0d0d]'
            }`}
            style={{
              height: '42px',
              minWidth: '120px'
            }}
          />

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#fef2f2] border border-[#ef4444] rounded-[8px]">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5"/>
                <path d="M8 4V8M8 11V11.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="font-['Inter',sans-serif] text-[12px] text-[#ef4444]">
                {errorMessage}
              </span>
            </div>
          )}

          {/* Add Question Link - Only show in editor */}
          {showAddQuestion && (
            <button className="text-center font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] hover:text-[#666] transition-colors py-[8px]">
              + Add a new question
            </button>
          )}

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
            <div className="flex items-center gap-[2px]">
              <span className="font-['Inter',sans-serif] text-[12px]">Takes</span>
              <span className="font-['Inter',sans-serif] text-[12px]">{displayMinutes}</span>
              <span className="font-['Inter',sans-serif] text-[12px]">minute{displayMinutes !== 1 ? 's' : ''}</span>
            </div>
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
