import { TwelveLabs } from 'twelvelabs-js'
import * as TwelvelabsApi from 'twelvelabs-js/api'

let twelveLabsClient: TwelveLabs | null = null

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
export async function generateVideoGist(videoId: string) {
  const client = getTwelveLabsClient()

  try {
    console.log(`🎯 Generating gist for video: ${videoId}`)

    const gist = await client.gist({
      videoId,
      types: ['title', 'topic', 'hashtag']
    })

    console.log(`✅ Gist generated successfully`)
    return {
      title: gist.title || '',
      topics: gist.topics || [],
      hashtags: gist.hashtags || []
    }
  } catch (error) {
    console.error('Failed to generate video gist:', error)
    throw new Error('Could not generate video insights')
  }
}

/**
 * Generate a comprehensive video summary
 * Provides detailed content analysis for brand alignment
 */
export async function generateVideoSummary(videoId: string, customPrompt?: string) {
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
    if ('summarizeType' in result && result.summarizeType === 'summary') {
      return result.summary || ''
    }

    return ''
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
  onProgress?: (status: string) => void
): Promise<string> {
  const client = getTwelveLabsClient()

  try {
    console.log(`⏳ Waiting for task completion: ${taskId}`)

    const completedTask = await client.tasks.waitForDone(taskId, {
      sleepInterval: 2, // Poll every 2 seconds
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
 * Complete video analysis workflow:
 * 1. Upload video
 * 2. Wait for indexing to complete
 * 3. Generate gist and summary
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

    // Step 3: Generate insights
    if (onProgress) onProgress('analyzing')
    const [gist, summary] = await Promise.all([
      generateVideoGist(videoId),
      generateVideoSummary(videoId)
    ])

    if (onProgress) onProgress('complete')

    return {
      videoId,
      taskId: task.id!,
      title: gist.title,
      topics: gist.topics,
      hashtags: gist.hashtags,
      summary
    }
  } catch (error) {
    console.error('Video analysis failed:', error)
    throw error
  }
}
