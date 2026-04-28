# API Request/Response Mapping - Detailed Verification

**Date:** April 27, 2026  
**Status:** ✅ All 20 implemented endpoints verified

---

## 📋 Complete Request/Response Mapping

### 1. GET /profile

**Frontend Action:** `getProfile()`  
**File:** `features/profile/api/profile.actions.ts`

**Request:**
```typescript
GET /profile
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json
Body: (empty)
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

**Verification:**
- ✅ Endpoint path matches: `/profile`
- ✅ HTTP method: GET
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: Empty
- ✅ Response format: Standard ApiResponse<ProfileData>
- ✅ Cache: Tagged with "profile" for revalidation

---

### 2. PATCH /profile

**Frontend Action:** `updateProfile(data)`  
**File:** `features/profile/api/profile.actions.ts`

**Request:**
```typescript
PATCH /profile
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json

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

**Verification:**
- ✅ Endpoint path matches: `/profile`
- ✅ HTTP method: PATCH
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: ProfileData fields
- ✅ Response format: Standard ApiResponse<ProfileData>
- ✅ Cache invalidation: revalidateTag("profile", "max")

---

### 3. GET /sessions

**Frontend Action:** `getSessions()`  
**File:** `features/session/actions/get-sessions.ts`

**Request:**
```typescript
GET /sessions
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json
Body: (empty)
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    sessions: {
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
    }[];
  };
  error?: string;
}
```

**Verification:**
- ✅ Endpoint path matches: `/sessions`
- ✅ HTTP method: GET
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: Empty
- ✅ Response format: Standard ApiResponse with sessions array
- ✅ Cache: no-store (real-time data)

---

### 4. POST /sessions

**Frontend Action:** `createSession(dto)`  
**File:** `features/session/actions/create-session.ts`

**Request:**
```typescript
POST /sessions
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json

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

**Verification:**
- ✅ Endpoint path matches: `/sessions`
- ✅ HTTP method: POST
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: CreateSessionDto
- ✅ Response format: Standard ApiResponse with session object
- ✅ Cache: no-store (real-time data)

---

### 5. GET /sessions/{session_id}

**Frontend Action:** `getSession(sessionId)`  
**File:** `features/session/actions/get-session.ts`

**Request:**
```typescript
GET /sessions/{session_id}
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json
Body: (empty)
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
      scenario_id: string;
      user_role: string;
      ai_role: string;
      difficulty_level: string;
      status: "active" | "completed" | "paused";
      turns: Turn[];
      created_at: string;
      updated_at: string;
      completed_at?: string;
    };
  };
  error?: string;
}
```

**Verification:**
- ✅ Endpoint path matches: `/sessions/{session_id}`
- ✅ HTTP method: GET
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: Empty
- ✅ Path parameter: session_id
- ✅ Response format: Standard ApiResponse with session object
- ✅ Cache: no-store (real-time data)

---

### 6. POST /sessions/{session_id}/turns

**Frontend Action:** `submitTurn(sessionId, request)`  
**File:** `features/session/actions/submit-turn.ts`

**Request:**
```typescript
POST /sessions/{session_id}/turns
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json

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
    user_turn?: {
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
    };
    ai_turn?: {
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
    };
    analysis_keywords?: string[];
    error?: string;
  };
  error?: string;
}
```

**Verification:**
- ✅ Endpoint path matches: `/sessions/{session_id}/turns`
- ✅ HTTP method: POST
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: SubmitTurnRequest
- ✅ Path parameter: session_id
- ✅ Response format: Standard ApiResponse with SubmitTurnResponse
- ✅ Cache: no-store (real-time data)

---

### 7. POST /sessions/{session_id}/complete

**Frontend Action:** `endSession(sessionId)`  
**File:** `features/session/actions/end-session.ts`

**Request:**
```typescript
POST /sessions/{session_id}/complete
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json
Body: (empty)
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

