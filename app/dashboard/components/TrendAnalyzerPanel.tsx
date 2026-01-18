'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface TrendAnalyzerPanelProps {
  onClose: () => void
}

export default function TrendAnalyzerPanel({ onClose }: TrendAnalyzerPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [trendAnalysis, setTrendAnalysis] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [niche, setNiche] = useState<string>('')

  const handleAnalyzeTrends = async () => {
    setIsAnalyzing(true)
    setError(null)
    setTrendAnalysis(null)

    try {
      const response = await fetch('/api/trends')
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze trends')
      }

      setTrendAnalysis(data.trends)
      setNiche(data.niche)
    } catch (err) {
      console.error('Trend analysis failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze trends')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-purple-500/30">
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-orange-500/10 to-red-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                </svg>
                🔥 Viral Trend Analyzer
              </h2>
              <p className="text-gray-400 text-sm mt-1">Discover what's trending and how to make it yours</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {!trendAnalysis && !isAnalyzing && !error && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl mb-6">
                <svg className="w-16 h-16 text-orange-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Ready to Find Viral Trends?</h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                I'll search the web for what's trending in your niche right now and show you how to adapt it to your authentic brand voice.
              </p>
              <button
                onClick={handleAnalyzeTrends}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-orange-500/30"
              >
                🔍 Analyze Trending Content
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl mb-6 animate-pulse">
                <svg className="w-16 h-16 text-orange-400 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Searching the Web for Trends...</h3>
              <p className="text-gray-400 mb-2">Finding what's viral in your niche</p>
              <p className="text-gray-500 text-sm">This may take 30-60 seconds</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-red-500/20 rounded-2xl mb-6">
                <svg className="w-16 h-16 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Analysis Failed</h3>
              <p className="text-gray-400 mb-6">{error}</p>
              <button
                onClick={handleAnalyzeTrends}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          )}

          {trendAnalysis && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-orange-500/20 border border-orange-500/40 rounded-full">
                    <span className="text-orange-400 text-sm font-semibold">🎯 {niche}</span>
                  </div>
                  <span className="text-gray-500 text-sm">Web search enabled</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(trendAnalysis)
                      alert('Trends copied to clipboard!')
                    }}
                    className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                  <button
                    onClick={handleAnalyzeTrends}
                    className="text-orange-400 hover:text-orange-300 text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>

              <div className="prose prose-invert prose-sm max-w-none bg-black/20 rounded-xl p-6 border border-orange-500/20">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-white mb-6 pb-3 border-b border-orange-500/30 flex items-center gap-3">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-bold text-orange-300 mt-8 mb-4 flex items-center gap-2">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold text-red-300 mt-5 mb-3">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-200 leading-relaxed mb-4">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside text-gray-200 mb-4 space-y-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside text-gray-200 mb-4 space-y-2">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-200">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-orange-500 pl-4 italic text-orange-200 my-4 bg-orange-500/10 py-3 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-orange-900/30 text-orange-200 px-2 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-white font-semibold">{children}</strong>
                    ),
                    em: ({ children }) => (
                      <em className="text-gray-300 italic">{children}</em>
                    ),
                    hr: () => (
                      <hr className="border-white/10 my-8" />
                    )
                  }}
                >
                  {trendAnalysis}
                </ReactMarkdown>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={() => {
                    const blob = new Blob([trendAnalysis], { type: 'text/markdown' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `trending_${niche.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.md`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Trend Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
