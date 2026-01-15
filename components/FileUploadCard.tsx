'use client'

import { useState, useRef } from 'react'

interface FileUploadCardProps {
  onFileUpload: (file: File) => void
  showLoginModal?: boolean
  buttonText?: string
  buttonHref?: string
  className?: string
  descriptionText?: string
}

export default function FileUploadCard({ 
  onFileUpload, 
  showLoginModal = false,
  buttonText = "Or browse a file",
  buttonHref,
  className = "",
  descriptionText = "Drag a PDF, PPTX or Images to start a new presentation"
}: FileUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileValidation(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileValidation(files[0])
    }
  }

  const handleFileValidation = (file: File) => {
    // Check if file is PDF or PowerPoint
    const validTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
    
    if (validTypes.includes(file.type)) {
      onFileUpload(file)
    } else {
      alert('Please upload a PDF or PowerPoint file')
    }
  }

  const handleCardClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div 
      className={`bg-gradient-to-b border border-solid flex flex-col from-[#f8f8f8] from-[0.125%] gap-[10px] items-center justify-center overflow-clip px-0 py-[30px] rounded-[16px] shrink-0 to-[#f7f4ed] cursor-pointer transition-all ${
        isDragging ? 'border-[#FF38BB] border-2' : 'border-[#dcdcdc]'
      } ${className}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCardClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Illustration */}
      <div className="h-[126px] relative shrink-0 w-[187.5px] pointer-events-none">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            alt="Upload illustration" 
            className="absolute h-[148.81%] left-0 max-w-none top-[-21.08%] w-full select-none" 
            src="/assets/upload-illustration-new.png"
            draggable="false"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-[10px] items-center justify-center leading-[17.786px] min-h-[35.57250213623047px] not-italic px-[19.44px] py-[12.96px] shrink-0 text-[#0d0d0d] tracking-[-0.2371px] max-w-[840px] w-full pointer-events-none">
        <p className="font-['Inter',sans-serif] font-medium shrink-0 text-[14px] sm:text-[16px]">
          Create your AI presentation
        </p>
        <p className="font-['Inter',sans-serif] font-normal shrink-0 text-[11px] sm:text-[12px] text-center max-w-[172px]">
          {descriptionText}
        </p>
        
        {/* Button */}
        {buttonHref ? (
          <a 
            href={buttonHref}
            className="bg-white border-none rounded-[809.19px] px-[12.96px] py-[8.1px] mt-2 pointer-events-auto no-underline"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-['Inter',sans-serif] font-normal text-[12px] text-black tracking-[-0.24px]">
              {buttonText}
            </p>
          </a>
        ) : (
          <button 
            className="bg-white border-none rounded-[809.19px] px-[12.96px] py-[8.1px] mt-2 pointer-events-auto cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              handleCardClick()
            }}
          >
            <p className="font-['Inter',sans-serif] font-normal text-[12px] text-black tracking-[-0.24px]">
              {buttonText}
            </p>
          </button>
        )}
      </div>
    </div>
  )
}
