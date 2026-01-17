// Memory Write API

import { promises as fs } from 'fs'
import path from 'path'
import { MemoryFile, MetaMemory, ProfileMemory, BrandMemory, ContentMemory, InsightsMemory } from './types'
import { readMemory } from './read'

const MEMORY_DIR = path.join(process.cwd(), 'memory')

// Type mapping for memory files
type MemoryTypeMap = {
  meta: MetaMemory
  profile: ProfileMemory
  brand: BrandMemory
  content: ContentMemory
  insights: InsightsMemory
}

interface WriteOptions {
  merge?: boolean // If true, deep merge with existing data. If false, replace entirely
}

/**
 * Deep merge two objects
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key]
      const targetValue = output[key]

      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        output[key] = deepMerge(
          targetValue && typeof targetValue === 'object' ? targetValue : {},
          sourceValue
        ) as T[Extract<keyof T, string>]
      } else {
        output[key] = sourceValue as T[Extract<keyof T, string>]
      }
    }
  }

  return output
}

/**
 * Writes data to a memory file
 * Always updates meta.lastUpdated timestamp
 *
 * @param file - The memory file to write to
 * @param patch - Partial data to write (will be merged by default)
 * @param options - Write options (merge behavior)
 */
export async function writeMemory<T extends MemoryFile>(
  file: T,
  patch: Partial<MemoryTypeMap[T]>,
  options: WriteOptions = { merge: true }
): Promise<void> {
  const filePath = path.join(MEMORY_DIR, `${file}.json`)

  // Ensure memory directory exists
  await fs.mkdir(MEMORY_DIR, { recursive: true })

  let data: MemoryTypeMap[T]

  if (options.merge) {
    // Read existing data and merge
    const existing = await readMemory(file)
    data = deepMerge(existing, patch) as MemoryTypeMap[T]
  } else {
    // Replace entirely
    data = patch as MemoryTypeMap[T]
  }

  // Write to file
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')

  // Update meta.lastUpdated (unless we're writing to meta itself)
  if (file !== 'meta') {
    const meta = await readMemory('meta')
    meta.lastUpdated = new Date().toISOString()
    const metaPath = path.join(MEMORY_DIR, 'meta.json')
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8')
  }
}

/**
 * Initializes the memory system with default values
 * Only creates files that don't exist
 */
export async function initializeMemory(): Promise<void> {
  await fs.mkdir(MEMORY_DIR, { recursive: true })

  const files: MemoryFile[] = ['meta', 'profile', 'brand', 'content', 'insights']

  for (const file of files) {
    const filePath = path.join(MEMORY_DIR, `${file}.json`)

    try {
      await fs.access(filePath)
      // File exists, skip
    } catch {
      // File doesn't exist, create it with defaults
      const defaultData = await readMemory(file)
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2), 'utf-8')
      console.log(`Created ${file}.json with defaults`)
    }
  }
}

/**
 * Marks onboarding as complete in meta.json
 */
export async function completeOnboarding(): Promise<void> {
  await writeMemory('meta', {
    onboardingComplete: true,
    lastUpdated: new Date().toISOString()
  })
}

/**
 * Resets all memory files to defaults (DANGEROUS - use with caution)
 */
export async function resetMemory(): Promise<void> {
  const files: MemoryFile[] = ['meta', 'profile', 'brand', 'content', 'insights']

  for (const file of files) {
    const defaultData = await readMemory(file)
    await writeMemory(file, defaultData, { merge: false })
  }

  console.log('Memory system reset to defaults')
}
