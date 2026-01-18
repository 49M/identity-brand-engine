import { NextResponse } from 'next/server'
import { readMemory } from '@/lib/memory'

/**
 * GET /api/brand-coherence
 * Calculate brand coherence score from uploaded video analyses
 * Returns average brand alignment score or null if no videos
 */
export async function GET() {
  try {
    const contentMemory = await readMemory('content')

    // Get all video analyses with brand alignment
    const videoAnalyses = contentMemory.videoAnalyses || []
    const videosWithAlignment = videoAnalyses.filter(
      video => video.brandAlignment && typeof video.brandAlignment.overallScore === 'number'
    )

    if (videosWithAlignment.length === 0) {
      return NextResponse.json({
        success: true,
        coherenceScore: null,
        videoCount: 0,
        message: 'No videos analyzed yet'
      })
    }

    // Calculate average brand alignment score
    const totalScore = videosWithAlignment.reduce(
      (sum, video) => sum + (video.brandAlignment?.overallScore || 0),
      0
    )
    const averageScore = totalScore / videosWithAlignment.length

    // Get score breakdown by dimension
    const dimensionTotals = {
      tone: 0,
      authority: 0,
      depth: 0,
      emotion: 0,
      risk: 0
    }

    videosWithAlignment.forEach(video => {
      if (video.brandAlignment?.dimensionScores) {
        dimensionTotals.tone += video.brandAlignment.dimensionScores.tone
        dimensionTotals.authority += video.brandAlignment.dimensionScores.authority
        dimensionTotals.depth += video.brandAlignment.dimensionScores.depth
        dimensionTotals.emotion += video.brandAlignment.dimensionScores.emotion
        dimensionTotals.risk += video.brandAlignment.dimensionScores.risk
      }
    })

    const dimensionAverages = {
      tone: Math.round(dimensionTotals.tone / videosWithAlignment.length),
      authority: Math.round(dimensionTotals.authority / videosWithAlignment.length),
      depth: Math.round(dimensionTotals.depth / videosWithAlignment.length),
      emotion: Math.round(dimensionTotals.emotion / videosWithAlignment.length),
      risk: Math.round(dimensionTotals.risk / videosWithAlignment.length)
    }

    return NextResponse.json({
      success: true,
      coherenceScore: Math.round(averageScore),
      videoCount: videosWithAlignment.length,
      dimensionAverages,
      latestVideo: videosWithAlignment[videosWithAlignment.length - 1]?.fileName
    })
  } catch (error) {
    console.error('Failed to calculate brand coherence:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate brand coherence'
      },
      { status: 500 }
    )
  }
}
