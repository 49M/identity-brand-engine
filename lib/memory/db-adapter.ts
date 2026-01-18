// Database Adapter for Memory Storage
// Abstracts storage to work both locally (filesystem) and in production (Redis)

import { createClient } from 'redis'
import { promises as fs } from 'fs'
import path from 'path'

const MEMORY_DIR = path.join(process.cwd(), 'memory')
const USE_REDIS = process.env.REDIS_URL !== undefined

// Redis client instance (singleton)
let redisClient: ReturnType<typeof createClient> | null = null

/**
 * Get or create Redis client connection
 */
async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL
    })
    await redisClient.connect()
  }
  return redisClient
}

/**
 * Read data from storage (Redis or filesystem)
 */
export async function dbRead<T>(key: string): Promise<T | null> {
  if (USE_REDIS) {
    // Production: Use Redis
    const redis = await getRedisClient()
    const result = await redis.get(key)
    if (result === null) {
      return null
    }
    return JSON.parse(result) as T
  } else {
    // Local development: Use filesystem
    const filePath = path.join(MEMORY_DIR, `${key}.json`)
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content) as T
    } catch (error) {
      // File doesn't exist
      return null
    }
  }
}

/**
 * Write data to storage (Redis or filesystem)
 */
export async function dbWrite<T>(key: string, value: T): Promise<void> {
  if (USE_REDIS) {
    // Production: Use Redis
    const redis = await getRedisClient()
    await redis.set(key, JSON.stringify(value))
  } else {
    // Local development: Use filesystem
    await fs.mkdir(MEMORY_DIR, { recursive: true })
    const filePath = path.join(MEMORY_DIR, `${key}.json`)
    await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8')
  }
}

/**
 * Check if a key exists in storage
 */
export async function dbExists(key: string): Promise<boolean> {
  if (USE_REDIS) {
    const redis = await getRedisClient()
    const exists = await redis.exists(key)
    return exists === 1
  } else {
    const filePath = path.join(MEMORY_DIR, `${key}.json`)
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }
}

/**
 * Delete a key from storage
 */
export async function dbDelete(key: string): Promise<void> {
  if (USE_REDIS) {
    const redis = await getRedisClient()
    await redis.del(key)
  } else {
    const filePath = path.join(MEMORY_DIR, `${key}.json`)
    try {
      await fs.unlink(filePath)
    } catch {
      // File doesn't exist, ignore
    }
  }
}

/**
 * Get all keys matching a pattern (for Redis) or all files in memory dir (for filesystem)
 */
export async function dbKeys(pattern?: string): Promise<string[]> {
  if (USE_REDIS) {
    // For Redis, use KEYS command
    const redis = await getRedisClient()
    const keys = await redis.keys(pattern || '*')
    return keys
  } else {
    // For filesystem, list all JSON files
    try {
      const files = await fs.readdir(MEMORY_DIR)
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''))
    } catch {
      return []
    }
  }
}
