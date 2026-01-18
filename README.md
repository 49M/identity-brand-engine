# TrueU 🎯

**AI-powered content creation that stays true to your voice.**

TrueU helps content creators maintain authenticity while producing high-performing content. Define your brand identity across five dimensions, analyze videos for retention patterns and brand alignment, and get personalized content ideas—all powered by advanced AI.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🌟 What is TrueU?

TrueU solves the creator's challenge: **staying authentic while growing your audience**. Map your unique brand identity, analyze video content for performance insights, and generate ideas that align with your voice.

### Core Features

1. **5-Dimension Brand Identity** - Define your voice across Tone, Authority, Depth, Emotion, and Risk
2. **Video Analysis with Twelve Labs** - Upload videos to get retention timelines, brand alignment scores, and actionable feedback
3. **AI Content Generation** - Get personalized content ideas that match your brand
4. **Target Audience Insights** - Understand who you're creating for
5. **Brand Coherence Tracking** - Monitor how consistently your content aligns with your identity

---

## ✨ Key Features

### 🎨 5-Dimension Brand Identity
Define your authentic voice:
- **Tone**: Aggressive to calm
- **Authority**: Peer guide to expert educator
- **Depth**: Tactical how-tos to philosophical concepts
- **Emotion**: Analytical to inspirational
- **Risk**: Safe to controversial

### 📹 Video Analysis (Twelve Labs)
Upload videos to get:
- **Retention Timeline** - Predicted engagement patterns with color-coded segments (green/yellow/red)
- **Brand Alignment Score** - How well videos match your identity across all 5 dimensions
- **Actionable Feedback** - Specific strengths and improvements with timestamps
- **Content Insights** - Auto-generated titles, topics, hashtags, and summaries

### 🤖 AI Content Generation
- Chat interface for content brainstorming
- Ideas tailored to your brand dimensions
- Platform-specific recommendations
- Powered by OpenAI GPT-4o and Claude 3.5 Sonnet

### 👥 Target Audience Insights
- AI-generated audience profiles
- Demographics, interests, and pain points
- Platform optimization suggestions
- Updates automatically with profile changes

### 📊 Brand Coherence Tracking
- Dashboard score showing average brand alignment
- Based on all uploaded video analyses
- Dimension-level breakdowns
- Empty state prompts for initial uploads

---

## 🏗️ Architecture

TrueU is built with modern web technologies and AI infrastructure:

### Tech Stack

**Frontend**
- Next.js 15.1 with App Router
- TypeScript
- Tailwind CSS
- React Markdown

**AI & Video Analysis**
- Twelve Labs (Marengo 3.0, Pegasus 1.2) - Video analysis
- Grok-3 via X.AI - Brand alignment scoring
- OpenAI GPT-4o - Content generation
- Claude 3.5 Sonnet - Identity reasoning
- Backboard.io - AI orchestration

**Storage**
- JSON-based local storage
- Profile, Brand, Content, Insights memory files

### Architecture Highlights

```
┌─────────────────────────────────────────────────────────┐
│                    TrueU Platform                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Profile    │  │    Ideas     │  │   Insights   │  │
│  │   Creation   │  │ Generation   │  │   Analysis   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│         └──────────────────┴──────────────────┘          │
│                         │                                │
│                 ┌───────▼────────┐                       │
│                 │  Memory System  │                      │
│                 │  (JSON Files)   │                      │
│                 └───────┬────────┘                       │
│                         │                                │
│         ┌───────────────┴───────────────┐               │
│         │                               │               │
│   ┌─────▼─────┐                  ┌─────▼─────┐         │
│   │ Backboard │                  │   Local   │         │
│   │    AI     │                  │  Storage  │         │
│   │ Assistant │                  │           │         │
│   └─────┬─────┘                  └───────────┘         │
│         │                                                │
│   ┌─────▼─────┐                                         │
│   │  OpenAI   │                                         │
│   │  Claude   │                                         │
│   └───────────┘                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- API keys for:
  - Backboard.io
  - Twelve Labs
  - X.AI (for Grok-3)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/trueu.git
   cd trueu
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables

   Create a `.env.local` file:
   ```env
   BACKBOARD_API_KEY=your_key_here
   TWELVE_LABS_API_KEY=your_key_here
   XAI_API_KEY=your_key_here
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage Guide

### Creating Your Profile

