import { NextRequest, NextResponse } from 'next/server'
import { writeMemory, readMemory } from '@/lib/memory'
import type { ProfileMemory, BrandMemory } from '@/lib/memory/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
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

    // Read current memories
    const profileMemory = await readMemory('profile') as ProfileMemory
    const brandMemory = await readMemory('brand') as BrandMemory

    // Map dimensions to brand persona updates
    const tone = dimensions.Tone
    const authority = dimensions.Authority
    const depth = dimensions.Depth
    const emotion = dimensions.Emotion
    const risk = dimensions.Risk

    // Determine voice style based on new dimensions
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

    // Determine content approach based on depth dimension
    const contentApproach: string[] = []
    if (depth < 40) {
      contentApproach.push('tactical', 'how-to', 'actionable')
    } else if (depth > 60) {
      contentApproach.push('philosophical', 'conceptual', 'big-picture')
    } else {
      contentApproach.push('balanced', 'practical-theory')
    }

    // Update brand memory
    brandMemory.persona.archetype = authority > 60 ? 'Educator-Expert' : 'Peer-Guide'
    brandMemory.persona.coreThemes = [
      profileMemory.creator.background[0],
      ...contentApproach
    ]
    brandMemory.persona.voice.style = voiceStyle
    brandMemory.persona.voice.pacing = pacing
    brandMemory.persona.voice.emotionalRange = emotionalRange
    brandMemory.positioning.whatYouAvoid = risk < 40 ? ['controversial topics'] : []

    // Update profile constraints
    profileMemory.constraints.tone = voiceStyle

    // Update profile with new fields if provided
    if (experienceLevel !== undefined) {
      profileMemory.creator.experienceLevel = experienceLevel
    }
    if (goals !== undefined) {
      profileMemory.creator.goals = goals
    }
    if (ageRange !== undefined) {
      profileMemory.audience.targetViewer.ageRange = ageRange
    }
    if (interests !== undefined) {
      profileMemory.audience.targetViewer.interests = interests
    }
    if (painPoints !== undefined) {
      profileMemory.audience.targetViewer.painPoints = painPoints
    }
    if (platforms !== undefined) {
      profileMemory.audience.platforms = platforms
    }
    if (postingFrequency !== undefined) {
      profileMemory.constraints.postingFrequency = postingFrequency
    }
    if (videoLengthSeconds !== undefined) {
      profileMemory.constraints.videoLengthSeconds = videoLengthSeconds
    }

    // Save rawDimensions
    profileMemory.rawDimensions = {
      tone,
      authority,
      depth,
      emotion,
      risk
    }

    // Write updated memories
    await writeMemory('profile', profileMemory)
    await writeMemory('brand', brandMemory)

    // Update meta timestamp
    const meta = await readMemory('meta')
    await writeMemory('meta', {
      ...meta,
      lastUpdated: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Identity updated successfully',
      data: {
        profile: profileMemory,
        brand: brandMemory
      }
    })
  } catch (error) {
    console.error('Error updating identity:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update identity' },
      { status: 500 }
    )
  }
}
