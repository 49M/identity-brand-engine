# TrueU 🎯

**Authentic content creation powered by AI that understands your unique voice.**

TrueU is an AI-powered platform that helps content creators stay true to their authentic voice while producing high-performing content. By analyzing your brand identity across five key dimensions, TrueU provides personalized content ideas, audience insights, and strategic recommendations—all tailored to your unique creative style. Through video analysis, and content generation, TrueU has creators' backs'!

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🌟 What is TrueU?

TrueU solves the creator's biggest challenge: **staying authentic while growing your audience**. Unlike generic content tools, TrueU learns your unique brand identity and ensures every piece of content resonates with both you and your audience.

### The Problem

Content creators face constant pressure to:
- Stay on trend while remaining authentic
- Understand their audience deeply
- Generate consistent content ideas
- Maintain their unique voice across platforms
- Balance performance with authenticity

### The Solution

TrueU uses AI to:
1. **Map your brand identity** across 5 dimensions (Tone, Authority, Depth, Emotion, Risk)
2. **Analyze your target audience** with precision
3. **Generate personalized content ideas** that align with your voice
4. **Track your brand evolution** over time
5. **Provide strategic insights** from successful content

---

## ✨ Key Features

### 🎨 5-Dimension Brand Identity System
Define your authentic voice through:
- **Tone**: From aggressive to calm
- **Authority**: From peer guide to expert educator
- **Depth**: From tactical how-tos to philosophical concepts
- **Emotion**: From analytical to inspirational
- **Risk**: From safe to controversial

### 🤖 AI-Powered Content Ideas
- Real-time chat interface with context-aware AI
- Content suggestions tailored to your brand
- Platform-specific recommendations
- Integration with social profile analysis

### 👥 Smart Audience Insights
- AI-generated target audience profiles
- Automatic updates based on profile changes
- Demographics, interests, and pain points analysis
- Platform optimization recommendations

### 📊 Profile Management
- Interactive identity dashboard
- Visual dimension sliders
- Profile editing with live preview
- Multi-platform support (YouTube, TikTok, Instagram, X, LinkedIn)

### 💬 Conversational AI Assistant
- Dedicated thread for content brainstorming
- Maintains context across conversations
- Markdown-formatted responses
- Powered by OpenAI GPT-4o via Backboard.io

---

## 🏗️ Architecture

TrueU is built with modern web technologies and AI infrastructure:

### Tech Stack

**Frontend**
- **Next.js 15.1** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Markdown** - Rich content formatting

**Backend**
- **Next.js API Routes** - Serverless API
- **Backboard.io** - AI assistant orchestration
- **OpenAI GPT-4o** - Content generation
- **Claude 3.5 Sonnet** - Identity reasoning

**Memory System**
- JSON-based local storage
- Profile, Brand, Content, Insights separation
- Adaptive memory with confidence scoring

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

