// AI Memory Types (Backboard-specific)

/**
 * Memory blocks stored in Backboard for adaptive learning
 * These are natural language, not structured data
 */

export interface BackboardMemoryBlock {
  type: 'identity_context' | 'creative_preferences' | 'feedback_signals' | 'evolution_notes'
  content: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface CreatorSession {
  sessionId: string
  creatorId: string
  createdAt: string
  lastActive: string
}

export interface ModelSelection {
  model: 'claude' | 'gpt-4' | 'gemini' | 'cohere' | 'grok'
  provider: 'anthropic' | 'openai' | 'google' | 'cohere' | 'xai'
  reason: string
}

export interface AIResponse {
  model: ModelSelection
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
  }
}

export interface VideoAnalysisContext {
  videoId: string
  twelveLabsData: unknown
  creatorProfile: {
    name: string
    niche: string
    targetIdentity: Record<string, number>
  }
  backboardMemory: string[] // Natural language context from past interactions
}

export interface ContentGenerationContext {
  creatorProfile: {
    name: string
    niche: string
    tone: string[]
  }
  brandMemory: {
    coreThemes: string[]
    voice: {
      style: string[]
      pacing: string
    }
  }
  backboardMemory: string[] // Learned preferences
  recentContent?: string[] // Past content for variety
}

export interface FeedbackCapture {
  ideaId: string
  action: 'accepted' | 'rejected' | 'modified'
  reason?: string
  timestamp: string
}
