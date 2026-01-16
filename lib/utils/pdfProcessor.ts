// Dynamic import to avoid SSR issues
let pdfjsLib: any = null

async function getPdfjsLib() {
  if (pdfjsLib) return pdfjsLib
  
  if (typeof window === 'undefined') {
    throw new Error('PDF processing is only available in the browser')
  }
  
  pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  
  return pdfjsLib
}

/**
 * Convert a PDF file to an array of image files (one per page)
 * Each page is rendered as a PNG and compressed
 */
export async function convertPDFToImages(pdfFile: File): Promise<File[]> {
  try {
    const pdfjs = await getPdfjsLib()
    const arrayBuffer = await pdfFile.arrayBuffer()
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
    const imageFiles: File[] = []

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      
      // Set scale for good quality (2x for retina)
      const scale = 2
      const viewport = page.getViewport({ scale })

      // Create canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (!context) {
        throw new Error('Could not get canvas context')
      }

      canvas.width = viewport.width
      canvas.height = viewport.height

      // Render PDF page to canvas
      const renderContext: any = {
        canvasContext: context,
        viewport: viewport,
      }
      await page.render(renderContext).promise

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          'image/png',
          0.92 // Quality for compression
        )
      })

      // Create File object
      const fileName = `${pdfFile.name.replace('.pdf', '')}_page_${pageNum}.png`
      const imageFile = new File([blob], fileName, { type: 'image/png' })
      imageFiles.push(imageFile)
    }

    return imageFiles
  } catch (error) {
    console.error('Error converting PDF to images:', error)
    throw error
  }
}

/**
 * Compress and optimize an image file
 */
export async function optimizeImage(imageFile: File): Promise<File> {
  try {
    // Create image element
    const img = new Image()
    const imageUrl = URL.createObjectURL(imageFile)

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = imageUrl
    })

    // Create canvas with max dimensions
    const maxWidth = 1920
    const maxHeight = 1080
    let width = img.width
    let height = img.height

    // Calculate new dimensions while maintaining aspect ratio
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height)
      width = width * ratio
      height = height * ratio
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }

    // Draw image
    ctx.drawImage(img, 0, 0, width, height)

    // Convert to blob with compression
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        },
        'image/jpeg',
        0.85 // Quality
      )
    })

    // Clean up
    URL.revokeObjectURL(imageUrl)

    // Create optimized file
    const optimizedFile = new File(
      [blob],
      imageFile.name.replace(/\.(png|jpg|jpeg|webp)$/i, '.jpg'),
      { type: 'image/jpeg' }
    )

    return optimizedFile
  } catch (error) {
    console.error('Error optimizing image:', error)
    // Return original if optimization fails
    return imageFile
  }
}
