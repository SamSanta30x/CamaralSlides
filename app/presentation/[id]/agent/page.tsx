'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/auth/AuthContext'
import DashboardHeader from '@/components/DashboardHeader'
import DescriptionTextarea from '@/components/DescriptionTextarea'

export default function AgentPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [name, setName] = useState('Max')
  const [voice, setVoice] = useState('Alejandro')
  const [language, setLanguage] = useState('Spanish')
  const [firstMessage, setFirstMessage] = useState("Hello! I'm Emma, your AI assistant. How can I help you today?")
  const [objective, setObjective] = useState('')

  const presentationId = params.id as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#66e7f5] border-t-transparent"></div>
          <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header with Menu and Tabs */}
      <DashboardHeader showMenu={true} showTabs={true} presentationId={presentationId} activeTab="agent" />

      {/* Main Content */}
      <div className="w-[840px] flex flex-col gap-[40px] px-0 py-[20px]">
        {/* Name Field */}
        <div className="flex flex-col gap-[10px]">
          <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px] focus:outline-none focus:border-[#66e7f5]"
          />
        </div>

        {/* Voice and Language Row */}
        <div className="flex gap-[20px]">
          {/* Voice Selector */}
          <div className="flex flex-col gap-[10px] w-[420px]">
            <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
              Voice
            </label>
            <div className="relative">
              <button className="w-full bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] flex items-center justify-between focus:outline-none focus:border-[#66e7f5]">
                <div className="flex items-center gap-[6px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                    A
                  </div>
                  <span className="font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
                    {voice}
                  </span>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-90">
                  <path d="M9 6L15 12L9 18" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex flex-col gap-[10px] w-[400px]">
            <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
              Language
            </label>
            <div className="relative">
              <button className="w-full bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] flex items-center justify-between focus:outline-none focus:border-[#66e7f5]">
                <div className="flex items-center gap-[6px]">
                  <div className="w-[24px] h-[24px] rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-b from-red-500 via-yellow-400 to-red-500"></div>
                  </div>
                  <span className="font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
                    {language}
                  </span>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-90">
                  <path d="M9 6L15 12L9 18" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* First Message Field */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[4px]">
            <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
              First message
            </label>
            <p className="font-['Inter',sans-serif] text-[16px] text-black tracking-[-0.24px]">
              The first message the agent will say. If empty, the agent will wait for the user to start the conversation
            </p>
          </div>
          <input
            type="text"
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            className="w-full bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px] focus:outline-none focus:border-[#66e7f5]"
          />
        </div>

        {/* Objective Field */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[4px]">
            <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
              Whats the objective of the presentation?
            </label>
            <p className="font-['Inter',sans-serif] text-[16px] text-black tracking-[-0.24px]">
              The first message the agent will say. If empty, the agent will wait for the user to start the conversation
            </p>
          </div>
          <DescriptionTextarea 
            value={objective}
            onChange={setObjective}
            height="159px"
          />
        </div>

        {/* Knowledge Base Section */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[4px]">
            <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
              Knowledge base
            </label>
            <p className="font-['Inter',sans-serif] text-[16px] text-black tracking-[-0.24px]">
              The first message the agent will say. If empty, the agent will wait for the user to start the conversation
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-[10px]">
            <button className="w-[168px] bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] flex flex-col items-center gap-[4.86px] hover:bg-[#f5f5f5] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18.333c4.602 0 8.333-3.73 8.333-8.333S14.602 1.667 10 1.667 1.667 5.397 1.667 10s3.73 8.333 8.333 8.333z" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 6.667v6.666M6.667 10h6.666" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
                Add Website
              </span>
            </button>

            <button className="w-[168px] bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] flex flex-col items-center gap-[4.86px] hover:bg-[#f5f5f5] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 9.167v-5c0-.917-.75-1.667-1.667-1.667h-5M10.833 9.167l6.667-6.667M8.333 2.5h-5c-.916 0-1.666.75-1.666 1.667v11.666c0 .917.75 1.667 1.666 1.667h11.667c.917 0 1.667-.75 1.667-1.667v-5" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
                Add Files
              </span>
            </button>

            <button className="w-[168px] bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] flex flex-col items-center gap-[4.86px] hover:bg-[#f5f5f5] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.167 2.5H5.833c-.916 0-1.666.75-1.666 1.667v11.666c0 .917.75 1.667 1.666 1.667h8.334c.916 0 1.666-.75 1.666-1.667V4.167c0-.917-.75-1.667-1.666-1.667zM12.5 7.5h-5M12.5 10.833h-5M10 14.167H7.5" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
                Create Text
              </span>
            </button>
          </div>

          {/* Empty State */}
          <div className="w-full h-[159px] bg-[#f8f8f8] border border-[#dcdcdc] rounded-[20.751px] flex flex-col items-center justify-center gap-[4.86px]">
            <p className="font-['Inter',sans-serif] font-medium text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
              No documents found
            </p>
            <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
              You don't have any documents yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
