import { BackboardClient } from 'backboard-sdk'
import type { ProfileMemory, BrandMemory } from '@/lib/memory/types'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { selectModelForTask } from './model-router'

// Singleton Backboard client
let backboardClient: InstanceType<typeof BackboardClient> | null = null

export function getBackboardClient(): InstanceType<typeof BackboardClient> {
  if (!backboardClient) {
    backboardClient = new BackboardClient({
      apiKey: process.env.BACKBOARD_API_KEY || ''
    })
  }
  return backboardClient
}

// Global assistant ID (created once, reused for all creators)
let globalAssistantId: string | null = null

/**
 * Get or create the Brand Identity Curator assistant
 */
export async function getOrCreateAssistant(): Promise<string> {
  if (globalAssistantId) {
    return globalAssistantId
  }

  const client = getBackboardClient()

  try {
    const assistant = await client.createAssistant({
      name: 'Brand-Identity Curator',
      description: 'You are a world class assistant which helps creators define and stay true to their own voice and brand identity, while continuing to produce high performing content.',
      system_prompt: `You are an expert brand identity consultant for content creators.

Your role is to:
1. Help creators understand and refine their authentic voice
2. Analyze content for brand alignment
3. Provide personalized content recommendations
4. Track brand evolution over time
5. Ensure content stays true to the creator's identity while performing well

You have access to the creator's profile, brand dimensions, and content history through uploaded documents.
Always reference this context when providing advice.`
    })

    globalAssistantId = assistant.assistantId
    console.log('✅ Created Backboard assistant:', globalAssistantId)
    return assistant.assistantId
  } catch (error) {
    console.error('Failed to create assistant:', error)
    throw new Error('Could not initialize Backboard assistant')
  }
}

/**
 * Upload creator profile as document to Backboard
 */
export async function uploadCreatorProfile(
  assistantId: string,
  profile: ProfileMemory,
  brand: BrandMemory,
  creatorId: string
): Promise<string> {
  const client = getBackboardClient()

  // Convert profile to a formatted markdown document for upload
  const documentContent = `# Creator Profile: ${profile.creator.name}

## Identity Overview
- **Creator ID**: ${creatorId}
- **Niche**: ${profile.creator.background.join(', ')}
- **Experience Level**: ${profile.creator.experienceLevel}
- **Brand Archetype**: ${brand.persona.archetype}

## Goals
${profile.creator.goals.map(g => `- ${g}`).join('\n')}

## Target Audience
- **Age Range**: ${profile.audience.targetViewer.ageRange}
- **Interests**: ${profile.audience.targetViewer.interests.join(', ')}
- **Platforms**: ${profile.audience.platforms.join(', ') || 'To be determined'}

## Brand Voice
- **Style**: ${brand.persona.voice.style.join(', ')}
- **Pacing**: ${brand.persona.voice.pacing}
- **Emotional Range**: ${brand.persona.voice.emotionalRange.join(', ')}

## Core Themes
${brand.persona.coreThemes.map(t => `- ${t}`).join('\n')}

## Positioning
**Known For**: ${brand.positioning.whatYouAreKnownFor.join(', ')}
**Avoids**: ${brand.positioning.whatYouAvoid.join(', ') || 'No specific restrictions'}

## Constraints
- **Posting Frequency**: ${profile.constraints.postingFrequency}
- **Video Length**: ${profile.constraints.videoLengthSeconds}s
- **Tone Preferences**: ${profile.constraints.tone.join(', ')}

## Initial Confidence Score
${brand.confidenceScore} (will evolve with content uploads)

---
*This profile serves as the foundation for personalized brand recommendations and content analysis.*
`

  // Write to a temporary file (Node.js environment requires file path)
  const tempFilePath = join(tmpdir(), `${creatorId}_profile_${Date.now()}.md`)

  try {
    // Write document content to temp file
    await writeFile(tempFilePath, documentContent, 'utf-8')
    console.log('📝 Created temporary profile document:', tempFilePath)

    // Upload the file to Backboard
    const document = await client.uploadDocumentToAssistant(
      assistantId,
      tempFilePath
    )

    console.log('📄 Uploaded profile document:', document.documentId)

    // Wait for indexing
    console.log('⏳ Waiting for document to be indexed...')
    let attempts = 0
    const maxAttempts = 30 // 60 seconds max

    while (attempts < maxAttempts) {
      const status = await client.getDocumentStatus(document.documentId)

      if (status.status === 'indexed') {
        console.log('✅ Document indexed successfully!')

        // Clean up temp file
        await unlink(tempFilePath).catch(() => {
          console.warn('Could not delete temp file:', tempFilePath)
        })

        return document.documentId
      } else if (status.status === 'failed') {
        console.error('❌ Document indexing failed:', status.statusMessage)

        // Clean up temp file
        await unlink(tempFilePath).catch(() => {})

        throw new Error('Document indexing failed')
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }

    // Clean up temp file on timeout
    await unlink(tempFilePath).catch(() => {})
    throw new Error('Document indexing timeout')
  } catch (error) {
    console.error('Failed to upload profile document:', error)

    // Ensure temp file is cleaned up on error
    try {
      await unlink(tempFilePath)
    } catch {
      // Ignore cleanup errors
    }

    throw new Error('Could not upload creator profile')
  }
}

/**
 * Create a thread for a creator
 */
export async function createCreatorThread(assistantId: string): Promise<string> {
  const client = getBackboardClient()

  try {
    const thread = await client.createThread(assistantId)
    console.log('✅ Created thread:', thread.threadId)
    return thread.threadId
  } catch (error) {
    console.error('Failed to create thread:', error)
    throw new Error('Could not create thread')
  }
}

export async function getInitialTargetAudience(threadId: string): Promise<string> {
  const client = getBackboardClient();
  try {
    const response = await client.addMessage(threadId, {
      content: 'Based on the creator profile document provided, please summarize the ideal target audience for this content creator. Include demographics, interests, platforms they are most active on, content needs, and any other useful information. Keep it concise and very easy to follow and apply into the creators content strategy.',
      memory: 'Auto',
      llm_provider: selectModelForTask('identity_reasoning').provider,
      model_name: selectModelForTask('identity_reasoning').model,
      web_search: 'Auto'
    })

    return response.content || 'Unable to generate target audience summary'
  } catch (err) {
    console.error('Failed to get initial target audience:', err);
    throw new Error('Could not get initial target audience');
  }
}

/**
 * Update target audience based on profile changes
 */
export async function updateTargetAudience(
  threadId: string,
  changes: string[]
): Promise<string> {
  const client = getBackboardClient();

  try {
    const changesText = changes.length > 0
      ? `The following profile changes have been made:\n${changes.map(c => `- ${c}`).join('\n')}`
      : 'The creator profile has been updated.'

    const response = await client.addMessage(threadId, {
      content: `${changesText}

Based on these changes to the creator's profile, please review and update the target audience summary if needed. Consider whether these changes affect:
- Demographics or age range
- Interests and pain points
- Platform strategy
- Content needs and preferences

If the changes significantly impact the target audience, provide an updated summary. If the changes don't materially affect the target audience, you can keep the previous summary with minor adjustments or confirm it remains accurate. Keep it concise and actionable.`,
      memory: 'Auto',
      llm_provider: selectModelForTask('identity_reasoning').provider,
      model_name: selectModelForTask('identity_reasoning').model,
      web_search: 'Auto'
    })

    return response.content || 'Unable to update target audience summary'
  } catch (err) {
    console.error('Failed to update target audience:', err);
    throw new Error('Could not update target audience');
  }
}
