'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginModal from './LoginModal'
import FileUploadCard from './FileUploadCard'

export default function Hero() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleFileUpload = (file: File) => {
    // Redirect to login on mobile, open modal on desktop
    if (isMobile) {
      router.push('/login')
    } else {
      setIsLoginModalOpen(true)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-[10px] items-center justify-center px-4 sm:px-6 md:px-8 py-[40px] w-full max-w-[1440px] mx-auto">
        {/* Main content */}
        <div className="flex flex-col gap-[20px] sm:gap-[30px] items-center shrink-0 w-full">
          {/* Heading and description */}
          <div className="flex flex-col font-['Inter',sans-serif] font-normal gap-[15px] sm:gap-[20px] items-center leading-[0] not-italic shrink-0 text-[#1c1c1c] text-center px-4">
            <div className="flex flex-col justify-center shrink-0 text-[36px] sm:text-[56px] md:text-[76px] lg:text-[96px] tracking-[-1.8px] sm:tracking-[-2.8px] md:tracking-[-3.8px] lg:tracking-[-4.8px]">
              <p className="leading-[1.1] whitespace-pre-wrap">
                <span>
                  Your slides
                  <br aria-hidden="true" />
                </span>
                <span className="font-['Inter',sans-serif] font-medium not-italic">always</span>
                <span>{` on`}</span>
              </p>
            </div>
            <div className="flex flex-col justify-center shrink-0 text-[14px] sm:text-[16px] md:text-[17px] lg:text-[18.9px] tracking-[-0.3px] sm:tracking-[-0.4px] lg:tracking-[-0.5px] max-w-[90%] sm:max-w-[548px]">
              <p className="leading-[1.4] whitespace-pre-wrap">
                Turn your presentations 24/7 into an AI agent that explains, pitch and answer questions automatically to anyone, anytime.
              </p>
            </div>
          </div>

          {/* Main slide card - with drag and drop */}
          <FileUploadCard 
            onFileUpload={handleFileUpload}
            buttonText="See an example"
            buttonHref="/example"
            descriptionText="Upload a PDF or PowerPoint and start now."
            className="w-full max-w-[840px] py-[20px] sm:py-[30px] px-4 sm:px-0"
          />
        </div>
      </div>

      {/* Login Modal - Desktop only */}
      {!isMobile && (
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      )}
    </>
  )
}
