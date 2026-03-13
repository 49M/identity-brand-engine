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
 * Heuristic scoring based on content characteristics.
 * Models a realistic retention curve: viewers drop off as video progresses,
 * with boosts only for genuinely compelling moments.
 */
function scoreSegment(
  segment: { start: number; end: number; title: string; summary: string },
  isHighlight: boolean,
  segmentIndex: number,
  totalSegments: number
): { score: number; reason: string } {
  // Start below the "moderate risk" threshold — must earn green
  let score = 35
  const reasons: string[] = []

  // 1. Hook zone — first 12 seconds are make-or-break
  if (segment.start < 12) {
    score += 22
    reasons.push('Hook zone')
  }

  // 2. Realistic positional decay curve
  // Retention research shows ~50% of viewers are gone by the halfway point
  const position = segmentIndex / Math.max(totalSegments - 1, 1)
  if (position < 0.2) {
    score += 8
  } else if (position < 0.4) {
    score += 2
  } else if (position < 0.6) {
    score -= 8
    reasons.push('Mid-video drop')
  } else if (position < 0.8) {
    score -= 18
    reasons.push('Late-stage risk')
  } else {
    score -= 25
    reasons.push('High drop-off zone')
  }

  // 3. Highlights are a genuine signal — but modest boost
  if (isHighlight) {
    score += 14
    reasons.push('Key moment')
  } else {
    // Non-highlight chapters are statistically weaker
    score -= 8
  }

  // 4. Segment duration penalties — attention degrades quickly
  const duration = segment.end - segment.start
  if (duration > 90) {
    score -= 18
    reasons.push('Very long segment')
  } else if (duration > 60) {
    score -= 10
    reasons.push('Long segment')
  } else if (duration > 30) {
    score -= 4
  } else if (duration <= 15 && duration > 3) {
    score += 6
    reasons.push('Tight pacing')
  }

  // 5. Content signal analysis
  const content = (segment.title + ' ' + segment.summary).toLowerCase()

  // Strong engagement signals
  if (/(reveal|secret|surprising|shocking|twist|never|actually)/i.test(content)) {
    score += 14
    reasons.push('Surprise/reveal')
  } else if (/(story|personal|moment|experience|happened)/i.test(content)) {
    score += 10
    reasons.push('Storytelling')
  } else if (/(how to|step|exactly|formula|framework)/i.test(content)) {
    score += 8
    reasons.push('Actionable value')
  } else if (/(question|wonder|but why|what if)/i.test(content)) {
    score += 6
    reasons.push('Curiosity gap')
  }

  // Drop-off signals
  if (/(introduction|overview|background|let me explain|in this video)/i.test(content)) {
    score -= 14
    reasons.push('Setup/filler')
  } else if (/(conclusion|summary|recap|wrap up|thanks for watching|subscribe)/i.test(content)) {
    score -= 16
    reasons.push('Wind-down')
  } else if (/(transition|next|moving on|now let)/i.test(content)) {
    score -= 6
    reasons.push('Transition')
  }

  // 6. Normalize
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
  if (score >= 68) return 'Strong Engagement'
  if (score >= 45) return 'Moderate Risk'
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
