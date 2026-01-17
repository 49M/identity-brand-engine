# AI System Architecture

## Dual-Memory System Design

This application uses a **dual-memory architecture** that separates deterministic state from adaptive learning:

### 🗄️ JSON Files (Deterministic Truth)
Stored in `/memory/*.json`

- **profile.json** - Creator's stated goals, niche, audience info
- **brand.json** - Target identity dimensions (what they want to be)
- **content.json** - Video upload history with analysis results
- **insights.json** - Analyzed video patterns
- **meta.json** - System metadata + Backboard session ID

**Purpose**: Structured data that represents the creator's explicit preferences and content history.

### 🧠 Backboard Memory (Adaptive Learning)
Stored in Backboard.io sessions via API

- **identity_context** - Evolving understanding of creator's actual voice
- **creative_preferences** - Learned patterns from content selections
- **feedback_signals** - User reactions to AI suggestions
- **evolution_notes** - Brand drift observations over time

**Purpose**: Natural language context that captures what the AI learns about the creator through interactions.

---

## Why This Architecture?

### Clarity for Judges ✅
- Easy to explain: "JSON = what they say, Backboard = what we learn"
- Visible separation makes adaptive memory obvious
- Can demonstrate memory growth during demo

### Technical Elegance ✅
- JSON handles structured queries (dimensions, metrics)
- Backboard handles context-aware AI responses
- Clean separation of concerns

### Hackathon Scoring ✅
- **Adaptive Memory**: Backboard memory grows with each interaction
- **Model Switching**: Different models access both memory types
- **User Experience**: Transparent - users see AI learning about them

---

## Multi-Model Router

### Model Responsibility Matrix

| Task | Model | Why |
|------|-------|-----|
| **Tone Analysis** | Claude (Anthropic) | Superior at nuanced communication analysis |
| **Identity Reasoning** | Claude (Anthropic) | Excels at complex brand positioning |
| **Content Generation** | GPT-4 (OpenAI) | Best-in-class creative ideation |
| **Voice Matching** | Claude (Anthropic) | Exceptional at matching specific styles |
| **Strategic Ranking** | Gemini (Google) | Strong reasoning for prioritization |
| **Quick Summary** | Cohere (Command) | Fast, efficient compression |
| **Trend Analysis** | Grok (xAI) | Real-time engagement patterns |

### Visible Model Switching

Models are selected based on task type, not randomly. The UI shows which model is being used:

```
🧠 Analyzing with Claude (Anthropic)...
💡 Generating ideas with GPT-4 (OpenAI)...
🎯 Ranking with Gemini (Google)...
```

This makes the intelligent routing **visible to judges** during demo.

---

## Integration Flow

### 1. Profile Creation
```typescript
// Creates both JSON and Backboard memory
await initializeMemory()  // JSON files
const session = await initializeCreatorSession(creatorId)  // Backboard
await storeCreativePreference(session.sessionId, initialPreferences)
```

### 2. Video Analysis
```typescript
// TwelveLabs analyzes video → stores in content.json
// Claude analyzes tone → stores in content.json + Backboard memory
const analysis = await analyzeVideoTone(sessionId, context, transcript)
await updateIdentityContext(sessionId, analysis)
```

### 3. Content Generation
```typescript
// Reads JSON (profile, brand) + Backboard memory (learned preferences)
const memoryContext = await getMemoryContext(sessionId)
const ideas = await generateContentIdeas(sessionId, context)  // GPT-4
const refined = await refineToVoice(sessionId, idea, voice, memoryContext)  // Claude
```

### 4. Feedback Loop
```typescript
// User accepts/rejects ideas → stores in Backboard
await storeFeedback(sessionId, { ideaId, action: 'rejected', reason: 'too soft' })
// Next generation uses this context
```

---

## Files

- **backboard.ts** - Axios client for Backboard.io API
- **backboard-memory.ts** - Memory management functions
- **model-router.ts** - Multi-model routing logic
- **types.ts** - TypeScript definitions

---

## Demo Story

**"We help creators discover, define, and evolve their identity using adaptive AI memory and video intelligence."**

1. Creator sets target identity (stored in JSON)
2. Uploads video → analyzed by TwelveLabs + Claude
3. AI generates personalized content ideas using both memories
4. Creator feedback → stored in Backboard memory
5. Next generation adapts based on learned preferences

**Key Moment**: Show how rejecting "motivational" ideas leads to AI avoiding them next time (visible memory learning).
