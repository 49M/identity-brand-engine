'use client'

import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface UploadVideoPanelProps {
  onClose: () => void
  onVideoAnalyzed?: () => void
}

// TODO: implement a remix feature which allows the user to remix the original content in a way which maintains virality but is catered uniquely to them.

interface RetentionSegment {
  start: number
  end: number
  score: number // 0-100
  label: string
  reason: string
}

interface VideoAnalysis {
  videoId: string
  title: string
  topics: string[]
  hashtags: string[]
  summary: string
  chapters?: unknown[]
  highlights?: unknown[]
  retentionTimeline?: RetentionSegment[]
  brandAlignment?: {
    overallScore: number
    dimensionScores: {
      tone: number
      authority: number
      depth: number
      emotion: number
      risk: number
    }
    strengths: string[]
    improvements: string[]
    recommendations: string
  }
}

// Helper function to format seconds to mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function UploadVideoPanel({ onClose, onVideoAnalyzed }: UploadVideoPanelProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysis | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [isRemixing, setIsRemixing] = useState(false)
  const [remixScript, setRemixScript] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type.startsWith('video/')) {
      setUploadedFile(file)
      console.log('Video file selected:', file.name)
    } else {
      alert('Please upload a video file')
    }
  }

  const handleAnalyze = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    setAnalysisError(null)
    setAnalysisProgress('Uploading video...')

    // Progress stages for realistic UX
    const progressStages = [
      { text: 'Uploading video...', delay: 0 },
      { text: 'Processing video...', delay: 3000 },
      { text: 'Analyzing visual content...', delay: 7000 },
      { text: 'Analyzing audio content...', delay: 10000 },
      { text: 'Generating insights...', delay: 13000 },
      { text: 'Analyzing brand alignment...', delay: 16000 },
      { text: 'Finalizing analysis...', delay: 20000 }
    ]

    // Set up progress stage timers
    const timers = progressStages.slice(1).map((stage) =>
      setTimeout(() => {
        setAnalysisProgress(stage.text)
      }, stage.delay)
    )

    try {
      // Create form data
      const formData = new FormData()
      formData.append('video', uploadedFile)

      // Upload and analyze video
      const response = await fetch('/api/video', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze video')
      }

      // Clear any remaining timers
      timers.forEach(timer => clearTimeout(timer))

      // Show results
      setAnalysisResult(data.analysis)
      setAnalysisProgress('Analysis complete!')

      // Notify parent component that video was analyzed
      if (onVideoAnalyzed) {
        onVideoAnalyzed()
      }
    } catch (error) {
      console.error('Video analysis failed:', error)

      // Clear timers on error
      timers.forEach(timer => clearTimeout(timer))

      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze video')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRemixVideo = async () => {
    if (!analysisResult) return

    setIsRemixing(true)
    setRemixScript(null)

    try {
      const response = await fetch('/api/video/remix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          videoAnalysis: analysisResult
        })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate remix')
      }

      setRemixScript(data.remix)
    } catch (error) {
      console.error('Video remix failed:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate video remix')
    } finally {
      setIsRemixing(false)
    }
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-purple-500/50 rounded-2xl p-8 mb-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Upload Video</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileInput}
        className="hidden"
      />

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-white/20 hover:border-purple-500/50 hover:bg-white/5'
        }`}
      >
        {uploadedFile ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">{uploadedFile.name}</p>
              <p className="text-gray-400 text-sm">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setUploadedFile(null)
              }}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Remove file
            </button>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-white font-semibold mb-2">Drop your video here or click to browse</p>
            <p className="text-gray-400 text-sm">Supports MP4, MOV, AVI and other video formats</p>
          </>
        )}
      </div>

      {uploadedFile && !analysisResult && (
        <div className="mt-6">
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {analysisProgress}
              </span>
            ) : (
              'Analyze Video with AI'
            )}
          </button>
        </div>
      )}

      {analysisError && (
        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl">
          <p className="text-red-400 text-sm">{analysisError}</p>
          <button
            onClick={() => {
              setAnalysisError(null)
              setUploadedFile(null)
            }}
            className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
          >
            Try again
          </button>
        </div>
      )}

      {analysisResult && (
        <div className="mt-6 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Analysis Results</h3>
            <button
              onClick={() => {
                setAnalysisResult(null)
                setUploadedFile(null)
              }}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Analyze Another
            </button>
          </div>

          {/* Brand Alignment - MOVED TO TOP */}
          {analysisResult.brandAlignment && (
            <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border-2 border-purple-500/60 shadow-lg shadow-purple-500/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-300 text-xs uppercase tracking-wide mb-1">Brand Alignment</p>
                  <p className="text-gray-400 text-xs">How well this video matches your brand identity</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-5xl font-black ${
                        analysisResult.brandAlignment.overallScore >= 80 ? 'text-green-400' :
                        analysisResult.brandAlignment.overallScore >= 60 ? 'text-yellow-400' :
                        'text-orange-400'
                      }`}>
                        {analysisResult.brandAlignment.overallScore}
                      </span>
                      <span className="text-gray-400 text-lg font-semibold">/100</span>
                    </div>
                    <p className={`text-xs font-semibold mt-1 ${
                      analysisResult.brandAlignment.overallScore >= 80 ? 'text-green-400' :
                      analysisResult.brandAlignment.overallScore >= 60 ? 'text-yellow-400' :
                      'text-orange-400'
                    }`}>
                      {analysisResult.brandAlignment.overallScore >= 80 ? 'Excellent Match' :
                       analysisResult.brandAlignment.overallScore >= 60 ? 'Good Match' :
                       'Needs Adjustment'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dimension Scores */}
              <div className="space-y-3 mb-5 bg-black/20 p-4 rounded-xl">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Dimension Breakdown</p>
                {Object.entries(analysisResult.brandAlignment.dimensionScores).map(([dimension, score]) => (
                  <div key={dimension} className="flex items-center gap-3">
                    <span className="text-sm text-gray-300 w-24 capitalize font-medium">{dimension}</span>
                    <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-400 rounded-full transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-sm text-white font-bold w-10 text-right">{score}</span>
                  </div>
                ))}
              </div>

              {/* Strengths */}
              {analysisResult.brandAlignment.strengths.length > 0 && (
                <div className="mb-4 bg-green-500/10 border border-green-500/30 p-4 rounded-xl">
                  <p className="text-sm text-green-400 font-bold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    What&apos;s Working
                  </p>
                  <ul className="space-y-2">
                    {analysisResult.brandAlignment.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-200 leading-relaxed pl-4 border-l-2 border-green-500/40">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improvements */}
              {analysisResult.brandAlignment.improvements.length > 0 && (
                <div className="mb-4 bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl">
                  <p className="text-sm text-orange-400 font-bold mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                    </svg>
                    What to Improve
                  </p>
                  <ul className="space-y-2">
                    {analysisResult.brandAlignment.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-gray-200 leading-relaxed pl-4 border-l-2 border-orange-500/40">
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Recommendation</p>
                <p className="text-sm text-purple-200 leading-relaxed">{analysisResult.brandAlignment.recommendations}</p>
              </div>

              {/* Remix Button */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={handleRemixVideo}
                  disabled={isRemixing}
                  className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
                >
                  {isRemixing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating Your Remix...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Remix This Video for My Brand
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Generate a brand-optimized script that maintains viral potential
                </p>
              </div>

            </div>
          )}

          {/* Remix Script Display */}
          {remixScript && (
            <div className="p-6 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-2xl border-2 border-pink-500/40 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Your Brand-Optimized Remix
                  </h4>
                  <p className="text-xs text-gray-400">Ready-to-film script aligned with your identity</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(remixScript)
                    alert('Script copied to clipboard!')
                  }}
                  className="text-pink-400 hover:text-pink-300 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Script
                </button>
              </div>

              <div className="prose prose-invert prose-sm max-w-none bg-black/20 rounded-xl p-5 overflow-y-auto max-h-[600px]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-pink-500/30">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-bold text-pink-300 mt-6 mb-3">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-semibold text-purple-300 mt-4 mb-2">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-200 leading-relaxed mb-3">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside text-gray-200 mb-3 space-y-1">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside text-gray-200 mb-3 space-y-1">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-200">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-pink-500 pl-4 italic text-pink-200 my-3 bg-pink-500/10 py-2 rounded-r">
                        {children}
                      </blockquote>
                    ),
                    code: ({ children }) => (
                      <code className="bg-purple-900/50 text-purple-200 px-1.5 py-0.5 rounded text-sm font-mono">
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
                      <hr className="border-white/10 my-6" />
                    )
                  }}
                >
                  {remixScript}
                </ReactMarkdown>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => setRemixScript(null)}
                  className="flex-1 py-2 px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200"
                >
                  Close Remix
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([remixScript], { type: 'text/markdown' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${analysisResult?.title.replace(/[^a-z0-9]/gi, '_')}_remix.md`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Script
                </button>
              </div>
            </div>
          )}

          {/* Retention Timeline */}
          {analysisResult.retentionTimeline && analysisResult.retentionTimeline.length > 0 && (
            <div className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border-2 border-blue-500/40 shadow-lg">
              <div className="mb-4">
                <h4 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Retention Timeline
                </h4>
                <p className="text-xs text-gray-400">Predicted engagement patterns based on content analysis</p>
              </div>

              {/* Timeline visualization */}
              <div className="mb-6">
                <div className="relative h-12 bg-gray-900/50 rounded-lg overflow-hidden">
                  {(() => {
                    const maxTime = Math.max(...analysisResult.retentionTimeline.map(s => s.end))
                    return analysisResult.retentionTimeline.map((segment, idx) => {
                      const left = (segment.start / maxTime) * 100
                      const width = ((segment.end - segment.start) / maxTime) * 100

                      // Color based on score
                      let bgColor = ''
                      if (segment.score >= 70) bgColor = 'bg-green-500'
                      else if (segment.score >= 50) bgColor = 'bg-yellow-500'
                      else bgColor = 'bg-red-500'

                      return (
                        <div
                          key={idx}
                          className={`absolute top-0 h-full ${bgColor} transition-all duration-300 hover:opacity-80 group cursor-pointer`}
                          style={{
                            left: `${left}%`,
                            width: `${width}%`
                          }}
                          title={`${segment.label} (${segment.score}/100): ${segment.reason}`}
                        >
                          {/* Hover tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                              <p className="text-white font-semibold">{segment.label}</p>
                              <p className="text-gray-400">{formatTime(segment.start)} - {formatTime(segment.end)}</p>
                              <p className="text-cyan-400 text-[10px] mt-1">{segment.reason}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>

                {/* Time markers */}
                <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                  {(() => {
                    const maxTime = Math.max(...analysisResult.retentionTimeline.map(s => s.end))
                    const markers = [0, 0.25, 0.5, 0.75, 1].map(ratio => Math.floor(maxTime * ratio))
                    return markers.map((time, idx) => (
                      <span key={idx}>{formatTime(time)}</span>
                    ))
                  })()}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-300">Strong (70+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span className="text-gray-300">Moderate (50-69)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span className="text-gray-300">Risk (&lt;50)</span>
                </div>
              </div>

              {/* Segments breakdown */}
              <div className="mt-5 pt-5 border-t border-white/10">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Segment Analysis</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {analysisResult.retentionTimeline.map((segment, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 rounded bg-black/20">
                      <div className={`w-2 h-2 rounded-full mt-1 ${
                        segment.score >= 70 ? 'bg-green-500' :
                        segment.score >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-white font-medium">{formatTime(segment.start)} - {formatTime(segment.end)}</span>
                          <span className="text-[10px] text-gray-500">({segment.score}/100)</span>
                        </div>
                        <p className="text-[11px] text-gray-400">{segment.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div className="p-4 bg-white/5 rounded-xl border border-purple-500/30">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">Suggested Title</p>
            <p className="text-white font-semibold">{analysisResult.title}</p>
          </div>

          {/* Topics */}
          {analysisResult.topics.length > 0 && (
            <div className="p-4 bg-white/5 rounded-xl border border-purple-500/30">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Topics</p>
              <div className="flex flex-wrap gap-2">
                {analysisResult.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hashtags */}
          {analysisResult.hashtags.length > 0 && (
            <div className="p-4 bg-white/5 rounded-xl border border-purple-500/30">
              <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Hashtags</p>
              <div className="flex flex-wrap gap-2">
                {analysisResult.hashtags.map((hashtag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-lg text-sm font-mono"
                  >
                    #{hashtag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-white/5 rounded-xl border border-purple-500/30">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-3">Content Summary</p>
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-xl font-bold mb-2 mt-3 text-white">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-lg font-bold mb-2 mt-3 text-white">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold mb-1.5 mt-2 text-white">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 text-gray-200 leading-relaxed text-sm">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-2 space-y-1 text-gray-200 text-sm">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-200 text-sm">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="ml-2">{children}</li>,
                  strong: ({ children }) => (
                    <strong className="font-bold text-purple-300">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic text-pink-300">{children}</em>,
                  code: ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) =>
                    inline ? (
                      <code className="bg-black/30 text-pink-300 px-1.5 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-black/40 text-gray-200 p-2 rounded-lg text-xs font-mono overflow-x-auto mb-2">
                        {children}
                      </code>
                    ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-500 pl-3 italic text-gray-300 my-2 text-sm">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline"
                    >
                      {children}
                    </a>
                  ),
                  hr: () => <hr className="border-white/10 my-3" />
                }}
              >
                {analysisResult.summary}
              </ReactMarkdown>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
