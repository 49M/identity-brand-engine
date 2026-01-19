import { NextResponse } from 'next/server'
import { analyzeTrendingContent, getBackboardClient } from '@/lib/ai/backboard-initialize'
import { readMemory, writeMemory } from '@/lib/memory'

/**
 * GET /api/trends
 * Analyze viral trends in the creator's niche using web search
 * Returns brand-aligned trend adaptations
 */
export async function GET() {
  try {
    // Get profile data
    const profile = await readMemory('profile')
    const meta = await readMemory('meta')

    if (!meta.backboardAssistantId) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active Backboard session. Please recreate your profile.'
        },
        { status: 400 }
      )
    }

    // Get or create a dedicated thread for trend analysis (separate from profile/audience thread)
    // Reuse the backboardIdeasThreadId since trends and ideas are both content-generation tasks
    let trendsThreadId = meta.backboardIdeasThreadId

    if (!trendsThreadId) {
      console.log('🆕 Creating dedicated thread for trend analysis...')
      const client = getBackboardClient()
      const thread = await client.createThread(meta.backboardAssistantId)
      trendsThreadId = thread.threadId

      // Store the new trends thread ID
      meta.backboardIdeasThreadId = trendsThreadId
      await writeMemory('meta', meta)
      console.log('✅ Created trends thread:', trendsThreadId)
    }

    // Get niche from profile
    const niche = profile.creator.background.find((bg: string) => bg.length > 0) || 'content creation'

    console.log(`🔥 Analyzing trending ${niche} content using thread ${trendsThreadId}...`)

    // Generate trend analysis with web search using dedicated trends thread
    const trendAnalysis = await analyzeTrendingContent(
      trendsThreadId!,
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
