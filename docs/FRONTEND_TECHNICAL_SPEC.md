# Frontend Technical Specification - LexiLearn
**Version**: 3.0 | **Date**: April 2026 | **Status**: Draft

---

## 1. Overview

### 1.1 Technology Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Framework** | Next.js | 16.2.0 | App Router with RSC |
| **UI Library** | shadcn/ui | 4.0.8 | Radix-based, nova style |
| **Styling** | Tailwind CSS | 4.x | Utility-first with CSS variables |
| **Icons** | Lucide React | 0.577.0 | Icon library |
| **State** | React Server State | 19.2.4 | Server components + client state |
| **Animations** | tw-animate-css | 1.4.0 | Tailwind animations |
| **Charts** | Recharts | 2.15.4 | Data visualization |
| **Date** | date-fns | 4.1.0 | Date manipulation |

### 1.2 Architecture Principles

**Clean Architecture Mapping (Frontend)**:
```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: FRAMEWORKS & DRIVERS (Infrastructure)             │
│  • Next.js App Router (routing, SSR/SSG)                    │
│  • shadcn/ui components (UI primitives)                     │
│  • Tailwind CSS (styling system)                            │
│  • AWS Amplify SDK (auth client)                            │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ depends on
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: INTERFACE ADAPTERS                                │
│  • API Service Layer (REST/WS clients)                      │
│  • Storage Adapter (S3 pre-signed URLs)                     │
│  • WebSocket Adapter (real-time connection)                 │
│  • Audio Recorder Adapter (Web Audio API)                   │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ depends on
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: APPLICATION (Use Cases + Ports)                   │
│  • Session Use Cases (create, list, end)                    │
│  • Flashcard Use Cases (create, review, SRS)                │
│  • Word Lookup Use Case (cache-aside pattern)               │
│  • Auth Use Cases (login, logout, refresh)                  │
│  • Ports: IApiService, IStorageService, IWebSocketService   │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ depends on
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: DOMAIN (Entities + Business Logic)                │
│  • Session Entity (status machine, validation)              │
│  • FlashCard Entity (SM-2 algorithm)                        │
│  • Turn Entity (USER/AI, hints, skips)                      │
│  • Scoring Entity (4 skills: 0-100)                         │
│  • UserProfile Entity (level, streak, points)               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Project Structure

### 2.1 Directory Layout

```
lexi-fe/
├── app/                              # Next.js App Router (RSC)
│   ├── (app)/                        # Authenticated app routes
│   │   ├── layout.tsx                # App layout with sidebar
│   │   ├── page.tsx                  # Dashboard redirect
│   │   ├── dashboard/                # Main dashboard
│   │   ├── learn/                    # Learning path
│   │   ├── vocabulary/               # Vocabulary management
│   │   ├── practice/                 # Practice mode
│   │   ├── shop/                     # Shop/Store
│   │   ├── leaderboard/              # Leaderboard
│   │   ├── showcase/                 # Component showcase
│   │   └── profile/                  # User profile settings
│   ├── (auth)/                       # Auth routes
│   │   ├── layout.tsx                # Auth layout (centered)
│   │   ├── login/                    # Login page
│   │   └── signup/                   # Signup page
│   ├── (marketing)/                  # Public marketing pages
│   │   ├── layout.tsx                # Marketing layout
│   │   └── page.tsx                  # Landing page
│   ├── layout.tsx                    # Root layout (metadata, fonts)
│   ├── page.tsx                      # Root redirect to marketing
│   └── globals.css                   # Tailwind + CSS variables
│
├── components/                       # Shared UI components
│   ├── ui/                           # shadcn/ui components (35+)
│   └── shared/                       # Shared across app
│       └── logo.tsx                  # Logo component
│
├── features/                         # Feature modules (Clean Arch)
│   ├── auth/                         # Authentication feature
│   │   ├── components/               # Auth UI components
│   │   │   ├── login-form.tsx        # Login-specific UI
│   │   │   ├── signup-form.tsx       # Signup-specific UI
│   │   │   └── ...
│   │   ├── hooks/                    # Auth logic (useAuthForm)
│   │   ├── types/                    # Auth schemas/types
│   │   ├── api/                      # Server Actions (auth.actions.ts)
│   │   └── index.ts                  # Feature exports
│   ├── navigation/                   # Navigation feature
│   │   ├── components/               # Sidebar, nav items
│   │   ├── hooks/                    # Navigation hooks
│   │   ├── types/                    # Nav types
│   │   └── index.ts
│   ├── dashboard/                    # Dashboard feature
│   │   ├── components/               # Dashboard widgets
│   │   └── index.ts
│   ├── profile/                      # Profile feature
│   │   ├── components/               # Profile form
│   │   └── index.ts
│   ├── marketing/                    # Marketing feature
│   │   ├── components/               # Hero, CTA, testimonials
│   │   ├── data.ts                   # Marketing content
│   │   └── index.ts
│   └── showcase/                     # Component showcase
│       └── components/               # All showcase types
│
├── lib/                              # Shared utilities
│   ├── utils.ts                      # cn() helper
│   └── api/                          # API clients
│       ├── client.ts                 # Base fetch client
│       ├── auth.ts                   # Auth service
│       ├── session.ts                # Session service
│       ├── flashcard.ts              # Flashcard service
│       └── websocket.ts              # WebSocket service
│
├── hooks/                            # Custom React hooks
│   ├── use-mobile.ts                 # Mobile detection
│   └── use-audio-recorder.ts         # Audio recording
│
├── public/                           # Static assets
│   └── avatars/                      # User avatars
│
├── docs/                             # Documentation
│   ├── SRS.md                        # Software Requirements
│   └── FRONTEND_TECHNICAL_SPEC.md    # This file
│
├── components.json                   # shadcn/ui config
├── next.config.ts                    # Next.js config
├── tailwind.config.ts                # Tailwind config
├── postcss.config.mjs                # PostCSS config
├── tsconfig.json                     # TypeScript config
└── package.json                      # Dependencies
```

### 2.2 Route Groups Strategy

| Route Group | Purpose | URL Impact | Layout |
|-------------|---------|------------|--------|
| `(app)/` | Authenticated app | Preserves path | AppLayout (sidebar) |
| `(auth)/` | Auth pages | Preserves path | AuthLayout (centered) |
| `(marketing)/` | Public pages | Preserves path | MarketingLayout |

**Benefits**:
- Clean URL structure without folder nesting
- Separate layouts for different app sections
- Organize routes by user intent

---

## 3. Data Flow Architecture

### 3.1 Server Components (Default)

**Rules**:
- No `"use client"` directive
- Can use `async/await` directly
- Can access cookies, headers, params
- Can fetch data from API/database
- Automatically memoized by Next.js (per-request)

**Example**:
```tsx
// app/(app)/dashboard/page.tsx
import { SessionsList } from "@/features/dashboard/components/sessions-list"

