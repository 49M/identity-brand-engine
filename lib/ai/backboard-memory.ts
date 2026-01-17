/**
 * Backboard Memory Management
 *
 * This module handles adaptive AI memory using Backboard.io
 * Memory is stored as natural language context, not structured data
 *
 * Architecture:
 * - JSON files = deterministic truth (profile, brand, content)
 * - Backboard = adaptive learning (preferences, feedback, evolution)
 */

import { backboard } from "./backboard"
import type { BackboardMemoryBlock, CreatorSession, FeedbackCapture } from "./types"

// In-memory fallback for development (when Backboard is unavailable)
const devMemoryStore = new Map<string, BackboardMemoryBlock[]>()
const DEV_MODE = process.env.NODE_ENV === 'development'

/**
 * Initialize a new creator session in Backboard
 */
export async function initializeCreatorSession(creatorId: string): Promise<CreatorSession> {
  const sessionId = `creator_${creatorId}_${Date.now()}`

  try {
    // Try Backboard first
    const response = await backboard.post("/sessions", {
      session_id: sessionId,
      metadata: {
        creator_id: creatorId,
        created_at: new Date().toISOString(),
        purpose: "identity_brand_engine"
      }
    })

    const session: CreatorSession = {
      sessionId: response.data.session_id || sessionId,
      creatorId,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    }

    // Initialize memory with creator context
    await addMemoryBlock(session.sessionId, {
      type: 'identity_context',
      content: `New creator session initialized. Ready to learn about creator's authentic voice and brand preferences.`,
      timestamp: new Date().toISOString()
    })

    console.log('✅ Backboard session initialized successfully')
    return session
  } catch (error) {
    if (DEV_MODE) {
      console.warn("⚠️  Backboard unavailable, using local memory fallback for development")

      // Initialize dev memory
      devMemoryStore.set(sessionId, [{
        type: 'identity_context',
        content: `[DEV MODE] New creator session initialized. Ready to learn about creator's authentic voice and brand preferences.`,
        timestamp: new Date().toISOString()
      }])

      return {
        sessionId,
        creatorId,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
      }
    }

    console.error("Failed to initialize Backboard session:", error)
    throw new Error("Could not create creator session")
  }
}

/**
 * Add a memory block to Backboard
 */
export async function addMemoryBlock(
  sessionId: string,
  block: BackboardMemoryBlock
): Promise<void> {
  try {
    await backboard.post(`/sessions/${sessionId}/memory`, {
      type: block.type,
      content: block.content,
      timestamp: block.timestamp,
      metadata: block.metadata || {}
    })
  } catch (error) {
    if (DEV_MODE) {
      // Fallback to dev memory
      const memory = devMemoryStore.get(sessionId) || []
      memory.push(block)
      devMemoryStore.set(sessionId, memory)
      console.log(`📝 [DEV MODE] Memory block stored locally: ${block.type}`)
      return
    }
    console.error("Failed to add memory block:", error)
    throw new Error("Could not store memory")
  }
}

/**
 * Retrieve all memory for a session
 */
export async function getSessionMemory(sessionId: string): Promise<BackboardMemoryBlock[]> {
  try {
    const response = await backboard.get(`/sessions/${sessionId}/memory`)
    return response.data.memory || []
  } catch (error) {
    if (DEV_MODE) {
      // Return dev memory
      return devMemoryStore.get(sessionId) || []
    }
    console.error("Failed to retrieve memory:", error)
    return []
  }
}

/**
 * Get memory context as natural language (for AI prompts)
 */
export async function getMemoryContext(sessionId: string): Promise<string[]> {
  try {
    const memory = await getSessionMemory(sessionId)

    // Convert memory blocks to natural language strings
    return memory.map(block => {
      const timeAgo = getTimeAgo(new Date(block.timestamp))
      return `[${block.type}] (${timeAgo}): ${block.content}`
    })
  } catch (error) {
    console.error("Failed to get memory context:", error)
    return []
  }
}

/**
 * Store feedback from content idea selection
 */
export async function storeFeedback(
  sessionId: string,
  feedback: FeedbackCapture
): Promise<void> {
  try {
    const memoryContent = buildFeedbackMemory(feedback)

    await addMemoryBlock(sessionId, {
      type: 'feedback_signals',
      content: memoryContent,
      timestamp: feedback.timestamp,
      metadata: {
        idea_id: feedback.ideaId,
        action: feedback.action
      }
    })
  } catch (error) {
    console.error("Failed to store feedback:", error)
  }
}

/**
 * Store creative preferences learned from user behavior
 */
export async function storeCreativePreference(
  sessionId: string,
  preference: string
): Promise<void> {
  try {
    await addMemoryBlock(sessionId, {
      type: 'creative_preferences',
      content: preference,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Failed to store creative preference:", error)
  }
}

/**
 * Store identity evolution notes
 */
export async function storeEvolutionNote(
  sessionId: string,
  note: string
): Promise<void> {
  try {
    await addMemoryBlock(sessionId, {
      type: 'evolution_notes',
      content: note,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Failed to store evolution note:", error)
  }
}

/**
 * Update identity context based on video analysis
 */
export async function updateIdentityContext(
  sessionId: string,
  videoAnalysis: {
    tone: string
    themes: string[]
    energyLevel: string
    alignmentScore: number
  }
): Promise<void> {
  try {
    const context = `
Video Analysis Update:
- Detected tone: ${videoAnalysis.tone}
- Key themes: ${videoAnalysis.themes.join(', ')}
- Energy level: ${videoAnalysis.energyLevel}
- Brand alignment: ${videoAnalysis.alignmentScore}%

${videoAnalysis.alignmentScore >= 80
  ? 'This content strongly aligns with target identity.'
  : videoAnalysis.alignmentScore >= 60
  ? 'This content moderately aligns with target identity.'
  : 'This content shows drift from target identity - may indicate evolving brand or experimental content.'
}
    `.trim()

    await addMemoryBlock(sessionId, {
      type: 'identity_context',
      content: context,
      timestamp: new Date().toISOString(),
      metadata: {
        alignment_score: videoAnalysis.alignmentScore
      }
    })
  } catch (error) {
    console.error("Failed to update identity context:", error)
  }
}

// Helper functions

function buildFeedbackMemory(feedback: FeedbackCapture): string {
  let memory = `User ${feedback.action} content idea #${feedback.ideaId}`

  if (feedback.reason) {
    memory += `. Reason: ${feedback.reason}`
  }

  if (feedback.action === 'rejected') {
    memory += '. Avoid similar approaches in future suggestions.'
  } else if (feedback.action === 'accepted') {
    memory += '. Prioritize similar approaches in future suggestions.'
  }

  return memory
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
