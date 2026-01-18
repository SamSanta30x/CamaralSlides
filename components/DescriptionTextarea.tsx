'use client'

import { useState } from 'react'
import Image from 'next/image'

interface DescriptionTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
  onGenerateAI?: () => Promise<void>
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
  return (
    <div className="bg-white rounded-[12px] border border-[#e5e5e5] flex flex-col relative" style={{ height }}>
      {/* Custom Placeholder with Button */}
      {!value && (
        <div className="absolute top-4 left-4 pointer-events-none flex flex-wrap items-center gap-[5px] z-20">
          <span className="font-['Inter',sans-serif] text-[15px] text-[#999]">
            {placeholder}
          </span>
          <button
            onClick={onGenerateAI}
            disabled={isGenerating || !onGenerateAI}
            className="px-3 py-1.5 bg-transparent border border-[#e5e5e5] rounded-[16px] font-['Inter',sans-serif] text-[13px] text-[#0d0d0d] flex items-center gap-1.5 pointer-events-auto cursor-pointer hover:bg-[#fafafa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                Generate it with AI
              </>
            )}
          </button>
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
              Improve it with AI
            </>
          )}
        </button>
      </div>
    </div>
  )
}
