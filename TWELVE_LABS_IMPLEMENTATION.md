# Twelve Labs Video Analysis Implementation

## Overview

This document describes the complete implementation of Twelve Labs video analysis functionality in the TrueU platform. The integration allows creators to upload videos and receive AI-powered insights including titles, topics, hashtags, and comprehensive summaries tailored for brand alignment.

## Architecture

### Technology Stack
- **Twelve Labs SDK**: `twelvelabs-js` v1.1.0
- **Model**: Marengo 3.0 with multi-modal analysis
- **Analysis Options**: Visual, Conversation, Text-in-Video, Logo detection
- **API Integration**: Next.js 15 API Routes
- **Storage**: Local JSON-based memory system

### Data Flow

```
User uploads video
    ↓
Frontend (UploadVideoPanel.tsx)
    ↓
API Route (/api/video)
    ↓
Twelve Labs Client (lib/ai/twelvelabs.ts)
    ↓
1. Create/Get Index
2. Upload Video → Task Created
3. Wait for Indexing (auto-polling)
4. Generate Gist (title, topics, hashtags)
5. Generate Summary (brand-aligned analysis)
    ↓
Store in Content Memory
    ↓
Return Results to Frontend
    ↓
Display Analysis to User
```

## Implementation Details

### 1. Twelve Labs Client Library (`lib/ai/twelvelabs.ts`)

**Key Functions:**

- `getTwelveLabsClient()` - Singleton pattern for SDK client
- `getOrCreateIndex()` - Manages video index with Marengo 3.0
- `uploadVideo()` - Uploads video file and creates indexing task
- `generateVideoGist()` - Extracts title, topics, and hashtags
- `generateVideoSummary()` - Creates brand-aligned content summary
- `waitForTaskCompletion()` - Auto-polls task status with callbacks
- `analyzeVideo()` - Complete workflow: upload → index → analyze

**Configuration:**
```typescript
{
  indexName: 'trueu-content-analysis',
  models: [{
    modelName: 'marengo3.0',
    modelOptions: ['visual', 'conversation', 'text_in_video', 'logo']
  }]
}
```

**Summary Prompt:**
The implementation uses a custom prompt designed for creator brand alignment:
```
Analyze this video and provide:
1. A comprehensive summary of the content
2. The overall tone and style
3. Key themes and topics covered
4. Target audience characteristics
5. Content type and format
6. Brand voice indicators (formal/casual, authoritative/approachable, etc.)

Focus on elements that would help a content creator understand
how this video aligns with their brand identity.
```

### 2. API Routes (`app/api/video/route.ts`)

**POST /api/video**
- Accepts video file via FormData
- Validates file type and size (max 2GB)
- Performs complete video analysis
- Stores results in content memory
- Returns analysis data

**Response Format:**
```json
{
  "success": true,
  "analysis": {
    "videoId": "xxx",
    "title": "Generated title",
    "topics": ["topic1", "topic2"],
    "hashtags": ["hashtag1", "hashtag2"],
    "summary": "Comprehensive summary..."
  }
}
```

**GET /api/video?taskId=xxx**
- Retrieves task status for async operations
- Used for polling during long uploads

### 3. Memory System Updates (`lib/memory/types.ts`)

**New Types:**

```typescript
// Added to MetaMemory
twelveLabsIndexId?: string

// New interface
interface VideoAnalysis {
  id: string
  taskId: string
  fileName: string
  fileSize: number
  title: string
  topics: string[]
  hashtags: string[]
  summary: string
  analyzedAt: string
}

// Updated ContentMemory
interface ContentMemory {
  ideas: ContentIdea[]
  published: PublishedContent[]
  videoAnalyses?: VideoAnalysis[]  // NEW
}
```

### 4. Frontend Component (`app/dashboard/components/UploadVideoPanel.tsx`)

**Features:**
- Drag-and-drop video upload
- Real-time progress indicators
- Comprehensive results display
- Error handling with retry
- Beautiful UI with TrueU branding

**UI States:**
1. **Upload** - File selection and preview
2. **Analyzing** - Loading spinner with progress text
3. **Results** - Formatted display of insights
4. **Error** - User-friendly error messages

