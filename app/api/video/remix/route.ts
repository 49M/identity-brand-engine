import { NextRequest, NextResponse } from 'next/server'
import { remixVideoForBrand } from '@/lib/ai/backboard-initialize'
import { readMemory } from '@/lib/memory'

/**
 * POST /api/video/remix
 * Generate a brand-optimized remix of a video
 * Takes video analysis and creates a new script aligned with creator's identity
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoAnalysis } = body

    if (!videoAnalysis) {
      return NextResponse.json(
        { success: false, error: 'Video analysis data is required' },
        { status: 400 }
      )
    }

    // Get the Backboard session ID from meta memory
    const meta = await readMemory('meta')
    if (!meta.backboardSessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active Backboard session. Please recreate your profile.'
        },
        { status: 400 }
      )
    }

    console.log('🎬 Generating brand-optimized video remix...')

    // Generate the remix script
    const remixScript = await remixVideoForBrand(
      meta.backboardSessionId,
      videoAnalysis
    )

    console.log('✅ Video remix generated successfully')

    return NextResponse.json({
      success: true,
      remix: remixScript
    })
  } catch (error) {
    console.error('Video remix failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate video remix'
      },
      { status: 500 }
    )
  }
}
