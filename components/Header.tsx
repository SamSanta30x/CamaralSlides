'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoginModal from './LoginModal'

export default function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  const handleLoginClick = () => {
    if (isMobile) {
      router.push('/login')
    } else {
      setIsLoginModalOpen(true)
    }
  }

  return (
    <>
    <header className="flex items-center justify-between p-4 w-full max-w-[1440px] mx-auto">
      {/* Logo Section */}
      <div className="flex items-center shrink-0">
        <Link href="/" className="flex items-center">
          <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
            <Image 
              src="/Camaral Logo.svg" 
              alt="Camaral" 
              width={90}
              height={20}
              priority
              className="h-[20px] sm:h-[24px] w-auto"
            />
          </div>
        </Link>
      </div>

      {/* Navigation Links - Hidden on mobile */}
      <nav className="hidden lg:flex gap-[10px] items-center shrink-0">
        <Link href="/solutions" className="flex items-start rounded-[16px] shrink-0">
          <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
            <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">
              <p className="leading-[20px] whitespace-pre">Solutions</p>
            </div>
          </div>
        </Link>
        <Link href="/enterprises" className="flex items-start rounded-[16px] shrink-0">
          <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
            <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">
              <p className="leading-[20px] whitespace-pre">Enterprises</p>
            </div>
          </div>
        </Link>
        <Link href="/pricing" className="flex items-start rounded-[16px] shrink-0">
          <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
            <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">
              <p className="leading-[20px] whitespace-pre">Pricing</p>
            </div>
          </div>
        </Link>
        <Link href="/explore" className="flex items-start rounded-[16px] shrink-0">
          <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
            <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">
              <p className="leading-[20px] whitespace-pre">Explore</p>
            </div>
          </div>
        </Link>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden flex flex-col gap-[5px] p-2 z-50"
        aria-label="Toggle menu"
      >
        <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
        <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
        <span className={`w-6 h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
      </button>

      {/* Action Buttons */}
      <div className="flex items-center shrink-0">
        <div className="flex gap-[6px] items-center shrink-0">
          {/* Login button - Desktop only */}
          <button 
            onClick={handleLoginClick}
            className="hidden lg:flex bg-gradient-to-b from-white to-[#f7f4ed] border border-[#dcdcdc] border-solid items-start rounded-[16px] shrink-0"
          >
            <div className="flex items-center justify-center px-[14px] py-2 rounded-[999px]">
              <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black whitespace-nowrap">
                <p className="leading-[20px] whitespace-pre">Login</p>
              </div>
            </div>
          </button>
          
          {/* Get started button - All devices */}
          <Link 
            href="/signup" 
            className="bg-[#222] border border-[#dcdcdc] border-solid flex items-start rounded-[16px] shrink-0"
          >
            <div className="flex items-center justify-center px-[10px] sm:px-[14px] py-2 rounded-[999px]">
              <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[13px] sm:text-[14px] text-white whitespace-nowrap">
                <p className="leading-[20px] whitespace-pre">Get started</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    <div 
      className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
        isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setIsMobileMenuOpen(false)}
    />

    {/* Mobile Menu */}
    <div 
      className={`fixed top-0 right-0 h-full w-[280px] bg-white z-40 lg:hidden transform transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col p-6 pt-20 gap-4">
        {/* Navigation Links */}
        <Link 
          href="/solutions" 
          className="font-['Inter',sans-serif] text-[16px] leading-[24px] text-black py-3 border-b border-[#eceae4]"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Solutions
        </Link>
        <Link 
          href="/enterprises" 
          className="font-['Inter',sans-serif] text-[16px] leading-[24px] text-black py-3 border-b border-[#eceae4]"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Enterprises
        </Link>
        <Link 
          href="/pricing" 
          className="font-['Inter',sans-serif] text-[16px] leading-[24px] text-black py-3 border-b border-[#eceae4]"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Pricing
        </Link>
        <Link 
          href="/explore" 
          className="font-['Inter',sans-serif] text-[16px] leading-[24px] text-black py-3 border-b border-[#eceae4]"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Explore
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mt-6">
          <Link
            href="/login"
            className="bg-gradient-to-b from-white to-[#f7f4ed] border border-[#dcdcdc] rounded-[16px] py-3 text-center font-['Inter',sans-serif] text-[14px] text-black"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-[#222] border border-[#dcdcdc] rounded-[16px] py-3 text-center font-['Inter',sans-serif] text-[14px] text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Get started
          </Link>
        </div>
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
