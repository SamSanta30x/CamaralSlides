'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import {
  getPendingUpload,
  pendingUploadToFile,
  clearPendingUpload,
} from '@/lib/utils/pendingUpload'
import { createPresentation } from '@/lib/supabase/presentations'
import { convertPDFToImages, optimizeImage } from '@/lib/utils/pdfProcessor'

/**
 * Component that handles pending file uploads after authentication
 * Should be rendered in the dashboard or main app layout
 */
export default function PendingUploadHandler() {
  const { user } = useAuth()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const hasProcessed = useRef(false)

  useEffect(() => {
    if (!user || processing || hasProcessed.current) return

    const processPendingUpload = async () => {
      const pendingUpload = getPendingUpload()
      if (!pendingUpload) return

      // Mark as processed to prevent duplicate runs
      hasProcessed.current = true
      setProcessing(true)

      try {
        // Convert pending upload back to File
        const file = await pendingUploadToFile(pendingUpload)
        const title = file.name.replace(/\.[^/.]+$/, '')
        
        let filesToUpload: File[] = []
        const isPDF = file.type === 'application/pdf'
        const isImage = file.type.startsWith('image/')

        if (isPDF) {
          // Convert PDF to images
          console.log('Converting PDF to images...')
          const images = await convertPDFToImages(file)
          filesToUpload = images
        } else if (isImage) {
          // Optimize image
          console.log('Optimizing image...')
          const optimized = await optimizeImage(file)
          filesToUpload = [optimized]
        }

        if (filesToUpload.length === 0) {
          throw new Error('No slides could be created')
        }

        // Create presentation
        console.log(`Creating presentation with ${filesToUpload.length} slides...`)
        const { data, error } = await createPresentation(title, filesToUpload)

        // Clear pending upload immediately to prevent retry
        clearPendingUpload()

        if (error) {
          console.error('Error creating presentation:', error)
          alert('Failed to create presentation. Please try uploading again.')
          setProcessing(false)
          hasProcessed.current = false
        } else if (data) {
          // Redirect to presentation
          router.push(`/presentation/${data.id}`)
        }
      } catch (error) {
        console.error('Error processing pending upload:', error)
        alert('An error occurred while processing your file. Please try uploading again.')
        clearPendingUpload()
        setProcessing(false)
        hasProcessed.current = false
      }
    }

    processPendingUpload()
  }, [user, processing, router])

  if (!processing) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-[16px] p-8 max-w-md mx-4 text-center">
        <div className="mb-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#66e7f5]"></div>
        </div>
        <h2 className="font-['Inter',sans-serif] text-[18px] font-medium text-[#0d0d0d] mb-2">
          Processing your file...
        </h2>
        <p className="font-['Inter',sans-serif] text-[14px] text-[#5f5f5d]">
          Converting pages to slides and optimizing images
        </p>
      </div>
    </div>
  )
}
