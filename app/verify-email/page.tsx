'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleResendEmail = async () => {
    setResending(true)
    // TODO: Implement resend email logic with Supabase
    setTimeout(() => {
      setResending(false)
      setResent(true)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between p-4 max-w-[1440px] mx-auto">
        <Link href="/" className="flex items-center">
          <div className="flex items-center px-[14px] py-2">
            <Image 
              src="/Camaral Logo.svg" 
              alt="Camaral" 
              width={90}
              height={20}
              priority
              className="h-[20px] w-auto"
            />
          </div>
        </Link>

        <Link 
          href="/"
          className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-black hover:underline"
        >
          Sign out
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-[400px] w-full bg-white rounded-[16px] border border-[#eceae4] shadow-sm p-8 flex flex-col items-center gap-6">
          {/* Icon */}
          <div className="w-[64px] h-[64px]">
            <img 
              src="/favicon.svg" 
              alt="Camaral" 
              className="w-full h-full"
            />
          </div>

          {/* Title */}
          <h1 className="font-['Inter',sans-serif] font-semibold text-[24px] leading-[32px] text-[#1c1c1c] text-center">
            Check your inbox
          </h1>

          {/* Description */}
          <p className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-[#5f5f5d] text-center">
            Click the link we sent to to finish your account setup.
          </p>

          {/* Email display if available */}
          {email && (
            <div className="w-full bg-[#f5f5f5] rounded-[8px] px-4 py-3">
              <p className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-[#1c1c1c] text-center break-all">
                {email}
              </p>
            </div>
          )}

          {/* Resend email */}
          <div className="flex flex-col items-center gap-2">
            <p className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-[#5f5f5d]">
              Didn't receive an email?{' '}
              <button
                onClick={handleResendEmail}
                disabled={resending || resent}
                className="text-[#1c1c1c] underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : resent ? 'Email sent!' : 'Resend email'}
              </button>
            </p>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-[#eceae4] my-2" />

          {/* Back to login */}
          <Link 
            href="/login"
            className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-[#1c1c1c] hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="font-['Inter',sans-serif] text-[16px] text-[#1c1c1c]">Loading...</p>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
