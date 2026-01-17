'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import DashboardHeader from '@/components/DashboardHeader'

export default function AnalyticsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [period, setPeriod] = useState('This month')

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
      <DashboardHeader showMenu={true} showTabs={true} presentationId={presentationId} activeTab="analytics" />

      {/* Main Content */}
      <div className="w-[840px] flex flex-col gap-[20px] px-0 py-[20px]">
        {/* Period Selector */}
        <div className="flex items-center">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e5e5] rounded-[12px] font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] hover:bg-[#f5f5f5] transition-colors">
            {period}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-90">
              <path d="M6 4L10 8L6 12" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-3 gap-[20px]">
          {/* Active Views */}
          <div className="bg-white border border-[#e5e5e5] rounded-[16px] p-6 flex flex-col items-center justify-center gap-2">
            <div className="text-[48px] font-['Inter',sans-serif] font-bold text-[#0d0d0d] leading-none flex items-center gap-2">
              1
              <div className="w-2 h-2 bg-[#22c55e] rounded-full"></div>
            </div>
            <p className="font-['Inter',sans-serif] text-[14px] text-[#666]">Active views</p>
          </div>

          {/* Total Views */}
          <div className="bg-white border border-[#e5e5e5] rounded-[16px] p-6 flex flex-col items-center justify-center gap-2">
            <div className="text-[48px] font-['Inter',sans-serif] font-bold text-[#0d0d0d] leading-none">
              874
            </div>
            <p className="font-['Inter',sans-serif] text-[14px] text-[#666]">Total views</p>
          </div>

          {/* Average Duration */}
          <div className="bg-white border border-[#e5e5e5] rounded-[16px] p-6 flex flex-col items-center justify-center gap-2">
            <div className="text-[48px] font-['Inter',sans-serif] font-bold text-[#0d0d0d] leading-none">
              12:30
            </div>
            <p className="font-['Inter',sans-serif] text-[14px] text-[#666]">Average duration</p>
          </div>
        </div>

        {/* Number of Calls Chart */}
        <div className="bg-white border border-[#e5e5e5] rounded-[16px] p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-['Inter',sans-serif] text-[14px] text-[#666] mb-2">Number of calls</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-['Inter',sans-serif] font-bold text-[#0d0d0d]">874</span>
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#22c55e]">↑ 21%</span>
                </div>
              </div>
            </div>
            
            {/* Chart Area */}
            <div className="relative h-[200px] w-full">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-[#999] font-['Inter',sans-serif]">
                <span>00</span>
                <span>00</span>
                <span>00</span>
                <span>00</span>
              </div>
              
              {/* Chart container */}
              <div className="ml-8 h-full relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  <div className="border-t border-[#f0f0f0]"></div>
                  <div className="border-t border-[#f0f0f0]"></div>
                  <div className="border-t border-[#f0f0f0]"></div>
                  <div className="border-t border-[#f0f0f0]"></div>
                </div>
                
                {/* Line chart - simplified SVG */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                  <path
                    d="M 0,150 Q 100,140 200,130 T 400,110 T 600,80 T 800,60"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
                
                {/* X-axis labels */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-[#999] font-['Inter',sans-serif]">
                  <span>00</span>
                  <span>00</span>
                  <span>00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Charts Row */}
        <div className="grid grid-cols-2 gap-[20px]">
          {/* Overall Success Rate */}
          <div className="bg-white border border-[#e5e5e5] rounded-[16px] p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-['Inter',sans-serif] text-[14px] text-[#666] mb-2">Overall success rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-['Inter',sans-serif] font-bold text-[#0d0d0d]">874</span>
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#22c55e]">↑ 21%</span>
                </div>
              </div>
              
              {/* Mini Chart */}
              <div className="relative h-[120px] w-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-[#999] font-['Inter',sans-serif]">
                  <span>00</span>
                  <span>00</span>
                  <span>00</span>
                </div>
                
                {/* Chart container */}
                <div className="ml-8 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    <div className="border-t border-[#f0f0f0]"></div>
                    <div className="border-t border-[#f0f0f0]"></div>
                    <div className="border-t border-[#f0f0f0]"></div>
                  </div>
                  
                  {/* Line chart */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                    <path
                      d="M 0,90 Q 50,85 100,80 T 200,70 T 300,60 T 400,55"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  
                  {/* X-axis labels */}
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-[#999] font-['Inter',sans-serif]">
                    <span>00</span>
                    <span>00</span>
                    <span>00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Average Duration */}
          <div className="bg-white border border-[#e5e5e5] rounded-[16px] p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="font-['Inter',sans-serif] text-[14px] text-[#666] mb-2">Average duration</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[32px] font-['Inter',sans-serif] font-bold text-[#0d0d0d]">12:31</span>
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#22c55e]">↑ 21%</span>
                </div>
              </div>
              
              {/* Mini Chart */}
              <div className="relative h-[120px] w-full">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-[#999] font-['Inter',sans-serif]">
                  <span>00</span>
                  <span>00</span>
                  <span>00</span>
                </div>
                
                {/* Chart container */}
                <div className="ml-8 h-full relative">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between">
                    <div className="border-t border-[#f0f0f0]"></div>
                    <div className="border-t border-[#f0f0f0]"></div>
                    <div className="border-t border-[#f0f0f0]"></div>
                  </div>
                  
                  {/* Line chart */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
                    <path
                      d="M 0,90 Q 50,85 100,80 T 200,70 T 300,60 T 400,55"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  
                  {/* X-axis labels */}
                  <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-[#999] font-['Inter',sans-serif]">
                    <span>00</span>
                    <span>00</span>
                    <span>00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
