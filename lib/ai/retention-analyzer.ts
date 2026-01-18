/**
 * Retention Timeline Analyzer
 *
 * Analyzes video chapters and highlights to predict retention patterns.
 * Uses semantic segmentation and heuristic scoring to identify:
 * - Strong engagement zones (green)
 * - Risk zones (yellow)
 * - Drop-off zones (red)
 */

interface Chapter {
  chapterTitle?: string
  headline?: string
  chapterSummary?: string
  summary?: string
  start?: number
  end?: number
}

interface Highlight {
  highlightTitle?: string
  title?: string
  highlightSummary?: string
  summary?: string
  start?: number
  end?: number
}

export interface RetentionSegment {
  start: number
  end: number
  score: number // 0-100 engagement score
  label: string
  reason: string
}

/**
 * Heuristic scoring based on content characteristics
 */
function scoreSegment(
  segment: { start: number; end: number; title: string; summary: string },
  isHighlight: boolean,
  segmentIndex: number,
  totalSegments: number
): { score: number; reason: string } {
  let score = 50 // Base score
  const reasons: string[] = []

  // 1. Highlights boost engagement significantly
  if (isHighlight) {
    score += 25
    reasons.push('Key moment')
  }

  // 2. First 15 seconds are critical (hook)
  if (segment.start < 15) {
    score += 20
    reasons.push('Hook period')
  }

  // 3. Position in video affects retention
  const position = segmentIndex / totalSegments
  if (position < 0.3) {
    // Early content retains better
    score += 10
    reasons.push('Early content')
  } else if (position > 0.7) {
    // Late content has drop-off risk
    score -= 15
    reasons.push('Late-stage risk')
  }

  // 4. Segment length (too long = boredom risk)
  const duration = segment.end - segment.start
  if (duration > 60) {
    score -= 10
    reasons.push('Long segment')
  } else if (duration < 10 && duration > 3) {
    score += 5
    reasons.push('Punchy pacing')
  }

  // 5. Content engagement keywords
  const content = (segment.title + ' ' + segment.summary).toLowerCase()

  // High-engagement triggers
  if (/(story|personal|reveal|secret|surprising|shocking)/i.test(content)) {
    score += 15
    reasons.push('Emotional trigger')
  }

  if (/(how to|tutorial|step|guide|tip)/i.test(content)) {
    score += 10
    reasons.push('Educational value')
  }

  if (/(question|ask|wonder|curious)/i.test(content)) {
    score += 8
    reasons.push('Curiosity gap')
  }

  // Drop-off triggers
  if (/(introduction|overview|background|context)/i.test(content)) {
    score -= 10
    reasons.push('Setup phase')
  }

  if (/(conclusion|summary|recap|ending)/i.test(content)) {
    score -= 12
    reasons.push('Wind-down phase')
  }

  // 6. Normalize score to 0-100
  score = Math.max(0, Math.min(100, score))

  return {
    score,
    reason: reasons.length > 0 ? reasons.join(', ') : 'Standard content'
  }
}

/**
 * Generate retention category label
 */
function getRetentionLabel(score: number): string {
  if (score >= 70) return 'Strong Engagement'
  if (score >= 50) return 'Moderate Risk'
  return 'Drop-off Risk'
}

/**
 * Analyze video chapters and highlights to create retention timeline
 */
export function analyzeRetentionTimeline(
  chapters?: Chapter[],
  highlights?: Highlight[]
): RetentionSegment[] {
  const segments: RetentionSegment[] = []

  // If no chapters/highlights, create default segment
  if ((!chapters || chapters.length === 0) && (!highlights || highlights.length === 0)) {
    return [{
      start: 0,
      end: 60,
      score: 60,
      label: 'Standard Content',
      reason: 'No detailed segmentation available'
    }]
  }

  // Create highlight map for boosting scores
  const highlightTimes = new Set<number>()
  if (highlights) {
    highlights.forEach(hl => {
      if (hl.start !== undefined) {
        highlightTimes.add(Math.floor(hl.start))
      }
    })
  }

  // Process chapters as base timeline
  if (chapters && chapters.length > 0) {
    chapters.forEach((chapter, index) => {
      const start = chapter.start ?? 0
      const end = chapter.end ?? start + 30
      const title = chapter.chapterTitle || chapter.headline || 'Chapter'
      const summary = chapter.chapterSummary || chapter.summary || ''

      // Check if this chapter overlaps with highlights
      const hasHighlight = Array.from(highlightTimes).some(
        hlTime => hlTime >= start && hlTime <= end
      )

      const { score, reason } = scoreSegment(
        { start, end, title, summary },
        hasHighlight,
        index,
        chapters.length
      )

      segments.push({
        start,
        end,
        score,
        label: getRetentionLabel(score),
        reason
      })
    })
  } else if (highlights && highlights.length > 0) {
    // If no chapters, use highlights as segments
    highlights.forEach((highlight, index) => {
      const start = highlight.start ?? 0
      const end = highlight.end ?? start + 10
      const title = highlight.highlightTitle || highlight.title || 'Highlight'
      const summary = highlight.highlightSummary || highlight.summary || ''

      const { score, reason } = scoreSegment(
        { start, end, title, summary },
        true, // All are highlights
        index,
        highlights.length
      )

      segments.push({
        start,
        end,
        score,
        label: getRetentionLabel(score),
        reason
      })
    })
  }

  // Sort by start time
  segments.sort((a, b) => a.start - b.start)

  return segments
}
