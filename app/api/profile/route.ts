import { NextRequest, NextResponse } from 'next/server'
import { writeMemory, initializeMemory, readMemory } from '@/lib/memory'
import { getOrCreateAssistant, uploadCreatorProfile, createCreatorThread } from '@/lib/ai/backboard-initialize'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { creatorName, niche, dimensions } = body

    // Ensure JSON memory system is initialized
    await initializeMemory()

    // Generate a unique creator ID (in production, use proper user ID)
    const creatorId = creatorName.toLowerCase().replace(/\s+/g, '_')

    console.log('🧠 Initializing Backboard for adaptive memory...')

    // Map the UI dimensions to brand persona data
    const tone = dimensions.Tone
    const authority = dimensions.Authority
    const depth = dimensions.Depth
    const emotion = dimensions.Emotion
    const risk = dimensions.Risk

    // Determine voice style based on dimensions
    const voiceStyle: string[] = []
    if (tone < 40) voiceStyle.push('aggressive', 'intense')
    else if (tone > 60) voiceStyle.push('calm', 'measured')
    else voiceStyle.push('balanced')

    // Determine emotional range
    const emotionalRange: string[] = []
    if (emotion < 40) emotionalRange.push('analytical', 'logical')
    else if (emotion > 60) emotionalRange.push('motivational', 'inspiring')
    else emotionalRange.push('balanced', 'practical')

    // Determine pacing
    let pacing = 'moderate'
    if (tone < 40) pacing = 'fast'
    else if (tone > 70) pacing = 'slow'

    // Determine content depth/approach based on depth dimension
    const contentApproach: string[] = []
    if (depth < 40) {
      contentApproach.push('tactical', 'how-to', 'actionable')
    } else if (depth > 60) {
      contentApproach.push('philosophical', 'conceptual', 'big-picture')
    } else {
      contentApproach.push('balanced', 'practical-theory')
    }

    // Write to profile.json
    await writeMemory('profile', {
      creator: {
        name: creatorName,
        experienceLevel: 'beginner', // Can be expanded in future
        background: [niche],
        goals: ['grow personal brand', 'create consistent content']
      },
      audience: {
        targetViewer: {
          ageRange: '18-35', // Default, can be customized later
          interests: [niche],
          painPoints: []
        },
        platforms: []
      },
      constraints: {
        postingFrequency: 'daily',
        videoLengthSeconds: 30,
        tone: voiceStyle
      }
    })

    // Write to brand.json - initialize with inferred persona
    const brandData = {
      persona: {
        archetype: authority > 60 ? 'Educator-Expert' : 'Peer-Guide',
        coreThemes: [niche, ...contentApproach],
        voice: {
          style: voiceStyle,
          pacing,
          emotionalRange
        }
      },
      positioning: {
        whatYouAreKnownFor: [niche, ...contentApproach.slice(0, 1)],
        whatYouAvoid: risk < 40 ? ['controversial topics'] : []
      },
      confidenceScore: 0.5 // Initial confidence, will evolve with content
    }
    await writeMemory('brand', brandData)

    // Read the written memories for Backboard upload
    const profileMemory = await readMemory('profile')
    const brandMemory = await readMemory('brand')

    // Initialize Backboard: Create assistant, upload profile, create thread
    try {
      console.log('📋 Step 1: Getting or creating Backboard assistant...')
      const assistantId = await getOrCreateAssistant()

      console.log('📄 Step 2: Uploading creator profile as document...')
      const documentId = await uploadCreatorProfile(assistantId, profileMemory, brandMemory, creatorId)

      console.log('💬 Step 3: Creating thread for creator...')
      const threadId = await createCreatorThread(assistantId)

      console.log('✅ Backboard initialization complete!')

      // Store Backboard IDs in meta
      await writeMemory('meta', {
        onboardingComplete: true,
        backboardSessionId: threadId,
        backboardAssistantId: assistantId,
        backboardDocumentId: documentId,
        lastUpdated: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: 'Profile created successfully with Backboard integration',
        data: {
          creatorName,
          niche,
          dimensions,
          backboard: {
            assistantId,
            threadId,
            documentId
          }
        }
      })
    } catch (backboardError) {
      console.error('⚠️  Backboard integration failed:', backboardError)

      // Fallback: Still complete profile creation without Backboard
      await writeMemory('meta', {
        onboardingComplete: true,
        lastUpdated: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: 'Profile created successfully (Backboard unavailable)',
        data: {
          creatorName,
          niche,
          dimensions,
          warning: 'Backboard integration failed - profile created in local mode'
        }
      })
    }
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { readMemory } = await import('@/lib/memory')
    const profile = await readMemory('profile')
    const brand = await readMemory('brand')

    return NextResponse.json({
      success: true,
      data: {
        profile,
        brand
      }
    })
  } catch (error) {
    console.error('Error reading profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to read profile' },
      { status: 500 }
    )
  }
}
