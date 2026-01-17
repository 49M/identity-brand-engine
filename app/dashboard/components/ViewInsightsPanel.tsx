'use client'

interface ViewInsightsPanelProps {
  onClose: () => void
  profileData: {
    brand: {
      persona: {
        voice: {
          style: string[]
          pacing: string
        }
      }
    }
  }
}

export default function ViewInsightsPanel({ onClose, profileData }: ViewInsightsPanelProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-blue-500/50 rounded-2xl p-8 mb-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Content Insights</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Identity Alignment */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-green-400 font-semibold">+5% this week</span>
          </div>
          <h3 className="text-sm text-gray-300 mb-2">Identity Alignment</h3>
          <p className="text-3xl font-bold text-white mb-1">87%</p>
          <p className="text-xs text-gray-400">Content matches your brand voice</p>
        </div>

        {/* Engagement Rate */}
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xs text-blue-400 font-semibold">+12% this week</span>
          </div>
          <h3 className="text-sm text-gray-300 mb-2">Engagement Rate</h3>
          <p className="text-3xl font-bold text-white mb-1">4.2%</p>
          <p className="text-xs text-gray-400">Avg across all platforms</p>
        </div>

        {/* Content Streak */}
        <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <span className="text-xs text-orange-400 font-semibold">Keep it up!</span>
          </div>
          <h3 className="text-sm text-gray-300 mb-2">Content Streak</h3>
          <p className="text-3xl font-bold text-white mb-1">12 days</p>
          <p className="text-xs text-gray-400">Consistent posting</p>
        </div>

        {/* Tone Consistency */}
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <span className="text-xs text-purple-400 font-semibold">Excellent</span>
          </div>
          <h3 className="text-sm text-gray-300 mb-2">Tone Consistency</h3>
          <p className="text-3xl font-bold text-white mb-1">92%</p>
          <p className="text-xs text-gray-400">Maintains brand voice</p>
        </div>

        {/* Audience Growth */}
        <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="text-xs text-pink-400 font-semibold">+215 this week</span>
          </div>
          <h3 className="text-sm text-gray-300 mb-2">Audience Growth</h3>
          <p className="text-3xl font-bold text-white mb-1">2.4K</p>
          <p className="text-xs text-gray-400">Total followers</p>
        </div>

        {/* Brand Evolution */}
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs text-indigo-400 font-semibold">Evolving</span>
          </div>
          <h3 className="text-sm text-gray-300 mb-2">Brand Evolution</h3>
          <p className="text-3xl font-bold text-white mb-1">0.8</p>
          <p className="text-xs text-gray-400">Identity drift score</p>
        </div>
      </div>

      {/* Insights Summary */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-200">
              <strong>AI Insight:</strong> Your {profileData.brand.persona.voice.style[0]} tone is resonating well. Consider maintaining your current {profileData.brand.persona.voice.pacing}-paced delivery for optimal engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