export default async function DashboardPage() {
  const sessions = await getSessionList() // Server fetch
  
  return (
    <div className="flex flex-col gap-6">
      <DashboardHero user={user} />
      <SessionsList sessions={sessions} />
    </div>
  )
}
```

### 3.2 Client Components (When needed)

**Use `"use client"` when**:
- Event handlers (`onClick`, `onChange`, etc.)
- `useState`, `useEffect`, `useRef`
- Browser APIs (`localStorage`, `window`)
- Interactive components (forms, modals, charts)

**Example**:
```tsx
// features/auth/components/login-form.tsx
"use client"

import { useAuthForm } from "../hooks/use-auth-form"
import { loginAction } from "../api/auth.actions"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const { action, isPending } = useAuthForm(loginAction)
  
  return (
    <form action={action} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  )
}
```

### 3.3 Streaming & Suspense

**Pattern for slow data**:
```tsx
import { Suspense } from "react"

export default async function Page() {
  return (
    <div>
      <Header /> {/* Static - prerendered */}
      
      <Suspense fallback={<LoadingSkeleton />}>
        <SlowDataComponent /> {/* Streams in */}
      </Suspense>
    </div>
  )
}
```

**Use `loading.js` for full-page loading**:
```
app/(app)/dashboard/loading.tsx
```

---

## 4. State Management Strategy

### 4.1 Server State (Default)

**Use Next.js 16 caching**:
- `use cache` directive (explicitly cache function/component output)
- `cacheLife(profile)` for caching profiles (TTL)
- `cacheTag(tag)` for invalidation

**Example**:
```tsx
// lib/api/session.ts
import { cacheLife, cacheTag } from "next/cache"

