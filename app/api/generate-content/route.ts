import { NextRequest, NextResponse } from 'next/server'
import { readMemory, writeMemory } from '@/lib/memory'
import { getOrCreateIdeasThread, sendIdeasMessage } from '@/lib/ai/backboard-initialize'

/**
 * POST /api/generate-content
 *
 * Handles content idea generation using Backboard AI with OpenAI model.
 * Maintains a separate thread for content ideas, distinct from profile management.
 *
 * Request body:
 * - message: string - User's message/prompt for content ideas
 *
 * Response:
 * - success: boolean
 * - message: string - AI response
 * - threadId: string - Backboard thread ID (for client-side tracking)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, profileUrl } = body

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Read meta to get assistant and thread IDs
    const meta = await readMemory('meta')

    if (!meta.backboardAssistantId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile not initialized. Please complete onboarding first.'
        },
        { status: 400 }
      )
    }

    console.log('💬 Processing content ideas message...')

    // Get or create ideas thread (separate from profile thread)
    const ideasThreadId = await getOrCreateIdeasThread(
      meta.backboardAssistantId,
      meta.backboardIdeasThreadId
    )

    // Save thread ID if it's new
    if (!meta.backboardIdeasThreadId) {
      await writeMemory('meta', {
        ...meta,
        backboardIdeasThreadId: ideasThreadId,
        lastUpdated: new Date().toISOString()
      })
      console.log('💾 Saved new ideas thread ID to meta')
    }

    // Send message to Backboard and get AI response
    console.log('🤖 Sending message to Backboard AI (OpenAI GPT-4o)...')
    const aiResponse = await sendIdeasMessage(ideasThreadId, message, profileUrl)

    console.log('✅ Content ideas generated successfully')

    return NextResponse.json({
      success: true,
      message: aiResponse,
      threadId: ideasThreadId
    })
  } catch (error) {
    console.error('❌ Error generating content ideas:', error)

    // Provide more specific error messages
    const errorMessage = error instanceof Error
      ? error.message
      : 'Failed to generate content ideas'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/generate-content
 *
 * Returns the current ideas thread ID if it exists.
 * Useful for checking if a conversation is already in progress.
 */
export async function GET() {
  try {
    const meta = await readMemory('meta')

    return NextResponse.json({
      success: true,
      hasThread: !!meta.backboardIdeasThreadId,
      threadId: meta.backboardIdeasThreadId || null
    })
  } catch (error) {
    console.error('Error fetching ideas thread info:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch thread info' },
      { status: 500 }
    )
  }
}
