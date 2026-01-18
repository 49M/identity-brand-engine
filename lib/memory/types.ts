// Memory System Types

export type MemoryFile = 'meta' | 'profile' | 'brand' | 'content' | 'insights'

export interface MetaMemory {
  version: string
  createdAt: string
  lastUpdated: string
  onboardingComplete: boolean
  activePersonaId: string
  backboardSessionId?: string // Backboard.io thread ID for profile/audience management
  backboardIdeasThreadId?: string // Backboard.io thread ID for content ideas generation
  backboardAssistantId?: string // Backboard.io assistant ID
  backboardDocumentId?: string // Backboard.io profile document ID
  twelveLabsIndexId?: string // Twelve Labs index ID for video analysis
  targetAudience?: string
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
    aiGeneratedSummary?: string // AI-generated target audience analysis from Backboard
  }
  constraints: {
    postingFrequency: string
    videoLengthSeconds: number
    tone: string[]
  }
  rawDimensions: {
    tone: number
    authority: number
    depth: number
    emotion: number
    risk: number
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

export interface RetentionSegment {
  start: number
  end: number
  score: number
  label: string
  reason: string
}

export interface VideoAnalysis {
  id: string
  taskId: string
  fileName: string
  fileSize: number
  title: string
  topics: string[]
  hashtags: string[]
  summary: string
  chapters?: unknown[]
  highlights?: unknown[]
  retentionTimeline?: RetentionSegment[]
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
  analyzedAt: string
}

export interface ContentMemory {
  ideas: ContentIdea[]
  published: PublishedContent[]
  videoAnalyses?: VideoAnalysis[]
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
