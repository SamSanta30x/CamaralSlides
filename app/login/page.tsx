'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import { checkEmailExists } from '@/lib/auth/checkEmail'

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isGoogleAccount, setIsGoogleAccount] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const { signIn, signInWithGoogle, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    // If email comes from query param, check it automatically
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
      handleEmailCheck(emailParam)
    }
  }, [searchParams])

  const handleEmailCheck = async (emailToCheck: string) => {
    setCheckingEmail(true)
    setError('')
    
    const { exists, isGoogleAccount: isGoogle } = await checkEmailExists(emailToCheck)
    
    if (isGoogle) {
      setIsGoogleAccount(true)
      setShowPassword(false)
    } else if (!exists) {
      // Email not registered, redirect to signup without page reload
      router.replace(`/signup?email=${encodeURIComponent(emailToCheck)}`)
      return
    } else {
      // Email exists and is not Google, show password field
      setIsGoogleAccount(false)
      setShowPassword(true)
    }
    
    setCheckingEmail(false)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!showPassword && !isGoogleAccount) {
      await handleEmailCheck(email)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="relative min-h-screen bg-[#fcfbf8] flex">
      {/* Left Side - Form */}
      <div className="w-[720px] flex items-center justify-center px-8 py-[115px]">
        <div className="flex flex-col gap-[10px] w-[350px]">
          {/* Logo Icon */}
          <div className="w-[48px] h-[48px] mb-2">
            <img 
              alt="Camaral" 
              className="w-full h-full" 
              src="/favicon.svg"
            />
          </div>

          {/* Title */}
          <h1 className="font-['Inter',sans-serif] font-normal text-[27.8px] leading-[45px] text-[#1c1c1c] mb-2">
            Log in
          </h1>

          {/* Google Button */}
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

          {/* Divider with OR */}
          <div className="relative w-full h-px border-t border-[#eceae4] my-2">
            <div className="absolute bg-[#fcfbf8] px-2 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="font-['Inter',sans-serif] text-[11.3px] leading-[18px] text-[#5f5f5d] uppercase">
                Or
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={showPassword ? handlePasswordLogin : handleEmailSubmit} className="flex flex-col gap-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-[6px] text-[13px]">
                {error}
              </div>
            )}

            {/* Google Account Message */}
            {isGoogleAccount && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-[6px] text-[13px]">
                This email uses Google sign-in. Please use "Continue with Google" button above.
              </div>
            )}

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
                disabled={loading || checkingEmail || showPassword}
              />
            </div>

            {/* Password Label and Input - Only show if email is verified and not Google */}
            {showPassword && !isGoogleAccount && (
              <div className="flex flex-col gap-1">
                <label className="font-['Inter',sans-serif] text-[13.9px] leading-[21px] text-[#1c1c1c]">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border border-[#eceae4] h-[36px] rounded-[6px] px-3 text-[13.9px] font-['Inter',sans-serif] outline-none focus:border-[#1c1c1c]"
                  required
                  disabled={loading}
                  minLength={8}
                />
              </div>
            )}

            {/* Continue Button */}
            {!isGoogleAccount && (
              <button
                type="submit"
                className="bg-[#1c1c1c] h-[32px] rounded-[6px] font-['Inter',sans-serif] text-[13.5px] leading-[21px] text-[#fcfbf8] hover:bg-[#333] mt-[16px] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || checkingEmail}
              >
                {checkingEmail ? 'Checking...' : loading ? 'Loading...' : 'Continue'}
              </button>
            )}

            {/* Don't have account */}
            <div className="text-center mt-[24px]">
              <span className="font-['Inter',sans-serif] text-[12.8px] leading-[21px] text-[#5f5f5d]">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-[#1c1c1c] underline">
                  Create your account
                </Link>
              </span>
            </div>

            {/* Divider */}
            <div className="border-t border-[#eceae4] mt-[24px]" />

            {/* SSO Text with Lock Icon */}
            <div className="flex items-center justify-center gap-2 mt-[24px]">
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

      {/* Right Side - Image Banner */}
      <div className="flex-1 relative">
        <div className="sticky top-0 h-screen p-4">
          <div className="relative h-full rounded-[12px] overflow-hidden">
            <img 
              alt="Login banner" 
              className="absolute inset-0 w-full h-full object-cover"
              src="/assets/login-banner-pink.png"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center">
        <p className="font-['Inter',sans-serif] text-[16px] text-[#1c1c1c]">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
