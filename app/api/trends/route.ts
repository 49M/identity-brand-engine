import { NextResponse } from 'next/server'
import { analyzeTrendingContent } from '@/lib/ai/backboard-initialize'
import { readMemory } from '@/lib/memory'

/**
 * GET /api/trends
 * Analyze viral trends in the creator's niche using web search
 * Returns brand-aligned trend adaptations
 */
export async function GET() {
  try {
    // Get profile and brand data
    const profile = await readMemory('profile')
    const brand = await readMemory('brand')
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

    // Get niche from profile
    const niche = profile.creator.background.find((bg: string) => bg.length > 0) || 'content creation'

    console.log(`🔥 Analyzing trending ${niche} content...`)

    // Generate trend analysis with web search
    const trendAnalysis = await analyzeTrendingContent(
      meta.backboardSessionId,
      niche,
      profile.rawDimensions
    )

    console.log('✅ Trend analysis complete')

    return NextResponse.json({
      success: true,
      trends: trendAnalysis,
      niche
    })
  } catch (error) {
    console.error('Trend analysis failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze trends'
      },
      { status: 500 }
    )
  }
}
