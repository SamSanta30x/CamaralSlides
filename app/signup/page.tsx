'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'

function SignUpForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasNumber: false
  })
  const { signUp, signInWithGoogle, user } = useAuth()
  const router = useRouter()
  
  // Show password field when email is filled
  const showPasswordField = email.trim() !== ''

  useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  useEffect(() => {
    // Validate password in real-time
    setPasswordValidation({
      minLength: password.length >= 8,
      hasNumber: /\d/.test(password)
    })
  }, [password])

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError('')
    const { error } = await signInWithGoogle()
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Check if there's an invitation token to redirect back to
      const invitationToken = searchParams.get('invitation')
      if (invitationToken) {
        // Redirect back to accept invitation page after signup
        router.push(`/auth/accept-invitation?token=${invitationToken}`)
      } else {
        // Normal flow - redirect to verify email page
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
      }
    }
  }

  return (
    <div className="relative min-h-screen bg-[#fcfbf8] flex">
      {/* Left Side - Form */}
      <div className="w-[720px] flex items-center justify-center px-8 py-[111px]">
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
          <h1 className="font-['Inter',sans-serif] font-normal text-[28.4px] leading-[45px] text-[#1c1c1c] mb-2">
            Create your account
          </h1>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignup}
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
          <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-[6px] text-[13px]">
                {error}
              </div>
            )}


            {/* Email Section */}
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
                disabled={loading}
                autoFocus={!email}
              />
            </div>

            {/* Password Label and Input - Show when email is filled */}
            {showPasswordField && (
              <>
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
                    autoFocus={!!email}
                  />
                </div>

                {/* Password Requirements */}
                <div className="flex flex-col gap-1">
                  <p className="font-['Inter',sans-serif] text-[13.9px] leading-[21px] text-[#1c1c1c]">
                    Password must contain:
                  </p>
                  <ul className="list-disc list-inside text-[#5f5f5d] font-['Inter',sans-serif] text-[11.1px] leading-[18px]">
                    <li className={passwordValidation.minLength ? 'text-green-600' : ''}>
                      at least 8 characters
                    </li>
                    <li className={passwordValidation.hasNumber ? 'text-green-600' : ''}>
                      a number (0-9)
                    </li>
                  </ul>
                </div>
              </>
            )}

            {/* Terms Text */}
            <div className="text-[#5f5f5d] font-['Inter',sans-serif] text-[11.1px] leading-[18px]">
              <span>By continuing, you agree to the </span>
              <a href="/terms" className="underline">Terms of Service</a>
              <span> and </span>
              <a href="/privacy" className="underline">Privacy Policy</a>
              <span>.</span>
            </div>

            {/* Continue/Create Account Button */}
            {showPasswordField && (
              <button
                type="submit"
                className="bg-[#1c1c1c] h-[32px] rounded-[6px] font-['Inter',sans-serif] text-[13.5px] leading-[21px] text-[#fcfbf8] hover:bg-[#333] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !passwordValidation.minLength || !passwordValidation.hasNumber}
              >
                {loading ? 'Loading...' : 'Create your account'}
              </button>
            )}

            {/* Already have account */}
            <div className="text-center">
              <span className="font-['Inter',sans-serif] text-[12.8px] leading-[21px] text-[#5f5f5d]">
                Already have an account?{' '}
                <Link href="/login" className="text-[#1c1c1c] underline">
                  Log in
                </Link>
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

      {/* Right Side - Image Banner */}
      <div className="flex-1 relative">
        <div className="sticky top-0 h-screen p-4">
          <div className="relative h-full rounded-[12px] overflow-hidden">
            <img 
              alt="Sign up banner" 
              className="absolute inset-0 w-full h-full object-cover"
              src="/assets/login-banner.png"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center">
        <p className="font-['Inter',sans-serif] text-[16px] text-[#1c1c1c]">Loading...</p>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  )
}
