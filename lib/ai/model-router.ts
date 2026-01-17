/**
 * Multi-Model Router
 *
 * Routes tasks to specialized AI models based on their strengths
 * All models accessed through Backboard.io unified API
 *
 * Model Responsibility Matrix:
 * - Claude (Anthropic): Nuanced tone analysis, identity reasoning, voice matching
 * - GPT-4 (OpenAI): Creative content ideation, diverse angles
 * - Gemini (Google): Strategic analysis, pattern detection, ranking
 * - Cohere (Command): Quick summaries, factual queries
 * - Grok (xAI): Real-time trends, engagement analysis
 */

import { backboard } from "./backboard"
import type { ModelSelection, AIResponse, VideoAnalysisContext, ContentGenerationContext } from "./types"

/**
 * Model routing decision logic
 */
export function selectModelForTask(task: string): ModelSelection {
  const taskMap: Record<string, ModelSelection> = {
    'tone_analysis': {
      model: 'claude',
      provider: 'anthropic',
      reason: 'Superior at nuanced communication analysis and understanding tone/voice'
    },
    'identity_reasoning': {
      model: 'claude',
      provider: 'anthropic',
      reason: 'Excels at complex identity and brand positioning analysis'
    },
    'content_generation': {
      model: 'gpt-4',
      provider: 'openai',
      reason: 'Best-in-class creative ideation with diverse angles'
    },
    'voice_matching': {
      model: 'claude',
      provider: 'anthropic',
      reason: 'Exceptional at matching and refining specific communication styles'
    },
    'strategic_ranking': {
      model: 'gemini',
      provider: 'google',
      reason: 'Strong reasoning for pattern detection and strategic prioritization'
    },
    'quick_summary': {
      model: 'cohere',
      provider: 'cohere',
      reason: 'Fast, efficient compression and summarization'
    },
    'trend_analysis': {
      model: 'grok',
      provider: 'xai',
      reason: 'Real-time analysis and engagement pattern detection'
    }
  }

  return taskMap[task] || taskMap['identity_reasoning']
}

/**
 * Call AI model through Backboard with context
 */
