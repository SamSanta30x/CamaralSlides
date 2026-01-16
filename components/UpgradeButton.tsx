interface UpgradeButtonProps {
  className?: string
}

export default function UpgradeButton({ className = '' }: UpgradeButtonProps) {
  return (
    <button className={`bg-gradient-to-b from-[#66e7f5] to-white border border-black rounded-[16px] px-[14px] py-2 flex items-center gap-2 hover:from-[#56d7e5] hover:to-[#f5f5f5] transition-all ${className}`}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="#0d0d0d" strokeWidth="1.67" strokeLinecap="round"/>
      </svg>
      <span className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-black">
        Upgrade Now
      </span>
    </button>
  )
}
