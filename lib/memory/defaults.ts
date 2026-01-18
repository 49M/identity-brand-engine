// Default memory structures for initialization

import { MetaMemory, ProfileMemory, BrandMemory, ContentMemory, InsightsMemory } from './types'

export const defaultMeta: MetaMemory = {
  version: '0.1.0',
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  onboardingComplete: false,
  activePersonaId: 'primary',
  flags: {
    needsReanalysis: false
  }
}

export const defaultProfile: ProfileMemory = {
  creator: {
    name: '',
    experienceLevel: 'beginner',
    background: [],
    goals: []
  },
  audience: {
    targetViewer: {
      ageRange: '',
      interests: [],
      painPoints: []
    },
    platforms: []
  },
  constraints: {
    postingFrequency: 'daily',
    videoLengthSeconds: 30,
    tone: []
  },
  rawDimensions: {
    tone: 50,
    authority: 50,
    depth: 50,
    emotion: 50,
    risk: 50
  }
}

export const defaultBrand: BrandMemory = {
  persona: {
    archetype: '',
    coreThemes: [],
    voice: {
      style: [],
      pacing: 'moderate',
      emotionalRange: []
    }
  },
  positioning: {
    whatYouAreKnownFor: [],
    whatYouAvoid: []
  },
  confidenceScore: 0
}

export const defaultContent: ContentMemory = {
  ideas: [],
  published: []
}

export const defaultInsights: InsightsMemory = {
  analyzedVideos: [],
  patterns: {
    commonHooks: [],
    winningFormats: []
  }
}
