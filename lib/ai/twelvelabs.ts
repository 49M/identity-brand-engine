import { TwelveLabs } from 'twelvelabs-js'
import * as TwelvelabsApi from 'twelvelabs-js/api'

let twelveLabsClient: TwelveLabs | null = null

// Simple in-memory cache for video analysis results (expires after 1 hour)
type CachedAnalysis = {
  data: unknown
  timestamp: number
}
const analysisCache = new Map<string, CachedAnalysis>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

/**
 * Get cached analysis result if available and not expired
 */
function getCachedAnalysis(cacheKey: string): unknown | null {
  const cached = analysisCache.get(cacheKey)
  if (!cached) return null

  const isExpired = Date.now() - cached.timestamp > CACHE_TTL
  if (isExpired) {
    analysisCache.delete(cacheKey)
    return null
  }

  console.log(`✅ Using cached analysis for ${cacheKey}`)
  return cached.data
}

/**
 * Store analysis result in cache
 */
function setCachedAnalysis(cacheKey: string, data: unknown): void {
  analysisCache.set(cacheKey, {
    data,
    timestamp: Date.now()
  })
}

/**
 * Get or create a Twelve Labs client instance
 * Implements singleton pattern for efficient resource usage
 */
export function getTwelveLabsClient(): TwelveLabs {
  if (!twelveLabsClient) {
    const apiKey = process.env.TWELVELABS_API_KEY

    if (!apiKey) {
      throw new Error('TWELVELABS_API_KEY environment variable is not set')
    }

    twelveLabsClient = new TwelveLabs({ apiKey })
  }

  return twelveLabsClient
}

/**
 * Get or create an index for video analysis
 * Uses Marengo 3.0 model with visual and audio analysis
 */
export async function getOrCreateIndex(indexName: string = 'trueu-content-analysis-v2'): Promise<string> {
  const client = getTwelveLabsClient()

  try {
    // Check if index already exists
    const indexes = await client.indexes.list()
    const existingIndex = indexes.data.find((idx) => idx.indexName === indexName)

    if (existingIndex && existingIndex.id) {
      console.log(`✅ Using existing index: ${existingIndex.id}`)
      return existingIndex.id
    }

    // Create new index with both Marengo 3.0 (for indexing) and Pegasus 1.2 (for generation)
    // Marengo 3.0: Video understanding and search
    // Pegasus 1.2: Text generation (gist, summarize)
    console.log(`🔨 Creating new index: ${indexName}`)
    const newIndex = await client.indexes.create({
      indexName: indexName,
      models: [
        {
          modelName: 'marengo3.0',
          modelOptions: ['visual', 'audio']
        },
        {
          modelName: 'pegasus1.2',
          modelOptions: ['visual', 'audio']
        }
      ]
    })

    if (!newIndex.id) {
      throw new Error('Failed to create index - no ID returned')
    }

    console.log(`✅ Created index: ${newIndex.id}`)
    return newIndex.id
  } catch (error) {
    console.error('Failed to get or create index:', error)
    throw new Error('Could not initialize Twelve Labs index')
  }
}

/**
 * Upload and index a video file
 * Returns the task for monitoring upload progress
 */
export async function uploadVideo(
  videoFile: File | Buffer | Blob,
  indexId: string,
  videoFileName?: string
) {
  const client = getTwelveLabsClient()

  try {
    console.log(`📤 Uploading video: ${videoFileName || 'unnamed'}`)

    const task = await client.tasks.create({
      indexId,
      videoFile: videoFile as File | Blob,
      enableVideoStream: true
    })

    console.log(`✅ Upload task created: ${task.id}`)
    return task
  } catch (error) {
    console.error('Failed to upload video:', error)
    throw new Error('Could not upload video to Twelve Labs')
  }
}

/**
 * Generate gist (title, topics, hashtags) from a video
 * This provides quick, actionable insights for content creators
 */
export async function generateVideoGist(videoId: string, useCache: boolean = true) {
  // Check cache first
  if (useCache) {
    const cacheKey = `gist:${videoId}`
    const cached = getCachedAnalysis(cacheKey)
    if (cached) return cached as { title: string; topics: string[]; hashtags: string[] }
  }

  const client = getTwelveLabsClient()

  try {
    console.log(`🎯 Generating gist for video: ${videoId}`)

    const gist = await client.gist({
      videoId,
      types: ['title', 'topic', 'hashtag']
    })

    console.log(`✅ Gist generated successfully`)
    const result = {
      title: gist.title || '',
      topics: gist.topics || [],
      hashtags: gist.hashtags || []
    }

    // Cache the result
    if (useCache) {
      setCachedAnalysis(`gist:${videoId}`, result)
    }

    return result
  } catch (error) {
    console.error('Failed to generate video gist:', error)
    throw new Error('Could not generate video insights')
  }
}

