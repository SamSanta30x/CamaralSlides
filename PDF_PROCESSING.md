# PDF Processing & Image Optimization

This document explains how PDFs and images are processed in the application.

## Features

### PDF Upload
- **Automatic page extraction**: Each page of the PDF is converted to a separate slide
- **Client-side processing**: Uses PDF.js to render pages in the browser
- **Image optimization**: Each page is rendered at 2x scale for retina displays and compressed to PNG

### Image Upload
- **Single or multiple images**: Each image becomes a slide
- **Automatic optimization**: Images are resized (max 1920x1080) and compressed to JPEG
- **Maintains aspect ratio**: Images are scaled proportionally

## Processing Flow

### For PDF Files:
1. User uploads PDF file
2. PDF.js loads the document
3. For each page:
   - Render page to canvas at 2x scale
   - Convert canvas to PNG blob (92% quality)
   - Create File object for upload
4. All pages uploaded to Supabase Storage
5. Slide records created in database
6. User redirected to presentation viewer

### For Image Files:
1. User uploads image (PNG, JPG, WEBP)
2. Image is loaded and analyzed
3. If larger than 1920x1080:
   - Resize proportionally to fit within bounds
   - Maintain aspect ratio
4. Convert to JPEG (85% quality) for smaller file size
5. Upload to Supabase Storage
6. Slide record created in database

## Library Used

- **pdfjs-dist**: PDF rendering and page extraction
- **Canvas API**: Image rendering and conversion
- **Blob API**: File creation and optimization

## Configuration

### PDF.js Worker
The worker is loaded from CDN:
```javascript
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
```

### Image Quality Settings
- **PDF pages**: PNG at 92% quality
- **Optimized images**: JPEG at 85% quality
- **Max dimensions**: 1920×1080 pixels
- **Render scale**: 2x for retina displays

## File Size Optimization

### Why We Optimize:
- Reduce storage costs in Supabase
- Faster loading times for presentations
- Better performance on mobile devices
- Still maintains high visual quality

### Estimated Sizes:
- **PDF page (before)**: ~500KB - 2MB per page (depending on content)
- **PDF page (after)**: ~100KB - 400KB per page as PNG
- **Large image (before)**: 2MB - 10MB
- **Large image (after)**: 200KB - 800KB as JPEG

## Error Handling

If processing fails:
- User sees error alert with specific message
- Pending upload is cleared to prevent retry
- User can try uploading again
- Logs are available in browser console

## Supported File Types

- **PDF**: `.pdf` (application/pdf)
- **Images**: `.png`, `.jpg`, `.jpeg`, `.webp`
- **PowerPoint**: `.ppt`, `.pptx` (accepted but not yet converted - stored as-is)

## Future Enhancements

- [ ] PowerPoint to image conversion
- [ ] Server-side processing option
- [ ] Progress indicator during conversion
- [ ] Batch image upload (multiple files at once)
- [ ] WebP output format for even smaller files
- [ ] Custom quality settings per user
