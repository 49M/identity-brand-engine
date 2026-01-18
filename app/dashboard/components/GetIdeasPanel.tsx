'use client'

import { useState, useRef, useEffect } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface GetIdeasPanelProps {
  onClose: () => void
  profileData: {
    brand: {
      persona: {
        archetype: string
        voice: {
          style: string[]
        }
      }
    }
  }
}

type Platform = 'YouTube' | 'TikTok' | 'Instagram' | 'Twitter' | 'LinkedIn'

export default function GetIdeasPanel({ onClose, profileData }: GetIdeasPanelProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('YouTube')
  const [profileUrl, setProfileUrl] = useState('')
  const [analysisProfile, setAnalysisProfile] = useState(false)
  const [showUrlSection, setShowUrlSection] = useState(true)
  const [urlError, setUrlError] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const platforms: { name: Platform; icon: string; placeholder: string; color: string; urlPattern: RegExp }[] = [
    {
      name: 'YouTube',
      icon: '',
      placeholder: 'https://youtube.com/@yourhandle',
      color: 'rgb(255, 0, 0)',
      urlPattern: /^https?:\/\/(www\.)?(youtube\.com\/((@[^\/]+)|c\/[^\/]+|channel\/[^\/]+|user\/[^\/]+)|youtu\.be\/)/i
    },
    {
      name: 'TikTok',
      icon: '',
      placeholder: 'https://tiktok.com/@yourhandle',
      color: 'rgb(0, 242, 234)',
      urlPattern: /^https?:\/\/(www\.)?(tiktok\.com\/@[^\/]+|vm\.tiktok\.com\/)/i
    },
    {
      name: 'Instagram',
      icon: '',
      placeholder: 'https://instagram.com/yourhandle',
      color: 'rgb(225, 48, 108)',
      urlPattern: /^https?:\/\/(www\.)?instagram\.com\/[^\/]+/i
    },
    {
      name: 'Twitter',
      icon: '',
      placeholder: 'https://x.com/yourhandle',
      color: 'rgb(0, 0, 0)',
      urlPattern: /^https?:\/\/(www\.)?(twitter\.com\/[^\/]+|x\.com\/[^\/]+)/i
    },
    {
      name: 'LinkedIn',
      icon: '',
      placeholder: 'https://linkedin.com/in/yourhandle',
      color: 'rgb(0, 119, 181)',
      urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[^\/]+/i
    },
  ]

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const validateUrl = (url: string, platform: Platform): boolean => {
    if (!url.trim()) {
      setUrlError('')
      return false
    }

    const platformData = platforms.find(p => p.name === platform)
    if (!platformData) return false

    const isValid = platformData.urlPattern.test(url)
    if (!isValid) {
      setUrlError(`Please enter a valid ${platform === 'Twitter' ? 'X' : platform} profile URL`)
    } else {
      setUrlError('')
    }

    return isValid
  }

  const handleUrlChange = (url: string) => {
    setProfileUrl(url)
    if (url.trim()) {
      validateUrl(url, selectedPlatform)
    } else {
      setUrlError('')
    }
  }

  const handlePlatformChange = (platform: Platform) => {
    setSelectedPlatform(platform)
    setAnalysisProfile(false)
    if (profileUrl.trim()) {
      const valid = validateUrl(profileUrl, platform)
      if (!valid) {
        setProfileUrl('')
      }
    }
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isLoading) return

    const newMessage: ChatMessage = { role: 'user', content: chatInput }
    setChatMessages(prev => [...prev, newMessage])
    setChatInput('')
    setIsLoading(true)

    // TODO: Replace with actual Backboard API call
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: `Great question! Based on your ${profileData.brand.persona.archetype} archetype and ${profileData.brand.persona.voice.style.join(', ')} voice, here's a content idea that aligns with your brand:

**Content Idea:** "5 Mistakes [Your Niche] Creators Make (And How to Fix Them)"

This format matches your voice style while providing actionable value. The contrarian angle fits your brand positioning and will drive engagement from creators looking to improve.`
      }
      setChatMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-pink-500/50 rounded-2xl p-8 mb-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">AI Content Ideas</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Profile URL Section */}
      {showUrlSection && (
        <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Connect Profile</h3>
            </div>
            <button
              onClick={() => setShowUrlSection(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-pink-200 mb-4">
            Paste social profile URL to get AI-powered content ideas based on the existing content
          </p>

          {/* Platform Selection */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
            {platforms.map((platform) => {
              const isSelected = selectedPlatform === platform.name
              const displayName = platform.name === 'Twitter' ? 'X' : platform.name

              return (
                <button
                  key={platform.name}
                  onClick={() => handlePlatformChange(platform.name)}
                  className={`px-3 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all ${
                    isSelected
                      ? 'text-white shadow-lg'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/30'
                  }`}
                  style={isSelected ? {
                    backgroundColor: platform.color,
                    borderColor: platform.color,
                    boxShadow: `0 4px 12px ${platform.color}40`
                  } : {}}
                >
                  {displayName}
                </button>
              )
            })}
          </div>

          {/* URL Input */}
          <div>
            <div className="flex gap-2">
              <input
                type="url"
                value={profileUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={platforms.find(p => p.name === selectedPlatform)?.placeholder}
                className={`flex-1 bg-white/10 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  urlError
                    ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
                    : 'border-white/20 focus:border-pink-500 focus:ring-pink-500/50'
                }`}
              />
              {!analysisProfile && (
                <button
                  onClick={() => {
                    if (profileUrl.trim() && validateUrl(profileUrl, selectedPlatform)) {
                      // TODO: Handle profile URL submission
                      console.log('Profile URL:', profileUrl, 'Platform:', selectedPlatform)
                      setAnalysisProfile(true);
                    }
                  }}
                  disabled={!profileUrl.trim() || !!urlError}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="hidden sm:inline">Analyze</span>
                </button>
              )}
            </div>
            {urlError && (
              <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {urlError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Show URL Section Button (when collapsed) */}
      {!showUrlSection && (
        <button
          onClick={() => setShowUrlSection(true)}
          className="w-full mb-4 px-4 py-3 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-300 font-medium transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Connect Profile URL
        </button>
      )}

      {/* Chat Messages */}
      <div className="bg-black/20 rounded-xl p-4 mb-4 h-96 overflow-y-auto space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-gray-400 mb-2">Ask the AI for content ideas tailored to your brand</p>
              <p className="text-gray-500 text-sm">{`Try: "Give me 3 video ideas for this week"`}</p>
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-white/10 text-white'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-xl p-4 bg-white/10">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </>
        )}
      </div>

      {/* Chat Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask for content ideas..."
          disabled={isLoading}
          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition-all disabled:opacity-50"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading || !chatInput.trim()}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-pink-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  )
}