/**
 * Generate a comprehensive video summary
 * Provides detailed content analysis for brand alignment
 */
export async function generateVideoSummary(videoId: string, customPrompt?: string, useCache: boolean = true) {
  // Check cache first (only for default prompt)
  if (useCache && !customPrompt) {
    const cacheKey = `summary:${videoId}`
    const cached = getCachedAnalysis(cacheKey)
    if (cached) return cached as string
  }

  const client = getTwelveLabsClient()

  try {
    console.log(`📝 Generating summary for video: ${videoId}`)

    const defaultPrompt = `Analyze this video and provide:
1. A comprehensive summary of the content
2. The overall tone and style
3. Key themes and topics covered
4. Target audience characteristics
5. Content type and format
6. Brand voice indicators (formal/casual, authoritative/approachable, etc.)

Focus on elements that would help a content creator understand how this video aligns with their brand identity.`

    const result = await client.summarize({
      videoId,
      type: 'summary',
      prompt: customPrompt || defaultPrompt
    })

    console.log(`✅ Summary generated successfully`)

    // Type guard to check if it's a summary result
    let summary = ''
    if ('summarizeType' in result && result.summarizeType === 'summary') {
      summary = result.summary || ''
    }

    // Cache the result (only for default prompt)
    if (useCache && !customPrompt) {
      setCachedAnalysis(`summary:${videoId}`, summary)
    }

    return summary
  } catch (error) {
    console.error('Failed to generate video summary:', error)
    throw new Error('Could not generate video summary')
  }
}

/**
 * Get the status of a video indexing task
 * Used for polling during upload/processing
 */
export async function getTaskStatus(taskId: string) {
  const client = getTwelveLabsClient()

  try {
    const task = await client.tasks.retrieve(taskId)

    return {
      id: task.id,
      status: task.status,
      videoId: task.videoId
    }
  } catch (error) {
    console.error('Failed to get task status:', error)
    throw new Error('Could not retrieve task status')
  }
}

/**
 * Wait for a task to complete with automatic polling
 * Returns the video ID when ready
 */
export async function waitForTaskCompletion(
  taskId: string,
  onProgress?: (status: string) => void,
  pollInterval: number = 1 // Poll every 1 second by default (was 2)
): Promise<string> {
  const client = getTwelveLabsClient()

  try {
    console.log(`⏳ Waiting for task completion: ${taskId}`)

    const completedTask = await client.tasks.waitForDone(taskId, {
      sleepInterval: pollInterval, // Faster polling for quicker response
      callback: (task: TwelvelabsApi.TasksRetrieveResponse) => {
        console.log(`   Status: ${task.status}`)
        if (onProgress) {
          onProgress(task.status || 'processing')
        }
      }
    })

    if (completedTask.status !== 'ready') {
      throw new Error(`Task failed with status: ${completedTask.status}`)
    }

    if (!completedTask.videoId) {
      throw new Error('Task completed but no video ID was returned')
    }

    console.log(`✅ Task completed: videoId=${completedTask.videoId}`)
    return completedTask.videoId
  } catch (error) {
    console.error('Task completion failed:', error)
    throw error
  }
}

/**
 * Generate chapters (key moments breakdown) from a video
 * Provides timestamps and descriptions of major sections
 */
export async function generateVideoChapters(videoId: string) {
  const client = getTwelveLabsClient()

  try {
    console.log(`📚 Generating chapters for video: ${videoId}`)

    const result = await client.summarize({
      videoId,
      type: 'chapter'
    })

    console.log(`✅ Chapters generated successfully`)

    // Type guard for chapter result
    if ('summarizeType' in result && result.summarizeType === 'chapter') {
      return result.chapters || []
    }

    return []
  } catch (error) {
    console.error('Failed to generate video chapters:', error)
    return [] // Return empty array instead of throwing to allow graceful degradation
  }
}

/**
 * Generate highlights (key moments) from a video
 * Identifies the most important parts of the video
 */
