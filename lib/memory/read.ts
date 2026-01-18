// Memory Read API

import { MemoryFile, MetaMemory, ProfileMemory, BrandMemory, ContentMemory, InsightsMemory } from './types'
import { defaultMeta, defaultProfile, defaultBrand, defaultContent, defaultInsights } from './defaults'
import { dbRead, dbExists } from './db-adapter'

// Type mapping for memory files
type MemoryTypeMap = {
  meta: MetaMemory
  profile: ProfileMemory
  brand: BrandMemory
  content: ContentMemory
  insights: InsightsMemory
}

// Get default for each file type
const getDefault = <T extends MemoryFile>(file: T): MemoryTypeMap[T] => {
  const defaults: Record<MemoryFile, MetaMemory | ProfileMemory | BrandMemory | ContentMemory | InsightsMemory> = {
    meta: defaultMeta,
    profile: defaultProfile,
    brand: defaultBrand,
    content: defaultContent,
    insights: defaultInsights
  }
  return defaults[file] as MemoryTypeMap[T]
}

/**
 * Reads a memory file and returns its contents
 * If file doesn't exist, returns default structure
 *
 * @param file - The memory file to read
 * @returns Parsed JSON data of the specified type
 */
export async function readMemory<T extends MemoryFile>(file: T): Promise<MemoryTypeMap[T]> {
  try {
    const data = await dbRead<MemoryTypeMap[T]>(file)

    if (data === null) {
      // If file doesn't exist, return default
      console.warn(`Memory file ${file} not found, using defaults`)
      return getDefault(file)
    }

    return data
  } catch (error) {
    // If there's an error reading, return default
    console.warn(`Error reading memory file ${file}, using defaults:`, error)
    return getDefault(file)
  }
}

/**
 * Checks if memory system is initialized
 *
 * @returns true if all memory files exist
 */
export async function isMemoryInitialized(): Promise<boolean> {
  try {
    const files: MemoryFile[] = ['meta', 'profile', 'brand', 'content', 'insights']

    for (const file of files) {
      const exists = await dbExists(file)
      if (!exists) {
        return false
      }
    }

    return true
  } catch {
    return false
  }
}

/**
 * Checks if onboarding is complete
 *
 * @returns true if onboarding is complete
 */
export async function isOnboardingComplete(): Promise<boolean> {
  try {
    const meta = await readMemory('meta')
    return meta.onboardingComplete
  } catch {
    return false
  }
}
