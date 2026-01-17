'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import FileUploadCard from '@/components/FileUploadCard'
import PendingUploadHandler from '@/components/PendingUploadHandler'
import DashboardHeader from '@/components/DashboardHeader'
import SearchInput from '@/components/SearchInput'
import { useToast } from '@/components/Toast'
import { useAuth } from '@/lib/auth/AuthContext'
import { 
  getPresentations, 
  createPresentation, 
  type Presentation 
} from '@/lib/supabase/presentations'

export default function DashboardContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [hoveredPresentation, setHoveredPresentation] = useState<string | null>(null)
  const [previewIndex, setPreviewIndex] = useState<{ [key: string]: number }>({})
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const { user } = useAuth()
  const { showToast, ToastContainer } = useToast()

  useEffect(() => {
    if (user) {
      loadPresentations()
    }
  }, [user])

  const loadPresentations = async () => {
    setLoading(true)
    const { data, error } = await getPresentations()
    if (data) {
      console.log('Presentations loaded:', data)
      console.log('First presentation slides:', data[0]?.slides)
      setPresentations(data)
    }
    setLoading(false)
  }

  const handleDuplicate = async (presentationId: string, title: string) => {
    try {
      // TODO: Implement duplicate logic
      showToast(`Duplicating "${title}"...`, 'success')
      setOpenMenuId(null)
    } catch (error) {
      showToast('Failed to duplicate presentation', 'error')
    }
  }

  const handleDelete = async (presentationId: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        // TODO: Implement delete logic
        showToast(`Deleted "${title}"`, 'success')
        setPresentations(presentations.filter(p => p.id !== presentationId))
        setOpenMenuId(null)
      } catch (error) {
        showToast('Failed to delete presentation', 'error')
      }
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    
    try {
      const isPDF = file.type === 'application/pdf'
      const isImage = file.type.startsWith('image/')
      
      if (!isPDF && !isImage) {
        showToast('Please upload a PDF or image file', 'error')
        setUploading(false)
        return
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        showToast('File is too large. Maximum size is 50MB', 'error')
        setUploading(false)
        return
      }

      const title = file.name.replace(/\.[^/.]+$/, '')

      // PDF processing now happens on the server via Edge Function
      // Images are uploaded directly
      const { data, error } = await createPresentation(title, [file])
      
      if (error) {
        console.error('Error creating presentation:', error)
        showToast(`Failed to create presentation: ${error.message}`, 'error')
      } else if (data) {
        showToast(isPDF ? 'PDF uploaded! Processing pages...' : 'Presentation created successfully!', 'success')
        // Reload presentations and redirect
        await loadPresentations()
        router.push(`/presentation/${data.id}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      showToast(`An error occurred during upload: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Toast Notifications */}
      <ToastContainer />
      
      {/* Pending Upload Handler */}
      <PendingUploadHandler />
      
      {/* Header */}
      <DashboardHeader />

      {/* Main Content */}
      <div className="flex flex-col gap-[40px] items-center w-full max-w-[1440px] px-4 py-8">
        {/* File Upload Card */}
        <FileUploadCard 
          onFileUpload={handleFileUpload}
          buttonText="Or Browse a file"
          className="w-full max-w-[840px] h-[400px]"
          uploading={uploading}
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
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search..."
                width="w-[267px]"
              />

              {/* Filters Button */}
              <button className="border border-[#e1e1e1] rounded-[999px] px-[14px] py-2 flex items-center gap-2 hover:bg-[#f5f5f5] transition-colors">
                <span className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-black">
                  Filters
                </span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 2.5H9M2 5H8M3.5 7.5H6.5" stroke="black" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <p className="font-['Inter',sans-serif] text-[14px] text-[#5f5f5d]">
                Loading presentations...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && presentations.length === 0 && (
            <div className="text-center py-12">
              <p className="font-['Inter',sans-serif] text-[16px] text-[#5f5f5d] mb-2">
                No presentations yet
              </p>
              <p className="font-['Inter',sans-serif] text-[14px] text-[#999]">
                Upload a file to create your first presentation
              </p>
            </div>
          )}

          {/* Presentations Grid */}
          {!loading && presentations.length > 0 && (
            <div className="grid grid-cols-4 gap-[17px]">
              {presentations
                .filter((p) =>
                  searchQuery
                    ? p.title.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                )
                .map((presentation, index) => {
                  // Get slides for preview
                  const slides = presentation.slides || []
                  const currentPreviewIndex = previewIndex[presentation.id] || 0
                  const thumbnail = slides.length > 0 
                    ? slides[currentPreviewIndex]?.image_url || slides[0]?.image_url
                    : '/assets/slide-demo.png'
                  
                  const hasMultipleSlides = slides.length > 1
                  const isHovered = hoveredPresentation === presentation.id

                  const handlePrevSlide = (e: React.MouseEvent) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setPreviewIndex(prev => ({
                      ...prev,
                      [presentation.id]: currentPreviewIndex > 0 ? currentPreviewIndex - 1 : slides.length - 1
                    }))
                  }

                  const handleNextSlide = (e: React.MouseEvent) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setPreviewIndex(prev => ({
                      ...prev,
                      [presentation.id]: currentPreviewIndex < slides.length - 1 ? currentPreviewIndex + 1 : 0
                    }))
                  }

                  return (
                    <Link
                      key={presentation.id}
                      href={`/presentation/${presentation.id}`}
                      className="flex flex-col gap-[6px] group cursor-pointer"
                      onMouseEnter={() => setHoveredPresentation(presentation.id)}
                      onMouseLeave={() => {
                        setHoveredPresentation(null)
                        setPreviewIndex(prev => ({ ...prev, [presentation.id]: 0 }))
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="border border-[#dcdcdc] rounded-[13.703px] overflow-hidden aspect-[16/9] relative group-hover:border-[#1c1c1c] transition-colors">
                        <img
                          src={thumbnail}
                          alt={presentation.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = '/assets/slide-demo.png'
                          }}
                        />
                        
                        {/* Navigation Arrows (only show on hover if multiple slides) */}
                        {hasMultipleSlides && isHovered && (
                          <>
                            {/* Previous Arrow */}
                            <button
                              onClick={handlePrevSlide}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M10 12L6 8L10 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>

                            {/* Next Arrow */}
                            <button
                              onClick={handleNextSlide}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-all backdrop-blur-sm"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 4L10 8L6 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Title and Menu */}
                      <div className="flex items-center justify-between">
                        <p className="font-['Inter',sans-serif] text-[12px] leading-[17.786px] tracking-[-0.2371px] text-[#0d0d0d] truncate flex-1">
                          {presentation.title}
                        </p>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              setOpenMenuId(openMenuId === presentation.id ? null : presentation.id)
                            }}
                            className="w-[12px] h-[12px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg width="4" height="12" viewBox="0 0 4 12" fill="none">
                              <circle cx="2" cy="2" r="1.5" fill="#0d0d0d" />
                              <circle cx="2" cy="6" r="1.5" fill="#0d0d0d" />
                              <circle cx="2" cy="10" r="1.5" fill="#0d0d0d" />
                            </svg>
                          </button>

                          {/* Dropdown Menu */}
                          {openMenuId === presentation.id && (
                            <>
                              {/* Backdrop to close menu */}
                              <div 
                                className="fixed inset-0 z-10" 
                                onClick={(e) => {
                                  e.preventDefault()
                                  setOpenMenuId(null)
                                }}
                              />
                              
                              {/* Menu */}
                              <div className="absolute right-0 top-full mt-1 w-[160px] bg-white border border-[#e5e5e5] rounded-[12px] overflow-hidden z-20">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleDuplicate(presentation.id, presentation.title)
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors text-left"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="#0d0d0d" strokeWidth="1.5"/>
                                    <path d="M11 5V3.5C11 2.67157 10.3284 2 9.5 2H3.5C2.67157 2 2 2.67157 2 3.5V9.5C2 10.3284 2.67157 11 3.5 11H5" stroke="#0d0d0d" strokeWidth="1.5"/>
                                  </svg>
                                  <span className="font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                                    Duplicate
                                  </span>
                                </button>
                                
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    router.push(`/presentation/${presentation.id}`)
                                    setOpenMenuId(null)
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa] transition-colors text-left"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M11.5 2L14 4.5M1 15L4 14L13.5 4.5C14.3284 3.67157 14.3284 2.32843 13.5 1.5C12.6716 0.671573 11.3284 0.671573 10.5 1.5L1 11V15Z" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span className="font-['Inter',sans-serif] text-[14px] text-[#0d0d0d]">
                                    Edit
                                  </span>
                                </button>

                                <div className="border-t border-[#e5e5e5]" />
                                
                                <button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    handleDelete(presentation.id, presentation.title)
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fef2f2] transition-colors text-left"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  <span className="font-['Inter',sans-serif] text-[14px] text-[#ef4444]">
                                    Delete
                                  </span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
