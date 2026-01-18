'use client'

import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface UploadVideoPanelProps {
  onClose: () => void
}

interface VideoAnalysis {
  videoId: string
  title: string
  topics: string[]
  hashtags: string[]
  summary: string
}

export default function UploadVideoPanel({ onClose }: UploadVideoPanelProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysis | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
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

      // Show results
      setAnalysisResult(data.analysis)
      setAnalysisProgress('Analysis complete!')
    } catch (error) {
      console.error('Video analysis failed:', error)
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze video')
    } finally {
      setIsAnalyzing(false)
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
