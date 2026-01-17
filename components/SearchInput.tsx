'use client'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  width?: string
  variant?: 'default' | 'compact'
}

export default function SearchInput({ 
  value, 
  onChange, 
  placeholder = 'Search responses...',
  width = 'w-full',
  variant = 'default'
}: SearchInputProps) {
  if (variant === 'compact') {
    // Compact variant for Views page (Figma design)
    // CSS: display: flex; height: 36px; padding: 10.5px; justify-content: space-between;
    // align-items: center; flex-shrink: 0; align-self: stretch; border-radius: 16px; background: #F5F5F5;
    return (
      <div className={`flex h-[36px] p-[10.5px] justify-between items-center flex-shrink-0 self-stretch rounded-[16px] bg-[#F5F5F5] ${width}`}>
        {/* Left side: Icon + Input */}
        <div className="flex items-center gap-[10px] flex-1 min-w-0">
          {/* Search Icon */}
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" className="flex-shrink-0">
            <circle cx="7.5" cy="7.5" r="6" stroke="black" strokeWidth="1.5"/>
            <path d="M12 12L15 15" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>

          {/* Input */}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-w-0 bg-transparent font-['Inter',sans-serif] text-[14px] leading-[20px] text-black outline-none placeholder:text-black"
          />
        </div>

        {/* Keyboard Shortcut */}
        <span className="font-['Inter',sans-serif] text-[12px] text-[#999] flex-shrink-0 ml-[10px]">⌘K</span>
      </div>
    )
  }

  // Default variant for Dashboard
  return (
    <div className={`relative ${width}`}>
      {/* Search Icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="#999" strokeWidth="1.5"/>
          <path d="M11 11L14 14" stroke="#999" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-[#e5e5e5] rounded-[12px] pl-12 pr-16 py-3 font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] placeholder:text-[#999] focus:outline-none focus:border-[#66e7f5] transition-colors"
      />

      {/* Keyboard Shortcut */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#f5f5f5] px-2 py-1 rounded-[6px] pointer-events-none">
        <span className="font-['Inter',sans-serif] text-[12px] text-[#666]">⌘K</span>
      </div>
    </div>
  )
}
