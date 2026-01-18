// Memory Write API

import { MemoryFile, MetaMemory, ProfileMemory, BrandMemory, ContentMemory, InsightsMemory } from './types'
import { readMemory } from './read'
import { defaultMeta, defaultProfile, defaultBrand, defaultContent, defaultInsights } from './defaults'
import { dbWrite, dbExists } from './db-adapter'

// Type mapping for memory files
type MemoryTypeMap = {
  meta: MetaMemory
  profile: ProfileMemory
  brand: BrandMemory
  content: ContentMemory
  insights: InsightsMemory
  targetAudience: string
}

interface WriteOptions {
  merge?: boolean // If true, deep merge with existing data. If false, replace entirely
}

/**
 * Deep merge two objects
 */
function deepMerge<T>(target: T, source: Partial<T>): T {
  const output = { ...target }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key]
      const targetValue = output[key as keyof T]

      if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
        output[key as keyof T] = deepMerge(
          targetValue && typeof targetValue === 'object' ? targetValue : {} as T[keyof T],
          sourceValue
        ) as T[keyof T]
      } else {
        output[key as keyof T] = sourceValue as T[keyof T]
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
  let data: MemoryTypeMap[T]

  if (options.merge) {
    // Read existing data and merge
    const existing = await readMemory(file)
    data = deepMerge(existing, patch) as MemoryTypeMap[T]
  } else {
    // Replace entirely
    data = patch as MemoryTypeMap[T]
  }

  // Write to database
  await dbWrite(file, data)

  // Update meta.lastUpdated (unless we're writing to meta itself)
  if (file !== 'meta') {
    const meta = await readMemory('meta')
    meta.lastUpdated = new Date().toISOString()
    await dbWrite('meta', meta)
  }
}

/**
 * Initializes the memory system with default values
 * Only creates files that don't exist
 */
export async function initializeMemory(): Promise<void> {
  const files: MemoryFile[] = ['meta', 'profile', 'brand', 'content', 'insights']

  for (const file of files) {
    const exists = await dbExists(file)

    if (!exists) {
      // File doesn't exist, create it with defaults
      const defaultData = await readMemory(file)
      await dbWrite(file, defaultData)
      console.log(`Created ${file} with defaults`)
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

  const defaults: Record<MemoryFile, MetaMemory | ProfileMemory | BrandMemory | ContentMemory | InsightsMemory> = {
    meta: defaultMeta,
    profile: defaultProfile,
    brand: defaultBrand,
    content: defaultContent,
    insights: defaultInsights
  }

  for (const file of files) {
    // Use clean defaults instead of reading existing data
    await writeMemory(file, defaults[file], { merge: false })
  }

  console.log('Memory system reset to defaults')
}
