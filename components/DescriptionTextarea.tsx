'use client'

import { useState } from 'react'
import Image from 'next/image'

interface DescriptionTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: string
}

export default function DescriptionTextarea({ 
  value, 
  onChange,
  placeholder = "Describe what your agent should say here or",
  height = "160px"
}: DescriptionTextareaProps) {
  return (
    <div className="bg-white rounded-[12px] border border-[#e5e5e5] flex flex-col relative" style={{ height }}>
      {/* Custom Placeholder with Button */}
      {!value && (
        <div className="absolute top-4 left-4 pointer-events-none flex flex-wrap items-center gap-[5px]">
          <span className="font-['Inter',sans-serif] text-[15px] text-[#999]">
            {placeholder}
          </span>
          <div className="px-3 py-1.5 bg-transparent border border-[#e5e5e5] rounded-[16px] font-['Inter',sans-serif] text-[13px] text-[#0d0d0d] flex items-center gap-1.5 pointer-events-auto cursor-pointer hover:bg-[#fafafa] transition-colors">
            <Image 
              src="/assets/sparkles-icon.svg" 
              alt="" 
              width={12} 
              height={12}
              className="flex-shrink-0"
            />
            Generate it with AI
          </div>
        </div>
      )}
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder=""
        className="flex-1 w-full bg-transparent font-['Inter',sans-serif] text-[15px] text-[#0d0d0d] outline-none resize-none relative z-10 px-4 pt-4 pb-2"
      />
      <div className="flex items-center justify-end px-4 pb-3">
        <button className="px-3 py-1.5 bg-white border border-[#e5e5e5] rounded-[16px] font-['Inter',sans-serif] text-[13px] text-[#0d0d0d] hover:bg-[#fafafa] transition-colors flex items-center gap-2">
          <Image 
            src="/assets/sparkles-icon.svg" 
            alt="" 
            width={14} 
            height={14}
            className="flex-shrink-0"
          />
          Improve it with AI
        </button>
      </div>
    </div>
  )
}
