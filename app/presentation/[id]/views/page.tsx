'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import DashboardHeader from '@/components/DashboardHeader'
import ViewDetailModal from '@/components/ViewDetailModal'
import SearchInput from '@/components/SearchInput'
import ActionButton from '@/components/ActionButton'
import { getPresentationViews, formatDuration, formatViewDate, type PresentationView } from '@/lib/supabase/analytics'

export default function ViewsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedView, setSelectedView] = useState<PresentationView | null>(null)
  const [views, setViews] = useState<PresentationView[]>([])
  const [loading, setLoading] = useState(true)

  const presentationId = params.id as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && presentationId) {
      loadViews()
      
      // Refresh views every 30 seconds
      const interval = setInterval(loadViews, 30000)
      
      return () => clearInterval(interval)
    }
  }, [user, presentationId])

  const loadViews = async () => {
    try {
      const { data, error } = await getPresentationViews(presentationId)
      if (error) {
        console.error('Error loading views:', error)
        return
      }
      setViews(data || [])
    } catch (error) {
      console.error('Error loading views:', error)
    } finally {
      setLoading(false)
    }
  }

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

  const filteredViews = views.filter(view =>
    (view.viewer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
    (view.viewer_email?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  )

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pb-[20px]">
      {/* Header with Menu and Tabs */}
      <DashboardHeader showMenu={true} showTabs={true} presentationId={presentationId} activeTab="views" viewsCount={views.length} />

      {/* Main Content */}
      <div className="w-[840px] flex flex-col gap-[20px] px-0 py-[20px] flex-1">
        {/* Search and Actions Bar */}
        <div className="flex items-center gap-[20px]">
          {/* Search Input */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search responses..."
            width="flex-1"
            variant="compact"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-[10px]">
            <ActionButton icon="filter">
              Filters
            </ActionButton>
            <ActionButton icon="download">
              Download
            </ActionButton>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[16px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left px-6 py-4 font-['Inter',sans-serif] font-medium text-[14px] text-[#666]">
                  Date
                </th>
                <th className="text-left px-6 py-4 font-['Inter',sans-serif] font-medium text-[14px] text-[#666]">
                  Name
                </th>
                <th className="text-left px-6 py-4 font-['Inter',sans-serif] font-medium text-[14px] text-[#666]">
                  Email
                </th>
                <th className="text-left px-6 py-4 font-['Inter',sans-serif] font-medium text-[14px] text-[#666]">
                  Duration
                </th>
                <th className="text-left px-6 py-4 font-['Inter',sans-serif] font-medium text-[14px] text-[#666]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#66e7f5] border-t-transparent"></div>
                      <p className="font-['Inter',sans-serif] text-[14px] text-[#666]">Loading views...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredViews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="font-['Inter',sans-serif] text-[14px] text-[#666]">
                      No views yet. Share your presentation to start tracking views.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredViews.map((view) => (
                  <tr 
                    key={view.id} 
                    onClick={() => setSelectedView(view)}
                    className="hover:bg-[#fafafa] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                      {formatViewDate(view.started_at)}
                    </td>
                    <td className="px-6 py-4 font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                      {view.viewer_name || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                      {view.viewer_email || '-'}
                    </td>
                    <td className="px-6 py-4 font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                      {formatDuration(view.duration_seconds)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center justify-center gap-[10px] rounded-[6px] font-['Inter',sans-serif] text-[12px] ${
                        view.call_status === 'Successful' 
                          ? 'bg-[#CBFFA3] text-[#0d0d0d] border border-[#88E73F] px-[5px] pt-[2px] pb-[3px]' 
                          : view.call_status === 'Failed'
                          ? 'bg-[#ef4444] text-white px-3 py-1'
                          : view.call_status === 'In Progress'
                          ? 'bg-[#fbbf24] text-[#0d0d0d] px-3 py-1'
                          : 'bg-[#e5e5e5] text-[#666] px-3 py-1'
                      }`}>
                        {view.call_status || 'No Call'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Add Column Input - Fixed at bottom with 20px margin */}
        <div className="mt-auto">
          <div className="bg-white border border-[#e5e5e5] rounded-[50px] px-[20px] py-[14px] flex items-center gap-[16px] shadow-sm">
            {/* Plus Button */}
            <button className="flex-shrink-0 w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
            
            {/* Input */}
            <input
              type="text"
              placeholder="Create a new column with a rating from 1 to 5 based on user experience"
              className="flex-1 bg-transparent font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] placeholder:text-[#999] focus:outline-none"
            />
            
            {/* Microphone Button */}
            <button className="flex-shrink-0 w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="2" width="6" height="11" rx="3" stroke="#0d0d0d" strokeWidth="1.5"/>
                <path d="M5 10V12C5 15.866 8.13401 19 12 19V19C15.866 19 19 15.866 19 12V10" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 19V22M12 22H9M12 22H15" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            
            {/* Waveform Button */}
            <button className="flex-shrink-0 w-[24px] h-[24px] flex items-center justify-center hover:opacity-70 transition-opacity">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 12V12M10 9V15M14 6V18M18 10V14" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* View Detail Modal */}
      {selectedView && (
        <ViewDetailModal
          isOpen={!!selectedView}
          onClose={() => setSelectedView(null)}
          viewData={selectedView}
        />
      )}
    </div>
  )
}