1. Click "Get Started" on the landing page
2. Enter your name and content niche
3. Adjust 5 brand dimension sliders
4. Define your target audience
5. Select your platforms
6. AI generates your target audience profile

### Analyzing Videos

1. Click "Upload Video" from the dashboard
2. Drag and drop or select a video file (up to 2GB)
3. Wait for analysis (includes Twelve Labs processing + Grok-3 brand alignment)
4. Review:
   - Retention timeline with color-coded engagement predictions
   - Brand alignment score with dimension breakdowns
   - Suggested title, topics, and hashtags
   - Actionable feedback with timestamps

### Getting Content Ideas

1. Click "Get Ideas" from dashboard
2. Ask questions like:
   - "Give me 5 video ideas for this week"
   - "What's trending in my niche?"
   - "How can I improve my hook?"
3. Review AI-generated suggestions tailored to your brand

### Monitoring Brand Coherence

The dashboard shows your brand coherence score:
- Average brand alignment across all uploaded videos
- Dimension-level breakdowns
- Updates automatically after each video upload

---

## 🗂️ Project Structure

```
trueu/
├── app/
│   ├── api/
│   │   ├── profile/           # Profile management
│   │   ├── video/             # Video upload & analysis
│   │   ├── brand-coherence/   # Brand scoring
│   │   ├── generate-content/  # Content ideas
│   │   └── update-identity/   # Identity updates
│   ├── dashboard/
│   │   └── components/
│   │       ├── UploadVideoPanel.tsx
│   │       ├── GetIdeasPanel.tsx
│   │       └── EditIdentityPanel.tsx
│   ├── create-profile/        # Onboarding
│   └── page.tsx               # Landing
├── lib/
│   ├── ai/
│   │   ├── backboard-initialize.ts
│   │   ├── twelvelabs.ts
│   │   ├── retention-analyzer.ts
│   │   └── model-router.ts
│   └── memory/
│       ├── types.ts
│       ├── read.ts
│       └── write.ts
└── memory/                    # JSON storage (gitignored)
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

### Adding New Features

1. **Memory Types** - Define in `lib/memory/types.ts`
2. **API Routes** - Create in `app/api/[route]/route.ts`
3. **Components** - Add to `app/dashboard/components/`
4. **AI Functions** - Extend `lib/ai/backboard-initialize.ts`

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BACKBOARD_API_KEY` | Backboard.io API key | Yes |
| `TWELVE_LABS_API_KEY` | Twelve Labs API key | Yes |
| `XAI_API_KEY` | X.AI API key for Grok-3 | Yes |

---

## 🎨 Design Philosophy

Core principles:

1. **Authenticity First** - Never compromise the creator's voice
2. **Local-First Storage** - Your data stays on your machine
3. **AI as Amplifier** - Enhance human creativity
4. **Actionable Insights** - Specific feedback, not generic advice

Design system: Pink-purple gradient brand, glassmorphism UI, responsive layout

---

## 🔒 Privacy & Data

- All profile data stored locally as JSON files
- No cloud sync - data stays on your machine
- API calls only for AI processing (Backboard.io, Twelve Labs, X.AI)
- No analytics or user tracking

---

## 🚧 Roadmap

### Current (v1.0)
- ✅ 5-dimension brand identity
- ✅ Video upload & analysis with Twelve Labs
- ✅ Retention timeline predictions
- ✅ Brand alignment scoring with Grok-3
- ✅ AI content ideas generation
- ✅ Target audience insights
- ✅ Brand coherence tracking

### Next
- Video remix feature (maintain virality while staying on-brand)
- Social profile content analysis
- Content performance tracking
- Multi-profile support
- Competitor insights

---

## 🤝 Contributing

Contributions welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/NewFeature`)
3. Commit your changes
4. Open a Pull Request

Guidelines: Follow TypeScript best practices, write meaningful commits, ensure `npm run lint` passes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Backboard.io - AI orchestration
- Twelve Labs - Video analysis
- X.AI - Grok-3 model
- OpenAI - GPT-4o
- Anthropic - Claude 3.5 Sonnet
- Vercel - Deployment

---

If you find TrueU helpful, please consider giving it a star ⭐

---

<div align="center">
  <strong>Built with ❤️ by creators, for creators</strong>

  <br/>

  **Be TrueU. Be Authentic.**
</div>
