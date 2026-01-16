/**
 * Helper functions to manage pending file uploads in localStorage
 * Used when users upload files before authentication
 */

const PENDING_UPLOAD_KEY = 'camaral_pending_upload'

export interface PendingUpload {
  fileName: string
  fileType: string
  fileSize: number
  fileDataUrl: string // Base64 encoded file
  timestamp: number
}

/**
 * Save a file to localStorage for later upload after authentication
 */
export async function savePendingUpload(file: File): Promise<void> {
  try {
    // Convert file to base64
    const dataUrl = await fileToBase64(file)
    
    const pendingUpload: PendingUpload = {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileDataUrl: dataUrl,
      timestamp: Date.now(),
    }

    localStorage.setItem(PENDING_UPLOAD_KEY, JSON.stringify(pendingUpload))
  } catch (error) {
    console.error('Error saving pending upload:', error)
    throw error
  }
}

/**
 * Get the pending upload from localStorage
 */
export function getPendingUpload(): PendingUpload | null {
  try {
    const data = localStorage.getItem(PENDING_UPLOAD_KEY)
    if (!data) return null

    const pendingUpload: PendingUpload = JSON.parse(data)
    
    // Check if upload is not too old (max 1 hour)
    const oneHour = 60 * 60 * 1000
    if (Date.now() - pendingUpload.timestamp > oneHour) {
      clearPendingUpload()
      return null
    }

    return pendingUpload
  } catch (error) {
    console.error('Error getting pending upload:', error)
    clearPendingUpload()
    return null
  }
}

/**
 * Convert a pending upload back to a File object
 */
export async function pendingUploadToFile(
  pendingUpload: PendingUpload
): Promise<File> {
  try {
    const blob = await base64ToBlob(
      pendingUpload.fileDataUrl,
      pendingUpload.fileType
    )
    return new File([blob], pendingUpload.fileName, {
      type: pendingUpload.fileType,
    })
  } catch (error) {
    console.error('Error converting pending upload to file:', error)
    throw error
  }
}

/**
 * Clear the pending upload from localStorage
 */
export function clearPendingUpload(): void {
  localStorage.removeItem(PENDING_UPLOAD_KEY)
}

/**
 * Check if there's a pending upload
 */
export function hasPendingUpload(): boolean {
  return getPendingUpload() !== null
}

// Helper: Convert File to Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Helper: Convert Base64 to Blob
function base64ToBlob(base64: string, type: string): Promise<Blob> {
  return fetch(base64)
    .then((res) => res.blob())
    .then((blob) => new Blob([blob], { type }))
}
