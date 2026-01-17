'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import DashboardHeader from '@/components/DashboardHeader'
import ViewDetailModal from '@/components/ViewDetailModal'
import SearchInput from '@/components/SearchInput'
import ActionButton from '@/components/ActionButton'

interface ViewData {
  id: string
  date: string
  name: string
  email: string
  duration: string
  status: 'Successful' | 'Failed'
}

export default function ViewsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedView, setSelectedView] = useState<ViewData | null>(null)

  const presentationId = params.id as string

  // Mock data - replace with real data from API
  const [views] = useState<ViewData[]>([
    {
      id: '1',
      date: 'Sep 22, 2025, 1:16 am',
      name: 'Sofia Hoyos',
      email: 'sof@gmail.com',
      duration: '09:00',
      status: 'Successful'
    },
    {
      id: '2',
      date: 'Sep 22, 2025, 1:16 am',
      name: 'Laura Mejia',
      email: 'lucasz@accenture.com',
      duration: '10:00',
      status: 'Successful'
    },
    {
      id: '3',
      date: 'Sep 22, 2025, 1:16 am',
      name: 'Orlando Ortiz',
      email: 'germa@dupta.ai',
      duration: '10:00',
      status: 'Successful'
    },
    {
      id: '4',
      date: 'Sep 22, 2025, 1:16 am',
      name: 'Vanessa Duque',
      email: 'grises32@openai.com',
      duration: '10:00',
      status: 'Successful'
    },
    {
      id: '5',
      date: 'Sep 22, 2025, 1:16 am',
      name: 'Alan Paol',
      email: 'alanpol-2@outlook.com',
      duration: '10:00',
      status: 'Successful'
    },
    {
      id: '6',
      date: 'Sep 22, 2025, 1:16 am',
      name: 'Pol Volandia',
      email: 'ljog@gmail.com',
      duration: '10:00',
      status: 'Successful'
    },
    {
      id: '7',
      date: 'Sep 22, 2025, 1:16 am',
      name: 'Lucas López',
      email: 'mlnvar324@luca.com',
      duration: '10:00',
      status: 'Successful'
    },
    {
      id: '8',
      date: 'Sep 22, 2025, 1:16 am',
      name: 'Grisela Giraldo',
      email: 'grise53giral.2@gmail.com',
      duration: '10:00',
      status: 'Successful'
    }
  ])

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

  const filteredViews = views.filter(view =>
    view.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    view.email.toLowerCase().includes(searchQuery.toLowerCase())
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
              {filteredViews.map((view, index) => (
                <tr 
                  key={view.id} 
                  onClick={() => setSelectedView(view)}
                  className="hover:bg-[#fafafa] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                    {view.date}
                  </td>
                  <td className="px-6 py-4 font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                    {view.name}
                  </td>
                  <td className="px-6 py-4 font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                    {view.email}
                  </td>
                  <td className="px-6 py-4 font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                    {view.duration}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center justify-center gap-[10px] rounded-[6px] font-['Inter',sans-serif] text-[12px] ${
                      view.status === 'Successful' 
                        ? 'bg-[#CBFFA3] text-[#0d0d0d] border border-[#88E73F] px-[5px] pt-[2px] pb-[3px]' 
                        : 'bg-[#ef4444] text-white px-3 py-1'
                    }`}>
                      {view.status}
                    </span>
                  </td>
                </tr>
              ))}
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