- **Node.js 18+** - [Download](https://nodejs.org/)
- **npm** or **pnpm** - Package manager
- **Backboard.io API Key** - [Get one here](https://backboard.io)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trueu.git
   cd trueu
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   BACKBOARD_API_KEY=your_backboard_api_key_here
   ```

4. **Initialize the memory system**

   The memory system will auto-initialize on first run. Files will be created in `./memory/`:
   - `meta.json` - System metadata
   - `profile.json` - Creator profile
   - `brand.json` - Brand persona
   - `content.json` - Content ideas
   - `insights.json` - Analytics data

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📖 Usage Guide

### Creating Your Profile

1. **Start Onboarding** - Click "Get Started" on the landing page
2. **Enter Basic Info** - Name and content niche
3. **Set Brand Dimensions** - Adjust 5 sliders to match your voice
4. **Define Your Audience** - Age, interests, pain points
5. **Choose Platforms** - Select where you create content
6. **Generate Target Audience** - AI analyzes and creates audience profile

### Getting Content Ideas

1. **Open Dashboard** - Navigate to your dashboard
2. **Click "Get Ideas"** - Opens AI chat interface
3. **Ask for Ideas** - Type questions like:
   - "Give me 5 video ideas for this week"
   - "What's trending in my niche?"
   - "Content ideas for YouTube Shorts"
4. **Review Suggestions** - AI provides markdown-formatted ideas
5. **Save & Implement** - Copy ideas to your workflow

### Editing Your Identity

1. **Click "Edit Identity"** - From dashboard
2. **Adjust Dimensions** - Fine-tune your brand voice
3. **Update Profile Details** - Modify goals, audience, constraints
4. **Save Changes** - AI automatically updates target audience

### Connecting Social Profiles

1. **Get Ideas Panel** - Click "Connect Profile URL"
2. **Select Platform** - YouTube, TikTok, Instagram, X, or LinkedIn
3. **Paste URL** - Add your profile link
4. **Analyze** - AI extracts insights (coming soon)

---

## 🗂️ Project Structure

```
trueu/
├── app/
│   ├── api/                  # API routes
│   │   ├── profile/          # Profile management
│   │   ├── generate-content/ # Content ideas generation
│   │   ├── update-identity/  # Identity updates
│   │   └── target-audience/  # Audience insights
│   ├── dashboard/            # Main dashboard
│   │   └── components/       # Dashboard components
│   │       ├── GetIdeasPanel.tsx
│   │       ├── EditIdentityPanel.tsx
│   │       └── ...
│   ├── create-profile/       # Onboarding flow
│   └── page.tsx              # Landing page
├── lib/
│   ├── ai/                   # AI integration
│   │   ├── backboard-initialize.ts
│   │   └── model-router.ts
│   └── memory/               # Memory system
│       ├── types.ts
│       ├── read.ts
│       ├── write.ts
│       ├── helpers.ts
│       └── defaults.ts
├── memory/                   # JSON data storage (gitignored)
│   ├── meta.json
│   ├── profile.json
│   ├── brand.json
│   ├── content.json
│   └── insights.json
└── public/                   # Static assets
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
| `BACKBOARD_API_KEY` | Backboard.io API key for AI assistant | Yes |
| `NODE_ENV` | Environment (development/production) | Auto-set |

---

## 🎨 Design Philosophy

TrueU follows these core principles:

1. **Authenticity First** - Never compromise the creator's voice
2. **Privacy by Design** - Local-first data storage
3. **AI as Amplifier** - Enhance, don't replace, human creativity
4. **Progressive Disclosure** - Simple onboarding, powerful features
5. **Beautiful by Default** - Polished UI with attention to detail

### Design System

- **Colors**: Pink-purple gradient brand
- **Typography**: Inter font family
- **Components**: Glassmorphism with subtle animations
- **Responsive**: Mobile-first approach

---

## 🔒 Privacy & Data

TrueU takes privacy seriously:

- **Local Storage** - All profile data stored locally as JSON files
- **No Cloud Sync** - Your data never leaves your machine
- **API Calls** - Only sent to Backboard.io for AI processing
- **No Tracking** - Zero analytics or user tracking
- **Open Source** - Full transparency into data handling

---

## 🚧 Roadmap

### v1.0 (Current)
- ✅ Profile creation & onboarding
- ✅ 5-dimension brand identity
- ✅ AI content ideas generation
- ✅ Target audience analysis
- ✅ Identity editing
- ✅ Social profile URL validation

### v1.1 (Next)
- 🔄 Social profile content analysis
- 🔄 Content performance tracking
- 🔄 Multi-profile support
- 🔄 Export capabilities

### v2.0 (Future)
- 📋 Video upload & analysis
- 📋 Competitor insights
- 📋 Content calendar
- 📋 Team collaboration
- 📋 API access

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure `npm run lint` passes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Backboard.io** - AI assistant orchestration
- **OpenAI** - GPT-4o model
- **Anthropic** - Claude 3.5 Sonnet
- **Vercel** - Deployment platform
- **Next.js Team** - Amazing framework

---

## 📞 Support

- **Documentation**: [docs.trueu.ai](https://docs.trueu.ai) (coming soon)
- **Issues**: [GitHub Issues](https://github.com/yourusername/trueu/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/trueu/discussions)
- **Email**: support@trueu.ai

---

## 🌟 Star History

If you find TrueU helpful, please consider giving it a star ⭐

---

<div align="center">
  <strong>Built with ❤️ by creators, for creators</strong>

  <br/>

  **Be TrueU. Be Authentic.**
</div>
