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

/**
 * Generate a remix of a video optimized for the creator's brand identity
 * Takes original video analysis and creates a new script/format that maintains virality
 * while aligning with the creator's authentic voice
 */
export async function remixVideoForBrand(
  threadId: string,
  videoAnalysis: {
    title: string
    topics: string[]
    hashtags: string[]
    summary: string
    chapters?: unknown[]
    highlights?: unknown[]
    brandAlignment?: {
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
    }
  }
): Promise<string> {
  const client = getBackboardClient()

  try {
    // Format chapters if available
    const chaptersText = videoAnalysis.chapters && Array.isArray(videoAnalysis.chapters) && videoAnalysis.chapters.length > 0
      ? `\n\nVideo Chapters:\n${videoAnalysis.chapters.map((ch: unknown, i: number) => {
          const chapter = ch as VideoChapter
          return `${i + 1}. ${chapter.chapterTitle || chapter.headline || 'Chapter'} (${chapter.start || 0}s - ${chapter.end || 0}s): ${chapter.chapterSummary || chapter.summary || ''}`
        }).join('\n')}`
      : ''

    // Format highlights if available
    const highlightsText = videoAnalysis.highlights && Array.isArray(videoAnalysis.highlights) && videoAnalysis.highlights.length > 0
      ? `\n\nKey Highlights:\n${videoAnalysis.highlights.map((hl: unknown, i: number) => {
          const highlight = hl as VideoHighlight
          return `${i + 1}. ${highlight.highlightTitle || highlight.title || 'Highlight'} (${highlight.start || 0}s - ${highlight.end || 0}s): ${highlight.highlightSummary || highlight.summary || ''}`
        }).join('\n')}`
      : ''

    // Format brand alignment feedback
    const alignmentText = videoAnalysis.brandAlignment
      ? `\n\n**Current Brand Alignment:**
- Overall Score: ${videoAnalysis.brandAlignment.overallScore}/100
- Dimension Scores: Tone (${videoAnalysis.brandAlignment.dimensionScores.tone}), Authority (${videoAnalysis.brandAlignment.dimensionScores.authority}), Depth (${videoAnalysis.brandAlignment.dimensionScores.depth}), Emotion (${videoAnalysis.brandAlignment.dimensionScores.emotion}), Risk (${videoAnalysis.brandAlignment.dimensionScores.risk})
- Strengths: ${videoAnalysis.brandAlignment.strengths.join('; ')}
- Areas to Improve: ${videoAnalysis.brandAlignment.improvements.join('; ')}`
      : ''

    const prompt = `I want to REMIX this video to be perfectly aligned with my brand identity while maintaining its viral potential.

**Original Video:**
- Title: ${videoAnalysis.title}
- Topics: ${videoAnalysis.topics.join(', ')}
- Summary: ${videoAnalysis.summary}${chaptersText}${highlightsText}${alignmentText}

**Your Task:**
Using my brand identity from our conversation memory, create a COMPLETE, READY-TO-FILM video script that:
1. Keeps the viral hooks and engagement patterns from the original
2. Transforms the content to match MY authentic voice and brand dimensions
3. Maintains the same core value but expresses it through MY lens
4. Provides specific scene-by-scene instructions I can follow

**Output Format (use markdown formatting):**

# Remixed Video Script

## 📝 New Title
[Your brand-aligned title that maintains virality]

## 🎯 Hook (0-5 seconds)
[Exact words to say + visual description]
*Why this works for your brand: [brief explanation]*

## 🎬 Scene-by-Scene Breakdown

### Scene 1: [Name] (5-15 seconds)
**Visuals:** [Specific camera angles, settings, props]
**Script:**
> [Exact words to say, formatted as dialogue]

**Delivery Notes:** [How to say it - tone, pacing, energy level based on your brand]

[Continue for each scene with timestamps]

## 📊 Retention Strategy
- **Hook elements:** [Specific techniques maintaining engagement]
- **Mid-roll holds:** [What keeps viewers watching at 20s, 40s, etc.]
- **Payoff:** [How the ending delivers value]

## 🎨 Brand Alignment Improvements
[Specific changes made to align with your dimensions:]
- Tone: [What changed]
- Authority: [What changed]
- Depth: [What changed]
- Emotion: [What changed]
- Risk: [What changed]

## 📋 Production Checklist
- [ ] [Specific prop/setup item 1]
- [ ] [Specific prop/setup item 2]
- [ ] [Key talking points to hit]

## 💡 Pro Tips
[2-3 specific tips for filming this based on your style]

---

**CRITICAL REQUIREMENTS:**
- Make it ACTIONABLE - I should be able to film this immediately
- Keep it AUTHENTIC to my brand - no generic advice
- Maintain VIRAL POTENTIAL - preserve what makes the original engaging
- Be SPECIFIC - include exact words, camera angles, timing
- Format beautifully with markdown - make it easy to scan and follow`

    const response = await client.addMessage(threadId, {
      content: prompt,
      memory: 'Auto',
      llm_provider: selectModelForTask('content_strategy').provider,
      model_name: selectModelForTask('content_strategy').model,
      web_search: 'Off'
    })

    console.log('✅ Video remix generated successfully')

    return response.content || 'Unable to generate video remix. Please try again.'
  } catch (error) {
    console.error('Failed to generate video remix:', error)
    throw new Error('Could not generate video remix')
  }
}

