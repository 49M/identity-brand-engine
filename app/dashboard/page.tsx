'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import UploadVideoPanel from './components/UploadVideoPanel'
import GetIdeasPanel from './components/GetIdeasPanel'
import ViewInsightsPanel from './components/ViewInsightsPanel'
import EditIdentityPanel from './components/EditIdentityPanel'

interface ProfileData {
  profile: {
    creator: {
      name: string
      background: string[]
      experienceLevel: 'beginner' | 'intermediate' | 'advanced'
      goals: string[]
    }
    audience: {
      targetViewer: {
        ageRange: string
        interests: string[]
        painPoints: string[]
      }
      platforms: string[]
    }
    constraints: {
      postingFrequency: string
      videoLengthSeconds: number
      tone: string[]
    }
    rawDimensions?: {
      tone: number
      authority: number
      depth: number
      emotion: number
      risk: number
    }
  }
  brand: {
    persona: {
      archetype: string
      voice: {
        style: string[]
        pacing: string
      }
    }
    confidenceScore: number
  }
}

interface IdentityDimensions {
  Tone: number
  Authority: number
  Depth: number
  Emotion: number
  Risk: number
}

interface CurrentProfile {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  goals: string[]
  ageRange: string
  interests: string[]
  painPoints: string[]
  platforms: string[]
  postingFrequency: string
  videoLengthSeconds: number
}

type ActivePanel = 'upload' | 'ideas' | 'insights' | 'edit-identity' | null

