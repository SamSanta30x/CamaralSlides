'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { type PresentationView, formatDuration, formatViewDate } from '@/lib/supabase/analytics'

interface ViewDetailModalProps {
  isOpen: boolean
  onClose: () => void
  viewData: PresentationView
}

export default function ViewDetailModal({ isOpen, onClose, viewData }: ViewDetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'transcription'>('overview')

  // Get transcription messages from viewData
  const messages = viewData.transcription || []

  // Handle animation on mount/unmount
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300) // Match transition duration
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal Container - Two Panels */}
      <div className={`fixed right-0 top-0 bottom-0 w-[896px] bg-white shadow-2xl z-50 flex transition-transform duration-300 ease-out ${
        isAnimating ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Left Panel - Main Content */}
        <div className="flex-1 flex flex-col border-r border-[#e5e5e5]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]">
            <div className="flex items-center gap-3">
              <h2 className="font-['Inter',sans-serif] text-[16px] font-semibold text-[#0d0d0d]">
                Conversation with {viewData.viewer_name?.split(' ')[0] || 'Anonymous'}
              </h2>
              <span className="font-['Inter',sans-serif] text-[12px] text-[#999]">
                {viewData.id}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Fixed Video and Tabs */}
            <div className="p-6 pb-0">
              {/* Video Preview */}
              <div className="relative w-full aspect-video bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 rounded-[16px] overflow-hidden mb-6">
                {/* Placeholder image - replace with actual video thumbnail */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M8 5.14v13.72L19 12L8 5.14z" fill="#0d0d0d"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`flex h-[28px] px-[8px] justify-center items-center gap-[8px] rounded-[8px] font-['Inter',sans-serif] text-[14px] transition-colors ${
                    activeTab === 'overview'
                      ? 'border border-[#E0E0E0] bg-white text-[#0d0d0d]'
                      : 'text-[#666] hover:text-[#0d0d0d]'
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveTab('transcription')}
                  className={`flex h-[28px] px-[8px] justify-center items-center gap-[8px] rounded-[8px] font-['Inter',sans-serif] text-[14px] transition-colors ${
                    activeTab === 'transcription'
                      ? 'border border-[#E0E0E0] bg-white text-[#0d0d0d]'
                      : 'text-[#666] hover:text-[#0d0d0d]'
                  }`}
                >
                  Transcription
                </button>
              </div>

            </div>

            {/* Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {activeTab === 'overview' ? (
                /* Overview Content */
                <div className="flex flex-col gap-6">
                  {/* Summary */}
                  <div className="flex flex-col gap-3">
                    <h3 className="font-['Inter',sans-serif] text-[14px] font-semibold text-[#0d0d0d]">
                      Summary
                    </h3>
                    <p className="font-['Inter',sans-serif] text-[14px] text-[#666] leading-relaxed">
                      {viewData.summary || 'No summary available yet. Summary will be generated after the call ends.'}
                    </p>
                  </div>

                  {/* Call Status */}
                  <div className="flex items-center gap-3">
                    <span className="font-['Inter',sans-serif] text-[14px] text-[#666]">
                      Call status
                    </span>
                    <span className={`inline-flex items-center justify-center gap-[10px] rounded-[6px] font-['Inter',sans-serif] text-[12px] ${
                      viewData.call_status === 'Successful' 
                        ? 'bg-[#CBFFA3] text-[#0d0d0d] border border-[#88E73F] px-[5px] pt-[2px] pb-[3px]' 
                        : viewData.call_status === 'Failed'
                        ? 'bg-[#ef4444] text-white px-3 py-1'
                        : viewData.call_status === 'In Progress'
                        ? 'bg-[#fbbf24] text-[#0d0d0d] px-3 py-1'
                        : 'bg-[#e5e5e5] text-[#666] px-3 py-1'
                    }`}>
                      {viewData.call_status || 'No Call'}
                    </span>
                  </div>

                  {/* Recording */}
                  {viewData.recording_url && (
                    <div className="flex flex-col gap-3">
                      <h3 className="font-['Inter',sans-serif] text-[14px] font-semibold text-[#0d0d0d]">
                        Recording
                      </h3>
                      <a 
                        href={viewData.recording_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#0d0d0d] hover:text-[#66e7f5] transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M6.5 5.5L10 8l-3.5 2.5V5.5z" fill="currentColor"/>
                        </svg>
                        <span className="font-['Inter',sans-serif] text-[14px]">
                          Play Recording
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                /* Transcription Content - Messages */
                <div className="flex flex-col gap-4">
                  {messages.length === 0 ? (
                    <p className="font-['Inter',sans-serif] text-[14px] text-[#666] text-center py-8">
                      No transcription available yet.
                    </p>
                  ) : (
                    messages.map((message, index) => (
                      <div 
                        key={index} 
                        className={`flex gap-3 ${message.speaker === 'User' ? 'flex-row-reverse' : ''}`}
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                          {message.speaker === 'User' ? (viewData.viewer_name?.charAt(0) || 'U') : 'A'}
                        </div>
                        
                        {/* Message Content */}
                        <div className={`flex flex-col gap-1 flex-1 ${message.speaker === 'User' ? 'items-end' : ''}`}>
                          <div className={`flex items-center gap-2 ${message.speaker === 'User' ? 'flex-row-reverse' : ''}`}>
                            <span className="font-['Inter',sans-serif] text-[14px] font-medium text-[#0d0d0d]">
                              {message.speaker === 'User' ? (viewData.viewer_name || 'User') : 'Agent'}
                            </span>
                            <span className="font-['Inter',sans-serif] text-[11px] text-[#999]">
                              {message.timestamp}
                            </span>
                          </div>
                          <div className={`px-4 py-3 rounded-[12px] max-w-[400px] ${
                            message.speaker === 'User' 
                              ? 'bg-[#f5f5f5]' 
                              : 'bg-white border border-[#e5e5e5]'
                          }`}>
                            <p className="font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] leading-relaxed">
                              {message.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Metadata */}
        <div className="w-[256px] flex flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5e5]">
            <h3 className="font-['Inter',sans-serif] text-[16px] font-semibold text-[#0d0d0d]">
              Metadata
            </h3>
            <button 
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 5L15 15M5 15L15 5" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Metadata Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-6">
              {/* Name */}
              <div className="flex flex-col gap-2">
                <span className="font-['Inter',sans-serif] text-[14px] text-[#666]">Name</span>
                <span className="font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                  {viewData.viewer_name || 'Anonymous'}
                </span>
              </div>

              {/* Email */}
              {viewData.viewer_email && (
                <div className="flex flex-col gap-2">
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#666]">Email</span>
                  <span className="font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                    {viewData.viewer_email}
                  </span>
                </div>
              )}

              {/* Date */}
              <div className="flex flex-col gap-2">
                <span className="font-['Inter',sans-serif] text-[14px] text-[#666]">Date</span>
                <span className="font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                  {formatViewDate(viewData.started_at)}
                </span>
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-2">
                <span className="font-['Inter',sans-serif] text-[14px] text-[#666]">Duration</span>
                <span className="font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                  {formatDuration(viewData.duration_seconds)}
                </span>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2">
                <span className="font-['Inter',sans-serif] text-[14px] text-[#666]">Status</span>
                <span className="font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                  {viewData.is_active ? 'Active' : 'Ended'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
