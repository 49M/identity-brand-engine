// Memory System Types

export type MemoryFile = 'meta' | 'profile' | 'brand' | 'content' | 'insights'

export interface MetaMemory {
  version: string
  createdAt: string
  lastUpdated: string
  onboardingComplete: boolean
  activePersonaId: string
  backboardSessionId?: string // Backboard.io thread ID for conversations
  backboardAssistantId?: string // Backboard.io assistant ID
  backboardDocumentId?: string // Backboard.io profile document ID
  flags: {
    needsReanalysis: boolean
  }
}

export interface ProfileMemory {
  creator: {
    name: string
    experienceLevel: 'beginner' | 'intermediate' | 'advanced'
    background: string[]
    goals: string[]
  }
  audience: {
    targetViewer: {
      ageRange: string
      interests: string[]
      painPoints: string[]
    }
    platforms: string[]
  }
  constraints: {
    postingFrequency: string
    videoLengthSeconds: number
    tone: string[]
  }
}

export interface BrandMemory {
  persona: {
    archetype: string
    coreThemes: string[]
    voice: {
      style: string[]
      pacing: string
      emotionalRange: string[]
    }
  }
  positioning: {
    whatYouAreKnownFor: string[]
    whatYouAvoid: string[]
  }
  confidenceScore: number
}

export interface ContentIdea {
  id: string
  hook: string
  angle: string
  status: 'unused' | 'drafted' | 'posted'
  personaFit: number
  createdAt: string
}

export interface PublishedContent {
  platform: string
  url: string
  ideaId: string
  postedAt: string
  metrics: {
    views: number
    likes: number
    shares: number
  }
}

export interface ContentMemory {
  ideas: ContentIdea[]
  published: PublishedContent[]
}

export interface VideoSignals {
  hookStyle: string
  avgCutLength: number
  energyLevel: string
}

export interface AnalyzedVideo {
  videoId: string
  platform: string
  niche: string
  signals: VideoSignals
  whyItWorked: string[]
}

export interface InsightsMemory {
  analyzedVideos: AnalyzedVideo[]
  patterns: {
    commonHooks: string[]
    winningFormats: string[]
  }
}

export type MemoryData = MetaMemory | ProfileMemory | BrandMemory | ContentMemory | InsightsMemory
