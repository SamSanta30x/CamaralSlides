'use client'

import { useState } from 'react'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')

  if (!isOpen) return null

  const handleGoogleLogin = () => {
    // Implement Google OAuth login
    console.log('Google login')
  }

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement email login
    console.log('Email login:', email)
  }

  return (
    <div 
      className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white flex flex-col gap-[10px] items-center px-[17px] rounded-[16px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo Icon */}
        <div className="w-[120px] h-[120px] shrink-0">
          <img 
            alt="Camaral" 
            className="w-full h-[175%]" 
            src="/favicon.svg"
          />
        </div>

        {/* Title */}
        <h2 className="font-['Inter',sans-serif] font-normal text-[27.8px] leading-[45px] text-[#1c1c1c] text-center shrink-0">
          Log in
        </h2>

        {/* Google Button */}
        <div className="pb-[10px] pt-0 w-[350px]">
          <button
            onClick={handleGoogleLogin}
            className="bg-[#f7f4ed] border border-[#eceae4] h-[32px] rounded-[6px] w-full relative flex items-center justify-center gap-2"
          >
            <img 
              alt="" 
              className="w-4 h-4" 
              src="/assets/google-icon.svg"
            />
            <span className="font-['Inter',sans-serif] text-[13.3px] leading-[21px] text-[#1c1c1c]">
              Continue with Google
            </span>
          </button>
        </div>

        {/* Divider with OR */}
        <div className="relative w-[350px] h-px border-t border-[#eceae4] mb-[10px]">
          <div className="absolute bg-white px-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="font-['Inter',sans-serif] text-[11.3px] leading-[18px] text-[#5f5f5d] uppercase">
              Or
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="w-[350px] flex flex-col gap-4">
          {/* Email Label and Input */}
          <div className="flex flex-col gap-1">
            <label className="font-['Inter',sans-serif] text-[13.9px] leading-[21px] text-[#1c1c1c]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-[#eceae4] h-[36px] rounded-[6px] px-3 text-[13.9px] font-['Inter',sans-serif] outline-none focus:border-[#1c1c1c]"
              required
            />
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="bg-[#1c1c1c] h-[32px] rounded-[6px] font-['Inter',sans-serif] text-[13.5px] leading-[21px] text-[#fcfbf8] hover:bg-[#333]"
          >
            Continue
          </button>

          {/* Don't have account */}
          <div className="text-center">
            <span className="font-['Inter',sans-serif] text-[12.8px] leading-[21px] text-[#5f5f5d]">
              Don&apos;t have an account?{' '}
              <a href="/sign-up" className="text-[#1c1c1c] underline">
                Create your account
              </a>
            </span>
          </div>

          {/* Divider */}
          <div className="border-t border-[#eceae4] my-2" />

          {/* SSO Text with Lock Icon */}
          <div className="flex items-center justify-center gap-2">
            <img 
              alt="" 
              className="w-4 h-4" 
              src="/assets/lock-icon.svg"
            />
            <span className="font-['Inter',sans-serif] text-[13.2px] leading-[21px] text-[#5f5f5d]">
              SSO available on{' '}
              <span className="underline">Business and Enterprise</span>
              {' '}plans
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}