export async function getSessionList() {
  "use cache"
  cacheLife("hours")
  cacheTag("sessions")
  
  const res = await fetch("/api/sessions")
  return res.json()
}
```

### 4.2 Client State (When needed)

**Use React Context for**:
- Auth state (token, user)
- UI state (sidebar open, theme)
- Session state (current session, turns)

**Example**:
```tsx
// hooks/use-session-context.ts
"use client"

import { createContext, useContext, useState } from "react"

type SessionContextType = {
  currentSession: Session | null
  setCurrentSession: (session: Session | null) => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  
  return (
    <SessionContext.Provider value={{ currentSession, setCurrentSession }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(SessionContext)
  if (!context) throw new Error("useSession must be used within SessionProvider")
  return context
}
```

### 4.3 Server Actions (Mutations)

**Use for form submissions and mutations**:
```tsx
// actions/session-actions.ts
"use server"

import { revalidateTag } from "next/cache"

export async function createSession(formData: FormData) {
  // Server actions are NOT cached by default, so do NOT use "use cache"
  await fetch("/api/sessions", { method: "POST", body: formData })
  revalidateTag("sessions")
}
```

---

## 5. API Service Layer

### 5.1 Base Client

```tsx
// lib/api/client.ts
import { cookies } from "next/headers"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

export async function apiRequest(path: string, options?: RequestInit) {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  
  const headers = new Headers(options?.headers)
  headers.set("Authorization", `Bearer ${token}`)
  headers.set("Content-Type", "application/json")
  
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "API Error")
  }
  
  return res.json()
}
```

### 5.2 Service Layer

```tsx
// lib/api/session.ts
import { apiRequest } from "./client"

export async function getSessionList() {
  return apiRequest("/sessions")
}

export async function createSession(data: CreateSessionDto) {
  return apiRequest("/sessions", { method: "POST", body: JSON.stringify(data) })
}

export async function endSession(sessionId: string) {
  return apiRequest(`/sessions/${sessionId}`, { method: "PATCH", body: JSON.stringify({ status: "COMPLETE" }) })
}
```

---

## 6. Authentication Flow

### 6.1 Client-Side (Amplify SDK)

```tsx
// hooks/use-auth.ts
"use client"

import { Amplify, Auth } from "aws-amplify"
import { cookies } from "next/headers"

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID,
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
    },
  },
})

export async function signIn(email: string, password: string) {
  const user = await Auth.signIn(email, password)
  
  // Store token in cookie (server-side accessible)
  const tokens = user.getSignInUserSession()
  const idToken = tokens?.getIdToken().getJwtToken()
  
  const cookieStore = await cookies()
  cookieStore.set("auth_token", idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60, // 1 hour
  })
  
  return user
}
```

### 6.2 Protected Routes

**Server-side protection**:
```tsx
// app/(app)/dashboard/page.tsx
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value
  
  if (!token) {
    redirect("/login")
  }
  
  // Token is valid, render page
  return <Dashboard />
}
```

---

## 7. Real-Time WebSocket Flow

### 7.1 Connection

```tsx
// lib/api/websocket.ts
export class WebSocketService {
  private ws: WebSocket | null = null
  private url: string
  
  constructor(sessionId: string, token: string) {
    this.url = `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}&session_id=${sessionId}`
  }
  
  connect(onMessage: (event: MessageEvent) => void) {
    this.ws = new WebSocket(this.url)
    
    this.ws.onopen = () => console.log("WS connected")
    this.ws.onmessage = onMessage
    this.ws.onclose = () => console.log("WS disconnected")
  }
  
  send(action: string, payload: any) {
    this.ws?.send(JSON.stringify({ action, ...payload }))
  }
  
