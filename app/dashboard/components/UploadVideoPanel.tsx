'use client'

import { useRef, useState } from 'react'

interface UploadVideoPanelProps {
  onClose: () => void
}

export default function UploadVideoPanel({ onClose }: UploadVideoPanelProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
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

    console.log('Analyzing video:', uploadedFile.name)
    // TODO: Integrate with TwelveLabs API
    alert('Video analysis coming soon!')
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

      {uploadedFile && (
        <div className="mt-6">
          <button
            onClick={handleAnalyze}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            Analyze Video with AI
          </button>
        </div>
      )}
    </div>
  )
}
