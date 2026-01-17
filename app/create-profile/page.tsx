'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type PersonaDimension = {
  label: string
  leftLabel: string
  rightLabel: string
  description: string
  gradient: string
}

const dimensions: PersonaDimension[] = [
  {
    label: 'Tone',
    leftLabel: 'Aggressive',
    rightLabel: 'Calm',
    description: 'How intense is your communication style?',
    gradient: 'from-red-500 to-blue-500'
  },
  {
    label: 'Authority',
    leftLabel: 'Peer',
    rightLabel: 'Teacher',
    description: 'Do you present as an expert or a fellow learner?',
    gradient: 'from-purple-500 to-indigo-500'
  },
  {
    label: 'Depth',
    leftLabel: 'Tactical',
    rightLabel: 'Philosophical',
    description: 'Do you focus on how-to or why?',
    gradient: 'from-pink-500 to-violet-500'
  },
  {
    label: 'Emotion',
    leftLabel: 'Analytical',
    rightLabel: 'Motivational',
    description: 'Data-driven or inspiration-driven?',
    gradient: 'from-cyan-500 to-orange-500'
  },
  {
    label: 'Risk',
    leftLabel: 'Safe',
    rightLabel: 'Controversial',
    description: 'How willing are you to challenge norms?',
    gradient: 'from-green-500 to-yellow-500'
  }
]

export default function CreateProfile() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [creatorName, setCreatorName] = useState('')
  const [niche, setNiche] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [values, setValues] = useState<Record<string, number>>({
    Tone: 50,
    Authority: 50,
    Depth: 50,
    Emotion: 50,
    Risk: 50
  })

  const updateValue = (dimension: string, value: number) => {
    setValues(prev => ({ ...prev, [dimension]: value }))
  }

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleComplete = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creatorName,
          niche,
          dimensions: values
        })
      })

      const data = await response.json()

      if (data.success) {
        // Profile created successfully, navigate to dashboard
        router.push('/dashboard')
      } else {
        console.error('Failed to create profile:', data.error)
        alert('Failed to create profile. Please try again.')
      }
    } catch (error) {
      console.error('Error creating profile:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-8">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-white">
              Build Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">Identity Vector</span>
            </h1>
            <div className="text-sm text-gray-400">
              Step {step} of 3
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Let&apos;s start with the basics</h2>
              <p className="text-gray-400">Tell us about yourself and your content niche</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Creator Name / Brand Name
                </label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Enter your name or brand"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content Niche
                </label>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g., Tech reviews, Fitness, Personal finance"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-purple-200">
                      <strong>Why this matters:</strong> Your identity vector will be calibrated to your specific niche,
                      ensuring recommendations align with both your personal brand and industry standards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Identity Dimensions */}
        {step === 2 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Define your target identity</h2>
              <p className="text-gray-400">Set your ideal position on each dimension - this becomes your north star</p>
            </div>

            <div className="space-y-8">
              {dimensions.map((dimension) => (
                <div key={dimension.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{dimension.label}</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">
                        {values[dimension.label]}%
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400">{dimension.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{dimension.leftLabel}</span>
                      <span>{dimension.rightLabel}</span>
                    </div>

                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={values[dimension.label]}
                        onChange={(e) => updateValue(dimension.label, parseInt(e.target.value))}
                        className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right,
                            rgb(139 92 246) 0%,
                            rgb(236 72 153) ${values[dimension.label]}%,
                            rgba(255,255,255,0.1) ${values[dimension.label]}%,
                            rgba(255,255,255,0.1) 100%)`
                        }}
                      />
                      <style jsx>{`
                        .slider::-webkit-slider-thumb {
                          appearance: none;
                          width: 24px;
                          height: 24px;
                          border-radius: 50%;
                          background: linear-gradient(135deg, rgb(168 85 247), rgb(236 72 153));
                          cursor: pointer;
                          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2);
                          transition: all 0.2s;
                        }
                        .slider::-webkit-slider-thumb:hover {
                          box-shadow: 0 0 0 6px rgba(168, 85, 247, 0.3);
                          transform: scale(1.1);
                        }
                        .slider::-moz-range-thumb {
                          width: 24px;
                          height: 24px;
                          border-radius: 50%;
                          background: linear-gradient(135deg, rgb(168 85 247), rgb(236 72 153));
                          cursor: pointer;
                          border: none;
                          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.2);
                        }
                      `}</style>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div>
                  <p className="text-sm text-blue-200">
                    <strong>Remember:</strong> These dimensions aren&apos;t permanent. They&apos;ll evolve as you upload content,
                    but they serve as your initial target identity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12 animate-fadeIn">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Review your identity vector</h2>
              <p className="text-gray-400">This is your brand DNA - your content will be analyzed against these dimensions</p>
            </div>

            <div className="space-y-6">
              {/* Basic info summary */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Profile Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Creator Name</p>
                    <p className="text-white font-medium">{creatorName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Niche</p>
                    <p className="text-white font-medium">{niche}</p>
                  </div>
                </div>
              </div>

              {/* Identity vector visualization */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Identity Dimensions</h3>
                <div className="space-y-4">
                  {dimensions.map((dimension) => (
                    <div key={dimension.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">{dimension.label}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">
                            {values[dimension.label] < 33 ? dimension.leftLabel :
                             values[dimension.label] > 66 ? dimension.rightLabel :
                             'Balanced'}
                          </span>
                          <span className="text-white font-semibold">{values[dimension.label]}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${dimension.gradient} rounded-full transition-all duration-500`}
                          style={{ width: `${values[dimension.label]}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Initial Coherence Target</span>
                    <span className="text-green-400 text-xl font-bold">100%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    As you upload videos, we&apos;ll track how your actual content aligns with this target
                  </p>
                </div>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-sm text-purple-200">
                      <strong>Next steps:</strong> After creating your profile, you&apos;ll be able to upload videos
                      to see how they impact your identity and get AI-powered recommendations that reinforce your brand.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              step === 1
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
          >
            Back
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && (!creatorName || !niche)}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                (step === 1 && (!creatorName || !niche))
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/50 transform hover:scale-105'
              }`}
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-xl text-white font-semibold transition-all transform ${
                isSubmitting
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50 hover:scale-105'
              }`}
            >
              {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
