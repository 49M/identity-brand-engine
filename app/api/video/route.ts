import { NextRequest, NextResponse } from 'next/server'
import {
  getOrCreateIndex,
  analyzeVideo,
  getTaskStatus
} from '@/lib/ai/twelvelabs'
import { readMemory, writeMemory } from '@/lib/memory'

/**
 * POST /api/video
 * Upload and analyze a video file
 * Returns taskId for polling progress
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No video file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { success: false, error: 'File must be a video' },
        { status: 400 }
      )
    }

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024 // 2GB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Video file too large. Maximum size is 2GB' },
        { status: 400 }
      )
    }

    console.log(`📹 Processing video upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Get or create Twelve Labs index
    const indexId = await getOrCreateIndex()

    // Get meta memory to store video info
    const meta = await readMemory('meta')

    // Store index ID for future use
    if (!meta.twelveLabsIndexId) {
      await writeMemory('meta', {
        ...meta,
        twelveLabsIndexId: indexId,
        lastUpdated: new Date().toISOString()
      })
    }

    // Start video analysis (async process)
    let analysisResult
    try {
      analysisResult = await analyzeVideo(
        file,
        indexId,
        file.name,
        (status) => {
          console.log(`   Analysis status: ${status}`)
        }
      )
    } catch (error) {
      console.error('Video analysis failed:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Video analysis failed. Please try again or use a different video.'
        },
        { status: 500 }
      )
    }

    // Store video analysis results in content memory
    const contentMemory = await readMemory('content')
    const videoAnalysis = {
      id: analysisResult.videoId,
      taskId: analysisResult.taskId,
      fileName: file.name,
      fileSize: file.size,
      title: analysisResult.title,
      topics: analysisResult.topics,
      hashtags: analysisResult.hashtags,
      summary: analysisResult.summary,
      analyzedAt: new Date().toISOString()
    }

    await writeMemory('content', {
      ...contentMemory,
      videoAnalyses: [...(contentMemory.videoAnalyses || []), videoAnalysis],
      lastUpdated: new Date().toISOString()
    })

    console.log(`✅ Video analysis complete: ${analysisResult.videoId}`)

    return NextResponse.json({
      success: true,
      analysis: {
        videoId: analysisResult.videoId,
        title: analysisResult.title,
        topics: analysisResult.topics,
        hashtags: analysisResult.hashtags,
        summary: analysisResult.summary
      }
    })
  } catch (error) {
    console.error('Video upload failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process video'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/video?taskId=xxx
 * Get the status of a video indexing task
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      )
    }

    const taskStatus = await getTaskStatus(taskId)

    return NextResponse.json({
      success: true,
      task: taskStatus
    })
  } catch (error) {
    console.error('Failed to get task status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get task status'
      },
      { status: 500 }
    )
  }
}
