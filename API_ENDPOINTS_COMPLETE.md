# API Gateway Endpoints - Complete Reference

**Last Updated:** April 27, 2026  
**Base URL:** `${NEXT_PUBLIC_API_URL}`  
**Authentication:** Cognito ID Token (via Authorization header)

---

## 📋 Table of Contents

1. [Profile Endpoints](#profile-endpoints)
2. [Session Endpoints](#session-endpoints)
3. [Vocabulary Endpoints](#vocabulary-endpoints)
4. [Flashcard Endpoints](#flashcard-endpoints)
5. [Scenario Endpoints](#scenario-endpoints)
6. [Admin Endpoints](#admin-endpoints)

---

## Profile Endpoints

### GET /profile
**Authentication:** Required (Cognito)  
**Purpose:** Fetch current user's profile

**Request:**
```typescript
GET /profile
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    display_name?: string;
    email?: string;
    current_level?: string;
    target_level?: string;
    learning_goal_text?: string;
    learning_goal?: string;
    avatar_url?: string;
    is_new_user?: boolean;
  };
  error?: string;
}
```

**Implementation:**
- File: `features/profile/api/profile.actions.ts`
- Function: `getProfile()`
- Cache: `{ tags: ["profile"] }`

---

### PATCH /profile
**Authentication:** Required (Cognito)  
**Purpose:** Update user's profile

**Request:**
```typescript
PATCH /profile
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json

Body:
{
  display_name?: string;
  current_level?: string;
  target_level?: string;
  learning_goal_text?: string;
  learning_goal?: string;
  is_new_user?: boolean;
  avatar_url?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    display_name?: string;
    email?: string;
    current_level?: string;
    target_level?: string;
    learning_goal_text?: string;
    learning_goal?: string;
    avatar_url?: string;
    is_new_user?: boolean;
  };
  error?: string;
}
```

**Implementation:**
- File: `features/profile/api/profile.actions.ts`
- Function: `updateProfile(data)`
- Cache Invalidation: `revalidateTag("profile", "max")`

---

## Session Endpoints

### POST /sessions
**Authentication:** Required (Cognito)  
**Purpose:** Create a new speaking session

**Request:**
```typescript
POST /sessions
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json

Body:
{
  scenario_id: string;
  user_role: string;
  ai_role: string;
  difficulty_level?: string;
  // Additional fields as needed
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    session: {
      session_id: string;
      user_id: string;
    };
  };
  error?: string;
}
```

**Implementation:**
- File: `features/session/actions/create-session.ts`
- Function: `createSession(dto)`
- Cache: `no-store`

---

### GET /sessions
**Authentication:** Required (Cognito)  
**Purpose:** Get all sessions for current user

**Request:**
```typescript
GET /sessions
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    sessions: Session[];
  };
  error?: string;
}
```

**Session Object:**
```typescript
{
  session_id: string;
  user_id: string;
  scenario_id: string;
  user_role: string;
  ai_role: string;
  difficulty_level: string;
  status: "active" | "completed" | "paused";
  turns: Turn[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}
```

**Implementation:**
- File: `features/session/actions/get-sessions.ts`
- Function: `getSessions()`
- Cache: `no-store`

---

### GET /sessions/{sessionId}
**Authentication:** Required (Cognito)  
**Purpose:** Get a specific session by ID

**Request:**
```typescript
GET /sessions/{sessionId}
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    session: Session;
  };
  error?: string;
}
```

**Implementation:**
- File: `features/session/actions/get-session.ts`
- Function: `getSession(sessionId)`
- Cache: `no-store`

---

### POST /sessions/{sessionId}/turns
**Authentication:** Required (Cognito)  
**Purpose:** Submit a speaking turn in a session

**Request:**
```typescript
POST /sessions/{sessionId}/turns
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json

Body:
{
  text: string;
  is_hint_used?: boolean;
  audio_url?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    success: boolean;
    session?: {
      session_id: string;
      turns?: Turn[];
    };
    user_turn?: Turn;
    ai_turn?: Turn;
    analysis_keywords?: string[];
    error?: string;
  };
  error?: string;
}
```

**Turn Object:**
```typescript
{
  turn_id: string;
  session_id: string;
  speaker: "user" | "ai";
  text: string;
  audio_url?: string;
  timestamp: string;
  feedback?: {
    grammar_errors: string[];
    vocabulary_suggestions: string[];
    pronunciation_notes: string[];
  };
}
```

**Implementation:**
- File: `features/session/actions/submit-turn.ts`
- Function: `submitTurn(sessionId, request)`
- Cache: `no-store`

---

### POST /sessions/{sessionId}/complete
**Authentication:** Required (Cognito)  
**Purpose:** End/complete a speaking session

**Request:**
```typescript
POST /sessions/{sessionId}/complete
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}
```

**Implementation:**
- File: `features/session/actions/end-session.ts`
- Function: `endSession(sessionId)`
- Cache: `no-store`

---

## Vocabulary Endpoints

### POST /vocabulary/translate
**Authentication:** Required (Cognito)  
**Purpose:** Translate a word with context

**Request:**
```typescript
POST /vocabulary/translate
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json

Body:
{
  word: string;
  context?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    word: string;
    translation_vi: string;
    phonetic: string;
    audio_url?: string;
    definitions: {
      part_of_speech: string;
      definition_en: string;
      definition_vi: string;
      example_en: string;
      example_vi: string;
    }[];
    synonyms: string[];
    response_time_ms: number;
    cached: boolean;
  };
  error?: string;
}
```

**Implementation:**
- File: `features/session/actions/translate-word.ts`
- Function: `translateWordAction(word, context?)`
- Cache: `no-store`

---

### POST /vocabulary/translate-sentence
**Authentication:** Required (Cognito)  
**Purpose:** Translate a sentence

**Request:**
```typescript
POST /vocabulary/translate-sentence
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json

Body:
{
  sentence: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    sentence_en: string;
    sentence_vi: string;
  };
  error?: string;
}
```

**Implementation:**
- File: `features/session/actions/translate-sentence.ts`
- Function: `translateSentenceAction(sentence)`
- Cache: `no-store`

---

## Flashcard Endpoints

### GET /flashcards
**Authentication:** Required (Cognito)  
**Purpose:** Fetch flashcards with pagination

**Request:**
```typescript
GET /flashcards?limit=20&last_key=<optional_pagination_key>
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json

Query Parameters:
  - limit: number (1-100, default: 20)
  - last_key?: string (for pagination)
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    cards: Flashcard[];
    next_key?: string;
  };
  error?: string;
}
```

**Flashcard Object:**
```typescript
{
  flashcard_id: string;
  user_id: string;
  word: string;
  word_type: string;
  translation_vi: string;
  phonetic?: string;
  audio_url?: string;
  example_sentence?: string;
  review_count: number;
  interval_days: number;
  next_review_at: string;
  created_at: string;
  updated_at: string;
}
```

**Implementation:**
- File: `features/flashcards/actions/practice-actions-v2.ts`
- Function: `fetchFlashcards(limit?, lastKey?)`
- Cache: `no-store`
- Retry: 3 attempts with exponential backoff

---

### GET /flashcards/due
**Authentication:** Required (Cognito)  
**Purpose:** Fetch due flashcards for practice

**Request:**
```typescript
GET /flashcards/due
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    cards: Flashcard[];
  };
  error?: string;
}
```

**Implementation:**
- File: `features/flashcards/actions/practice-actions-v2.ts`
- Function: `fetchPracticeQueue()`
- Cache: `no-store`
- Retry: 3 attempts with exponential backoff

---

### GET /flashcards/{flashcardId}
**Authentication:** Required (Cognito)  
**Purpose:** Get a specific flashcard by ID

**Request:**
```typescript
GET /flashcards/{flashcardId}
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: Flashcard;
  error?: string;
}
```

**Implementation:**
- File: `features/flashcards/actions/practice-actions-v2.ts`
- Function: `getFlashcard(flashcardId)`
- Cache: `no-store`
- Retry: 3 attempts with exponential backoff

---

### POST /flashcards
**Authentication:** Required (Cognito)  
**Purpose:** Create a new flashcard

**Request:**
```typescript
POST /flashcards
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json

Body:
{
  word: string;
  word_type: string;
  translation_vi: string;
  phonetic?: string;
  audio_url?: string;
  example_sentence?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    flashcard_id?: string;
    word?: string;
    message?: string;
  };
  error?: string;
}
```

**Implementation:**
- File: `features/flashcards/actions/practice-actions-v2.ts`
- Function: `saveFlashcardFromSession(input)`
- Cache Invalidation: `revalidatePath("/flashcards")`, `revalidatePath("/flashcards/review")`
- Retry: 3 attempts with exponential backoff

---

### POST /flashcards/{flashcardId}/review
**Authentication:** Required (Cognito)  
**Purpose:** Update flashcard SRS (Spaced Repetition System)

**Request:**
```typescript
POST /flashcards/{flashcardId}/review
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json

Body:
{
  rating: "easy" | "good" | "hard" | "again";
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    interval_days?: number;
    review_count?: number;
    next_review_at?: string;
  };
  error?: string;
}
```

**Implementation:**
- File: `features/flashcards/actions/practice-actions-v2.ts`
- Function: `updateFlashcardSRS(flashcardId, difficultyStr)`
- Cache Invalidation: `revalidatePath("/flashcards/review")`
- Retry: 3 attempts with exponential backoff

---

## Scenario Endpoints

### GET /scenarios
**Authentication:** NOT Required (Public)  
**Purpose:** Get all available scenarios

**Request:**
```typescript
GET /scenarios
Headers:
  - Content-Type: application/json
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    scenarios: Scenario[];
  };
  error?: string;
}
```

**Scenario Object:**
```typescript
{
  scenario_id: string;
  scenario_title: string;
  context: string;
  difficulty_level: string;
  roles: {
    user_role: string;
    ai_role: string;
  };
  goals: string[];
  order?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

**Implementation:**
- File: `features/session/actions/get-scenarios.ts`
- Function: `getScenarios()`
- Cache: `no-store`
- Note: Uses `apiPublicFetch` (no authentication required)

---

## Admin Endpoints

### GET /admin/users
**Authentication:** Required (Cognito + Admin Role)  
**Purpose:** Get all users (admin only)

**Request:**
```typescript
GET /admin/users
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    users: AdminUser[];
    total_count: number;
  };
  error?: string;
}
```

**AdminUser Object:**
```typescript
{
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  current_level: string;
  target_level: string;
  role: string;
  is_active: boolean;
  total_words_learned: number;
  joined_at: string;
  learning_goal_text: string;
  status: string;
  sessions_completed: number;
  streak: number;
  last_active_at: string;
  updated_at: string;
  notes?: string;
}
```

**Implementation:**
- File: `features/admin/actions/admin.actions.ts`
- Function: `getAdminUsers()`
- Cache: `no-store`
- Fallback: Returns mock data if user is not admin (403 Forbidden)

---

### PATCH /admin/users/{userId}
**Authentication:** Required (Cognito + Admin Role)  
**Purpose:** Update a user (admin only)

**Request:**
```typescript
PATCH /admin/users/{userId}
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json

Body:
{
  display_name?: string;
  current_level?: string;
  target_level?: string;
  is_active?: boolean;
  role?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: AdminUser;
  error?: string;
}
```

**Implementation:**
- File: `features/admin/actions/admin.actions.ts`
- Function: `upsertAdminUser(user)`
- Cache Invalidation: `revalidatePath("/admin")`, `revalidatePath("/admin/users")`

---

### GET /admin/scenarios
**Authentication:** Required (Cognito + Admin Role)  
**Purpose:** Get all scenarios (admin only)

**Request:**
```typescript
GET /admin/scenarios
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    scenarios: AdminScenario[];
    total_count: number;
  };
  error?: string;
}
```

**Implementation:**
- File: `features/admin/actions/admin.actions.ts`
- Function: `getAdminScenarios()`
- Cache: `no-store`
- Fallback: Fetches public scenarios if user is not admin (403 Forbidden)

---

### POST /admin/scenarios
**Authentication:** Required (Cognito + Admin Role)  
**Purpose:** Create a new scenario (admin only)

**Request:**
```typescript
POST /admin/scenarios
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json

Body:
{
  scenario_title: string;
  context: string;
  difficulty_level: string;
  roles: {
    user_role: string;
    ai_role: string;
  };
  goals: string[];
  order?: number;
  notes?: string;
  is_active: boolean;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: AdminScenario;
  error?: string;
}
```

**Implementation:**
- File: `features/admin/actions/admin.actions.ts`
- Function: `upsertAdminScenario(scenario)`
- Cache Invalidation: `revalidatePath("/admin")`, `revalidatePath("/admin/scenarios")`

---

### PATCH /admin/scenarios/{scenarioId}
**Authentication:** Required (Cognito + Admin Role)  
**Purpose:** Update a scenario (admin only)

**Request:**
```typescript
PATCH /admin/scenarios/{scenarioId}
Headers:
  - Authorization: <id_token>
  - Content-Type: application/json

Body:
{
  scenario_title?: string;
  context?: string;
  difficulty_level?: string;
  roles?: {
    user_role: string;
    ai_role: string;
  };
  goals?: string[];
  order?: number;
  notes?: string;
  is_active?: boolean;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: AdminScenario;
  error?: string;
}
```

**Implementation:**
- File: `features/admin/actions/admin.actions.ts`
- Function: `upsertAdminScenario(scenario)`
- Cache Invalidation: `revalidatePath("/admin")`, `revalidatePath("/admin/scenarios")`

---

## 🔐 Authentication

All endpoints (except `/scenarios`) require Cognito authentication:

1. **Token Source:** AWS Amplify `fetchAuthSession()`
2. **Token Type:** ID Token (JWT)
3. **Header:** `Authorization: <id_token>`
4. **Obtained via:** `runWithAmplifyServerContext()` in Server Actions

**Error Handling:**
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User authenticated but lacks required permissions (e.g., admin role)

---

## 📊 Response Format

All endpoints follow a standard response format:

```typescript
{
  success: boolean;           // Operation success status
  message: string;            // Human-readable message
  data?: T;                   // Response payload (varies by endpoint)
  error?: string;             // Error code or details
}
```

---

## ⚠️ Error Handling

**Common HTTP Status Codes:**
- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource (e.g., flashcard already exists)
- `429 Too Many Requests`: Rate limited
- `500 Internal Server Error`: Server error

**Error Response Example:**
```typescript
{
  success: false;
  message: "User not authenticated";
  error: "UNAUTHORIZED";
}
```

---

## 🔄 Caching Strategy

| Endpoint | Cache | Revalidation |
|----------|-------|--------------|
| GET /profile | `{ tags: ["profile"] }` | `revalidateTag("profile", "max")` on PATCH |
| GET /sessions | `no-store` | N/A |
| GET /sessions/{id} | `no-store` | N/A |
| POST /sessions/{id}/turns | `no-store` | N/A |
| GET /flashcards | `no-store` | N/A |
| GET /flashcards/due | `no-store` | N/A |
| POST /flashcards | `no-store` | `revalidatePath("/flashcards")` |
| POST /flashcards/{id}/review | `no-store` | `revalidatePath("/flashcards/review")` |
| GET /scenarios | `no-store` | N/A |
| GET /admin/users | `no-store` | N/A |
| GET /admin/scenarios | `no-store` | N/A |

---

## 🔁 Retry Logic

**Flashcard endpoints** use automatic retry with exponential backoff:
- Max attempts: 3
- Retryable errors: Network errors, timeouts, 5xx errors
- Backoff strategy: Exponential

**Other endpoints:** No automatic retry (handled by application layer)

---

## 📝 Implementation Notes

### Fetch Wrapper
- **File:** `lib/api/fetch.ts`
- **Functions:**
  - `apiFetch<T>()`: Authenticated requests
  - `apiPublicFetch<T>()`: Public requests (no auth)

### Error Handling
- **Pattern:** Return errors, don't throw (for expected errors)
- **Validation:** Zod schemas for flashcard operations
- **Logging:** Comprehensive error logging with context

### Server Actions
- **Pattern:** Pure Next.js Server Actions
- **Cache Invalidation:** `revalidateTag()` and `revalidatePath()`
- **Error Handling:** Return `ActionResult<T>` with success/error fields

---

## ✅ Verification Checklist

- [x] All endpoints documented with request/response formats
- [x] Authentication requirements specified
- [x] Cache strategies defined
- [x] Error handling patterns documented
- [x] Implementation file references provided
- [x] Retry logic documented
- [x] Standard response format defined
- [x] Admin endpoints marked with role requirements
