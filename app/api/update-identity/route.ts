import { NextRequest, NextResponse } from 'next/server'
import { writeMemory, readMemory } from '@/lib/memory'
import type { ProfileMemory, BrandMemory } from '@/lib/memory/types'
import { updateTargetAudience } from '@/lib/ai/backboard-initialize'

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

    // Track changes for target audience update
    const changes: string[] = []

    // Map dimensions to brand persona updates
    const tone = dimensions.Tone
    const authority = dimensions.Authority
    const depth = dimensions.Depth
    const emotion = dimensions.Emotion
    const risk = dimensions.Risk

    // Track dimension changes
    const oldDimensions = profileMemory.rawDimensions || {}
    if (oldDimensions.tone !== tone) {
      changes.push(`Tone dimension changed from ${oldDimensions.tone} to ${tone}`)
    }
    if (oldDimensions.authority !== authority) {
      changes.push(`Authority dimension changed from ${oldDimensions.authority} to ${authority}`)
    }
    if (oldDimensions.depth !== depth) {
      changes.push(`Depth dimension changed from ${oldDimensions.depth} to ${depth}`)
    }
    if (oldDimensions.emotion !== emotion) {
      changes.push(`Emotion dimension changed from ${oldDimensions.emotion} to ${emotion}`)
    }
    if (oldDimensions.risk !== risk) {
      changes.push(`Risk dimension changed from ${oldDimensions.risk} to ${risk}`)
    }

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
    const newArchetype = authority > 60 ? 'Educator-Expert' : 'Peer-Guide'
    if (brandMemory.persona.archetype !== newArchetype) {
      changes.push(`Brand archetype changed from ${brandMemory.persona.archetype} to ${newArchetype}`)
    }
    brandMemory.persona.archetype = newArchetype
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
    if (experienceLevel !== undefined && profileMemory.creator.experienceLevel !== experienceLevel) {
      changes.push(`Experience level changed from "${profileMemory.creator.experienceLevel}" to "${experienceLevel}"`)
      profileMemory.creator.experienceLevel = experienceLevel
    }
    if (goals !== undefined && JSON.stringify(profileMemory.creator.goals) !== JSON.stringify(goals)) {
      changes.push(`Updated goals: ${goals.join('; ')}`)
      profileMemory.creator.goals = goals
    }
    if (ageRange !== undefined && profileMemory.audience.targetViewer.ageRange !== ageRange) {
      changes.push(`Target age range changed from "${profileMemory.audience.targetViewer.ageRange}" to "${ageRange}"`)
      profileMemory.audience.targetViewer.ageRange = ageRange
    }
    if (interests !== undefined && JSON.stringify(profileMemory.audience.targetViewer.interests) !== JSON.stringify(interests)) {
      changes.push(`Target audience interests updated: ${interests.join(', ')}`)
      profileMemory.audience.targetViewer.interests = interests
    }
    if (painPoints !== undefined && JSON.stringify(profileMemory.audience.targetViewer.painPoints) !== JSON.stringify(painPoints)) {
      changes.push(`Target audience pain points updated: ${painPoints.join('; ')}`)
      profileMemory.audience.targetViewer.painPoints = painPoints
    }
    if (platforms !== undefined && JSON.stringify(profileMemory.audience.platforms) !== JSON.stringify(platforms)) {
      changes.push(`Platform preferences changed from [${profileMemory.audience.platforms.join(', ')}] to [${platforms.join(', ')}]`)
      profileMemory.audience.platforms = platforms
    }
    if (postingFrequency !== undefined && profileMemory.constraints.postingFrequency !== postingFrequency) {
      changes.push(`Posting frequency changed from "${profileMemory.constraints.postingFrequency}" to "${postingFrequency}"`)
      profileMemory.constraints.postingFrequency = postingFrequency
    }
    if (videoLengthSeconds !== undefined && profileMemory.constraints.videoLengthSeconds !== videoLengthSeconds) {
      changes.push(`Video length preference changed from ${profileMemory.constraints.videoLengthSeconds}s to ${videoLengthSeconds}s`)
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

    // Update target audience if there are changes and we have a Backboard thread
    let updatedTargetAudience = null
    if (changes.length > 0 && meta.backboardSessionId) {
      try {
        console.log('🎯 Updating target audience based on profile changes...')
        console.log('Changes detected:', changes)

        updatedTargetAudience = await updateTargetAudience(
          meta.backboardSessionId,
          changes
        )

        // Update the profile with the new target audience summary
        profileMemory.audience.aiGeneratedSummary = updatedTargetAudience
        await writeMemory('profile', profileMemory)

        // Also update meta for backward compatibility
        await writeMemory('meta', {
          ...meta,
          targetAudience: updatedTargetAudience,
          lastUpdated: new Date().toISOString()
        })

        console.log('✅ Target audience updated successfully')
      } catch (error) {
        console.error('⚠️  Failed to update target audience:', error)
        // Don't fail the whole request if target audience update fails
      }
    } else if (changes.length > 0) {
      console.log('⚠️  Profile changes detected but no Backboard session found')
    } else {
      console.log('ℹ️  No profile changes detected, target audience remains the same')
    }

    return NextResponse.json({
      success: true,
      message: 'Identity updated successfully',
      data: {
        profile: profileMemory,
        brand: brandMemory,
        targetAudienceUpdated: updatedTargetAudience !== null,
        changes: changes
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
