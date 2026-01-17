'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import UpgradeButton from '@/components/UpgradeButton'
import { useAuth } from '@/lib/auth/AuthContext'

interface DashboardHeaderProps {
  showMenu?: boolean
  showTabs?: boolean
  presentationId?: string
  activeTab?: 'agent' | 'content' | 'analytics' | 'views'
  viewsCount?: number
}

export default function DashboardHeader({ 
  showMenu = true, 
  showTabs = false,
  presentationId,
  activeTab = 'agent',
  viewsCount = 12
}: DashboardHeaderProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Get user name from email
  const userName = user?.email?.split('@')[0] || 'User'
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1)

  return (
    <header className="w-full flex items-center justify-between p-4 max-w-[1440px] mx-auto">
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

      {/* Center - Tabs (only in presentation view) */}
      {showTabs && presentationId && (
        <div className="flex items-center gap-2">
          <Link 
            href={`/presentation/${presentationId}/agent`}
            className={`px-4 py-2 font-['Inter',sans-serif] text-[14px] ${
              activeTab === 'agent' 
                ? 'text-[#0d0d0d] border-b-2 border-[#0d0d0d]' 
                : 'text-[#666] hover:text-[#0d0d0d]'
            }`}
          >
            Agent
          </Link>
          <Link 
            href={`/presentation/${presentationId}`}
            className={`px-4 py-2 font-['Inter',sans-serif] text-[14px] ${
              activeTab === 'content' 
                ? 'text-[#0d0d0d] border-b-2 border-[#0d0d0d]' 
                : 'text-[#666] hover:text-[#0d0d0d]'
            }`}
          >
            Content
          </Link>
          <Link 
            href={`/presentation/${presentationId}/analytics`}
            className={`px-4 py-2 font-['Inter',sans-serif] text-[14px] ${
              activeTab === 'analytics' 
                ? 'text-[#0d0d0d] border-b-2 border-[#0d0d0d]' 
                : 'text-[#666] hover:text-[#0d0d0d]'
            }`}
          >
            Analytics
          </Link>
          <Link 
            href={`/presentation/${presentationId}/views`}
            className={`px-4 py-2 font-['Inter',sans-serif] text-[14px] flex items-center gap-1 ${
              activeTab === 'views' 
                ? 'text-[#0d0d0d] border-b-2 border-[#0d0d0d]' 
                : 'text-[#666] hover:text-[#0d0d0d]'
            }`}
          >
            Views
            <span className="bg-[#f5f5f5] px-2 py-0.5 rounded-full text-[12px]">{viewsCount}</span>
          </Link>
        </div>
      )}

      {/* Right side - Upgrade button and Avatar */}
      <div className="flex items-center gap-[10px]">
        <UpgradeButton />

        {/* Avatar with dropdown */}
        {showMenu && (
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
                <div className="absolute right-0 mt-2 w-[310px] bg-white border border-[#d9d9d9] rounded-[16px] flex flex-col gap-[10px] px-[10px] py-[16px] z-50">
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
                  <Link 
                    href="/settings?tab=billing"
                    className="bg-[#66e7f5] rounded-[16px] flex items-center justify-center px-[14px] py-[8px] w-full"
                  >
                    <span className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-black">
                      Upgrade
                    </span>
                  </Link>

                  {/* Add Members Button */}
                  <Link 
                    href="/settings?tab=team"
                    className="border border-[#dcdcdc] rounded-[16px] flex items-center justify-center px-[14px] py-[8px] w-full"
                  >
                    <span className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-black">
                      Add members
                    </span>
                  </Link>

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
                    <Link 
                      href="/settings?tab=billing"
                      className="flex gap-[6px] items-center px-[10px] py-[8px] rounded-[10px] hover:bg-[rgba(32,32,32,0.05)] w-full"
                    >
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
                    </Link>

                    {/* Settings */}
                    <Link 
                      href="/settings?tab=profile"
                      className="flex gap-[6px] items-center px-[10px] py-[8px] rounded-[10px] hover:bg-[rgba(32,32,32,0.05)] w-full"
                    >
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
                    </Link>

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
        )}
      </div>
    </header>
  )
}
