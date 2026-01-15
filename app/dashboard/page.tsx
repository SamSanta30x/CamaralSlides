'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import FileUploadCard from '@/components/FileUploadCard'

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // TODO: Check if user is logged in
    // For now, simulate checking auth
    const checkAuth = () => {
      // Simulate auth check - replace with real auth later
      const isLoggedIn = false // Change this when you implement real auth
      
      if (!isLoggedIn) {
        router.push('/')
      } else {
        setIsAuthenticated(true)
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name)
    // TODO: Handle file upload logic
  }

  // Dummy presentation data
  const presentations = Array(8).fill({
    title: 'Sales Pitch Presentation',
    thumbnail: '/assets/slide-demo.png'
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <header className="w-full flex items-center justify-between p-4 max-w-[1440px]">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center">
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

          {/* Avatar */}
          <div className="w-[36px] h-[36px] rounded-full border-[1.125px] border-[#fbff00] overflow-hidden">
            <img 
              src="/assets/avatar-demo.png" 
              alt="User avatar" 
              className="w-full h-full object-cover"
            />
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
