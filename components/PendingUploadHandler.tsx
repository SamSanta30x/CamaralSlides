'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import {
  getPendingUpload,
  pendingUploadToFile,
  clearPendingUpload,
} from '@/lib/utils/pendingUpload'
import { createPresentation } from '@/lib/supabase/presentations'

/**
 * Component that handles pending file uploads after authentication
 * Should be rendered in the dashboard or main app layout
 */
export default function PendingUploadHandler() {
  const { user } = useAuth()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!user || processing) return

    const processPendingUpload = async () => {
      const pendingUpload = getPendingUpload()
      if (!pendingUpload) return

      setProcessing(true)

      try {
        // Convert pending upload back to File
        const file = await pendingUploadToFile(pendingUpload)

        // Create presentation
        const title = file.name.replace(/\.[^/.]+$/, '') // Remove extension
        const { data, error } = await createPresentation(title, [file])

        if (error) {
          console.error('Error creating presentation:', error)
          alert('Failed to create presentation. Please try uploading again.')
        } else if (data) {
          // Clear pending upload
          clearPendingUpload()
          
          // Redirect to presentation
          router.push(`/presentation/${data.id}`)
        }
      } catch (error) {
        console.error('Error processing pending upload:', error)
        alert('An error occurred while processing your file. Please try uploading again.')
        clearPendingUpload()
      } finally {
        setProcessing(false)
      }
    }

    processPendingUpload()
  }, [user, processing, router])

  if (!processing) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[16px] p-8 max-w-md mx-4 text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c1c1c]"></div>
        </div>
        <h2 className="font-['Inter',sans-serif] text-[18px] font-medium text-[#0d0d0d] mb-2">
          Processing your file...
        </h2>
        <p className="font-['Inter',sans-serif] text-[14px] text-[#5f5f5d]">
          Please wait while we create your presentation
        </p>
      </div>
    </div>
  )
}