  disconnect() {
    this.ws?.close()
  }
}
```

### 7.2 Usage in Session

```tsx
// features/session/hooks/use-session-websocket.ts
"use client"

export function useSessionWebSocket(sessionId: string) {
  const ws = useRef<WebSocketService | null>(null)
  
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    ws.current = new WebSocketService(sessionId, token)
    
    ws.current.connect((event) => {
      const data = JSON.parse(event.data)
      
      switch (data.event) {
        case "SESSION_READY":
          setUploadUrl(data.upload_url)
          break
        case "STT_RESULT":
          setTranscript(data.text)
          break
        case "AI_TEXT_CHUNK":
          appendAiText(data.chunk)
          break
        case "AI_AUDIO_URL":
          setAiAudioUrl(data.url)
          break
      }
    })
    
    return () => ws.current?.disconnect()
  }, [sessionId])
  
  return { send: ws.current?.send.bind(ws.current) }
}
```

---

## 8. Audio Recording & Upload

### 8.1 Web Audio API Recorder

```tsx
// hooks/use-audio-recorder.ts
"use client"

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.current = new MediaRecorder(stream)
    
    audioChunks.current = []
    
    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data)
      }
    }
    
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks.current, { type: "audio/pcm;codec=pcm" })
      setAudioBlob(audioBlob)
    }
    
    mediaRecorder.current.start()
    setIsRecording(true)
  }
  
  const stopRecording = () => {
    mediaRecorder.current?.stop()
    setIsRecording(false)
  }
  
  return { isRecording, audioBlob, startRecording, stopRecording }
}
```

### 8.2 Upload to S3

```tsx
// lib/api/storage.ts
import { apiRequest } from "./client"

export async function getPresignedUrl(filename: string) {
  return apiRequest(`/upload-url?filename=${encodeURIComponent(filename)}`)
}

export async function uploadAudioToS3(blob: Blob, url: string) {
  // Upload directly to S3 with pre-signed URL
  const res = await fetch(url, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": "audio/pcm;codec=pcm",
    },
  })
  
  if (!res.ok) {
    throw new Error("Upload failed")
  }
  
  // Extract s3_key from URL or response
  const s3Key = new URL(url).pathname.split("/").slice(3).join("/")
  return s3Key
}
```

---

## 9. Caching Strategy

### 9.1 Data Caching

```tsx
// lib/api/word.ts
import { cacheLife } from "next/cache"

export async function lookupWord(word: string) {
  "use cache"
  cacheLife("days") // Cache for extended duration per Next.js 16 strategy
  
  // Next.js Cache Components handle the caching natively.
  // We just fetch from the source directly.
  return await fetchOxfordWord(word)
}
```

### 9.2 UI Caching

```tsx
// app/(app)/dashboard/page.tsx
import { cacheLife } from "next/cache"

export default async function DashboardPage() {
  "use cache"
  cacheLife("hours")
  
  const sessions = await getSessionList()
  
  return <Dashboard sessions={sessions} />
}
```

### 9.3 Revalidation

```tsx
// app/(app)/dashboard/page.tsx
import { revalidateTag } from "next/cache"

export async function endSession(sessionId: string) {
  "use server"
  
  await fetch(`/api/sessions/${sessionId}`, { method: "PATCH" })
  revalidateTag("sessions") // Revalidate cached data
}
```

---

## 10. Styling Strategy

### 10.1 Tailwind CSS v4

**Configuration** (`tailwind.config.ts`):
```ts
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./features/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
}

export default config
```

**CSS Variables** (`app/globals.css`):
```css
@import "tailwindcss";

:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}
```

### 10.2 Component Styling

**Use shadcn/ui variants**:
```tsx
<Button variant="outline" size="lg" className="w-full">
  Click me
</Button>
```

**Semantic colors**:
```tsx
<div className="bg-card text-card-foreground">
  <Badge variant="secondary">New</Badge>
</div>
```

**No raw colors**:
```tsx
/* ❌ Bad */
<span className="text-blue-500">Error</span>

/* ✅ Good */
<span className="text-destructive">Error</span>
```

---

## 11. Component Composition

### 11.1 shadcn/ui Rules

**Forms**:
```tsx
<FieldGroup>
  <Field>
    <FieldLabel htmlFor="email">Email</FieldLabel>
    <Input id="email" />
  </Field>