export async function generateVideoHighlights(videoId: string) {
  const client = getTwelveLabsClient()

  try {
    console.log(`⭐ Generating highlights for video: ${videoId}`)

    const result = await client.summarize({
      videoId,
      type: 'highlight'
    })

    console.log(`✅ Highlights generated successfully`)

    // Type guard for highlight result
    if ('summarizeType' in result && result.summarizeType === 'highlight') {
      return result.highlights || []
    }

    return []
  } catch (error) {
    console.error('Failed to generate video highlights:', error)
    return [] // Return empty array instead of throwing
  }
}

/**
 * Complete video analysis workflow:
 * 1. Upload video
 * 2. Wait for indexing to complete
 * 3. Generate comprehensive insights (gist, summary, chapters, highlights)
 */
export async function analyzeVideo(
  videoFile: File | Buffer | Blob,
  indexId: string,
  videoFileName?: string,
  onProgress?: (status: string) => void
) {
  try {
    // Step 1: Upload video
    if (onProgress) onProgress('uploading')
    const task = await uploadVideo(videoFile, indexId, videoFileName)

    // Step 2: Wait for indexing
    if (onProgress) onProgress('indexing')
    const videoId = await waitForTaskCompletion(task.id!, onProgress)

    // Step 3: Generate comprehensive insights in parallel
    if (onProgress) onProgress('analyzing')
    const [gist, summary, chapters, highlights] = await Promise.all([
      generateVideoGist(videoId),
      generateVideoSummary(videoId),
      generateVideoChapters(videoId),
      generateVideoHighlights(videoId)
    ])

    if (onProgress) onProgress('complete')

    return {
      videoId,
      taskId: task.id!,
      title: gist.title,
      topics: gist.topics,
      hashtags: gist.hashtags,
      summary,
      chapters,
      highlights
    }
  } catch (error) {
    console.error('Video analysis failed:', error)
    throw error
  }
}

/**
 * Fast video analysis - returns quick insights only
 * Use this when you need fast results (gist only, ~2-3x faster)
 */
export async function analyzeVideoFast(
  videoFile: File | Buffer | Blob,
  indexId: string,
  videoFileName?: string,
  onProgress?: (status: string) => void
) {
  try {
    // Step 1: Upload video
    if (onProgress) onProgress('uploading')
    const task = await uploadVideo(videoFile, indexId, videoFileName)

    // Step 2: Wait for indexing
    if (onProgress) onProgress('indexing')
    const videoId = await waitForTaskCompletion(task.id!, onProgress)

    // Step 3: Generate only essential insights (gist is fastest)
    if (onProgress) onProgress('analyzing')
    const gist = await generateVideoGist(videoId)

    if (onProgress) onProgress('complete')

    return {
      videoId,
      taskId: task.id!,
      title: gist.title,
      topics: gist.topics,
      hashtags: gist.hashtags
    }
  } catch (error) {
    console.error('Fast video analysis failed:', error)
    throw error
  }
}

/**
 * Progressive video analysis - returns quick results immediately, detailed analysis later
 * Returns a promise for quick results and a function to get detailed results
 */
export async function analyzeVideoProgressive(
  videoFile: File | Buffer | Blob,
  indexId: string,
  videoFileName?: string,
  onProgress?: (status: string) => void
) {
  try {
    // Step 1 & 2: Upload and index video
    if (onProgress) onProgress('uploading')
    const task = await uploadVideo(videoFile, indexId, videoFileName)

    if (onProgress) onProgress('indexing')
    const videoId = await waitForTaskCompletion(task.id!, onProgress)

    // Step 3: Generate quick insights first (gist is fastest)
    if (onProgress) onProgress('analyzing')
    const gist = await generateVideoGist(videoId)

    // Return quick results immediately
    const quickResults = {
      videoId,
      taskId: task.id!,
      title: gist.title,
      topics: gist.topics,
      hashtags: gist.hashtags
    }

    // Function to get detailed analysis later (can be called in background)
    const getDetailedAnalysis = async () => {
      const [summary, chapters, highlights] = await Promise.all([
        generateVideoSummary(videoId),
        generateVideoChapters(videoId),
        generateVideoHighlights(videoId)
      ])

      return {
        ...quickResults,
        summary,
        chapters,
        highlights
      }
    }

    if (onProgress) onProgress('complete')

    return {
      quick: quickResults,
      detailed: getDetailedAnalysis
    }
  } catch (error) {
    console.error('Progressive video analysis failed:', error)
    throw error
  }
}
