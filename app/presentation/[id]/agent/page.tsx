'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/lib/auth/AuthContext'
import { getPresentation, updatePresentationObjective, updateAgentConfig, type Presentation } from '@/lib/supabase/presentations'
import DashboardHeader from '@/components/DashboardHeader'
import DescriptionTextarea from '@/components/DescriptionTextarea'

export default function AgentPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [name, setName] = useState('Max')
  const [voice, setVoice] = useState('Alejandro')
  const [language, setLanguage] = useState('Spanish')
  const [firstMessage, setFirstMessage] = useState("Hello! I'm Emma, your AI assistant. How can I help you today?")
  const [objective, setObjective] = useState('')
  const [description, setDescription] = useState('')
  const [showVoiceDropdown, setShowVoiceDropdown] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const objectiveSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const agentSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const voices = ['Alejandro', 'Emma', 'Max', 'Sofia', 'James']
  const languages = ['Spanish', 'English', 'French', 'German', 'Portuguese']

  const presentationId = params.id as string

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user && presentationId) {
      loadPresentation()
    }
  }, [user, presentationId])

  const loadPresentation = async () => {
    const { data, error } = await getPresentation(presentationId)
    
    if (error) {
      console.error('Error loading presentation:', error)
      return
    }

    if (data) {
      setPresentation(data)
      setObjective(data.objective || '')
      setName(data.agent_name || 'Max')
      setVoice(data.agent_voice || 'Alejandro')
      setLanguage(data.agent_language || 'Spanish')
      setFirstMessage(data.agent_first_message || "Hello! I'm Emma, your AI assistant. How can I help you today?")
      setDescription(data.agent_description || '')
    }
  }

  const handleObjectiveChange = (newObjective: string) => {
    setObjective(newObjective)
    
    // Clear existing timeout
    if (objectiveSaveTimeoutRef.current) {
      clearTimeout(objectiveSaveTimeoutRef.current)
    }

    // Debounce save for 500ms
    objectiveSaveTimeoutRef.current = setTimeout(async () => {
      if (!presentation) return

      try {
        const { error } = await updatePresentationObjective(presentationId, newObjective)
        
        if (error) {
          console.error('Error saving objective:', error)
        } else {
          setPresentation({
            ...presentation,
            objective: newObjective
          })
        }
      } catch (error) {
        console.error('Error saving objective:', error)
      }
    }, 500)
  }

  const saveAgentConfig = async (config: {
    agent_name?: string
    agent_voice?: string
    agent_language?: string
    agent_first_message?: string
    agent_description?: string
  }) => {
    if (!presentation) return

    try {
      const { error } = await updateAgentConfig(presentationId, config)
      
      if (error) {
        console.error('Error saving agent config:', error)
      } else {
        setPresentation({
          ...presentation,
          ...config
        })
      }
    } catch (error) {
      console.error('Error saving agent config:', error)
    }
  }

  const handleAgentFieldChange = (field: string, value: string) => {
    // Clear existing timeout
    if (agentSaveTimeoutRef.current) {
      clearTimeout(agentSaveTimeoutRef.current)
    }

    // Debounce save for 500ms
    agentSaveTimeoutRef.current = setTimeout(() => {
      saveAgentConfig({ [field]: value })
    }, 500)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    handleAgentFieldChange('agent_name', newName)
  }

  const handleVoiceSelect = (selectedVoice: string) => {
    setVoice(selectedVoice)
    setShowVoiceDropdown(false)
    handleAgentFieldChange('agent_voice', selectedVoice)
  }

  const handleLanguageSelect = (selectedLanguage: string) => {
    setLanguage(selectedLanguage)
    setShowLanguageDropdown(false)
    handleAgentFieldChange('agent_language', selectedLanguage)
  }

  const handleFirstMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newMessage = e.target.value
    setFirstMessage(newMessage)
    handleAgentFieldChange('agent_first_message', newMessage)
  }

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription)
    handleAgentFieldChange('agent_description', newDescription)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (objectiveSaveTimeoutRef.current) {
        clearTimeout(objectiveSaveTimeoutRef.current)
      }
      if (agentSaveTimeoutRef.current) {
        clearTimeout(agentSaveTimeoutRef.current)
      }
    }
  }, [])

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
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header with Menu and Tabs */}
      <DashboardHeader showMenu={true} showTabs={true} presentationId={presentationId} activeTab="agent" />

      {/* Main Content */}
      <div className="w-[840px] flex flex-col gap-[40px] px-0 py-[20px]">
        {/* Name Field */}
        <div className="flex flex-col gap-[10px]">
          <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px] focus:outline-none focus:border-[#66e7f5]"
          />
        </div>

        {/* Voice and Language Row */}
        <div className="flex gap-[20px]">
          {/* Voice Selector */}
          <div className="flex flex-col gap-[10px] w-[420px]">
            <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
              Voice
            </label>
            <div className="relative">
              <button 
                onClick={() => setShowVoiceDropdown(!showVoiceDropdown)}
                className="w-full bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] flex items-center justify-between focus:outline-none focus:border-[#66e7f5]"
              >
                <div className="flex items-center gap-[6px]">
                  <div className="w-[24px] h-[24px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {voice.charAt(0)}
                  </div>
                  <span className="font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
                    {voice}
                  </span>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={`rotate-90 transition-transform ${showVoiceDropdown ? 'rotate-[270deg]' : ''}`}>
                  <path d="M9 6L15 12L9 18" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {showVoiceDropdown && (
                <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#dcdcdc] rounded-[20.751px] shadow-lg z-10 overflow-hidden">
                  {voices.map((v) => (
                    <button
                      key={v}
                      onClick={() => handleVoiceSelect(v)}
                      className="w-full px-[19.44px] py-[12.96px] flex items-center gap-[6px] hover:bg-[#f5f5f5] transition-colors"
                    >
                      <div className="w-[24px] h-[24px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                        {v.charAt(0)}
                      </div>
                      <span className="font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
                        {v}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex flex-col gap-[10px] w-[400px]">
            <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
              Language
            </label>
            <div className="relative">
              <button 
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="w-full bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] flex items-center justify-between focus:outline-none focus:border-[#66e7f5]"
              >
                <div className="flex items-center gap-[6px]">
                  <div className="w-[24px] h-[24px] rounded-full overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-b from-red-500 via-yellow-400 to-red-500"></div>
                  </div>
                  <span className="font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
                    {language}
                  </span>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={`rotate-90 transition-transform ${showLanguageDropdown ? 'rotate-[270deg]' : ''}`}>
                  <path d="M9 6L15 12L9 18" stroke="#0d0d0d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              {showLanguageDropdown && (
                <div className="absolute top-full left-0 right-0 mt-[4px] bg-white border border-[#dcdcdc] rounded-[20.751px] shadow-lg z-10 overflow-hidden">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageSelect(lang)}
                      className="w-full px-[19.44px] py-[12.96px] flex items-center gap-[6px] hover:bg-[#f5f5f5] transition-colors"
                    >
                      <div className="w-[24px] h-[24px] rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-b from-red-500 via-yellow-400 to-red-500"></div>
                      </div>
                      <span className="font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
                        {lang}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* First Message Field */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[4px]">
            <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
              First message
            </label>
            <p className="font-['Inter',sans-serif] text-[16px] text-black tracking-[-0.24px]">
              The first message the agent will say. If empty, the agent will wait for the user to start the conversation
            </p>
          </div>
          <textarea
            value={firstMessage}
            onChange={handleFirstMessageChange}
            className="w-full bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px] focus:outline-none focus:border-[#66e7f5] resize-none"
            rows={3}
          />
        </div>

        {/* Objective Field */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[4px]">
            <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
              Whats the objective of the presentation?
            </label>
            <p className="font-['Inter',sans-serif] text-[16px] text-black tracking-[-0.24px]">
              The first message the agent will say. If empty, the agent will wait for the user to start the conversation
            </p>
          </div>
          <DescriptionTextarea 
            value={objective}
            onChange={handleObjectiveChange}
            height="159px"
          />
        </div>

        {/* Agent Description Field */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[4px]">
            <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
              Agent description
            </label>
            <p className="font-['Inter',sans-serif] text-[16px] text-black tracking-[-0.24px]">
              Describe what the agent should do and how it should behave during the presentation
            </p>
          </div>
          <DescriptionTextarea 
            value={description}
            onChange={handleDescriptionChange}
            height="159px"
          />
        </div>

        {/* Knowledge Base Section */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex flex-col gap-[4px]">
            <label className="font-['Inter',sans-serif] font-medium text-[16px] text-black tracking-[-0.48px]">
              Knowledge base
            </label>
            <p className="font-['Inter',sans-serif] text-[16px] text-black tracking-[-0.24px]">
              The first message the agent will say. If empty, the agent will wait for the user to start the conversation
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-[10px]">
            <button className="w-[168px] bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] flex flex-col items-center gap-[4.86px] hover:bg-[#f5f5f5] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 18.333c4.602 0 8.333-3.73 8.333-8.333S14.602 1.667 10 1.667 1.667 5.397 1.667 10s3.73 8.333 8.333 8.333z" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 6.667v6.666M6.667 10h6.666" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
                Add Website
              </span>
            </button>

            <button className="w-[168px] bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] flex flex-col items-center gap-[4.86px] hover:bg-[#f5f5f5] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.5 9.167v-5c0-.917-.75-1.667-1.667-1.667h-5M10.833 9.167l6.667-6.667M8.333 2.5h-5c-.916 0-1.666.75-1.666 1.667v11.666c0 .917.75 1.667 1.666 1.667h11.667c.917 0 1.667-.75 1.667-1.667v-5" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
                Add Files
              </span>
            </button>

            <button className="w-[168px] bg-white border border-[#dcdcdc] rounded-[20.751px] px-[19.44px] py-[12.96px] flex flex-col items-center gap-[4.86px] hover:bg-[#f5f5f5] transition-colors">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M14.167 2.5H5.833c-.916 0-1.666.75-1.666 1.667v11.666c0 .917.75 1.667 1.666 1.667h8.334c.916 0 1.666-.75 1.666-1.667V4.167c0-.917-.75-1.667-1.666-1.667zM12.5 7.5h-5M12.5 10.833h-5M10 14.167H7.5" stroke="#0d0d0d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="font-['SF_Pro',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
                Create Text
              </span>
            </button>
          </div>

          {/* Empty State */}
          <div className="w-full h-[159px] bg-[#f8f8f8] border border-[#dcdcdc] rounded-[20.751px] flex flex-col items-center justify-center gap-[4.86px]">
            <p className="font-['Inter',sans-serif] font-medium text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
              No documents found
            </p>
            <p className="font-['Inter',sans-serif] text-[16px] text-[#0d0d0d] tracking-[-0.2371px]">
              You don't have any documents yet.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