**Results Display:**
- Suggested title (prominent display)
- Topics (purple tags)
- Hashtags (pink tags with # symbol)
- Content summary (formatted text block)
- Action buttons (Analyze Another / Done)

## Usage

### For Users

1. Click "Upload Video" on dashboard
2. Drag video file or click to browse
3. Click "Analyze Video with AI"
4. Wait for analysis (typically 30s-2min depending on video length)
5. Review results:
   - Copy suggested title
   - Use relevant topics for targeting
   - Add hashtags to posts
   - Read summary to ensure brand alignment

### For Developers

**Basic Analysis:**
```typescript
import { analyzeVideo, getOrCreateIndex } from '@/lib/ai/twelvelabs'

const indexId = await getOrCreateIndex()
const results = await analyzeVideo(
  videoFile,
  indexId,
  'my-video.mp4',
  (status) => console.log(status)
)

console.log(results.title)
console.log(results.topics)
console.log(results.hashtags)
console.log(results.summary)
```

**Custom Summary Prompt:**
```typescript
import { generateVideoSummary } from '@/lib/ai/twelvelabs'

const summary = await generateVideoSummary(
  videoId,
  'Analyze this video for TikTok audience and suggest hooks'
)
```

## Best Practices

### Performance
- **Lazy Index Creation**: Index is created on first upload, reused thereafter
- **Async Processing**: Long-running tasks use proper async/await patterns
- **Auto-polling**: SDK handles status checking automatically
- **Progress Callbacks**: Real-time updates to user during analysis

### Error Handling
- Validates file type (video/* only)
- Enforces size limits (2GB max)
- Graceful fallbacks for API failures
- User-friendly error messages
- Retry functionality

### UX Considerations
- Clear visual feedback during upload
- Animated loading states
- Immediate results display
- Copy-friendly format (hashtags, topics)
- Option to analyze multiple videos

## Limitations & Considerations

### Twelve Labs Limits
- **Video Duration**: 4 seconds to 4 hours (Marengo 3.0)
- **Resolution**: 360-2160 pixels
- **File Size**: 2GB max (enforced by app)
- **Rate Limits**: Enhanced limits as of January 12, 2026
- **Processing Time**: Varies by video length (typically 30s-2min)

### Cost Optimization
- Single index reused across all videos
- Efficient model selection (Marengo 3.0 only)
- No redundant analysis calls
- Results cached in local memory

## Future Enhancements

### Planned Features
1. **Batch Upload**: Analyze multiple videos at once
2. **Brand Alignment Score**: Compare video against creator's 5 dimensions
3. **Competitor Analysis**: Compare with successful creators in niche
4. **Performance Tracking**: Correlate video insights with actual metrics
5. **Clip Detection**: Identify best moments for short-form content
6. **Transcript Export**: Full video transcription for repurposing

### Integration Opportunities
- **Content Ideas**: Use video analysis to seed content generation
- **Profile Enhancement**: Refine brand dimensions based on video patterns
- **Audience Insights**: Update target audience from video analysis
- **Trend Detection**: Identify patterns across multiple videos

## Testing

### Manual Testing
```bash
# Start dev server
npm run dev

# Upload a video through UI
1. Navigate to dashboard
2. Click "Upload Video"
3. Select test video file
4. Verify analysis completes
5. Check all fields populated
```

### API Testing
```bash
# Test video upload
curl -X POST http://localhost:3000/api/video \
  -F "video=@test-video.mp4"

# Test task status
curl http://localhost:3000/api/video?taskId=xxx
```

## Troubleshooting

### Common Issues

**"TWELVELABS_API_KEY environment variable is not set"**
- Ensure `.env.local` contains: `TWELVELABS_API_KEY=tlk_xxx`
- Restart dev server after adding env var

**"Video analysis failed"**
- Check video format is supported
- Verify file size under 2GB
- Ensure stable internet connection
- Check Twelve Labs API status

**"Task completion timeout"**
- Very long videos may exceed timeout
- Increase timeout in `waitForTaskCompletion()`
- Or implement async polling pattern

**Index creation fails**
- Verify API key has index creation permissions
- Check Twelve Labs account limits
- Review console logs for specific error

### Debug Mode
Enable detailed logging:
```typescript
// In lib/ai/twelvelabs.ts
console.log('Twelve Labs Debug:', {
  indexId,
  taskId,
  videoId,
  status
})
```

## Resources

- [Twelve Labs Documentation](https://docs.twelvelabs.io/)
- [Twelve Labs GitHub](https://github.com/twelvelabs-io/twelvelabs-js)
- [Marengo 3.0 Features](https://docs.twelvelabs.io/docs/concepts/models/marengo)
- [API Reference](https://docs.twelvelabs.io/api-reference)

## Support

For issues related to:
- **TrueU Implementation**: Check this documentation or project README
- **Twelve Labs SDK**: GitHub issues at twelvelabs-io/twelvelabs-js
- **API Limits**: Contact Twelve Labs support

---

**Implementation Date**: January 2026
**SDK Version**: twelvelabs-js@1.1.0
**Model**: Marengo 3.0
**Status**: ✅ Production Ready
