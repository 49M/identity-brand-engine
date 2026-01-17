/**
 * Memory Helper Functions
 *
 * Convenient functions to access specific data from memory files
 */

import { readMemory } from './index'
import type { ProfileMemory, BrandMemory, MetaMemory } from './types'

/**
 * Get the AI-generated target audience summary
 * Returns from profile.json first, falls back to meta.json for backward compatibility
 */
export async function getTargetAudience(): Promise<string | null> {
  try {
    // Primary: Check profile.json
    const profile = await readMemory('profile') as ProfileMemory
    if (profile.audience.aiGeneratedSummary) {
      return profile.audience.aiGeneratedSummary
    }

    // Fallback: Check meta.json (backward compatibility)
    const meta = await readMemory('meta') as MetaMemory
    return meta.targetAudience || null
  } catch (error) {
    console.error('Error reading target audience:', error)
    return null
  }
}

/**
 * Get the creator's profile data
 */
export async function getCreatorProfile(): Promise<ProfileMemory | null> {
  try {
    return await readMemory('profile') as ProfileMemory
  } catch (error) {
    console.error('Error reading profile:', error)
    return null
  }
}

/**
 * Get the brand persona data
 */
export async function getBrandPersona(): Promise<BrandMemory | null> {
  try {
    return await readMemory('brand') as BrandMemory
  } catch (error) {
    console.error('Error reading brand:', error)
    return null
  }
}

/**
 * Get Backboard session information
 */
export async function getBackboardSession(): Promise<{
  threadId: string | undefined
  assistantId: string | undefined
  documentId: string | undefined
} | null> {
  try {
    const meta = await readMemory('meta') as MetaMemory
    return {
      threadId: meta.backboardSessionId,
      assistantId: meta.backboardAssistantId,
      documentId: meta.backboardDocumentId
    }
  } catch (error) {
    console.error('Error reading Backboard session:', error)
    return null
  }
}

/**
 * Check if onboarding is complete
 */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const meta = await readMemory('meta') as MetaMemory
    return meta.onboardingComplete || false
  } catch (error) {
    return false
  }
}
