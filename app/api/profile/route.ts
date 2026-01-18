import { NextRequest, NextResponse } from 'next/server'
import { writeMemory, initializeMemory, readMemory, resetMemory } from '@/lib/memory'
import { getOrCreateAssistant, uploadCreatorProfile, createCreatorThread, getInitialTargetAudience, cleanupAssistantDocuments } from '@/lib/ai/backboard-initialize'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      creatorName,
      niche,
      dimensions,
      experienceLevel,
      goals,
      ageRange,
      interests,
      painPoints,
      platforms,
      postingFrequency,
      videoLengthSeconds
    } = body

    // Reset memory system to ensure clean slate for new profile
    console.log('🔄 Resetting memory for new profile creation...')
    await resetMemory()

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
        experienceLevel: experienceLevel,
        background: [niche],
        goals: goals
      },
      audience: {
        targetViewer: {
          ageRange: ageRange,
          interests: interests,
          painPoints: painPoints
        },
        platforms: platforms
      },
      constraints: {
        postingFrequency: postingFrequency,
        videoLengthSeconds: videoLengthSeconds,
        tone: voiceStyle
      },
      rawDimensions: {
        tone: tone,
        authority: authority,
        depth: depth,
        emotion: emotion,
        risk: risk
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

      console.log('🧹 Step 2: Cleaning up old documents to ensure fresh context...')
      await cleanupAssistantDocuments(assistantId)

      console.log('📄 Step 3: Uploading creator profile as document...')
      const documentId = await uploadCreatorProfile(assistantId, profileMemory, brandMemory, creatorId)

      console.log('💬 Step 4: Creating thread for creator...')
      const threadId = await createCreatorThread(assistantId)

      console.log('🎯 Step 5: Generating target audience analysis...')
      const targetAudience = await getInitialTargetAudience(threadId)

      console.log('✅ Backboard initialization complete!')

      // Update profile with AI-generated target audience summary
      const updatedProfile = await readMemory('profile')
      updatedProfile.audience.aiGeneratedSummary = targetAudience
      await writeMemory('profile', updatedProfile)

      // Store Backboard IDs in meta (keep targetAudience here too for backward compatibility)
      await writeMemory('meta', {
        onboardingComplete: true,
        backboardSessionId: threadId,
        backboardAssistantId: assistantId,
        backboardDocumentId: documentId,
        lastUpdated: new Date().toISOString(),
        targetAudience: targetAudience
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
            documentId,
            targetAudience
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
