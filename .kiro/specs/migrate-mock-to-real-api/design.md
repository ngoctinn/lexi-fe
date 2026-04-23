# Design Document: Migrate Mock to Real API

## Overview

This design document outlines the complete migration of the Lexi Frontend from mock data and mock authentication to real API calls with Cognito authentication. The migration maintains user experience, adds comprehensive error handling, and ensures all data flows through the real backend API.

**Key Objectives:**
- Remove all mock data and mock authentication
- Implement missing API endpoints (session turns, flashcard queries)
- Add error handling and loading states
- Ensure Cognito token injection for all authenticated requests
- Maintain backend as the source of truth for all data

---

## Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend UI Components                       │
│  (Sessions, Flashcards, Profile, Auth)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Server Actions / React Hooks                        │
│  (get-sessions, create-session, fetch-flashcards, etc.)         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Client Layer                              │
│  (lib/api/client.ts)                                            │
│  - JWT Token Injection (Cognito)                                │
│  - Error Handling & Logging                                     │
│  - Request/Response Validation                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Real Backend API                              │
│  (https://htv5bybfsc.execute-api.ap-southeast-1.amazonaws.com)  │
│  - Sessions Endpoints                                           │
│  - Flashcards Endpoints                                         │
│  - Profile Endpoints                                            │
│  - Scenarios Endpoints                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Authentication Flow

```
User Sign-In
    │
    ▼
Cognito initiateAuth (AWS Amplify)
    │
    ├─ Success: Store ID Token + Refresh Token
    │
    ▼
API Client retrieves ID Token from storage
    │
    ▼
Inject Authorization: Bearer <id_token> header
    │
    ▼
Make authenticated API request
    │
    ├─ 401 Unauthorized: Refresh token → Retry request
    ├─ 403 Forbidden: Display permission error
    ├─ 4xx/5xx: Display user-friendly error message
    │
    ▼
Backend validates JWT and processes request
```

### Data Flow: Session Creation Example

```
User clicks "Start Session"
    │
    ▼
UI shows loading spinner
    │
    ▼
Server Action: createSession(scenario_id, learner_role_id)
    │
    ▼
API Client: POST /sessions
    ├─ Retrieve Cognito ID token
    ├─ Inject Authorization header
    ├─ Send request body: { scenario_id, learner_role_id, ... }
    │
    ▼
Backend creates session, returns session_id + initial AI turn
    │
    ▼
Server Action parses response:
    ├─ Extract session_id, turns, status
    ├─ Validate schema (required fields present)
    ├─ Store in React state / server cache
    │
    ▼
UI hides loading spinner, displays session
```

---

## Components and Interfaces

### 1. API Client Layer (`lib/api/client.ts`)

**Current Status:** ✅ Ready (no changes needed)

**Responsibilities:**
- Automatic JWT token injection from Cognito
- Error handling with detailed logging
- Request/response validation
- Support for authenticated and public requests

**Key Functions:**
```typescript
// Authenticated request (includes JWT token)
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T>

// Public request (no JWT token)
export async function apiRequestPublic<T>(
  path: string,
  options: RequestInit = {}
): Promise<T>
```

**Error Handling:**
- Network errors: Log and throw
- 4xx errors: Log details, throw with message
- 5xx errors: Log details, throw with message
- 401 Unauthorized: Trigger token refresh (handled by Amplify)
- 403 Forbidden: Throw with permission error message

### 2. Authentication Module

**Changes Required:**
- ❌ Remove `features/auth/mock-auth.ts` (entire file)
- ❌ Remove `isMockAuthSession()` function calls
- ❌ Remove `signInMockSession()` and `clearMockAuthSession()` actions
- ✅ Keep Cognito integration (AWS Amplify handles this)

**Auth Flow:**
1. User signs in via Cognito (AWS Amplify)
2. Cognito returns ID token + Refresh token
3. Amplify stores tokens in secure storage
4. API Client retrieves token before each request
5. Token automatically injected in Authorization header

### 3. Session Actions (`features/session/actions/*.ts`)

**Changes Required:**

#### `get-sessions.ts`
```typescript
// BEFORE (with mock fallback)
export async function getSessions() {
  if (await isMockAuthSession()) {
    return mockSessionApi.getSessions();  // ❌ Remove this
  }
  return apiRequest('/sessions');
}

// AFTER (real API only)
export async function getSessions() {
  const response = await apiRequest<SessionsResponse>('/sessions');
  return response.sessions;
}
```

#### `get-session.ts`
```typescript
// BEFORE (with mock fallback)
export async function getSession(sessionId: string) {
  if (await isMockAuthSession()) {
    return mockSessionApi.getSession(sessionId);  // ❌ Remove this
  }
  return apiRequest(`/sessions/${sessionId}`);
}

// AFTER (real API only)
export async function getSession(sessionId: string) {
  const response = await apiRequest<SessionResponse>(`/sessions/${sessionId}`);
  return response.session;
}
```

#### `create-session.ts`
```typescript
// BEFORE (with mock fallback)
export async function createSession(
  scenarioId: string,
  learnerRoleId?: string
) {
  if (await isMockAuthSession()) {
    return mockSessionApi.createSession(scenarioId);  // ❌ Remove this
  }
  return apiRequest('/sessions', {
    method: 'POST',
    body: JSON.stringify({ scenario_id: scenarioId, learner_role_id: learnerRoleId })
  });
}

// AFTER (real API only)
export async function createSession(
  scenarioId: string,
  learnerRoleId?: string
) {
  const response = await apiRequest<CreateSessionResponse>('/sessions', {
    method: 'POST',
    body: JSON.stringify({
      scenario_id: scenarioId,
      learner_role_id: learnerRoleId
    })
  });
  return response.session;
}
```

#### `submit-turn.ts` (NEW - Implement POST /sessions/{id}/turns)
```typescript
export async function submitTurn(
  sessionId: string,
  text: string,
  isHintUsed: boolean = false,
  audioUrl?: string
) {
  const response = await apiRequest<SubmitTurnResponse>(
    `/sessions/${sessionId}/turns`,
    {
      method: 'POST',
      body: JSON.stringify({
        text,
        is_hint_used: isHintUsed,
        audio_url: audioUrl
      })
    }
  );
  return {
    userTurn: response.user_turn,
    aiTurn: response.ai_turn,
    analysisKeywords: response.analysis_keywords
  };
}
```

#### `end-session.ts`
```typescript
// BEFORE (with mock fallback)
export async function endSession(sessionId: string) {
  if (await isMockAuthSession()) {
    return mockSessionApi.completeSession(sessionId);  // ❌ Remove this
  }
  return apiRequest(`/sessions/${sessionId}/complete`, {
    method: 'POST'
  });
}

// AFTER (real API only)
export async function endSession(sessionId: string) {
  const response = await apiRequest<CompleteSessionResponse>(
    `/sessions/${sessionId}/complete`,
    { method: 'POST' }
  );
  return response.scoring;
}
```

### 4. Flashcard Actions (`features/flashcards/actions/practice-actions.ts`)

**Changes Required:**

#### Remove Mock Data
```typescript
// ❌ REMOVE THIS
let mockFlashcards: Flashcard[] = [
  { flashcard_id: "01HGWY0Z57N3F0H19ZK2B7V2M1", word: "resilient", ... },
  { flashcard_id: "01HGWY0Z57N3F0H19ZK2B7V2M2", word: "ephemeral", ... },
  { flashcard_id: "01HGWY0Z57N3F0H19ZK2B7V2M3", word: "ubiquitous", ... },
  { flashcard_id: "01HGWY0Z57N3F0H19ZK2B7V2M4", word: "pragmatic", ... }
];
```

#### Implement Real API Calls
```typescript
// NEW: Fetch all flashcards
export async function fetchFlashcards(limit: number = 20, lastKey?: string) {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (lastKey) params.append('last_key', lastKey);
  
  const response = await apiRequest<FlashcardsResponse>(
    `/flashcards?${params.toString()}`
  );
  return {
    cards: response.cards,
    nextKey: response.next_key
  };
}

// NEW: Fetch due flashcards for today
export async function fetchPracticeQueue() {
  const response = await apiRequest<DueFlashcardsResponse>('/flashcards/due');
  return response.cards;
}

// NEW: Fetch specific flashcard
export async function getFlashcard(flashcardId: string) {
  const response = await apiRequest<FlashcardResponse>(
    `/flashcards/${flashcardId}`
  );
  return response;
}

// EXISTING: Update to use real API
export async function updateFlashcardSRS(
  flashcardId: string,
  rating: 'forgot' | 'hard' | 'good' | 'easy'
) {
  const response = await apiRequest<ReviewResponse>(
    `/flashcards/${flashcardId}/review`,
    {
      method: 'POST',
      body: JSON.stringify({ rating })
    }
  );
  return {
    intervalDays: response.interval_days,
    reviewCount: response.review_count,
    nextReviewAt: response.next_review_at
  };
}

// EXISTING: Create flashcard (already calls real API, just remove mock fallback)
export async function createFlashcard(vocab: string, metadata: FlashcardMetadata) {
  const response = await apiRequest<CreateFlashcardResponse>('/flashcards', {
    method: 'POST',
    body: JSON.stringify({
      vocab,
      vocab_type: metadata.vocabType,
      translation_vi: metadata.translationVi,
      definition_vi: metadata.definitionVi,
      phonetic: metadata.phonetic,
      audio_url: metadata.audioUrl,
      example_sentence: metadata.exampleSentence,
      source_session_id: metadata.sourceSessionId,
      source_turn_index: metadata.sourceTurnIndex
    })
  });
  return response.flashcard_id;
}
```

### 5. Profile Actions (`features/profile/api/profile.actions.ts`)

**Changes Required:**

#### Remove Mock Data
```typescript
// ❌ REMOVE THIS
const MOCK_ADMIN_PROFILE = {
  display_name: "Lexi Admin",
  email: "admin@lexi.app",
  current_level: "B2",
  target_level: "C1",
  avatar_url: "https://api.dicebear.com/9.x/lorelei/svg?seed=LexiAdmin",
  is_new_user: false,
};
```

#### Implement Real API Calls
```typescript
// BEFORE (with mock fallback)
export async function getProfile() {
  if (await isMockAuthSession()) {
    return { ...MOCK_ADMIN_PROFILE };  // ❌ Remove this
  }
  return apiRequest('/profile');
}

// AFTER (real API only)
export async function getProfile() {
  const response = await apiRequest<ProfileResponse>('/profile');
  return response;
}

// BEFORE (with mock fallback)
export async function updateProfile(updates: Partial<Profile>) {
  if (await isMockAuthSession()) {
    return { ...MOCK_ADMIN_PROFILE, ...updates };  // ❌ Remove this
  }
  return apiRequest('/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
}

// AFTER (real API only)
export async function updateProfile(updates: Partial<Profile>) {
  const response = await apiRequest<UpdateProfileResponse>('/profile', {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
  return response;
}
```

### 6. Error Handling Strategy

**Error Handling Layer** (in Server Actions / React Hooks):

```typescript
// Pattern for all API calls
export async function fetchSessionsWithErrorHandling() {
  try {
    return await getSessions();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    // Map error messages to user-friendly text
    const userMessage = mapErrorToUserMessage(message);
    
    // Log for debugging
    console.error('[sessions] Failed to fetch sessions:', {
      error: message,
      timestamp: new Date().toISOString()
    });
    
    // Return error state for UI
    return {
      error: userMessage,
      data: null
    };
  }
}

// Error message mapping
function mapErrorToUserMessage(error: string): string {
  if (error.includes('401') || error.includes('Unauthorized')) {
    return 'Your session has expired. Please sign in again.';
  }
  if (error.includes('403') || error.includes('Forbidden')) {
    return 'You do not have permission to perform this action.';
  }
  if (error.includes('404') || error.includes('not found')) {
    return 'The requested resource was not found.';
  }
  if (error.includes('timeout')) {
    return 'Request timed out. Please check your connection and try again.';
  }
  if (error.includes('5')) {
    return 'Server error. Please try again later.';
  }
  return 'Something went wrong. Please try again.';
}
```

### 7. Loading State Implementation

**Pattern for UI Components:**

```typescript
// Server Action with loading state
'use server'
export async function getSessionsAction() {
  try {
    const sessions = await getSessions();
    return { success: true, data: sessions };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Client Component with loading state
'use client'
export function SessionsList() {
  const [state, formAction] = useActionState(getSessionsAction, {
    success: false,
    data: null,
    error: null
  });
  
  const isLoading = state.success === false && !state.error;
  
  return (
    <div>
      {isLoading && <Skeleton className="h-20 w-full" />}
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
          <Button onClick={() => formAction()}>Retry</Button>
        </Alert>
      )}
      {state.success && state.data && (
        <div>
          {state.data.map(session => (
            <SessionCard key={session.session_id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Data Models

### Session Response Schema
```typescript
interface Session {
  session_id: string;
  user_id: string;
  scenario_id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  turns: Turn[];
  scoring: Scoring | null;
  created_at: string;
  updated_at: string;
}

interface Turn {
  turn_index: number;
  speaker: 'USER' | 'AI';
  content: string;
  translated_content?: string;
  audio_url?: string;
  is_hint_used: boolean;
}

interface Scoring {
  fluency: number;
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  overall: number;
  feedback: string;
}
```

### Flashcard Response Schema
```typescript
interface Flashcard {
  flashcard_id: string;
  word: string;
  translation_vi: string;
  definition_vi: string;
  phonetic: string;
  audio_url: string;
  example_sentence: string;
  review_count: number;
  interval_days: number;
  difficulty: number;
  next_review_at: string;
  last_reviewed_at: string;
  source_session_id?: string;
  source_turn_index?: number;
}
```

### Profile Response Schema
```typescript
interface Profile {
  user_id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  current_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  target_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  current_streak: number;
  total_words_learned: number;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  is_new_user: boolean;
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: JWT Token Injection

**For all** authenticated API requests, the Authorization header SHALL contain a valid Cognito JWT token in the format `Bearer <id_token>`.

**Validates: Requirements 1.4, 9.2**

**Test Strategy:**
- Intercept all authenticated API requests
- Verify Authorization header is present
- Verify format matches `Bearer <token>`
- Verify token is a valid JWT (can be decoded)

### Property 2: Session Response Schema Compliance

**For all** session responses from the Real_API, the response structure SHALL contain all required fields: `session_id`, `status`, `turns`, and `scoring` (when completed).

**Validates: Requirements 12.1**

**Test Strategy:**
- Generate random session responses
- Verify all required fields are present
- Verify field types match schema
- Verify nested Turn objects have required fields

### Property 3: Flashcard Response Schema Compliance

**For all** flashcard responses from the Real_API, the response structure SHALL contain all required fields: `flashcard_id`, `word`, `translation_vi`, `definition_vi`, `phonetic`, `audio_url`, `example_sentence`, `review_count`, `interval_days`, `difficulty`, `next_review_at`, `last_reviewed_at`.

**Validates: Requirements 12.2**

**Test Strategy:**
- Generate random flashcard responses
- Verify all required fields are present
- Verify field types match schema
- Verify date fields are valid ISO 8601 timestamps

### Property 4: Profile Response Schema Compliance

**For all** profile responses from the Real_API, the response structure SHALL contain all required fields: `user_id`, `email`, `display_name`, `avatar_url`, `current_level`, `target_level`, `current_streak`, `total_words_learned`, `role`, `is_active`, `is_new_user`.

**Validates: Requirements 12.3**

**Test Strategy:**
- Generate random profile responses
- Verify all required fields are present
- Verify field types match schema
- Verify enum fields (level, role) have valid values

### Property 5: No Mock Data in Production

**For all** data displayed in the System, the source SHALL be the Real_API (never mock data).

**Validates: Requirements 2.1, 2.2, 3.1, 3.2, 4.1, 11.8**

**Test Strategy:**
- Search codebase for hardcoded mock data arrays
- Verify all data-fetching functions call Real_API endpoints
- Verify no fallback to mock data on API errors
- Verify mock files are deleted

---

## Error Handling

### Error Categories and Responses

| Error Type | HTTP Status | User Message | Action |
|-----------|------------|--------------|--------|
| Invalid Request | 400 | "Invalid request. Please check your input and try again." | Show error, allow retry |
| Unauthorized | 401 | "Your session has expired. Please sign in again." | Redirect to sign-in |
| Forbidden | 403 | "You do not have permission to perform this action." | Show error, no retry |
| Not Found | 404 | "The requested resource was not found." | Show error, allow retry |
| Server Error | 5xx | "Server error. Please try again later." | Show error, allow retry |
| Timeout | - | "Request timed out. Please check your connection and try again." | Show error, allow retry |
| Network Error | - | "Network error. Please check your connection and try again." | Show error, allow retry |

### Error Logging

All errors SHALL be logged with:
- Error message
- HTTP status code (if applicable)
- Request path and method
- Timestamp
- User ID (if authenticated)

**Example:**
```
[api] Request failed (401): /sessions
{
  "status": 401,
  "body": { "error": "Unauthorized" },
  "timestamp": "2026-04-23T10:30:00Z",
  "userId": "cognito-sub-123"
}
```

---

## Testing Strategy

### Unit Tests (Example-Based)

Test specific API calls and error scenarios:

1. **Session Operations**
   - ✅ `getSessions()` calls `GET /sessions` with correct headers
   - ✅ `createSession()` calls `POST /sessions` with correct body
   - ✅ `submitTurn()` calls `POST /sessions/{id}/turns` with correct body
   - ✅ `endSession()` calls `POST /sessions/{id}/complete`
   - ✅ Error handling: 401 triggers redirect, 5xx shows error message

2. **Flashcard Operations**
   - ✅ `fetchFlashcards()` calls `GET /flashcards` with pagination
   - ✅ `fetchPracticeQueue()` calls `GET /flashcards/due`
   - ✅ `getFlashcard()` calls `GET /flashcards/{id}`
   - ✅ `updateFlashcardSRS()` calls `POST /flashcards/{id}/review` with rating
   - ✅ Error handling: 404 shows "not found" message

3. **Profile Operations**
   - ✅ `getProfile()` calls `GET /profile`
   - ✅ `updateProfile()` calls `PATCH /profile` with updates
   - ✅ Error handling: 403 shows "permission denied" message

4. **Error Handling**
   - ✅ 4xx errors display user-friendly messages
   - ✅ 5xx errors display user-friendly messages
   - ✅ Timeouts display user-friendly messages
   - ✅ Error details are logged for debugging
   - ✅ Retry button is displayed on error

5. **Loading States**
   - ✅ Loading spinner is visible during API calls
   - ✅ Submit button is disabled during submission
   - ✅ Loading spinner is hidden when response arrives
   - ✅ Loading spinner is hidden when error occurs

### Integration Tests

Test end-to-end flows with real API:

1. **Session Flow**
   - Create session → Submit turn → Complete session → Verify scoring saved

2. **Flashcard Flow**
   - Fetch due flashcards → Review flashcard → Verify SRS updated

3. **Profile Flow**
   - Fetch profile → Update profile → Verify changes persisted

### Property-Based Tests

Test universal properties across many inputs:

1. **JWT Token Injection** (100+ iterations)
   - For all authenticated requests, verify Authorization header format

2. **Schema Validation** (100+ iterations)
   - For all session responses, verify required fields present
   - For all flashcard responses, verify required fields present
   - For all profile responses, verify required fields present

---

## Migration Rollout Plan

### Phase 1: Remove Mock Authentication (Week 1)
- [ ] Remove `features/auth/mock-auth.ts` file
- [ ] Remove `isMockAuthSession()` function calls
- [ ] Remove `signInMockSession()` and `clearMockAuthSession()` actions
- [ ] Verify Cognito sign-in works
- [ ] Test: Sign in → Verify JWT token is stored

### Phase 2: Remove Mock Session Data (Week 1-2)
- [ ] Remove `features/session/api/session-mock.ts` file
- [ ] Update `get-sessions.ts` to use real API only
- [ ] Update `get-session.ts` to use real API only
- [ ] Update `create-session.ts` to use real API only
- [ ] Update `end-session.ts` to use real API only
- [ ] Implement `submit-turn.ts` for `POST /sessions/{id}/turns`
- [ ] Test: Create session → Submit turn → Complete session

### Phase 3: Remove Mock Flashcard Data (Week 2)
- [ ] Remove mock flashcards array from `practice-actions.ts`
- [ ] Implement `fetchFlashcards()` for `GET /flashcards`
- [ ] Implement `fetchPracticeQueue()` for `GET /flashcards/due`
- [ ] Implement `getFlashcard()` for `GET /flashcards/{id}`
- [ ] Update `updateFlashcardSRS()` to use real API
- [ ] Test: Fetch due flashcards → Review flashcard → Verify SRS updated

### Phase 4: Remove Mock Profile Data (Week 2)
- [ ] Remove `MOCK_ADMIN_PROFILE` from codebase
- [ ] Update `getProfile()` to use real API only
- [ ] Update `updateProfile()` to use real API only
- [ ] Test: Fetch profile → Update profile → Verify changes persisted

### Phase 5: Add Error Handling & Loading States (Week 2-3)
- [ ] Add error handling to all API calls
- [ ] Add loading states to all async operations
- [ ] Add retry buttons to error messages
- [ ] Test: Simulate API errors → Verify error messages and retry

### Phase 6: Testing & Verification (Week 3)
- [ ] Run unit tests for all API calls
- [ ] Run integration tests for end-to-end flows
- [ ] Run property-based tests for schema validation
- [ ] Manual testing on staging environment
- [ ] Verify no mock references remain in codebase

---

## Files to Remove

1. `features/auth/mock-auth.ts` — Mock authentication module
2. `features/session/api/session-mock.ts` — Mock session data

## Files to Modify

1. `features/session/actions/get-sessions.ts` — Remove mock fallback
2. `features/session/actions/get-session.ts` — Remove mock fallback
3. `features/session/actions/create-session.ts` — Remove mock fallback
4. `features/session/actions/end-session.ts` — Remove mock fallback
5. `features/session/actions/submit-turn.ts` — NEW: Implement POST /sessions/{id}/turns
6. `features/flashcards/actions/practice-actions.ts` — Remove mock data, implement real API calls
7. `features/profile/api/profile.actions.ts` — Remove mock data, use real API only

## Files to Keep (No Changes)

1. `lib/api/client.ts` — API client is ready, no changes needed
2. `.env.local` — Environment variables are correct

---

## Success Criteria

✅ All mock files removed  
✅ All mock function calls removed  
✅ All API calls use real backend  
✅ Cognito JWT tokens injected in all authenticated requests  
✅ Error handling displays user-friendly messages  
✅ Loading states visible during async operations  
✅ All response schemas validated  
✅ No mock data references in codebase  
✅ All unit tests passing  
✅ All integration tests passing  
✅ All property-based tests passing (100+ iterations)  
