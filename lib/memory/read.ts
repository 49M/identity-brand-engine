// Memory Read API

import { promises as fs } from 'fs'
import path from 'path'
import { MemoryFile, MetaMemory, ProfileMemory, BrandMemory, ContentMemory, InsightsMemory } from './types'
import { defaultMeta, defaultProfile, defaultBrand, defaultContent, defaultInsights } from './defaults'

const MEMORY_DIR = path.join(process.cwd(), 'memory')

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
  const defaults: Record<MemoryFile, any> = {
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
  const filePath = path.join(MEMORY_DIR, `${file}.json`)

  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(data) as MemoryTypeMap[T]
  } catch (error) {
    // If file doesn't exist or is corrupted, return default
    console.warn(`Memory file ${file}.json not found or corrupted, using defaults`)
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
    await fs.access(MEMORY_DIR)
    const files: MemoryFile[] = ['meta', 'profile', 'brand', 'content', 'insights']

    for (const file of files) {
      const filePath = path.join(MEMORY_DIR, `${file}.json`)
      await fs.access(filePath)
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
