'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import FileUploadCard from '@/components/FileUploadCard'
import { useAuth } from '@/lib/auth/AuthContext'

export default function DashboardContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name)
    // TODO: Handle file upload logic
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Dummy presentation data
  const presentations = Array(8).fill({
    title: 'Sales Pitch Presentation',
    thumbnail: '/assets/slide-demo.png'
  })

  // Get user name from email
  const userName = user?.email?.split('@')[0] || 'User'
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1)

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <header className="w-full flex items-center justify-between p-4 max-w-[1440px]">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="flex items-center px-[14px] py-2">
            <Image 
              src="/Camaral Logo.svg" 
              alt="Camaral" 
              width={90}
              height={20}
              priority
              className="h-[20px] w-auto"
            />
          </div>
        </Link>

        {/* Right side - Upgrade button and Avatar */}
        <div className="flex items-center gap-[10px]">
          {/* Upgrade Now button */}
          <button className="bg-gradient-to-b from-[#66e7f5] to-white border border-black rounded-[16px] px-[14px] py-2 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="#0d0d0d" strokeWidth="1.67" strokeLinecap="round"/>
            </svg>
            <span className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-black">
              Upgrade Now
            </span>
          </button>

          {/* Avatar with dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-[36px] h-[36px] rounded-full border-[1.125px] border-[#fbff00] overflow-hidden"
            >
              <img 
                src="/assets/avatar-demo.png" 
                alt="User avatar" 
                className="w-full h-full object-cover"
              />
            </button>
            
            {/* Dropdown menu - Pixel Perfect */}
            {isMenuOpen && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMenuOpen(false)}
                />
                
                {/* Menu */}
                <div className="absolute right-0 mt-2 w-[310px] bg-white border border-[#d9d9d9] rounded-[16px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] flex flex-col gap-[10px] px-[10px] py-[16px] z-50">
                  {/* User Info */}
                  <div className="flex gap-[10px] h-[36px] items-center">
                    <div className="w-[36px] h-[36px] rounded-full border-[1.125px] border-[#fbff00] overflow-hidden shrink-0">
                      <img 
                        src="/assets/avatar-demo.png" 
                        alt="User avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col px-[10px] text-[12px] leading-[16px] tracking-[-0.1px] text-black">
                      <p className="font-['Inter',sans-serif] font-medium">
                        {displayName}
                      </p>
                      <p className="font-['Inter',sans-serif] font-normal">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* Upgrade Button */}
                  <button className="bg-[#66e7f5] rounded-[16px] flex items-center justify-center px-[14px] py-[8px] w-full">
                    <span className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-black">
                      Upgrade
                    </span>
                  </button>

                  {/* Add Members Button */}
                  <button className="border border-[#dcdcdc] rounded-[16px] flex items-center justify-center px-[14px] py-[8px] w-full">
                    <span className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-black">
                      Add members
                    </span>
                  </button>

                  {/* Total Demos Section */}
                  <div className="flex flex-col">
                    <div className="flex items-center px-[10px]">
                      <p className="font-['SF_Pro',sans-serif] font-light text-[12px] leading-[16px] tracking-[-0.1px] text-black">
                        Total Demos
                      </p>
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center px-[10px]">
                        <p className="font-['SF_Pro',sans-serif] font-light text-[12px] leading-[16px] tracking-[-0.1px] text-black">
                          17
                        </p>
                      </div>
                      <div className="flex items-center justify-end">
                        <p className="font-['SF_Pro',sans-serif] font-light text-[12px] leading-[16px] tracking-[-0.1px] text-black">
                          Limit 25
                        </p>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="flex flex-col h-[6px] px-[10px] mt-1">
                      <div className="h-[6px] rounded-[16px] w-full bg-gradient-to-r from-[#66e7f5] from-[67%] to-[#dcdcdc] to-[67%]" />
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="flex flex-col w-full gap-[4px]">
                    {/* Plan & billing */}
                    <button className="flex gap-[6px] items-center px-[10px] py-[8px] rounded-[10px] hover:bg-[rgba(32,32,32,0.05)] w-full">
                      <Image 
                        src="/assets/icon-billing.svg" 
                        alt="" 
                        width={12} 
                        height={12}
                        className="shrink-0"
                      />
                      <p className="flex-1 text-left font-['SF_Pro',sans-serif] font-normal text-[14px] leading-[20px] tracking-[-0.18px] text-[#202020] whitespace-nowrap overflow-hidden text-ellipsis">
                        Plan & billing
                      </p>
                      <div className="bg-[#66e7f5] rounded-[999px] px-[8px] pt-[2px] pb-[3px] shrink-0">
                        <span className="font-['Inter',sans-serif] font-medium text-[12px] text-black leading-normal">
                          Premium
                        </span>
                      </div>
                    </button>

                    {/* Settings */}
                    <button className="flex gap-[6px] items-center px-[10px] py-[8px] rounded-[10px] hover:bg-[rgba(32,32,32,0.05)] w-full">
                      <Image 
                        src="/assets/icon-settings.svg" 
                        alt="" 
                        width={12} 
                        height={12}
                        className="shrink-0"
                      />
                      <p className="flex-1 text-left font-['SF_Pro',sans-serif] font-normal text-[14px] leading-[20px] tracking-[-0.18px] text-[#202020]">
                        Settings
                      </p>
                    </button>

                    {/* Help center */}
                    <button className="flex gap-[6px] items-center px-[10px] py-[8px] rounded-[10px] hover:bg-[rgba(32,32,32,0.05)] w-full">
                      <Image 
                        src="/assets/icon-help.svg" 
                        alt="" 
                        width={12} 
                        height={12}
                        className="shrink-0"
                      />
                      <p className="flex-1 text-left font-['SF_Pro',sans-serif] font-normal text-[14px] leading-[20px] tracking-[-0.18px] text-[#202020]">
                        Help center
                      </p>
                    </button>

                    {/* Log out */}
                    <button 
                      onClick={handleSignOut}
                      className="flex gap-[6px] items-center px-[10px] py-[8px] rounded-[10px] hover:bg-[rgba(32,32,32,0.05)] w-full"
                    >
                      <Image 
                        src="/assets/icon-logout.svg" 
                        alt="" 
                        width={12} 
                        height={12}
                        className="shrink-0"
                      />
                      <p className="flex-1 text-left font-['SF_Pro',sans-serif] font-normal text-[14px] leading-[20px] tracking-[-0.18px] text-[#202020]">
                        Log out
                      </p>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col gap-[40px] items-center w-full max-w-[1440px] px-4 py-8">
        {/* File Upload Card */}
        <FileUploadCard 
          onFileUpload={handleFileUpload}
          buttonText="Or Browse a file"
          className="w-full max-w-[840px] h-[400px]"
        />

        {/* Presentations Section */}
        <div className="flex flex-col gap-[20px] w-full max-w-[840px]">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="font-['Inter',sans-serif] text-[16px] leading-[17.786px] tracking-[-0.2371px] text-[#0d0d0d]">
              Your AI presentations
            </h2>

            {/* Search and Filters */}
            <div className="flex items-center gap-[6px]">
              {/* Search Input */}
              <div className="bg-[#f5f5f5] rounded-[16px] p-[10.5px] flex items-center gap-[10px] w-[267px] h-[36px]">
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <circle cx="7.5" cy="7.5" r="6" stroke="black" strokeWidth="1.5"/>
                  <path d="M12 12L15 15" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent flex-1 font-['Inter',sans-serif] text-[14px] leading-[20px] text-black outline-none placeholder:text-black"
                />
                <span className="font-['Inter',sans-serif] text-[12px] text-[#999]">⌘K</span>
              </div>

              {/* Filters Button */}
              <button className="border border-[#e1e1e1] rounded-[999px] px-[14px] py-2 flex items-center gap-2">
                <span className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-black">
                  Filters
                </span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 2.5H9M2 5H8M3.5 7.5H6.5" stroke="black" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Presentations Grid */}
          <div className="grid grid-cols-4 gap-[17px]">
            {presentations.map((presentation, index) => (
              <div key={index} className="flex flex-col gap-[6px]">
                {/* Thumbnail */}
                <div className="border border-[#dcdcdc] rounded-[13.703px] overflow-hidden aspect-[16/9] relative">
                  <img 
                    src={presentation.thumbnail} 
                    alt={presentation.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title and Menu */}
                <div className="flex items-center justify-between">
                  <p className="font-['Inter',sans-serif] text-[12px] leading-[17.786px] tracking-[-0.2371px] text-[#0d0d0d] truncate flex-1">
                    {presentation.title}
                  </p>
                  {index === 0 && (
                    <button className="w-[12px] h-[12px] flex items-center justify-center">
                      <svg width="4" height="12" viewBox="0 0 4 12" fill="none">
                        <circle cx="2" cy="2" r="1.5" fill="#0d0d0d"/>
                        <circle cx="2" cy="6" r="1.5" fill="#0d0d0d"/>
                        <circle cx="2" cy="10" r="1.5" fill="#0d0d0d"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
