'use client'

interface EndSlideProps {
  endTitle?: string
  presentationTitle: string
  description?: string
  ctaText?: string
  ctaUrl?: string
}

export default function EndSlide({
  endTitle,
  presentationTitle,
  description,
  ctaText = 'Start for free',
  ctaUrl = 'https://camaral.ai'
}: EndSlideProps) {
  const displayTitle = endTitle || `Say bye! Recall information with @${presentationTitle}`

  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center px-8">
      {/* Title */}
      <h1 
        className="font-['Inter',sans-serif] text-[18px] text-[#000] text-center mb-4 max-w-[600px]"
        style={{
          fontWeight: 590,
          lineHeight: '26px',
          letterSpacing: '-0.45px',
          fontFeatureSettings: "'ss01' on, 'cv01' on"
        }}
      >
        {displayTitle}
      </h1>

      {/* Description */}
      {description && (
        <p 
          className="font-['Inter',sans-serif] text-[16px] text-[#000] text-center mb-8 max-w-[500px]"
          style={{
            fontWeight: 400,
            lineHeight: '26px',
            letterSpacing: '-0.4px'
          }}
        >
          {description}
        </p>
      )}

      {/* CTA Button */}
      <a
        href={ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#0d0d0d] text-white font-['Inter',sans-serif] text-[16px] font-medium px-8 py-4 rounded-full hover:bg-[#2d2d2d] transition-colors cursor-pointer"
      >
        {ctaText}
      </a>

      {/* Helper Text */}
      <p className="font-['Inter',sans-serif] text-[14px] text-[#999] mt-3">
        press Enter ↵
      </p>

      {/* Social Share Section */}
      <div className="mt-12">
        <p className="font-['Inter',sans-serif] text-[14px] text-[#999] text-center mb-4">
          Or share this form in
        </p>
        <div className="flex items-center gap-4">
          {/* Facebook */}
          <button className="w-10 h-10 rounded-full bg-[#f5f5f5] hover:bg-[#e5e5e5] flex items-center justify-center transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* LinkedIn */}
          <button className="w-10 h-10 rounded-full bg-[#f5f5f5] hover:bg-[#e5e5e5] flex items-center justify-center transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="4" cy="4" r="2" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* X (Twitter) */}
          <button className="w-10 h-10 rounded-full bg-[#f5f5f5] hover:bg-[#e5e5e5] flex items-center justify-center transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Stack */}
          <button className="w-10 h-10 rounded-full bg-[#f5f5f5] hover:bg-[#e5e5e5] flex items-center justify-center transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="4" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="10" width="18" height="4" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="17" width="18" height="4" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* More */}
          <button className="w-10 h-10 rounded-full bg-[#f5f5f5] hover:bg-[#e5e5e5] flex items-center justify-center transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="5" r="1" fill="#0d0d0d"/>
              <circle cx="12" cy="12" r="1" fill="#0d0d0d"/>
              <circle cx="12" cy="19" r="1" fill="#0d0d0d"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