**Verification:**
- ✅ Endpoint path matches: `/sessions/{session_id}/complete`
- ✅ HTTP method: POST
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: Empty
- ✅ Path parameter: session_id
- ✅ Response format: Standard ApiResponse
- ✅ Cache: no-store (real-time data)

---

### 8. GET /scenarios

**Frontend Action:** `getScenarios()`  
**File:** `features/session/actions/get-scenarios.ts`

**Request:**
```typescript
GET /scenarios
Headers:
  Content-Type: application/json
Body: (empty)
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    scenarios: {
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
    }[];
  };
  error?: string;
}
```

**Verification:**
- ✅ Endpoint path matches: `/scenarios`
- ✅ HTTP method: GET
- ✅ Authentication: NOT Required (Public endpoint)
- ✅ Request body: Empty
- ✅ Response format: Standard ApiResponse with scenarios array
- ✅ Cache: no-store (real-time data)
- ✅ Uses apiPublicFetch (no authentication)

---

### 9. POST /vocabulary/translate

**Frontend Action:** `translateWordAction(word, context?)`  
**File:** `features/session/actions/translate-word.ts`

**Request:**
```typescript
POST /vocabulary/translate
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json

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

**Verification:**
- ✅ Endpoint path matches: `/vocabulary/translate`
- ✅ HTTP method: POST
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: word and optional context
- ✅ Response format: Standard ApiResponse with TranslateWordApiResponse
- ✅ Cache: no-store (real-time data)
- ✅ Error handling: Graceful fallback with empty translation

---

### 10. POST /vocabulary/translate-sentence

**Frontend Action:** `translateSentenceAction(sentence)`  
**File:** `features/session/actions/translate-sentence.ts`

**Request:**
```typescript
POST /vocabulary/translate-sentence
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json

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

**Verification:**
- ✅ Endpoint path matches: `/vocabulary/translate-sentence`
- ✅ HTTP method: POST
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: sentence
- ✅ Response format: Standard ApiResponse with TranslateSentenceResult
- ✅ Cache: no-store (real-time data)
- ✅ Error handling: Graceful fallback with empty translation

---

### 11. GET /flashcards

**Frontend Action:** `fetchFlashcards(limit?, lastKey?)`  
**File:** `features/flashcards/actions/practice-actions-v2.ts`

**Request:**
```typescript
GET /flashcards?limit=20&last_key=<optional_key>
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json
Body: (empty)

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
    cards: {
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
    }[];
    next_key?: string;
  };
  error?: string;
}
```

**Verification:**
- ✅ Endpoint path matches: `/flashcards`
- ✅ HTTP method: GET
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: Empty
- ✅ Query parameters: limit, last_key
- ✅ Response format: Standard ApiResponse with cards array and pagination
- ✅ Cache: no-store (real-time data)
- ✅ Retry logic: 3 attempts with exponential backoff
- ✅ Validation: Zod schema for flashcards

---

### 12. GET /flashcards/due

**Frontend Action:** `fetchPracticeQueue()`  
**File:** `features/flashcards/actions/practice-actions-v2.ts`

**Request:**
```typescript
GET /flashcards/due
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json
Body: (empty)
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    cards: {
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
    }[];
  };
  error?: string;
}
```

**Verification:**
- ✅ Endpoint path matches: `/flashcards/due`
- ✅ HTTP method: GET
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: Empty
- ✅ Response format: Standard ApiResponse with cards array
- ✅ Cache: no-store (real-time data)
- ✅ Retry logic: 3 attempts with exponential backoff
- ✅ Validation: Zod schema for flashcards

---

### 13. GET /flashcards/{flashcard_id}

**Frontend Action:** `getFlashcard(flashcardId)`  
**File:** `features/flashcards/actions/practice-actions-v2.ts`

**Request:**
```typescript
GET /flashcards/{flashcard_id}
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json
Body: (empty)
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
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
  };
  error?: string;
}
```

