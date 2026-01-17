'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { useToast } from '@/components/Toast'
import DashboardHeader from '@/components/DashboardHeader'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface TeamMember {
  id: string
  name: string
  email: string
  role: 'Owner' | 'Admin' | 'Member'
  avatar: string
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'Paid' | 'Pending' | 'Failed'
  invoice: string
}

function SettingsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { showToast, ToastContainer } = useToast()
  const supabase = createClient()
  
  // Get tab from URL or default to 'profile'
  const tabFromUrl = searchParams.get('tab') as 'profile' | 'team' | 'billing' | null
  const [activeTab, setActiveTab] = useState<'profile' | 'team' | 'billing'>(tabFromUrl || 'profile')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [language, setLanguage] = useState('Spanish')
  
  // Organization and team states
  const [isOrganization, setIsOrganization] = useState(false) // Personal vs Organization account
  const [organizationName, setOrganizationName] = useState('Personal Account')
  const [originalOrgName, setOriginalOrgName] = useState('Personal Account')
  const [inviteEmail, setInviteEmail] = useState('')
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false) // Track if data has been loaded
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  // Loading states
  const [savingName, setSavingName] = useState(false)
  const [sendingInvitation, setSendingInvitation] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Samuel Santa', email: 'sam@camaral.ai', role: 'Owner', avatar: '/assets/avatar-demo.png' },
  ])
  const [currentPlan] = useState({
    name: 'Pro Plan',
    price: 29,
    interval: 'month',
    features: [
      'Unlimited presentations',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Team collaboration'
    ]
  })
  const [billingHistory] = useState([
    { id: '1', date: 'Jan 15, 2026', amount: 29.00, status: 'Paid', invoice: 'INV-2026-001' },
    { id: '2', date: 'Dec 15, 2025', amount: 29.00, status: 'Paid', invoice: 'INV-2025-012' },
    { id: '3', date: 'Nov 15, 2025', amount: 29.00, status: 'Paid', invoice: 'INV-2025-011' },
  ])

  const handleInviteMember = async () => {
    if (!isOrganization) {
      showToast('Convert to Organization account first', 'error')
      return
    }
    
    if (!inviteEmail || !inviteEmail.includes('@')) {
      showToast('Please enter a valid email address', 'error')
      return
    }

    if (teamMembers.some(member => member.email === inviteEmail)) {
      showToast('This email is already a team member', 'error')
      return
    }

    setSendingInvitation(true)
    try {
      const inviterName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Someone'
      const orgName = organizationName || 'the team'
      
      // Get the session to include authorization header
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }
      
      // Call the send-team-invitation Edge Function
      const { data, error } = await supabase.functions.invoke('send-team-invitation', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          invitedEmail: inviteEmail,
          organizationName: orgName,
          inviterName: inviterName,
          role: 'Member'
        }
      })

      if (error) {
        throw error
      }

      // Add member to local state (in production, this would come from database)
      const newMember: TeamMember = {
        id: String(Date.now()),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: 'Member',
        avatar: '/assets/avatar-demo.png',
      }
      
      setTeamMembers([...teamMembers, newMember])
      setInviteEmail('')
      showToast('Invitation email sent successfully!', 'success')
      
      console.log('Invitation sent:', data)
    } catch (error) {
      console.error('Error sending invitation:', error)
      showToast(`Failed to send invitation: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setSendingInvitation(false)
    }
  }

  const handleRemoveMember = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId)
    if (!member) return
    
    if (member.role === 'Owner') {
      showToast('Cannot remove the owner', 'error')
      return
    }

    if (confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      setTeamMembers(teamMembers.filter(m => m.id !== memberId))
      showToast('Member removed successfully!', 'success')
    }
  }

  const handleChangeRole = (memberId: string, newRole: TeamMember['role']) => {
    setTeamMembers(teamMembers.map(member =>
      member.id === memberId ? { ...member, role: newRole } : member
    ))
    setEditingRoleId(null)
    showToast('Role updated successfully!', 'success')
  }

  const handleConvertToOrganization = () => {
    console.log('🔍 handleConvertToOrganization called') // Debug log
    if (confirm('Convert your personal account to an organization? You can add team members and manage permissions.')) {
      console.log('✅ User confirmed conversion') // Debug log
      setIsOrganization(true)
      setOrganizationName('My Organization')
      setOriginalOrgName('My Organization')
      showToast('Account converted to Organization!', 'success')
    } else {
      console.log('❌ User cancelled conversion') // Debug log
    }
  }

  const handleSaveOrganizationName = () => {
    if (!organizationName.trim()) {
      showToast('Organization name cannot be empty', 'error')
      return
    }

    setOriginalOrgName(organizationName)
    showToast('Organization name updated!', 'success')
  }

  const handleUpdateName = async () => {
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error')
      return
    }

    setSavingName(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name }
      })

      if (error) throw error

      showToast('Name updated successfully!', 'success')
    } catch (error) {
      console.error('Error updating name:', error)
      showToast(`Failed to update name: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setSavingName(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      showToast('Please fill in all password fields', 'error')
      return
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error')
      return
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    setSavingName(true) // Reusing loading state
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      showToast('Password changed successfully!', 'success')
      setIsChangingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error changing password:', error)
      showToast(`Failed to change password: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    } finally {
      setSavingName(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
    
    // Load user data (only on initial load)
    if (user && !hasInitialized) {
      setEmail(user.email || '')
      setName(user.user_metadata?.full_name || user.email?.split('@')[0] || '')
      
      // Initialize organization data
      const isOrg = user.user_metadata?.is_organization || false
      const orgName = user.user_metadata?.organization_name || (isOrg ? 'My Organization' : 'Personal Account')
      setIsOrganization(isOrg)
      setOrganizationName(orgName)
      setOriginalOrgName(orgName) // Initialize original name to prevent false "Save" button
      setHasInitialized(true) // Mark as initialized
    }
  }, [user, authLoading, router, hasInitialized])

  // Update activeTab when URL changes
  useEffect(() => {
    if (tabFromUrl && ['profile', 'team', 'billing'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#66e7f5] border-t-transparent"></div>
          <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Toast Notifications */}
      <ToastContainer />
      
      {/* Header */}
      <DashboardHeader showMenu={true} />

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-[280px] p-6">
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] font-['Inter',sans-serif] text-[16px] transition-colors ${
                activeTab === 'profile'
                  ? 'bg-[#f5f5f5] text-[#0d0d0d]'
                  : 'text-[#666] hover:bg-[#fafafa]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 18C3 14.134 6.13401 11 10 11C13.866 11 17 14.134 17 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Profile
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] font-['Inter',sans-serif] text-[16px] transition-colors ${
                activeTab === 'team'
                  ? 'bg-[#f5f5f5] text-[#0d0d0d]'
                  : 'text-[#666] hover:bg-[#fafafa]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="14" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M1 16C1 13.2386 3.23858 11 6 11H8C10.7614 11 13 13.2386 13 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M13 13C14.6569 13 16 14.3431 16 16V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Team
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] font-['Inter',sans-serif] text-[16px] transition-colors ${
                activeTab === 'billing'
                  ? 'bg-[#f5f5f5] text-[#0d0d0d]'
                  : 'text-[#666] hover:bg-[#fafafa]'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 8H18" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              Plan & billing
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-10">
          <div className="max-w-[600px]">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-8">
                <h1 className="font-['Inter',sans-serif] text-[24px] font-semibold text-[#0d0d0d]">
                  Profile
                </h1>

                {/* Avatar + Name + Email */}
                <div className="flex items-center gap-4">
                  <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#66e7f5] to-[#4ade80] flex items-center justify-center overflow-hidden">
                    <Image
                      src="/assets/avatar-demo.png"
                      alt="Profile"
                      width={60}
                      height={60}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="font-['Inter',sans-serif] text-[16px] font-semibold text-[#0d0d0d]">
                      {name || 'User'}
                    </p>
                    <p className="font-['Inter',sans-serif] text-[16px] text-[#666]">
                      {email}
                    </p>
                  </div>
                </div>

                {/* Name Input with Save Button */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d]">
                    Name
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Enter your name'}
                      className="flex-1 bg-white border border-[#e5e5e5] rounded-[12px] px-4 py-3 font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] outline-none focus:border-[#66e7f5] transition-colors placeholder:text-[#999]"
                    />
                    <button
                      onClick={handleUpdateName}
                      disabled={savingName}
                      className="bg-[#0d0d0d] text-white rounded-[12px] px-6 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#2d2d2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingName ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>

                {/* Email Input (disabled) */}
                <div className="flex flex-col gap-2">
                  <label className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d]">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    placeholder={user?.email || 'your.email@example.com'}
                    disabled
                    className="w-full bg-[#f5f5f5] border border-[#e5e5e5] rounded-[12px] px-4 py-3 font-['Inter',sans-serif] text-[16px] text-[#999] outline-none cursor-not-allowed"
                  />
                  <p className="font-['Inter',sans-serif] text-[14px] text-[#999]">
                    Email cannot be changed
                  </p>
                </div>

                {/* Change Password Section */}
                {!isChangingPassword ? (
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full bg-white border border-[#e5e5e5] text-[#0d0d0d] rounded-[12px] px-6 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#fafafa] transition-colors"
                  >
                    Change password
                  </button>
                ) : (
                  <div className="flex flex-col gap-4 p-6 border border-[#e5e5e5] rounded-[12px]">
                    <h3 className="font-['Inter',sans-serif] text-[16px] font-semibold text-[#0d0d0d]">
                      Change Password
                    </h3>

                    {/* New Password */}
                    <div className="flex flex-col gap-2">
                      <label className="font-['Inter',sans-serif] text-[14px] font-medium text-[#0d0d0d]">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-white border border-[#e5e5e5] rounded-[12px] px-4 py-3 font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] outline-none focus:border-[#66e7f5] transition-colors"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-2">
                      <label className="font-['Inter',sans-serif] text-[14px] font-medium text-[#0d0d0d]">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full bg-white border border-[#e5e5e5] rounded-[12px] px-4 py-3 font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] outline-none focus:border-[#66e7f5] transition-colors"
                      />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setIsChangingPassword(false)
                          setCurrentPassword('')
                          setNewPassword('')
                          setConfirmPassword('')
                        }}
                        className="flex-1 bg-white border border-[#e5e5e5] text-[#0d0d0d] rounded-[12px] px-6 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#fafafa] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleChangePassword}
                        disabled={savingName}
                        className="flex-1 bg-[#0d0d0d] text-white rounded-[12px] px-6 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#2d2d2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingName ? 'Saving...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Preferences Section */}
                <div className="flex flex-col gap-6 pt-6 border-t border-[#e5e5e5]">
                  <h2 className="font-['Inter',sans-serif] text-[16px] font-semibold text-[#0d0d0d]">
                    Preferences
                  </h2>

                  {/* Language */}
                  <div className="flex flex-col gap-2">
                    <label className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d]">
                      Language
                    </label>
                    <div className="relative w-full bg-white border border-[#e5e5e5] rounded-[12px] px-4 py-3 flex items-center justify-between cursor-pointer hover:border-[#66e7f5] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
                          <span className="text-[16px]">🇪🇸</span>
                        </div>
                        <span className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">
                          {language}
                        </span>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M6 8L10 12L14 8" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="flex flex-col gap-8">
                <h1 className="font-['Inter',sans-serif] text-[24px] font-semibold text-[#0d0d0d]">
                  Team
                </h1>

                {/* Account Type Badge */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-[8px] font-['Inter',sans-serif] text-[14px] font-medium ${
                    isOrganization
                      ? 'bg-[#CBFFA3] text-[#0d0d0d] border border-[#88E73F]'
                      : 'bg-[#f5f5f5] text-[#666] border border-[#e5e5e5]'
                  }`}>
                    {isOrganization ? '🏢 Organization Account' : '👤 Personal Account'}
                  </span>
                </div>

                {/* Convert to Organization (only for personal accounts) */}
                {!isOrganization && (
                  <div className="p-6 bg-[#f5f5f5] border border-[#e5e5e5] rounded-[12px] flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#66e7f5] flex items-center justify-center flex-shrink-0">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 2L3 7V16C3 16.5523 3.44772 17 4 17H16C16.5523 17 17 16.5523 17 16V7L10 2Z" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 17V10H13V17" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-['Inter',sans-serif] text-[16px] font-semibold text-[#0d0d0d] mb-1">
                          Upgrade to Organization
                        </h3>
                        <p className="font-['Inter',sans-serif] text-[14px] text-[#666] mb-4">
                          Convert your personal account to an organization to invite team members, manage permissions, and collaborate with your team.
                        </p>
                        <button
                          onClick={handleConvertToOrganization}
                          className="bg-[#0d0d0d] text-white rounded-[12px] px-6 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#2d2d2d] transition-colors"
                        >
                          Convert to Organization
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Organization Name (only for organizations) */}
                {isOrganization && (
                  <div className="flex flex-col gap-2">
                    <label className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d]">
                      Organization name
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={organizationName}
                        onChange={(e) => setOrganizationName(e.target.value)}
                        placeholder="Enter organization name"
                        className="flex-1 bg-white border border-[#e5e5e5] rounded-[12px] px-4 py-3 font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] outline-none focus:border-[#66e7f5] transition-colors"
                      />
                      {organizationName !== originalOrgName && (
                        <button
                          onClick={handleSaveOrganizationName}
                          className="bg-[#0d0d0d] text-white rounded-[12px] px-6 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#2d2d2d] transition-colors whitespace-nowrap"
                        >
                          Save
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Invite Member Section (only for organizations) */}
                {isOrganization && (
                  <div className="flex flex-col gap-3 pt-6 border-t border-[#e5e5e5]">
                    <label className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d]">
                      Invite team member
                    </label>
                    <p className="font-['Inter',sans-serif] text-[14px] text-[#666]">
                      Send an invitation to join your organization
                    </p>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleInviteMember()}
                        placeholder="email@example.com"
                        className="flex-1 bg-white border border-[#e5e5e5] rounded-[12px] px-4 py-3 font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] placeholder:text-[#999] outline-none focus:border-[#66e7f5] transition-colors"
                      />
                      <button
                        onClick={handleInviteMember}
                        disabled={sendingInvitation}
                        className="bg-[#0d0d0d] text-white rounded-[12px] px-6 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#2d2d2d] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sendingInvitation ? 'Sending...' : 'Send invite'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Team Members List */}
                <div className="flex flex-col gap-3 pt-6 border-t border-[#e5e5e5]">
                  <div className="flex items-center justify-between">
                    <h2 className="font-['Inter',sans-serif] text-[16px] font-semibold text-[#0d0d0d]">
                      Team members
                    </h2>
                    <span className="font-['Inter',sans-serif] text-[14px] text-[#666]">
                      {teamMembers.length} {teamMembers.length === 1 ? 'member' : 'members'}
                    </span>
                  </div>

                  {/* Members List */}
                  <div className="flex flex-col gap-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-white border border-[#e5e5e5] rounded-[12px] hover:bg-[#fafafa] transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-br from-[#66e7f5] to-[#4ade80] flex items-center justify-center overflow-hidden flex-shrink-0">
                            <Image
                              src={member.avatar}
                              alt={member.name}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          
                          {/* Info */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <p className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d] truncate">
                              {member.name}
                            </p>
                            <p className="font-['Inter',sans-serif] text-[14px] text-[#666] truncate">
                              {member.email}
                            </p>
                          </div>
                        </div>

                        {/* Role and Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Role Selector (only for non-owners in organizations) */}
                          {isOrganization && member.role !== 'Owner' ? (
                            editingRoleId === member.id ? (
                              <div className="flex items-center gap-2">
                                <select
                                  value={member.role}
                                  onChange={(e) => handleChangeRole(member.id, e.target.value as 'Admin' | 'Member')}
                                  className="px-2.5 py-1 rounded-[6px] font-['Inter',sans-serif] text-[12px] font-medium border border-[#e5e5e5] bg-white outline-none focus:border-[#66e7f5]"
                                >
                                  <option value="Admin">Admin</option>
                                  <option value="Member">Member</option>
                                </select>
                                <button
                                  onClick={() => setEditingRoleId(null)}
                                  className="p-1 text-[#666] hover:text-[#0d0d0d]"
                                >
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingRoleId(member.id)}
                                className={`px-2.5 py-1 rounded-[6px] font-['Inter',sans-serif] text-[12px] font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                                  member.role === 'Admin'
                                    ? 'bg-[#e0f2fe] text-[#0369a1] border border-[#7dd3fc]'
                                    : 'bg-[#f5f5f5] text-[#666] border border-[#e5e5e5]'
                                }`}
                              >
                                {member.role}
                              </button>
                            )
                          ) : (
                            <span className={`px-2.5 py-1 rounded-[6px] font-['Inter',sans-serif] text-[12px] font-medium ${
                              member.role === 'Owner'
                                ? 'bg-[#CBFFA3] text-[#0d0d0d] border border-[#88E73F]'
                                : member.role === 'Admin'
                                ? 'bg-[#e0f2fe] text-[#0369a1] border border-[#7dd3fc]'
                                : 'bg-[#f5f5f5] text-[#666] border border-[#e5e5e5]'
                            }`}>
                              {member.role}
                            </span>
                          )}

                          {/* Remove Button (only if not Owner and is organization) */}
                          {isOrganization && member.role !== 'Owner' && (
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1.5 text-[#666] hover:text-[#ef4444] hover:bg-[#fef2f2] rounded-[6px] transition-colors"
                              title="Remove member"
                            >
                              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                                <path d="M4 6H16M8 9V14M12 9V14M5 6L6 16C6 17.1046 6.89543 18 8 18H12C13.1046 18 14 17.1046 14 16L15 6M7 6V4C7 3.44772 7.44772 3 8 3H12C12.5523 3 13 3.44772 13 4V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="flex flex-col gap-8">
                <h1 className="font-['Inter',sans-serif] text-[24px] font-semibold text-[#0d0d0d]">
                  Plan & billing
                </h1>

                {/* Current Plan */}
                <div className="flex flex-col gap-4 p-6 bg-white border border-[#e5e5e5] rounded-[12px]">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <h2 className="font-['Inter',sans-serif] text-[20px] font-semibold text-[#0d0d0d]">
                        {currentPlan.name}
                      </h2>
                      <p className="font-['Inter',sans-serif] text-[14px] text-[#666]">
                        Your current plan
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-['Inter',sans-serif] text-[32px] font-bold text-[#0d0d0d]">
                        ${currentPlan.price}
                      </span>
                      <span className="font-['Inter',sans-serif] text-[16px] text-[#666]">
                        /{currentPlan.interval}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-[#e5e5e5]">
                    {currentPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" fill="#CBFFA3" stroke="#88E73F" strokeWidth="1.5"/>
                          <path d="M5 8L7 10L11 6" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-[#e5e5e5]">
                    <button className="flex-1 bg-[#0d0d0d] text-white rounded-[12px] px-4 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#2d2d2d] transition-colors">
                      Upgrade plan
                    </button>
                    <button className="flex-1 bg-white border border-[#e5e5e5] text-[#0d0d0d] rounded-[12px] px-4 py-3 font-['Inter',sans-serif] text-[16px] font-medium hover:bg-[#fafafa] transition-colors">
                      Cancel subscription
                    </button>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="flex flex-col gap-3">
                  <label className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d]">
                    Payment method
                  </label>
                  <div className="flex items-center justify-between p-4 bg-white border border-[#e5e5e5] rounded-[12px]">
                    <div className="flex items-center gap-3">
                      <div className="w-[40px] h-[28px] bg-[#0d0d0d] rounded-[4px] flex items-center justify-center">
                        <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                          <rect x="0.5" y="0.5" width="23" height="15" rx="1.5" fill="white" stroke="#e5e5e5"/>
                          <rect x="2" y="2" width="20" height="3" rx="1" fill="#0d0d0d"/>
                          <rect x="2" y="7" width="8" height="2" rx="1" fill="#e5e5e5"/>
                          <rect x="2" y="10" width="6" height="2" rx="1" fill="#e5e5e5"/>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <p className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d]">
                          •••• •••• •••• 4242
                        </p>
                        <p className="font-['Inter',sans-serif] text-[14px] text-[#666]">
                          Expires 12/2028
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white border border-[#e5e5e5] text-[#0d0d0d] rounded-[8px] font-['Inter',sans-serif] text-[14px] font-medium hover:bg-[#fafafa] transition-colors">
                      Update
                    </button>
                  </div>
                </div>

                {/* Billing History */}
                <div className="flex flex-col gap-3 pt-6 border-t border-[#e5e5e5]">
                  <div className="flex items-center justify-between">
                    <h2 className="font-['Inter',sans-serif] text-[16px] font-semibold text-[#0d0d0d]">
                      Billing history
                    </h2>
                    <button className="px-3 py-1.5 bg-white border border-[#e5e5e5] text-[#0d0d0d] rounded-[8px] font-['Inter',sans-serif] text-[14px] font-medium hover:bg-[#fafafa] transition-colors">
                      Download all
                    </button>
                  </div>

                  {/* History List */}
                  <div className="flex flex-col gap-2">
                    {billingHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-white border border-[#e5e5e5] rounded-[12px] hover:bg-[#fafafa] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <p className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d]">
                              {item.invoice}
                            </p>
                            <p className="font-['Inter',sans-serif] text-[14px] text-[#666]">
                              {item.date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-end">
                            <p className="font-['Inter',sans-serif] text-[16px] font-medium text-[#0d0d0d]">
                              ${item.amount.toFixed(2)}
                            </p>
                            <span className="px-2.5 py-1 rounded-[6px] bg-[#CBFFA3] text-[#0d0d0d] border border-[#88E73F] font-['Inter',sans-serif] text-[12px] font-medium">
                              {item.status}
                            </span>
                          </div>
                          <button className="p-1.5 text-[#666] hover:text-[#0d0d0d] hover:bg-[#f5f5f5] rounded-[6px] transition-colors">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M8 2V10M8 10L5 7M8 10L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M2 12V13C2 13.5523 2.44772 14 3 14H13C13.5523 14 14 13.5523 14 13V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#66e7f5] border-t-transparent"></div>
          <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d]">Loading...</p>
        </div>
      </div>
    }>
      <SettingsContent />
    </Suspense>
  )
}