export default function Dashboard() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [targetAudience, setTargetAudience] = useState<string>('')
  const [identityDimensions, setIdentityDimensions] = useState<IdentityDimensions>({
    Tone: 50,
    Authority: 50,
    Depth: 50,
    Emotion: 50,
    Risk: 50
  })
  const [currentProfile, setCurrentProfile] = useState<CurrentProfile>({
    experienceLevel: 'beginner',
    goals: [],
    ageRange: '',
    interests: [],
    painPoints: [],
    platforms: [],
    postingFrequency: 'weekly',
    videoLengthSeconds: 60
  })

  useEffect(() => {
    async function loadAudience() {
      const response = await fetch('/api/target-audience')
      const data = await response.json()
      setTargetAudience(data.targetAudience)
    }
    loadAudience()
  }, [])

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/profile')
        const data = await response.json()

        if (data.success) {
          setProfileData(data.data)

          // Load rawDimensions if available
          if (data.data.profile.rawDimensions) {
            const raw = data.data.profile.rawDimensions
            setIdentityDimensions({
              Tone: raw.tone,
              Authority: raw.authority,
              Depth: raw.depth,
              Emotion: raw.emotion,
              Risk: raw.risk
            })
          }

          // Load profile fields
          setCurrentProfile({
            experienceLevel: data.data.profile.creator.experienceLevel,
            goals: data.data.profile.creator.goals,
            ageRange: data.data.profile.audience.targetViewer.ageRange,
            interests: data.data.profile.audience.targetViewer.interests,
            painPoints: data.data.profile.audience.targetViewer.painPoints,
            platforms: data.data.profile.audience.platforms,
            postingFrequency: data.data.profile.constraints.postingFrequency,
            videoLengthSeconds: data.data.profile.constraints.videoLengthSeconds
          })
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleSaveIdentity = async (newDimensions: IdentityDimensions, newProfile: CurrentProfile) => {
    try {
      const response = await fetch('/api/update-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dimensions: newDimensions,
          experienceLevel: newProfile.experienceLevel,
          goals: newProfile.goals,
          ageRange: newProfile.ageRange,
          interests: newProfile.interests,
          painPoints: newProfile.painPoints,
          platforms: newProfile.platforms,
          postingFrequency: newProfile.postingFrequency,
          videoLengthSeconds: newProfile.videoLengthSeconds
        })
      })

      const data = await response.json()

      if (data.success) {
        setProfileData(data.data)
        setIdentityDimensions(newDimensions)
        setCurrentProfile(newProfile)
        setActivePanel(null)
        setTargetAudience('')
        // Reload target audience analysis
        const audienceResponse = await fetch('/api/target-audience')
        const audienceData = await audienceResponse.json()
        setTargetAudience(audienceData.targetAudience)
      }
    } catch (error) {
      console.error('Error saving identity:', error)
      alert('Failed to save identity changes')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading your identity...</div>
      </main>
    )
  }

  if (!profileData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">No profile found</div>
          <Link href="/create-profile" className="text-purple-400 hover:text-purple-300">
            Create your profile
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Home</span>
            </Link>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">{profileData.profile.creator.name}</span>
          </h1>
          <p className="text-gray-400">Your identity engine is ready to help you build coherent content</p>
        </div>

        {/* Profile Summary */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your Identity</h2>
              <button
                onClick={() => setActivePanel('edit-identity')}
                className="text-xs px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Archetype</p>
                <p className="text-white font-semibold">{profileData.brand.persona.archetype}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Voice Style</p>
                <p className="text-white font-semibold">{profileData.brand.persona.voice.style.join(', ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Pacing</p>
                <p className="text-white font-semibold capitalize">{profileData.brand.persona.voice.pacing}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Niche</p>
                <p className="text-white font-semibold">{profileData.profile.creator.background.join(', ')}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Brand Coherence</h2>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-sm text-gray-300 mb-2">Current Score</p>
                <p className="text-5xl font-bold text-white">{Math.round(profileData.brand.confidenceScore * 100)}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-300">Status</p>
                <p className="text-green-400 font-semibold">Active</p>
              </div>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${profileData.brand.confidenceScore * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Your score will evolve as you upload and analyze content
            </p>
          </div>

          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Your Target Audience</h2>
              <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            {targetAudience ? (
              <>
                <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-3 max-h-[280px] custom-scrollbar">
                  <div
                    className="text-sm text-cyan-100/90 leading-relaxed prose prose-sm prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: targetAudience
                        .replace(/^#{1,3}\s+\*\*(.*?)\*\*/gm, '<h3 class="text-base font-bold text-white mt-3 mb-2">$1</h3>')
                        .replace(/^#{1,3}\s+(.*?)$/gm, '<h3 class="text-base font-bold text-white mt-3 mb-2">$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-50 font-semibold">$1</strong>')
                        .replace(/^- \*\*(.*?):\*\*(.*?)$/gm, '<div class="flex items-start gap-2 mb-1.5"><span class="text-cyan-400 mt-1">•</span><div><strong class="text-cyan-50">$1:</strong><span class="text-cyan-100/80">$2</span></div></div>')
                        .replace(/^- (.*?)$/gm, '<div class="flex items-start gap-2 mb-1.5"><span class="text-cyan-400 mt-1">•</span><span class="text-cyan-100/80">$1</span></div>')
                        .replace(/\n\n/g, '<div class="h-2"></div>')
                    }}
                  />
                </div>
                <div className="pt-3 border-t border-cyan-500/20 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-xs text-cyan-300">AI-Generated Analysis</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-cyan-300/70">Analyzing your audience...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setActivePanel(activePanel === 'upload' ? null : 'upload')}
            className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-6 transition-all text-left ${
              activePanel === 'upload'
                ? 'border-purple-500 ring-2 ring-purple-500/50'
                : 'border-white/10 hover:border-purple-500/50'
            }`}
          >
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Upload Video</h3>
            <p className="text-gray-400 text-sm">Analyze your content and track identity evolution</p>
          </button>

          <button
            onClick={() => setActivePanel(activePanel === 'ideas' ? null : 'ideas')}
            className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-6 transition-all text-left ${
              activePanel === 'ideas'
                ? 'border-pink-500 ring-2 ring-pink-500/50'
                : 'border-white/10 hover:border-pink-500/50'
            }`}
          >
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Get Ideas</h3>
            <p className="text-gray-400 text-sm">AI-generated content ideas that match your identity</p>
          </button>

          <button
            onClick={() => setActivePanel(activePanel === 'insights' ? null : 'insights')}
            className={`bg-white/5 backdrop-blur-sm border rounded-2xl p-6 transition-all text-left ${
              activePanel === 'insights'
                ? 'border-blue-500 ring-2 ring-blue-500/50'
                : 'border-white/10 hover:border-blue-500/50'
            }`}
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">View Insights</h3>
            <p className="text-gray-400 text-sm">Understand patterns and what works in your niche</p>
          </button>
        </div>

        {/* Dynamic Panels */}
        {activePanel === 'edit-identity' && (
          <EditIdentityPanel
            onClose={() => setActivePanel(null)}
            currentDimensions={identityDimensions}
            currentProfile={currentProfile}
            onSave={handleSaveIdentity}
          />
        )}

        {activePanel === 'upload' && (
          <UploadVideoPanel onClose={() => setActivePanel(null)} />
        )}

        {activePanel === 'ideas' && (
          <GetIdeasPanel
            onClose={() => setActivePanel(null)}
            profileData={profileData}
          />
        )}

        {activePanel === 'insights' && (
          <ViewInsightsPanel
            onClose={() => setActivePanel(null)}
            profileData={profileData}
          />
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Custom scrollbar for target audience */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(6, 182, 212, 0.05);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.3);
          border-radius: 10px;
          transition: background 0.2s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.5);
        }

        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.3) rgba(6, 182, 212, 0.05);
        }
      `}</style>
    </main>
  )
}
