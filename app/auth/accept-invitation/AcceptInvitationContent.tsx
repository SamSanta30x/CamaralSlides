'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/AuthContext'

export default function AcceptInvitationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    loadInvitation(token)
  }, [searchParams])

  const loadInvitation = async (token: string) => {
    try {
      // Fetch invitation details
      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('invitation_token', token)
        .single()

      if (error || !data) {
        setError('Invitation not found or expired')
        setLoading(false)
        return
      }

      if (data.status !== 'pending') {
        setError(`This invitation has already been ${data.status}`)
        setLoading(false)
        return
      }

      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired')
        setLoading(false)
        return
      }

      setInvitation(data)
      setLoading(false)
    } catch (err) {
      console.error('Error loading invitation:', err)
      setError('Failed to load invitation')
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!user) {
      // Redirect to signup with invitation token
      router.push(`/signup?invitation=${invitation.invitation_token}`)
      return
    }

    if (user.email !== invitation.invited_email) {
      setError('This invitation is for a different email address')
      return
    }

    setLoading(true)
    try {
      // Accept the invitation
      const { error } = await supabase
        .from('team_invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('invitation_token', invitation.invitation_token)

      if (error) throw error

      // In production, you would also:
      // 1. Add user to the organization's team_members table
      // 2. Update user's metadata with organization info
      
      router.push('/dashboard?invited=true')
    } catch (err) {
      console.error('Error accepting invitation:', err)
      setError('Failed to accept invitation')
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'rejected' })
        .eq('invitation_token', invitation.invitation_token)

      if (error) throw error

      router.push('/dashboard')
    } catch (err) {
      console.error('Error rejecting invitation:', err)
      setError('Failed to reject invitation')
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#66e7f5] border-t-transparent"></div>
          <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white border border-[#e5e5e5] rounded-[16px] p-8 text-center">
            <div className="w-16 h-16 bg-[#fef2f2] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="font-['Inter',sans-serif] text-[24px] font-semibold text-[#0d0d0d] mb-2">
              Invalid Invitation
            </h1>
            <p className="font-['Inter',sans-serif] text-[16px] text-[#666] mb-6">
              {error}
            </p>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-[#0d0d0d] text-white rounded-[12px] px-6 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#2d2d2d] transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#66e7f5] to-[#4ade80] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white border border-[#e5e5e5] rounded-[16px] p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#66e7f5] to-[#4ade80] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M17 3.13C17.8604 3.3503 18.623 3.8507 19.1676 4.55231C19.7122 5.25392 20.0078 6.11683 20.0078 7.005C20.0078 7.89317 19.7122 8.75608 19.1676 9.45769C18.623 10.1593 17.8604 10.6597 17 10.88M12.5 7C12.5 9.20914 10.7091 11 8.5 11C6.29086 11 4.5 9.20914 4.5 7C4.5 4.79086 6.29086 3 8.5 3C10.7091 3 12.5 4.79086 12.5 7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="font-['Inter',sans-serif] text-[28px] font-bold text-[#0d0d0d] mb-2">
              You're Invited! 🎉
            </h1>
            <p className="font-['Inter',sans-serif] text-[16px] text-[#666]">
              <strong>{invitation.invited_by_name}</strong> has invited you to join
            </p>
            <p className="font-['Inter',sans-serif] text-[20px] font-semibold text-[#0d0d0d] mt-1">
              {invitation.organization_name}
            </p>
          </div>

          {/* Details */}
          <div className="bg-[#f5f5f5] rounded-[12px] p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-['Inter',sans-serif] text-[14px] text-[#666]">Role:</span>
              <span className={`px-2.5 py-1 rounded-[6px] font-['Inter',sans-serif] text-[12px] font-medium ${
                invitation.role === 'Admin'
                  ? 'bg-[#e0f2fe] text-[#0369a1] border border-[#7dd3fc]'
                  : 'bg-white text-[#666] border border-[#e5e5e5]'
              }`}>
                {invitation.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-['Inter',sans-serif] text-[14px] text-[#666]">Email:</span>
              <span className="font-['Inter',sans-serif] text-[14px] text-[#0d0d0d] font-medium">
                {invitation.invited_email}
              </span>
            </div>
          </div>

          {/* Actions */}
          {!user ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAccept}
                className="w-full bg-[#0d0d0d] text-white rounded-[12px] px-6 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#2d2d2d] transition-colors"
              >
                Sign up to accept
              </button>
              <p className="text-center font-['Inter',sans-serif] text-[14px] text-[#666]">
                Already have an account?{' '}
                <a href={`/login?invitation=${invitation.invitation_token}`} className="text-[#0d0d0d] font-medium hover:underline">
                  Log in
                </a>
              </p>
            </div>
          ) : user.email === invitation.invited_email ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleAccept}
                disabled={loading}
                className="w-full bg-[#0d0d0d] text-white rounded-[12px] px-6 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#2d2d2d] transition-colors disabled:opacity-50"
              >
                {loading ? 'Accepting...' : 'Accept Invitation'}
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="w-full bg-white border border-[#e5e5e5] text-[#0d0d0d] rounded-[12px] px-6 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#fafafa] transition-colors disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="font-['Inter',sans-serif] text-[14px] text-[#ef4444] mb-4">
                This invitation is for {invitation.invited_email}. Please log out and sign in with that email.
              </p>
              <button
                onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
                className="w-full bg-[#0d0d0d] text-white rounded-[12px] px-6 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#2d2d2d] transition-colors"
              >
                Log out
              </button>
            </div>
          )}

          {/* Expiry notice */}
          <p className="text-center font-['Inter',sans-serif] text-[12px] text-[#999] mt-6">
            This invitation expires on {new Date(invitation.expires_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
