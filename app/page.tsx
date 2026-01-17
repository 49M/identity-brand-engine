export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Gradient orbs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
          {/* Nav */}
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
              <span className="text-white font-bold text-xl">Identity Engine</span>
            </div>
            {/* Waitlist commented out for now */}
            {/* <button className="px-6 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white hover:bg-white/20 transition-all">
              Join Waitlist
            </button> */}
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-purple-200 text-sm font-medium">AI-Powered Identity Evolution</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Don&apos;t Chase Trends.
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
                Build Your Identity.
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Most creators copy what works. That destroys identity. We built an AI that learns who you are,
              analyzes what works in your niche, and only recommends content that
              <span className="text-purple-400 font-semibold"> reinforces your personal brand over time.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105">
                Start Building Your Identity
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold hover:bg-white/20 transition-all">
                See How It Works
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-white/10">
              <div>
                <div className="text-3xl font-bold text-white mb-1">100%</div>
                <div className="text-sm text-gray-400">Identity Coherent</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">AI-Driven</div>
                <div className="text-sm text-gray-400">Content Analysis</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">Real-time</div>
                <div className="text-sm text-gray-400">Brand Evolution</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Problem Section */}
      <div className="relative py-20 bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              The Creator&apos;s Dilemma
            </h2>
            <p className="text-gray-400 text-lg">Why most creators fail to build lasting brands</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-red-500/50 transition-all">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Content is Inconsistent</h3>
              <p className="text-gray-400">Jumping between styles, topics, and tones without a coherent thread.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-yellow-500/50 transition-all">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Chasing Trends Blindly</h3>
              <p className="text-gray-400">Following what's viral without considering if it aligns with who you are.</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:border-orange-500/50 transition-all">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Brand Drift</h3>
              <p className="text-gray-400">Your &ldquo;brand&rdquo; evolves accidentally, not intentionally.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Solution Section */}
      <div className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">Identity Vector</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A living profile that evolves with every video, keeping your brand coherent and intentional
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Define Your Target Identity</h3>
                  <p className="text-gray-400">Set your tone, authority level, depth, emotion, and risk tolerance. This becomes your north star.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Analyze Your Content</h3>
                  <p className="text-gray-400">Upload videos and see how they shape your public image. Track identity signals, sentiment, and brand coherence.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Evolve Intentionally</h3>
                  <p className="text-gray-400">Get recommendations that reinforce your identity. Preview how new content aligns before you post.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-3xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Tone</span>
                    <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                    <span className="text-white font-semibold">Calm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Authority</span>
                    <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-5/6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    </div>
                    <span className="text-white font-semibold">Teacher</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Depth</span>
                    <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"></div>
                    </div>
                    <span className="text-white font-semibold">Tactical</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Emotion</span>
                    <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-4/5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
                    </div>
                    <span className="text-white font-semibold">Motivational</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Risk</span>
                    <div className="flex-1 mx-4 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-white font-semibold">Balanced</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Brand Coherence Score</span>
                    <span className="text-green-400 text-2xl font-bold">94%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-20 bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Build Who You&apos;re Becoming?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Stop copying. Start creating content that fits who you are becoming.
          </p>
          <button className="px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105">
            Start Your Identity Journey
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400 text-sm">
            <p>Built for creators who refuse to be copies.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}