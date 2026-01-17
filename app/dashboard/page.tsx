'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface ProfileData {
  profile: {
    creator: {
      name: string
      background: string[]
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

export default function Dashboard() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch('/api/profile')
        const data = await response.json()

        if (data.success) {
          setProfileData(data.data)
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

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
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Your Identity</h2>
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
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <button className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/50 transition-all text-left">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Upload Video</h3>
            <p className="text-gray-400 text-sm">Analyze your content and track identity evolution</p>
          </button>

          <button className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-pink-500/50 transition-all text-left">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Get Ideas</h3>
            <p className="text-gray-400 text-sm">AI-generated content ideas that match your identity</p>
          </button>

          <button className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 transition-all text-left">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">View Insights</h3>
            <p className="text-gray-400 text-sm">Understand patterns and what works in your niche</p>
          </button>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-blue-200 text-sm">
            <strong>Note:</strong> This is your dashboard foundation. Video upload, content ideas, and insights features are coming soon!
          </p>
        </div>
      </div>
    </main>
  )
}
