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
 * Delete a document from Backboard assistant
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const client = getBackboardClient()

  try {
    await client.deleteDocument(documentId)
    console.log('🗑️  Deleted old document:', documentId)
  } catch (error) {
    console.error('Failed to delete document:', error)
    // Don't throw - we want to continue even if deletion fails
  }
}

/**
 * Delete all documents from an assistant to ensure clean context
 */
export async function cleanupAssistantDocuments(assistantId: string): Promise<void> {
  const client = getBackboardClient()

  try {
    console.log('🧹 Cleaning up old documents from assistant...')

    // Get all documents for this assistant
    const documents = await client.listAssistantDocuments(assistantId)

    if (documents && documents.length > 0) {
      console.log(`   Found ${documents.length} existing document(s) to remove`)

      // Delete each document
      for (const doc of documents) {
        if (doc.documentId) {
          await deleteDocument(doc.documentId)
        }
      }

      console.log('✅ All old documents cleaned up')
    } else {
      console.log('   No existing documents to clean up')
    }
  } catch (error) {
    console.error('Failed to cleanup assistant documents:', error)
    // Don't throw - we want to continue even if cleanup fails
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
      content: 'Based on my creator profile document provided, please summarize the ideal target audience for me as a content creator. Include demographics, interests, platforms they are most active on, content needs, and any other useful information. Keep it concise and very easy to follow and apply into the creators content strategy.',
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

/**
 * Get or create a thread for content ideas generation
 * This thread is separate from the profile/audience thread to maintain clean contexts
 */
export async function getOrCreateIdeasThread(
  assistantId: string,
  existingThreadId?: string
): Promise<string> {
  if (existingThreadId) {
    console.log('✅ Using existing ideas thread:', existingThreadId)
    return existingThreadId
  }

  const client = getBackboardClient()

  try {
    const thread = await client.createThread(assistantId)
    console.log('✅ Created new ideas thread:', thread.threadId)
    return thread.threadId
  } catch (error) {
    console.error('Failed to create ideas thread:', error)
    throw new Error('Could not create ideas thread')
  }
}

/**
 * Send a message to the ideas thread and get AI response
 */
export async function sendIdeasMessage(
  threadId: string,
  message: string,
  profileUrl?: string
): Promise<string> {
  const client = getBackboardClient()

  try {
    const response = await client.addMessage(threadId, {
      content: `${profileUrl ? `Reference the profile URL: ${profileUrl}` : ''}\n\nMessage: ${message}`,
      memory: 'Auto',
      llm_provider: selectModelForTask('content_generation').provider,
      model_name: selectModelForTask('content_generation').model,
      web_search: 'Auto'
    })

    return response.content || 'Unable to generate response'
  } catch (err) {
    console.error('Failed to send ideas message:', err)
    throw new Error('Could not send message to ideas thread')
  }
}

/**
 * Analyze video brand alignment using Backboard.io with Grok-3
 * Compares video analysis against creator's 5-dimension brand identity
 */
interface VideoChapter {
  chapterTitle?: string
  headline?: string
  chapterSummary?: string
  summary?: string
  start?: number
  end?: number
}

interface VideoHighlight {
  highlightTitle?: string
  title?: string
  highlightSummary?: string
  summary?: string
  start?: number
  end?: number
}

export async function analyzeVideoBrandAlignment(
  threadId: string,
  videoAnalysis: {
    title: string
    topics: string[]
    hashtags: string[]
    summary: string
    chapters?: VideoChapter[]
    highlights?: VideoHighlight[]
  }
): Promise<{
  overallScore: number
  dimensionScores: {
    tone: number
    authority: number
    depth: number
    emotion: number
    risk: number
  }
  strengths: string[]
  improvements: string[]
  recommendations: string
}> {
  const client = getBackboardClient()

  try {
    console.log('🎯 Analyzing video brand alignment with Grok-3...')
    // Format chapters and highlights for context
    const chaptersText = videoAnalysis.chapters && videoAnalysis.chapters.length > 0
      ? `\n\nChapters:\n${videoAnalysis.chapters.map((ch: VideoChapter, i: number) =>
          `${i + 1}. ${ch.chapterTitle || ch.headline || 'Chapter'} (${ch.start || 0}s - ${ch.end || 0}s): ${ch.chapterSummary || ch.summary || ''}`
        ).join('\n')}`
      : ''

    const highlightsText = videoAnalysis.highlights && videoAnalysis.highlights.length > 0
      ? `\n\nKey Highlights:\n${videoAnalysis.highlights.map((hl: VideoHighlight, i: number) =>
          `${i + 1}. ${hl.highlightTitle || hl.title || 'Highlight'} (${hl.start || 0}s - ${hl.end || 0}s): ${hl.highlightSummary || hl.summary || ''}`
        ).join('\n')}`
      : ''

    const prompt = `Using my brand identity and target audience specification from our previous conversations memory, analyze how well this video aligns with my authentic brand.

**Video Analysis from Twelve Labs:**
- **Title**: ${videoAnalysis.title}
- **Topics**: ${videoAnalysis.topics.join(', ')}
- **Hashtags**: ${videoAnalysis.hashtags.join(', ')}
- **Summary**: ${videoAnalysis.summary}${chaptersText}${highlightsText}

**Your Task:**
As a content creator, I need ACTIONABLE feedback on this video - not just a recap. Tell me EXACTLY what's working and what's not, with specific timestamps and examples.

Provide your response in the following JSON format (respond ONLY with valid JSON, no other text):

{
  "overallScore": <number 0-100>,
  "dimensionScores": {
    "tone": <number 0-100>,
    "authority": <number 0-100>,
    "depth": <number 0-100>,
    "emotion": <number 0-100>,
    "risk": <number 0-100>
  },
  "strengths": [<array of 2-4 SPECIFIC strengths with timestamps/examples from the video>],
  "improvements": [<array of 2-4 SPECIFIC, ACTIONABLE suggestions with timestamps/examples>],
  "recommendations": "<1-2 sentences on whether I should create more content like this or adjust my approach>"
}

**CRITICAL REQUIREMENTS:**
- Be SPECIFIC with timestamps (e.g., "at 0:45 the personal story creates authentic vulnerability")
- Be ACTIONABLE (e.g., "add 30 seconds explaining the technical process at 1:20 because your audience expects depth")
- Reference ACTUAL content from the video analysis (topics, chapters, highlights)
- Use creator-focused language (what I should DO, not academic analysis)
- Don't say "good emotional connection" - say "the story at X timestamp connects emotionally because Y"
- Don't say "add more depth" - say "explain X in more detail at Y timestamp, similar to your top-performing content"`

    const response = await client.addMessage(threadId, {
      content: prompt,
      memory: 'Auto',
      llm_provider: selectModelForTask('trend_analysis').provider,  // Use X.AI for Grok-3
      model_name: selectModelForTask('trend_analysis').model,  // Grok-3 model
      web_search: 'Off'  // Don't need web search for this analysis
    })

    console.log('✅ Brand alignment analysis complete')

    // Parse JSON response
    const content = response.content || '{}'

    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? jsonMatch[0] : content

    const result = JSON.parse(jsonStr)

    return {
      overallScore: result.overallScore || 50,
      dimensionScores: result.dimensionScores || {
        tone: 50,
        authority: 50,
        depth: 50,
        emotion: 50,
        risk: 50
      },
      strengths: result.strengths || [],
      improvements: result.improvements || [],
      recommendations: result.recommendations || 'Unable to generate recommendations'
    }
  } catch (error) {
    console.error('Failed to analyze video brand alignment:', error)

    // Return default scores on error
    return {
      overallScore: 50,
      dimensionScores: {
        tone: 50,
        authority: 50,
        depth: 50,
        emotion: 50,
        risk: 50
      },
      strengths: ['Analysis unavailable'],
      improvements: ['Please try again'],
      recommendations: 'Unable to analyze brand alignment at this time.'
    }
  }
}