**Verification:**
- ✅ Endpoint path matches: `/flashcards/{flashcard_id}`
- ✅ HTTP method: GET
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: Empty
- ✅ Path parameter: flashcard_id
- ✅ Response format: Standard ApiResponse with Flashcard object
- ✅ Cache: no-store (real-time data)
- ✅ Retry logic: 3 attempts with exponential backoff
- ✅ Validation: Zod schema for flashcard
- ✅ Error handling: Returns null on not found

---

### 14. POST /flashcards

**Frontend Action:** `saveFlashcardFromSession(input)`  
**File:** `features/flashcards/actions/practice-actions-v2.ts`

**Request:**
```typescript
POST /flashcards
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json

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

**Verification:**
- ✅ Endpoint path matches: `/flashcards`
- ✅ HTTP method: POST
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: CreateFlashcardInput
- ✅ Response format: Standard ApiResponse with flashcard_id and word
- ✅ Cache: no-store (real-time data)
- ✅ Cache invalidation: revalidatePath("/flashcards"), revalidatePath("/flashcards/review")
- ✅ Retry logic: 3 attempts with exponential backoff
- ✅ Validation: Zod schema for input
- ✅ Error handling: Handles duplicate error
- ✅ Text normalization: Normalizes input text

---

### 15. POST /flashcards/{flashcard_id}/review

**Frontend Action:** `updateFlashcardSRS(flashcardId, difficultyStr)`  
**File:** `features/flashcards/actions/practice-actions-v2.ts`

**Request:**
```typescript
POST /flashcards/{flashcard_id}/review
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json

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

**Verification:**
- ✅ Endpoint path matches: `/flashcards/{flashcard_id}/review`
- ✅ HTTP method: POST
- ✅ Authentication: Required (Cognito ID Token)
- ✅ Request body: rating (ReviewDifficulty)
- ✅ Path parameter: flashcard_id
- ✅ Response format: Standard ApiResponse with SRS data
- ✅ Cache: no-store (real-time data)
- ✅ Cache invalidation: revalidatePath("/flashcards/review")
- ✅ Retry logic: 3 attempts with exponential backoff
- ✅ Validation: Zod schema for rating

---

### 16. GET /admin/users

**Frontend Action:** `getAdminUsers()`  
**File:** `features/admin/actions/admin.actions.ts`

**Request:**
```typescript
GET /admin/users
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json
Body: (empty)
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    users: {
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
    }[];
    total_count: number;
  };
  error?: string;
}
```

**Verification:**
- ✅ Endpoint path matches: `/admin/users`
- ✅ HTTP method: GET
- ✅ Authentication: Required (Cognito ID Token + Admin Role)
- ✅ Request body: Empty
- ✅ Response format: Standard ApiResponse with users array and total_count
- ✅ Cache: no-store (real-time data)
- ✅ Error handling: Fallback to mock data on 403 Forbidden

---

### 17. PATCH /admin/users/{user_id}

**Frontend Action:** `upsertAdminUser(user)`  
**File:** `features/admin/actions/admin.actions.ts`

**Request:**
```typescript
PATCH /admin/users/{user_id}
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json

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
  data?: {
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
  };
  error?: string;
}
```

**Verification:**
- ✅ Endpoint path matches: `/admin/users/{user_id}`
- ✅ HTTP method: PATCH
- ✅ Authentication: Required (Cognito ID Token + Admin Role)
- ✅ Request body: User fields
- ✅ Path parameter: user_id
- ✅ Response format: Standard ApiResponse with AdminUser object
- ✅ Cache invalidation: revalidatePath("/admin"), revalidatePath("/admin/users")

---

### 18. GET /admin/scenarios

**Frontend Action:** `getAdminScenarios()`  
**File:** `features/admin/actions/admin.actions.ts`

**Request:**
```typescript
GET /admin/scenarios
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json
Body: (empty)
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  data?: {
    scenarios: {
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
    }[];
    total_count: number;
  };
  error?: string;
}
```

