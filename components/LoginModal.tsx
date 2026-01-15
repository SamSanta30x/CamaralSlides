'use client'

import { useState } from 'react'
import Image from 'next/image'

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
        className="bg-white flex flex-col gap-[10px] items-center px-[17px] py-[34px] rounded-[16px] w-[384px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo Icon */}
        <div className="inline-grid grid-cols-[max-content] grid-rows-[max-content] items-start justify-items-start leading-[0] shrink-0">
          <div className="col-1 row-1 inline-grid grid-cols-[max-content] grid-rows-[max-content] items-start justify-items-start ml-0 mt-0">
            <div className="col-1 row-1 inline-grid grid-cols-[max-content] grid-rows-[max-content] items-start justify-items-start ml-0 mt-0">
              <div className="col-1 row-1 ml-0 mt-[3.32px] w-[15.428px] h-[15.084px]">
                <img 
                  alt="" 
                  className="block max-w-none w-full h-full" 
                  src="/assets/group-137.svg"
                />
              </div>
              <div className="col-1 row-1 ml-[20.57px] mt-[3.32px] w-[15.428px] h-[15.084px]">
                <img 
                  alt="" 
                  className="block max-w-none w-full h-full" 
                  src="/assets/group-135.svg"
                />
              </div>
              <div className="col-1 row-1 ml-[10.29px] mt-0 w-[15.428px] h-[15.084px]">
                <img 
                  alt="" 
                  className="block max-w-none w-full h-full" 
                  src="/assets/group-134.svg"
                />
              </div>
            </div>
            <div className="col-1 row-1 inline-grid grid-cols-[max-content] grid-rows-[max-content] items-start justify-items-start ml-0 mt-[17.6px]">
              <div className="col-1 row-1 flex items-center justify-center ml-0 mt-[3.32px] w-[15.428px] h-[15.084px]">
                <div className="flex-none scale-y-[-100%]">
                  <div className="w-[15.428px] h-[15.084px]">
                    <img 
                      alt="" 
                      className="block max-w-none w-full h-full" 
                      src="/assets/group-138.svg"
                    />
                  </div>
                </div>
              </div>
              <div className="col-1 row-1 flex items-center justify-center ml-[20.57px] mt-[3.32px] w-[15.428px] h-[15.084px]">
                <div className="flex-none scale-y-[-100%]">
                  <div className="w-[15.428px] h-[15.084px]">
                    <img 
                      alt="" 
                      className="block max-w-none w-full h-full" 
                      src="/assets/group-136.svg"
                    />
                  </div>
                </div>
              </div>
              <div className="col-1 row-1 flex items-center justify-center ml-[10.29px] mt-0 w-[15.428px] h-[15.084px]">
                <div className="flex-none scale-y-[-100%]">
                  <div className="w-[15.428px] h-[15.084px]">
                    <img 
                      alt="" 
                      className="block max-w-none w-full h-full" 
                      src="/assets/group-139.svg"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-1 row-1 ml-[11.66px] mt-[11.76px] w-[12.57px] h-[12.57px]">
              <div className="absolute inset-[-5.6%]">
                <img 
                  alt="" 
                  className="block max-w-none w-full h-full" 
                  src="/assets/ellipse-1.svg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col font-['Inter',sans-serif] font-normal h-[45px] justify-center leading-[0] not-italic shrink-0 text-[#1c1c1c] text-[27.8px] w-[80.11px]">
          <p className="leading-[45px] whitespace-pre-wrap">Log in</p>
        </div>

        {/* Google Button */}
        <div className="flex flex-col items-start pb-[10px] pt-0 px-0 shrink-0 w-full">
          <button
            onClick={handleGoogleLogin}
            className="bg-[#f7f4ed] border border-[#eceae4] border-solid h-[32px] rounded-[6px] shrink-0 w-[350px] relative"
          >
            <div className="absolute left-[calc(50%-71.77px)] w-[16px] h-[16px] top-1/2 -translate-x-1/2 -translate-y-1/2">
              <img 
                alt="" 
                className="block max-w-none w-full h-full" 
                src="/assets/google-icon.svg"
              />
            </div>
            <div className="absolute flex flex-col font-['Inter',sans-serif] font-normal h-[18px] justify-center leading-[0] left-[calc(50%+12.09px)] not-italic text-[#1c1c1c] text-[13.3px] text-center top-[calc(50%-0.5px)] -translate-x-1/2 -translate-y-1/2 w-[135.72px]">
              <p className="leading-[21px] whitespace-pre-wrap">Continue with Google</p>
            </div>
          </button>
        </div>

        {/* Divider with OR */}
        <div className="relative w-[350px] h-px border-t border-[#eceae4] border-solid shrink-0">
          <div className="absolute bg-white h-[18px] left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[31.73px]">
            <div className="absolute flex flex-col font-['Inter',sans-serif] font-normal h-[16px] justify-center leading-[0] left-[8px] not-italic text-[#5f5f5d] text-[11.3px] top-[9px] -translate-y-1/2 uppercase w-[15.93px]">
              <p className="leading-[18px] whitespace-pre-wrap">Or</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailLogin} className="h-[191px] relative shrink-0 w-[350px]">
          {/* Email Label */}
          <div className="absolute flex flex-col font-['Inter',sans-serif] font-normal h-[21px] justify-center leading-[0] left-0 not-italic text-[#1c1c1c] text-[13.9px] top-[10.5px] -translate-y-1/2 w-[34.89px]">
            <p className="leading-[21px] whitespace-pre-wrap">Email</p>
          </div>

          {/* Email Input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="absolute border border-[#eceae4] border-solid h-[36px] left-0 right-0 rounded-[6px] top-[25px] px-3 text-[13.9px] font-['Inter',sans-serif] outline-none focus:border-[#1c1c1c]"
            required
          />

          {/* Continue Button */}
          <button
            type="submit"
            className="absolute bg-[#1c1c1c] h-[32px] left-0 right-0 rounded-[6px] top-[77px]"
          >
            <div className="absolute flex flex-col font-['Inter',sans-serif] font-normal h-[18px] justify-center leading-[0] left-[calc(50%+0.09px)] not-italic text-[#fcfbf8] text-[13.5px] text-center top-[calc(50%-0.5px)] -translate-x-1/2 -translate-y-1/2 w-[57.51px]">
              <p className="leading-[21px] whitespace-pre-wrap">Continue</p>
            </div>
          </button>

          {/* Don't have account */}
          <div className="absolute flex flex-col font-['Inter',sans-serif] font-normal h-[18px] justify-center leading-[0] left-[calc(50%+0.1px)] not-italic text-[#5f5f5d] text-[0px] text-center top-[133px] -translate-x-1/2 -translate-y-1/2 w-[268.53px]">
            <p className="leading-[21px] text-[12.8px] whitespace-pre-wrap">
              <span>Don&apos;t have an account? </span>
              <a href="/signup" className="text-[#1c1c1c] underline decoration-solid">Create your account</a>
            </p>
          </div>

          {/* Divider */}
          <div className="absolute border-t border-[#eceae4] border-solid h-px left-0 right-0 top-[157px]" />

          {/* Lock Icon */}
          <div className="absolute left-[calc(50%-147.97px)] w-[16px] h-[16px] top-[calc(50%+85px)] -translate-x-1/2 -translate-y-1/2">
            <img 
              alt="" 
              className="block max-w-none w-full h-full" 
              src="/assets/lock-icon.svg"
            />
          </div>

          {/* SSO Text */}
          <div className="absolute flex gap-[2px] items-center left-[41.03px] top-[170px]">
            <div className="flex flex-col font-['Inter',sans-serif] font-normal h-[21px] justify-center leading-[0] not-italic shrink-0 text-[#5f5f5d] text-[13.2px] w-[105.03px]">
              <p className="leading-[21px] whitespace-pre-wrap">SSO available on </p>
            </div>
            <div className="h-[18px] shrink-0 w-[148.73px]">
              <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic text-[#5f5f5d] text-[13.2px] whitespace-nowrap">
                <p className="decoration-solid leading-[21px] underline whitespace-pre">Business and Enterprise</p>
              </div>
            </div>
            <div className="flex flex-col font-['Inter',sans-serif] font-normal justify-center leading-[0] not-italic shrink-0 text-[#5f5f5d] text-[13.2px] whitespace-nowrap">
              <p className="leading-[21px] whitespace-pre"> plans</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