export async function callModel(
  sessionId: string,
  model: ModelSelection,
  prompt: string,
  memoryContext: string[] = []
): Promise<AIResponse> {
  try {
    // Build full prompt with memory context
    const fullPrompt = buildPromptWithContext(prompt, memoryContext)

    // Map to Backboard model identifiers
    const modelId = getBackboardModelId(model)

    const response = await backboard.post(`/v1/sessions/${sessionId}/chat`, {
      model: modelId,
      messages: [
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      temperature: getTemperatureForTask(model.model),
      max_tokens: 2000
    })

    return {
      model,
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    }
  } catch (error) {
    console.error(`Model ${model.model} call failed:`, error)
    throw new Error(`AI model request failed: ${model.model}`)
  }
}

/**
 * Analyze video tone and brand alignment with Claude
 */
export async function analyzeVideoTone(
  sessionId: string,
  context: VideoAnalysisContext,
  transcript: string
): Promise<AIResponse> {
  const model = selectModelForTask('tone_analysis')

  const prompt = `
You are analyzing a video for a content creator to determine brand alignment.

Creator Profile:
- Name: ${context.creatorProfile.name}
- Niche: ${context.creatorProfile.niche}
- Target Identity Dimensions: ${JSON.stringify(context.creatorProfile.targetIdentity)}

Video Transcript:
${transcript}

Analyze this video and provide:
1. Detected tone (aggressive/calm, peer/teacher, tactical/philosophical, analytical/motivational)
2. Key themes present
3. Energy level (low/medium/high)
4. Brand alignment score (0-100) comparing actual vs target identity
5. Specific observations about voice and style

Format as JSON.
  `.trim()

  return callModel(sessionId, model, prompt, context.backboardMemory)
}

/**
 * Generate content ideas with GPT-4
 */
export async function generateContentIdeas(
  sessionId: string,
  context: ContentGenerationContext,
  count: number = 10
): Promise<AIResponse> {
  const model = selectModelForTask('content_generation')

  const prompt = `
Generate ${count} compelling content ideas for a creator.

Creator Profile:
- Name: ${context.creatorProfile.name}
- Niche: ${context.creatorProfile.niche}
- Tone: ${context.creatorProfile.tone.join(', ')}

Brand Identity:
- Core Themes: ${context.brandMemory.coreThemes.join(', ')}
- Voice Style: ${context.brandMemory.voice.style.join(', ')}
- Pacing: ${context.brandMemory.voice.pacing}

${context.recentContent ? `Recent Content (avoid repetition):\n${context.recentContent.join('\n')}` : ''}

Generate creative, diverse content ideas. Each idea should have:
1. Hook (attention-grabbing opening)
2. Angle (unique perspective or approach)
3. Why it fits this creator's brand

Format as JSON array.
  `.trim()

  return callModel(sessionId, model, prompt, context.backboardMemory)
}

/**
 * Refine content idea to match creator's voice with Claude
 */
export async function refineToVoice(
  sessionId: string,
  idea: { hook: string; angle: string },
  voiceProfile: { style: string[]; pacing: string },
  memoryContext: string[]
): Promise<AIResponse> {
  const model = selectModelForTask('voice_matching')

  const prompt = `
Refine this content idea to perfectly match the creator's authentic voice.

Original Idea:
- Hook: ${idea.hook}
- Angle: ${idea.angle}

Target Voice:
- Style: ${voiceProfile.style.join(', ')}
- Pacing: ${voiceProfile.pacing}

Rewrite the hook and angle to match this voice precisely. Keep the core concept but adjust tone, word choice, and pacing.

Format as JSON with "hook" and "angle" keys.
  `.trim()

  return callModel(sessionId, model, prompt, memoryContext)
}

/**
 * Rank ideas by strategic fit with Gemini
 */
export async function rankIdeasByFit(
  sessionId: string,
  ideas: Array<{ id: string; hook: string; angle: string }>,
  brandThemes: string[],
  memoryContext: string[]
): Promise<AIResponse> {
  const model = selectModelForTask('strategic_ranking')

  const prompt = `
Rank these content ideas by strategic fit for a creator's brand.

Brand Core Themes: ${brandThemes.join(', ')}

Ideas to rank:
${ideas.map((idea, i) => `${i + 1}. [${idea.id}] ${idea.hook} - ${idea.angle}`).join('\n')}

Rank them from best to worst fit based on:
1. Alignment with core themes
2. Authenticity to brand voice
3. Strategic positioning value

Return JSON array of idea IDs in ranked order with reasoning.
  `.trim()

  return callModel(sessionId, model, prompt, memoryContext)
}

/**
 * Quick summary with Cohere
 */
export async function quickSummary(
  sessionId: string,
  content: string
): Promise<AIResponse> {
  const model = selectModelForTask('quick_summary')

  const prompt = `Summarize this in 2-3 sentences:\n\n${content}`

  return callModel(sessionId, model, prompt)
}

// Helper functions

function buildPromptWithContext(prompt: string, memoryContext: string[]): string {
  if (memoryContext.length === 0) return prompt

  const contextSection = `
LEARNED CONTEXT (from past interactions):
${memoryContext.map((ctx, i) => `${i + 1}. ${ctx}`).join('\n')}

Use this context to personalize your response.

---

${prompt}
  `.trim()

  return contextSection
}

function getBackboardModelId(model: ModelSelection): string {
  // Map to Backboard.io model identifiers
  const modelMap: Record<string, string> = {
    'claude': 'anthropic/claude-3.5-sonnet',
    'gpt-4': 'openai/gpt-4-turbo',
    'gemini': 'google/gemini-pro',
    'cohere': 'cohere/command',
    'grok': 'xai/grok-beta'
  }

  return modelMap[model.model] || 'anthropic/claude-3.5-sonnet'
}

function getTemperatureForTask(model: string): number {
  // Higher temperature for creative tasks, lower for analytical
  const temperatureMap: Record<string, number> = {
    'claude': 0.3,      // Analytical precision
    'gpt-4': 0.8,       // Creative diversity
    'gemini': 0.4,      // Strategic reasoning
    'cohere': 0.2,      // Factual summary
    'grok': 0.5         // Balanced analysis
  }

  return temperatureMap[model] || 0.5
}

/**
 * Get user-friendly model display name
 */
export function getModelDisplayName(model: ModelSelection): string {
  const displayMap: Record<string, string> = {
    'claude': '🧠 Claude (Anthropic)',
    'gpt-4': '💡 GPT-4 (OpenAI)',
    'gemini': '🎯 Gemini (Google)',
    'cohere': '⚡ Command (Cohere)',
    'grok': '📊 Grok (xAI)'
  }

  return displayMap[model.model] || model.model
}