**Verification:**
- ✅ Endpoint path matches: `/admin/scenarios`
- ✅ HTTP method: GET
- ✅ Authentication: Required (Cognito ID Token + Admin Role)
- ✅ Request body: Empty
- ✅ Response format: Standard ApiResponse with scenarios array and total_count
- ✅ Cache: no-store (real-time data)
- ✅ Error handling: Fallback to public scenarios on 403 Forbidden

---

### 19. POST /admin/scenarios

**Frontend Action:** `upsertAdminScenario(scenario)` (Create)  
**File:** `features/admin/actions/admin.actions.ts`

**Request:**
```typescript
POST /admin/scenarios
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json

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
  data?: {
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
  };
  error?: string;
}
```

**Verification:**
- ✅ Endpoint path matches: `/admin/scenarios`
- ✅ HTTP method: POST
- ✅ Authentication: Required (Cognito ID Token + Admin Role)
- ✅ Request body: Scenario fields
- ✅ Response format: Standard ApiResponse with AdminScenario object
- ✅ Cache invalidation: revalidatePath("/admin"), revalidatePath("/admin/scenarios")

---

### 20. PATCH /admin/scenarios/{scenario_id}

**Frontend Action:** `upsertAdminScenario(scenario)` (Update)  
**File:** `features/admin/actions/admin.actions.ts`

**Request:**
```typescript
PATCH /admin/scenarios/{scenario_id}
Headers:
  Authorization: <cognito_id_token>
  Content-Type: application/json

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
  data?: {
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
  };
  error?: string;
}
```

**Verification:**
- ✅ Endpoint path matches: `/admin/scenarios/{scenario_id}`
- ✅ HTTP method: PATCH
- ✅ Authentication: Required (Cognito ID Token + Admin Role)
- ✅ Request body: Scenario fields (all optional)
- ✅ Path parameter: scenario_id
- ✅ Response format: Standard ApiResponse with AdminScenario object
- ✅ Cache invalidation: revalidatePath("/admin"), revalidatePath("/admin/scenarios")

---

## ✅ Overall Verification Summary

### Request/Response Alignment

| Aspect | Status | Notes |
|--------|--------|-------|
| Endpoint Paths | ✅ | All 20 paths match AWS API Gateway |
| HTTP Methods | ✅ | GET, POST, PATCH used correctly |
| Authentication | ✅ | Cognito ID Token in Authorization header |
| Request Bodies | ✅ | All required fields included |
| Query Parameters | ✅ | Pagination parameters for flashcards |
| Path Parameters | ✅ | session_id, flashcard_id, user_id, scenario_id |
| Response Format | ✅ | Standard ApiResponse<T> structure |
| Error Handling | ✅ | Graceful fallbacks and user-friendly messages |
| Cache Strategy | ✅ | Proper use of no-store and cache tags |
| Retry Logic | ✅ | Flashcard actions use 3-attempt retry |
| Validation | ✅ | Zod schemas for input validation |

### Key Findings

1. **Consistency:** All 20 actions follow the same pattern
2. **Type Safety:** Strong TypeScript types throughout
3. **Error Handling:** Comprehensive error handling with fallbacks
4. **Caching:** Proper cache strategy with invalidation
5. **Validation:** Input validation with Zod schemas
6. **Retry Logic:** Automatic retry for flashcard operations
7. **Admin Fallback:** Graceful degradation for non-admin users

### No Issues Found

All 20 API actions are correctly implemented and aligned with the API Gateway specification.

---

## 📝 Recommendations

1. **Documentation:** Keep this verification report updated when adding new endpoints
2. **Testing:** Consider adding integration tests for each action
3. **Monitoring:** Add metrics for API call success/failure rates
4. **Rate Limiting:** Consider implementing client-side rate limiting
5. **Caching:** Consider adding cache tags for admin endpoints

