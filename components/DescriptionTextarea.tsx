'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface DescriptionTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
  onGenerateAI?: (mode: 'single' | 'all') => Promise<void>
  onImproveAI?: () => Promise<void>
  isGenerating?: boolean
}

export default function DescriptionTextarea({ 
  value, 
  onChange,
  placeholder = "Describe what your agent should say here or",
  height = "160px",
  onGenerateAI,
  onImproveAI,
  isGenerating = false
}: DescriptionTextareaProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleGenerateClick = async (mode: 'single' | 'all') => {
    setShowDropdown(false)
    if (onGenerateAI) {
      await onGenerateAI(mode)
    }
  }
  return (
    <div className="bg-white rounded-[12px] border border-[#e5e5e5] flex flex-col relative" style={{ height }}>
      {/* Custom Placeholder with Button */}
      {!value && (
        <div className="absolute top-4 left-4 pointer-events-none flex flex-wrap items-center gap-[5px] z-20">
          <span className="font-['Inter',sans-serif] text-[15px] text-[#999]">
            {placeholder}
          </span>
          <div className="relative pointer-events-auto" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              disabled={isGenerating || !onGenerateAI}
              className="px-3 py-1.5 bg-transparent border border-[#e5e5e5] rounded-[16px] font-['Inter',sans-serif] text-[13px] text-[#0d0d0d] flex items-center gap-1.5 cursor-pointer hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-[#0d0d0d] border-t-transparent"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Image 
                    src="/assets/sparkles-icon.svg" 
                    alt="" 
                    width={12} 
                    height={12}
                    className="flex-shrink-0"
                  />
                  <span>Generate with AI</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-1">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>

            {/* Dropdown Menu */}
            {showDropdown && !isGenerating && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#e5e5e5] rounded-[12px] shadow-lg py-1 min-w-[140px] z-50">
                <button
                  onClick={() => handleGenerateClick('single')}
                  className="w-full px-4 py-2 text-left font-['Inter',sans-serif] text-[13px] text-[#0d0d0d] hover:bg-[#fafafa] transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="2" y="2" width="10" height="10" rx="1" stroke="#0d0d0d" strokeWidth="1.5"/>
                  </svg>
                  This slide
                </button>
                <button
                  onClick={() => handleGenerateClick('all')}
                  className="w-full px-4 py-2 text-left font-['Inter',sans-serif] text-[13px] text-[#0d0d0d] hover:bg-[#fafafa] transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="5" height="5" rx="0.5" stroke="#0d0d0d" strokeWidth="1"/>
                    <rect x="8" y="1" width="5" height="5" rx="0.5" stroke="#0d0d0d" strokeWidth="1"/>
                    <rect x="1" y="8" width="5" height="5" rx="0.5" stroke="#0d0d0d" strokeWidth="1"/>
                    <rect x="8" y="8" width="5" height="5" rx="0.5" stroke="#0d0d0d" strokeWidth="1"/>
                  </svg>
                  All slides
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=""
        className="flex-1 w-full bg-transparent font-['Inter',sans-serif] text-[15px] text-[#0d0d0d] outline-none resize-none relative px-4 pt-4 pb-2"
      />
      <div className="flex items-center justify-end px-4 pb-3">
        <button
          onClick={onImproveAI}
          disabled={isGenerating || !onImproveAI || !value}
          className="px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-[16px] font-['Inter',sans-serif] text-[13px] text-[#0d0d0d] hover:bg-[#fafafa] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-[#0d0d0d] border-t-transparent"></div>
              Improving...
            </>
          ) : (
            <>
              <Image 
                src="/assets/sparkles-icon.svg" 
                alt="" 
                width={14} 
                height={14}
                className="flex-shrink-0"
              />
              Improve with AI
            </>
          )}
        </button>
      </div>
    </div>
  )
}
