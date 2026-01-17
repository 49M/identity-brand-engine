'use client'

import { useState, useEffect } from 'react'

interface IdentityDimensions {
  Tone: number
  Authority: number
  Depth: number
  Emotion: number
  Risk: number
}

interface EditIdentityPanelProps {
  onClose: () => void
  currentDimensions: IdentityDimensions
  onSave: (newDimensions: IdentityDimensions) => Promise<void>
}

export default function EditIdentityPanel({ onClose, currentDimensions, onSave }: EditIdentityPanelProps) {
  const [dimensions, setDimensions] = useState<IdentityDimensions>(currentDimensions)
  const [isSaving, setIsSaving] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  // Calculate overall difference percentage
  const calculateTotalDifference = () => {
    const differences = Object.keys(dimensions).map(key => {
      const k = key as keyof IdentityDimensions
      return Math.abs(dimensions[k] - currentDimensions[k])
    })
    const totalDiff = differences.reduce((sum, diff) => sum + diff, 0)
    return Math.round(totalDiff / Object.keys(dimensions).length)
  }

  // Get impact summary for each dimension
  const getDimensionImpact = (dimension: keyof IdentityDimensions) => {
    const oldValue = currentDimensions[dimension]
    const newValue = dimensions[dimension]
    const diff = newValue - oldValue

    if (Math.abs(diff) < 5) return null

    const impacts: Record<keyof IdentityDimensions, { increase: string; decrease: string }> = {
      Tone: {
        increase: 'More calm, measured communication',
        decrease: 'More aggressive, intense delivery'
      },
      Authority: {
        increase: 'More teacher/expert positioning',
        decrease: 'More peer-to-peer relatability'
      },
      Depth: {
        increase: 'More philosophical, big-picture thinking',
        decrease: 'More tactical, actionable content'
      },
      Emotion: {
        increase: 'More motivational, inspiring tone',
        decrease: 'More analytical, logical approach'
      },
      Risk: {
        increase: 'More willing to tackle controversial topics',
        decrease: 'More focus on safe, established ideas'
      }
    }

    return {
      diff,
      message: diff > 0 ? impacts[dimension].increase : impacts[dimension].decrease
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(dimensions)
    } finally {
      setIsSaving(false)
    }
  }

  const hasChanges = calculateTotalDifference() > 0

  useEffect(() => {
    setShowComparison(hasChanges)
  }, [hasChanges])

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-orange-500/50 rounded-2xl p-8 mb-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </span>
            Edit Your Identity
          </h2>
          <p className="text-gray-400 text-sm mt-1 ml-13">Adjust your brand dimensions to refine your content style</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column: Sliders */}
        <div className="space-y-6">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-orange-300 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Move the sliders to adjust your identity dimensions</span>
            </div>
          </div>

          {(Object.keys(dimensions) as Array<keyof IdentityDimensions>).map((dimension) => {
            const impact = getDimensionImpact(dimension)
            const hasChanged = Math.abs(dimensions[dimension] - currentDimensions[dimension]) >= 5

            return (
              <div key={dimension} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-white font-semibold flex items-center gap-2">
                    {dimension}
                    {hasChanged && (
                      <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded-full">
                        Modified
                      </span>
                    )}
                  </label>
                  <span className="text-2xl font-bold text-white">{dimensions[dimension]}</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={dimensions[dimension]}
                  onChange={(e) => setDimensions({ ...dimensions, [dimension]: parseInt(e.target.value) })}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-orange-500
                    [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-orange-500/50
                    [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />

                <div className="flex justify-between text-xs text-gray-400">
                  <span>{dimension === 'Tone' ? 'Aggressive' :
                         dimension === 'Authority' ? 'Peer' :
                         dimension === 'Depth' ? 'Tactical' :
                         dimension === 'Emotion' ? 'Analytical' : 'Safe'}</span>
                  <span>{dimension === 'Tone' ? 'Calm' :
                         dimension === 'Authority' ? 'Teacher' :
                         dimension === 'Depth' ? 'Philosophical' :
                         dimension === 'Emotion' ? 'Motivational' : 'Controversial'}</span>
                </div>

                {impact && (
                  <div className={`text-xs px-3 py-2 rounded-lg flex items-start gap-2 ${
                    impact.diff > 0 ? 'bg-green-500/10 text-green-300' : 'bg-blue-500/10 text-blue-300'
                  }`}>
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={impact.diff > 0 ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"} />
                    </svg>
                    <span>{impact.message}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Right Column: Impact Summary */}
        <div className="space-y-4">
          {showComparison ? (
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6 sticky top-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-300">{calculateTotalDifference()}%</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Overall Change</h3>
                  <p className="text-sm text-orange-200">Average shift across dimensions</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-white uppercase tracking-wide">Impact Summary</h4>
                {(Object.keys(dimensions) as Array<keyof IdentityDimensions>).map((dimension) => {
                  const impact = getDimensionImpact(dimension)
                  if (!impact) return null

                  return (
                    <div key={dimension} className="flex items-start gap-2 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        impact.diff > 0 ? 'bg-green-400' : 'bg-blue-400'
                      }`} />
                      <div>
                        <span className="text-white font-semibold">{dimension}:</span>
                        <span className="text-orange-100/90 ml-1">{impact.message}</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-start gap-2 text-sm text-orange-200">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-orange-100 mb-1">What this means:</p>
                    <p className="text-orange-200/90">
                      Your brand voice and content style will shift based on these adjustments.
                      The AI will use these updated dimensions to generate more aligned content recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm">
                  Adjust the sliders to see<br />how your identity will change
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
        <button
          onClick={() => setDimensions(currentDimensions)}
          disabled={!hasChanges}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset Changes
        </button>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg
              hover:shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