/**
 * Analyze viral trends in the creator's niche using web search
 * Returns trending topics with brand-aligned adaptations
 */
export async function analyzeTrendingContent(
  threadId: string,
  niche: string,
  brandDimensions: {
    tone: number
    authority: number
    depth: number
    emotion: number
    risk: number
  }
): Promise<string> {
  const client = getBackboardClient()

  try {
    // Create dimension descriptions for context
    const toneDesc = brandDimensions.tone > 60 ? 'calm and measured' : brandDimensions.tone < 40 ? 'aggressive and bold' : 'balanced'
    const authorityDesc = brandDimensions.authority > 60 ? 'expert educator' : brandDimensions.authority < 40 ? 'peer guide' : 'knowledgeable friend'
    const depthDesc = brandDimensions.depth > 60 ? 'deep, philosophical' : brandDimensions.depth < 40 ? 'tactical, practical' : 'balanced depth'
    const emotionDesc = brandDimensions.emotion > 60 ? 'highly inspirational' : brandDimensions.emotion < 40 ? 'analytical and data-driven' : 'balanced emotion'
    const riskDesc = brandDimensions.risk > 60 ? 'controversial and edgy' : brandDimensions.risk < 40 ? 'safe and approachable' : 'moderately bold'

    const prompt = `You are analyzing trending content for a ${niche} creator. Use web search to find what's performing well RIGHT NOW in the last 7-10 days.

**CRITICAL CONTEXT - This Creator's Brand Identity:**
I am a ${niche} creator with these specific brand dimensions:
- **Tone**: ${toneDesc} (${brandDimensions.tone}/100 scale)
- **Authority**: ${authorityDesc} (${brandDimensions.authority}/100 scale)
- **Depth**: ${depthDesc} (${brandDimensions.depth}/100 scale)
- **Emotion**: ${emotionDesc} (${brandDimensions.emotion}/100 scale)
- **Risk**: ${riskDesc} (${brandDimensions.risk}/100 scale)

ALL trend adaptations MUST match these exact dimensions. Do not give generic advice - tailor everything to MY specific voice.

**Your Task:**
Search the web and identify the top 3 viral trends in ${niche} content. For EACH trend provide:

1. **What's Trending** - Specific examples (titles, creators if possible, view counts if available)
2. **Why It's Working** - Engagement psychology (hooks, format, timing, audience need)
3. **My Brand Adaptation** - How I can authentically adapt this trend to MY voice dimensions
4. **Ready-to-Use Idea** - A specific, actionable video concept that combines this trend with my brand

**Output Format (use markdown):** FOLLOW EXACTLY THIS FORMAT IN YOUR RESPONSE USING REAL TRENDING INFO:

# 🔥 Trending content in ${niche} Right Now

## Trend #1: [Trend Name]

### 📊 What's Trending
[Specific examples with details]

### 🧠 Why It's Working
[Engagement psychology - be specific about hooks, format, emotional triggers]

### 🎨 Your Brand Adaptation
[How to adapt this to your ${toneDesc}, ${authorityDesc} voice]

### 💡 Ready-to-Use Video Idea
**Title:** [Specific title]
**Hook:** [First 5 seconds]
**Format:** [Video structure]
**Key Points:**
- [Point 1]
- [Point 2]
- [Point 3]

---

[Repeat for Trends #2 and #3]

---

## 🎯 Quick Action Plan

Pick ONE trend for each topic that is highest ROI to create this week:
- **Best for beginners:** [Which trend and why]
- **Highest viral potential:** [Which trend and why]
- **Most authentic to your brand:** [Which trend and why]

**CRITICAL REQUIREMENTS:**
- Use REAL, CURRENT examples from web search (with specifics like views, creators)
- Be ACTIONABLE - I should be able to start filming today
- Stay AUTHENTIC - adaptations must fit my brand dimensions
- Focus on PROVEN viral patterns - not speculation`

    // Note: We explicitly include brand dimensions in the prompt rather than relying on memory
    // This ensures the first call works properly without needing a "warm-up"
    const response = await client.addMessage(threadId, {
      content: prompt,
      memory: 'Off',  // Turned off since we're providing explicit context in the prompt
      llm_provider: selectModelForTask('content_strategy').provider,
      model_name: selectModelForTask('content_strategy').model,
      web_search: 'On'  // Enable web search for real-time trends
    })

    console.log('✅ Trend analysis complete')

    return response.content || 'Unable to analyze trends. Please try again.'
  } catch (error) {
    console.error('Failed to analyze trends:', error)
    throw new Error('Could not analyze trending content')
  }
}
