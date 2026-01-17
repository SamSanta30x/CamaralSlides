'use client'

interface ActionButtonProps {
  children: React.ReactNode
  onClick?: () => void
  icon?: 'filter' | 'download' | React.ReactNode
  variant?: 'default' | 'primary'
}

export default function ActionButton({ 
  children, 
  onClick, 
  icon,
  variant = 'default'
}: ActionButtonProps) {
  const renderIcon = () => {
    if (!icon) return null
    
    if (icon === 'filter') {
      return (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 2.5H9M2 5H8M3.5 7.5H6.5" stroke="black" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      )
    }
    
    if (icon === 'download') {
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V12" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    }
    
    return icon
  }

  return (
    <button 
      onClick={onClick}
      className="flex justify-center items-center gap-[6px] px-[14px] py-[8px] rounded-[999px] border border-[#E1E1E1] bg-white font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] hover:bg-[#f5f5f5] transition-colors"
    >
      {children}
      {renderIcon()}
    </button>
  )
}
