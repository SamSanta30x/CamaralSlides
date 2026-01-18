/**
 * Convert PDF file to PNG images (one per page)
 * Uses pdf.js to render each page to canvas and convert to PNG
 */

import * as pdfjsLib from 'pdfjs-dist'

// Set worker source
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

export interface PDFToImagesResult {
  images: File[]
  pageCount: number
}

/**
 * Convert a PDF file to an array of PNG image files
 * @param pdfFile - The PDF file to convert
 * @param scale - Scale factor for rendering (default: 2 for high quality)
 * @returns Array of PNG image files, one per page
 */
export async function convertPDFToImages(
  pdfFile: File,
  scale: number = 2
): Promise<PDFToImagesResult> {
  try {
    console.log('📄 Starting PDF conversion...')
    
    // Read PDF file as ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer()
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    
    const pageCount = pdf.numPages
    console.log(`📊 PDF has ${pageCount} pages`)
    
    const images: File[] = []
    
    // Process each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      console.log(`🔄 Converting page ${pageNum}/${pageCount}...`)
      
      // Get page
      const page = await pdf.getPage(pageNum)
      
      // Get viewport
      const viewport = page.getViewport({ scale })
      
      // Create canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      
      if (!context) {
        throw new Error('Failed to get canvas context')
      }
      
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      // Render page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      }
      
      await page.render(renderContext).promise
      
      // Convert canvas to Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        }, 'image/png', 1.0)
      })
      
      // Create File from Blob
      const fileName = `slide_${pageNum}.png`
      const imageFile = new File([blob], fileName, { type: 'image/png' })
      
      images.push(imageFile)
      console.log(`✅ Page ${pageNum} converted to PNG (${(blob.size / 1024).toFixed(1)} KB)`)
    }
    
    console.log(`✅ PDF conversion complete: ${images.length} images`)
    
    return {
      images,
      pageCount,
    }
  } catch (error) {
    console.error('❌ Error converting PDF to images:', error)
    throw error
  }
}

/**
 * Check if a file is a PDF
 */
export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}