</FieldGroup>
```

**Icons in buttons**:
```tsx
<Button>
  <SearchIcon data-icon="inline-start" />
  Search
</Button>
```

**Card composition**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### 11.2 Layout Patterns

**Sidebar + Main**:
```tsx
<SidebarProvider>
  <AppSidebar />
  <SidebarInset>
    <SidebarTrigger />
    <main className="flex-1 p-6">{children}</main>
  </SidebarInset>
</SidebarProvider>
```

**Modal**:
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <div>Content</div>
  </DialogContent>
</Dialog>
```

---

## 12. Performance Optimization

### 12.1 Code Splitting

**Automatic with Next.js**:
```tsx
// Dynamic import for heavy components
const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
})
```

### 12.2 Image Optimization

**Use `next/image`**:
```tsx
import Image from "next/image"

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={100}
  height={100}
  className="rounded-full"
/>
```

### 12.3 Font Optimization

**Preload critical fonts**:
```tsx
// app/layout.tsx
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  experimental_optimizeCss: true,
})
```

---

## 13. Testing Strategy

### 13.1 Unit Tests

**Target**: Domain entities, Use cases

```tsx
// __tests__/session.test.ts
describe("Session", () => {
  it("should set active status on creation", () => {
    const session = new Session({
      sessionId: "test-123",
      status: "ACTIVE",
    })
    
    expect(session.status).toBe("ACTIVE")
  })
})
```

### 13.2 Integration Tests

**Target**: API services, Adapters

```tsx
// __tests__/session-api.test.ts
describe("Session API", () => {
  it("should create session", async () => {
    const session = await createSession({
      userId: "user-123",
      scenario: "Job interview",
    })
    
    expect(session.sessionId).toBeDefined()
  })
})
```

### 13.3 E2E Tests

**Target**: User flows

```tsx
// e2e/login.spec.ts
test("should login successfully", async ({ page }) => {
  await page.goto("/login")
  await page.fill("#email", "test@example.com")
  await page.fill("#password", "password123")
  await page.click('button[type="submit"]')
  await page.waitForURL("/dashboard")
})
```

---

## 14. Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000/ws
NEXT_PUBLIC_USER_POOL_ID=us-east-1_xxxxx
NEXT_PUBLIC_USER_POOL_CLIENT_ID=xxxxx

# Server-side (not exposed to client)
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
```

---

## 15. Build & Deployment

### 15.1 Build Commands

```bash
# Development
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint
pnpm lint
```

### 15.2 Deployment Targets

| Environment | Command | Notes |
|-------------|---------|-------|
| Vercel | `vercel deploy` | Auto-deploy on push |
| AWS Amplify | `amplify publish` | Full AWS deployment |
| Docker | `docker build -t lexi-fe .` | Containerized deployment |

---

## 16. Future Enhancements

### 16.1 Cache Components (Next.js 16+)

Enable in `next.config.ts`:
```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
}

export default nextConfig
```

### 16.2 Instant Navigation

Export `unstable_instant` for instant client-side navigation:
```tsx
// app/(app)/dashboard/page.tsx
export const unstable_instant = true
```

### 16.3 Server Actions

Migrate mutations to Server Actions:
```tsx
// actions/session-actions.ts
"use server"

export async function createSession(formData: FormData) {
  await db.session.create({ data: formData })
  revalidateTag("sessions")
}
```

---

## 17. Checklist

- [ ] All routes protected with auth check
- [ ] API responses cached with `use cache`
- [ ] Loading states with `<Suspense>` or `loading.js`
- [ ] Error boundaries with `error.tsx`
- [ ] Not found pages with `not-found.tsx`
- [ ] Mobile responsive with `md:` breakpoints
- [ ] Dark mode support with `dark:` classes
- [ ] SEO metadata on all pages
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Performance optimized (code splitting, image optimization)
- [ ] Tests for domain logic
- [ ] Environment variables documented
- [ ] Build succeeds without errors

---

## 18. Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [React Server Components](https://react.dev/reference/react/components#server-components)
