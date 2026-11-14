# MyVoice – AI Voice & Conversational Intelligence Platform

> **A cutting-edge, multilingual AI voice and text conversational platform powered by Google Gemini, Supabase, and Web Speech APIs.**

[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_Postgres-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Serverless_API-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![Vitest](https://img.shields.io/badge/Vitest-26_Passed-729B1B?logo=vitest&logoColor=white)](https://vitest.dev/)

---

## 1. Overview & Vision

**MyVoice** breaks the traditional typing barrier in AI conversations by providing a unified, conversational interface combining:
- **Natural Voice Interaction:** Browser-native speech recognition (STT) and speech synthesis (TTS).
- **Conversational Intelligence:** Server-side Google Gemini 1.5 Flash multi-turn context awareness.
- **Multilingual Support:** Native communication in **English**, **Hindi (हिन्दी)**, and **Kannada (ಕನ್ನಡ)** with automatic script detection and manual language switching.
- **Persistent Cloud History:** Secured by Supabase PostgreSQL and Row-Level Security (RLS).
- **Futuristic Animated UI:** Central Framer Motion interactive glowing voice orb and responsive glassmorphism dark theme.

---

## 2. Architecture & Data Flow

```mermaid
flowchart TD
    subgraph Client ["Frontend (Browser)"]
        UI["MyVoice Responsive UI\n(React 18 + Tailwind + Framer Motion)"]
        STT["Web Speech Recognition API\n(STT: en-US, hi-IN, kn-IN)"]
        TTS["Web Speech Synthesis API\n(TTS Voice Utterance)"]
        AuthHook["useAuth & Supabase SDK\n(Session & Token)"]
    end

    subgraph Vercel ["Vercel Serverless Backend"]
        ChatAPI["POST /api/chat\n(Zod validation & Auth verification)"]
        ConvAPI["GET /api/conversations\n(History & Cascade Deletion)"]
        HealthAPI["GET /api/health\n(Health Check)"]
        ServerSupabase["Server-Side Supabase Client\n(Privileged Service Role Key)"]
    end

    subgraph External ["Cloud Intelligence & Database"]
        Gemini["Google Gemini API\n(gemini-1.5-flash / gemini-1.5-pro)"]
        SupabaseDB[("Supabase PostgreSQL\n(Profiles, Conversations, Messages + RLS)")]
    end

    UI -->|Voice captured| STT
    STT -->|Transcript| UI
    UI -->|Bearer Token + Chat Payload| ChatAPI
    ChatAPI -->|Verify User Identity| ServerSupabase
    ServerSupabase -->|Verify Ownership| SupabaseDB
    ChatAPI -->|Save User Message| SupabaseDB
    ChatAPI -->|Fetch 20 Recent Turns Context| SupabaseDB
    ChatAPI -->|Multi-Turn Context & System Prompt| Gemini
    Gemini -->|AI Response Text| ChatAPI
    ChatAPI -->|Persist Assistant Message| SupabaseDB
    ChatAPI -->|JSON Response| UI
    UI -->|Read Aloud (autoSpeak)| TTS
    UI <-->|Fetch/Manage History| ConvAPI
    ConvAPI <--> SupabaseDB
```

---

## 3. Core Features

### 🎙️ Feature 1: AI Voice Conversation
- **9 Voice Interaction States:** `idle`, `requesting`, `listening`, `speech_detected`, `processing`, `generating`, `speaking`, `paused`, `error`.
- **Framer Motion Voice Orb:** Interactive central glowing orb pulsating with concentric waveform ripples during active listening, spinning during AI generation, and audio waves during speech synthesis.
- **Voice Controls:** Start/Stop microphone, Cancel listening, Replay last AI response, Mute speech playback.
- **Graceful Voice Error Handling:** Microphone permission denial, hardware unavailability, and unsupported browsers gracefully fall back to full-featured text chat.

### 💬 Feature 2: AI Text Chat
- Auto-resizing textarea with `Enter` to send and `Shift+Enter` for newline.
- User and Assistant message bubbles with role avatars, input mode badges (voice or text), and timestamps.
- Rich Markdown rendering with code blocks, lists, bold text, and quick "Copy" feedback.
- Gemini response generation typing indicator with glowing animated dots.
- 20-message recent context retrieval ensuring seamless continuity across conversational turns.

### 🌐 Feature 3: Multilingual Communication
- **Supported Languages:**
  - **English (US):** `en-US`
  - **Hindi (हिन्दी):** `hi-IN`
  - **Kannada (ಕನ್ನಡ):** `kn-IN`
- **Automatic Language Detection:** Heuristic Unicode script analysis automatically detects Devanagari (`hi-IN`), Kannada script (`kn-IN`), or Latin (`en-US`).
- **Manual Language Selector:** Instant switching dropdown in the header with flags and native names.
- **Language-Aware Speech:** Speech recognition and speech synthesis configure specific BCP 47 language codes and localized system voices.
- **Profile Synchronization:** Preferred language is saved in the user's profile.

### 🗄️ Feature 4: Persistent Conversation History
- Saved securely in Supabase PostgreSQL.
- Short conversational titles generated from first user message without extra LLM token latency.
- Ordered with recent conversations first.
- Open, continue, or delete conversations with a confirmation modal.

### 🔒 Feature 5: Security & Privacy
- **Row-Level Security (RLS):** Policies enforced on `profiles`, `conversations`, and `messages`.
- **No Token Forgery:** Every protected API route verifies the Bearer access token via `supabase.auth.getUser(token)`.
- **Zero Client Key Leakage:** `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` reside exclusively on the serverless backend.
- Normal authenticated clients are restricted from directly inserting fake assistant messages into the database.

---

## 4. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Lucide React, React Router 6, React Markdown, Remark GFM |
| **Voice & Audio** | Browser Native Web Speech API (`SpeechRecognition` & `SpeechSynthesis`) |
| **Backend** | Vercel Serverless Functions (`api/chat.ts`, `api/conversations/*.ts`, `api/health.ts`), Zod |
| **AI Intelligence** | Google Gemini API (`@google/generative-ai`), default model `gemini-1.5-flash` |
| **Database & Auth** | Supabase (PostgreSQL with RLS, Supabase Auth, Automated Database Triggers) |
| **Testing** | Vitest, React Testing Library, JSDOM |

---

## 5. Getting Started (Local Development)

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd myvoice
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the values:
```env
# Client-side Supabase Configuration (Public)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side Supabase Configuration (Private - Never expose to client)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google Gemini API Configuration (Private - Server-side only)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-1.5-flash

# Application Metadata
VITE_APP_NAME=MyVoice
VITE_APP_URL=http://localhost:5173
```

> **Note:** If you run the application before configuring Supabase or Gemini, MyVoice includes a **Quick Demo / Guest Mode** that allows immediate evaluation of the UI, voice animations, language switcher, and speech synthesis without crashing!

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Full-Stack Local Dev:** The custom Vite serverless API plugin in `vite.config.ts` intercepts `/api/*` requests in real time, executing the exact TypeScript serverless handlers with zero secondary process needed.

---

## 6. Database Setup & Supabase Migrations

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Navigate to the **SQL Editor**.
3. Copy and execute the contents of [`supabase/migrations/001_initial_schema.sql`](file:///c:/Users/samee/OneDrive/Desktop/My%20Voice/supabase/migrations/001_initial_schema.sql).
4. This script sets up:
   - `profiles` table with automatic signup trigger.
   - `conversations` table with cascade delete and user indexes.
   - `messages` table with cascade delete and chronological indexes.
   - Complete Row-Level Security (RLS) policies for user data isolation.

---

## 7. Google Gemini API Setup

1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Add the key to `GEMINI_API_KEY` in your `.env` (or Vercel Environment Variables).
3. The platform uses `gemini-1.5-flash` by default for fast, conversational responses. You can configure any supported Gemini model via `GEMINI_MODEL` (e.g. `gemini-1.5-pro` or `gemini-2.0-flash`).

---

## 8. Running Tests

Run the Vitest test suite:
```bash
npm test
```

### Test Results
```text
✓ tests/unit/utils.test.ts (12 tests)
✓ tests/unit/validation.test.ts (7 tests)
✓ tests/unit/components.test.tsx (7 tests)

Test Files  3 passed (3)
     Tests  26 passed (26)
```

To build for production and check TypeScript types:
```bash
npm run build
```

---

## 9. Vercel Production Deployment

### Option A: Deploy via Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option B: Deploy via GitHub / Vercel Web Dashboard
1. Push your repository to GitHub.
2. In [Vercel](https://vercel.com/), click **Add New Project** and import the repository.
3. Configure the environment variables in Vercel Project Settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (set to `gemini-1.5-flash`)
4. Build Settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Click **Deploy**.

---

## 10. Browser Speech Compatibility & Fallbacks

| Browser | Speech Recognition (STT) | Speech Synthesis (TTS) | Experience |
|---|---|---|---|
| **Google Chrome** | ✅ Native Full Support (`webkitSpeechRecognition`) | ✅ Native Full Support (`speechSynthesis`) | Full Voice & Text Experience |
| **Microsoft Edge** | ✅ Native Full Support (`webkitSpeechRecognition`) | ✅ Native Full Support (`speechSynthesis`) | Full Voice & Text Experience |
| **Safari (iOS & macOS)** | ⚠️ Requires mic permission prompt per session | ✅ Native Full Support | Full Voice & Text Experience |
| **Mozilla Firefox** | ❌ Speech Recognition disabled by default in Firefox | ✅ Native Full Support | Seamless Text Chat with Spoken AI Output |

> **Graceful Degradation:** When Speech Recognition is unsupported or microphone access is denied, MyVoice alerts the user clearly and enables full text chat functionality with Gemini conversational intelligence.

---

## 11. Folder Structure

```
myvoice/
├── api/
│   ├── chat.ts                     # POST /api/chat - Gemini conversation & persistence
│   ├── conversations/
│   │   ├── index.ts                # GET & POST /api/conversations
│   │   └── [id].ts                 # GET & DELETE /api/conversations/[id]
│   ├── health.ts                   # GET /api/health - System health check
│   ├── lib/
│   │   ├── gemini.ts               # Server-side Gemini SDK integration & context
│   │   └── supabaseServer.ts       # Server-side Supabase client & token auth
│   └── types.ts                    # Serverless request/response types
├── public/
│   └── favicon.svg                 # SVG Voice wave branding icon
├── src/
│   ├── app/
│   │   ├── App.tsx                 # App entry point with router
│   │   ├── providers.tsx           # Context providers
│   │   └── router.tsx              # React Router configuration
│   ├── components/
│   │   ├── auth/                   # LoginForm & SignupForm
│   │   ├── chat/                   # ChatHeader, ChatWindow, MessageBubble, MessageInput
│   │   ├── common/                 # LanguageSelector, TypingIndicator, ConfirmDialog
│   │   ├── layout/                 # AppLayout
│   │   ├── settings/               # SettingsPanel (Voice rate, pitch, auto-speak, test)
│   │   ├── sidebar/                # Sidebar, ConversationList, ConversationItem
│   │   └── voice/                  # VoiceOrb (Framer Motion) & VoiceControls
│   ├── hooks/
│   │   ├── useAuth.tsx             # Supabase Auth state & demo mode
│   │   ├── useChat.ts              # Active conversation chat hook & optimistic updates
│   │   ├── useConversations.ts     # Conversation list & management
│   │   ├── useLanguagePreference.ts# Language switcher & auto-detection
│   │   ├── useSpeechRecognition.ts # Browser STT lifecycle & permission handling
│   │   ├── useSpeechSynthesis.ts   # Browser TTS playback & voice selection
│   │   └── useVoiceState.ts        # 9-state voice state machine
│   ├── pages/
│   │   ├── DashboardPage.tsx       # Main authenticated conversational dashboard
│   │   ├── LoginPage.tsx           # Sign In page
│   │   ├── SignupPage.tsx          # Sign Up page
│   │   └── NotFoundPage.tsx        # 404 page
│   ├── services/
│   │   ├── chatService.ts          # API client for /api/chat
│   │   ├── conversationService.ts  # API client for /api/conversations
│   │   └── supabase.ts             # Frontend Supabase client
│   ├── styles/
│   │   └── index.css               # Tailwind directives & glassmorphism theme
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces & domain models
│   └── utils/
│       └── index.ts                # Language detection, title generator, timestamps
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema, triggers, and RLS policies
├── tests/
│   ├── setup.ts                    # Vitest setup & mocks
│   └── unit/
│       ├── components.test.tsx     # React component unit tests
│       ├── utils.test.ts           # Utility functions tests
│       └── validation.test.ts      # Zod validation schema tests
├── .env.example                    # Environment variables template
├── package.json                    # Project dependencies and scripts
├── tailwind.config.ts              # Custom colors, glows, animations
├── tsconfig.json                   # TypeScript compiler options
├── vercel.json                     # Vercel deployment configuration
└── vite.config.ts                  # Vite build & local serverless middleware
```

---

## 12. License
MIT License. Built for modern conversational intelligence.
