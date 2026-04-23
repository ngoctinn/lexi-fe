# Frontend API Audit Report — Lexi FE

**Date:** April 23, 2026  
**Status:** ⚠️ **CRITICAL** — Mock data & auth still active, needs migration to real API  
**Backend API Reference:** `/lexi-be/docs/API_REFERENCE.md`

---

## Executive Summary

Frontend currently uses **mock data and mock authentication** for development. The API client infrastructure is in place (`lib/api/client.ts`), but multiple features still fall back to mock implementations when:

1. **Mock auth cookie is set** (`lexi_mock_auth=admin`)
2. **Environment variable** `NEXT_PUBLIC_USE_SESSION_MOCK=true`
3. **Development mode** with fallback to mock on API errors

**Action Required:** Remove mock data, enable real API calls, and verify all endpoints match API_REFERENCE.md.

---

## 1. Mock Data Locations

### 1.1 Session Mock Data
**File:** `lexi-fe/features/session/api/session-mock.ts`

**Mock Data:**
- 14 hardcoded scenarios (s1–s8)
- 8 mock sessions with pre-generated turns and scoring
- Mock translation, hints, and scoring logic

**Usage:**
```typescript
// features/session/actions/get-sessions.ts
if (await isMockAuthSession()) {
  return mockSessionApi.getSessions();  // ← Returns mock data
}
```

**Endpoints Affected:**
- `GET /scenarios` → Returns mock scenarios
- `GET /sessions` → Returns mock sessions
- `GET /sessions/{session_id}` → Returns mock session
- `POST /sessions` → Creates mock session
- `POST /sessions/{session_id}/complete` → Completes mock session

---

### 1.2 Flashcard Mock Data
**File:** `lexi-fe/features/flashcards/actions/practice-actions.ts`

**Mock Data:**
- 4 hardcoded flashcards (resilient, ephemeral, ubiquitous, pragmatic)
- Mock SRS (Spaced Repetition System) logic

**Usage:**
```typescript
// practice-actions.ts
let mockFlashcards: Flashcard[] = [
  { flashcard_id: "01HGWY0Z57N3F0H19ZK2B7V2M1", word: "resilient", ... },
  // ... 3 more
];

export async function fetchPracticeQueue(): Promise<Flashcard[]> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [...mockFlashcards];
}
```

**Endpoints Affected:**
- `GET /flashcards` → Should return real flashcards
- `GET /flashcards/due` → Should return due flashcards
- `POST /flashcards/{flashcard_id}/review` → Should update SRS

---

### 1.3 Profile Mock Data
**File:** `lexi-fe/features/profile/api/profile.actions.ts`

**Mock Data:**
```typescript
const MOCK_ADMIN_PROFILE = {
  display_name: "Lexi Admin",
  email: "admin@lexi.app",
  current_level: "B2",
  target_level: "C1",
  avatar_url: "https://api.dicebear.com/9.x/lorelei/svg?seed=LexiAdmin",
  is_new_user: false,
};
```

**Usage:**
```typescript
if (await isMockAuthSession()) {
  return { ...mockProfile };  // ← Returns mock profile
}
```

**Endpoints Affected:**
- `GET /profile` → Returns mock profile
- `PATCH /profile` → Updates mock profile

---

### 1.4 Mock Authentication
**File:** `lexi-fe/features/auth/mock-auth.ts`

**Mock Credentials:**
```typescript
export const MOCK_ADMIN_LOGIN = {
  email: "admin@lexi.app",
  password: "admin1234",
};
```

**Cookie-based Auth:**
- Cookie name: `lexi_mock_auth`
- Cookie value: `admin`
- Enabled in: development mode only

**Usage:**
```typescript
// features/session/api/session-auth.ts
export async function isMockAuthSession() {
  const cookieStore = await cookies();
  return cookieStore.get(MOCK_AUTH_COOKIE_NAME)?.value === MOCK_AUTH_COOKIE_VALUE;
}
```

---

## 2. API Client Infrastructure (✅ Ready)

### 2.1 API Client Setup
**File:** `lexi-fe/lib/api/client.ts`

**Status:** ✅ Properly configured

**Features:**
- ✅ Automatic JWT token injection from Cognito
- ✅ Error handling with detailed logging
- ✅ Support for authenticated (`apiRequest`) and public (`apiRequestPublic`) calls
- ✅ Base URL from `NEXT_PUBLIC_API_URL`

**Configuration:**
```typescript
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// = "https://htv5bybfsc.execute-api.ap-southeast-1.amazonaws.com/Prod/"

// Automatically adds:
// - Content-Type: application/json
// - Authorization: Bearer <id_token>
```

---

### 2.2 Environment Variables
**File:** `lexi-fe/.env.local`

**Status:** ✅ Properly configured

```env
NEXT_PUBLIC_API_URL=https://htv5bybfsc.execute-api.ap-southeast-1.amazonaws.com/Prod/
NEXT_PUBLIC_COGNITO_USER_POOL_ID=ap-southeast-1_SGJAgKdrq
NEXT_PUBLIC_COGNITO_CLIENT_ID=1b87am8h2lh4atll7cbqc22ago
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_WS_URL=wss://pevnb57tdd.execute-api.ap-southeast-1.amazonaws.com/Prod
```

---

## 3. API Endpoints Audit

### 3.1 Auth Endpoints
| Endpoint | Status | Notes |
|----------|--------|-------|
| Cognito signUp | ✅ | Handled by AWS Amplify |
| Cognito confirmSignUp | ✅ | Handled by AWS Amplify |
| Cognito initiateAuth | ✅ | Handled by AWS Amplify |

---

### 3.2 Onboarding Endpoints
| Endpoint | Status | Implementation | Notes |
|----------|--------|-----------------|-------|
| `POST /onboarding/complete` | ⚠️ | `features/onboarding/` | Not found in audit — needs verification |

---

### 3.3 Profile Endpoints
| Endpoint | Status | Implementation | Mock? |
|----------|--------|-----------------|-------|
| `GET /profile` | ⚠️ | `features/profile/api/profile.actions.ts` | ✅ Yes (isMockAuthSession) |
| `PATCH /profile` | ⚠️ | `features/profile/api/profile.actions.ts` | ✅ Yes (isMockAuthSession) |

---

### 3.4 Scenarios Endpoints
| Endpoint | Status | Implementation | Mock? |
|----------|--------|-----------------|-------|
| `GET /scenarios` | ⚠️ | `features/session/actions/get-scenarios.ts` | ✅ Yes (isMockAuthSession) |

---

### 3.5 Sessions Endpoints
| Endpoint | Status | Implementation | Mock? |
|----------|--------|-----------------|-------|
| `GET /sessions` | ⚠️ | `features/session/actions/get-sessions.ts` | ✅ Yes (isMockAuthSession) |
| `GET /sessions/{session_id}` | ⚠️ | `features/session/actions/get-session.ts` | ✅ Yes (isMockAuthSession) |
| `POST /sessions` | ⚠️ | `features/session/actions/create-session.ts` | ✅ Yes (isMockAuthSession) |
| `POST /sessions/{session_id}/turns` | ⚠️ | Not found — needs implementation | ❓ |
| `POST /sessions/{session_id}/complete` | ⚠️ | `features/session/actions/end-session.ts` | ✅ Yes (isMockAuthSession) |

---

### 3.6 Vocabulary Endpoints
| Endpoint | Status | Implementation | Notes |
|----------|--------|-----------------|-------|
| `POST /vocabulary/translate` | ⚠️ | `features/session/actions/translate-word.ts` | Uses AWS Translate (real API) |
| `POST /vocabulary/translate-sentence` | ⚠️ | `features/session/actions/translate-sentence.ts` | Uses AWS Translate (real API) |

---

### 3.7 Flashcards Endpoints
| Endpoint | Status | Implementation | Mock? |
|----------|--------|-----------------|-------|
| `POST /flashcards` | ⚠️ | `features/flashcards/actions/practice-actions.ts` | ✅ Partially (calls real API but has mock fallback) |
| `GET /flashcards` | ⚠️ | Not found — needs implementation | ❓ |
| `GET /flashcards/due` | ⚠️ | Not found — needs implementation | ❓ |
| `GET /flashcards/{flashcard_id}` | ⚠️ | Not found — needs implementation | ❓ |
| `POST /flashcards/{flashcard_id}/review` | ⚠️ | `features/flashcards/actions/practice-actions.ts` | ✅ Yes (mock only) |

---

### 3.8 Admin Endpoints
| Endpoint | Status | Implementation | Notes |
|----------|--------|-----------------|-------|
| `GET /admin/users` | ❌ | Not found | Needs implementation |
| `PATCH /admin/users/{user_id}` | ❌ | Not found | Needs implementation |
| `GET /admin/scenarios` | ❌ | Not found | Needs implementation |
| `POST /admin/scenarios` | ❌ | Not found | Needs implementation |
| `PATCH /admin/scenarios/{scenario_id}` | ❌ | Not found | Needs implementation |

---

## 4. Migration Checklist

### Phase 1: Remove Mock Authentication
- [ ] Remove `MOCK_AUTH_COOKIE_NAME` and `MOCK_AUTH_COOKIE_VALUE` checks
- [ ] Remove `isMockAuthSession()` function
- [ ] Remove `signInMockSession()` and `clearMockAuthSession()` actions
- [ ] Remove mock-auth.ts file
- [ ] Update auth flow to use Cognito only

### Phase 2: Remove Mock Session Data
- [ ] Remove `session-mock.ts` file
- [ ] Update `get-sessions.ts` to always call real API
- [ ] Update `get-session.ts` to always call real API
- [ ] Update `create-session.ts` to always call real API
- [ ] Update `end-session.ts` to always call real API
- [ ] Implement `POST /sessions/{session_id}/turns` endpoint

### Phase 3: Remove Mock Flashcard Data
- [ ] Remove mock flashcards array from `practice-actions.ts`
- [ ] Update `fetchPracticeQueue()` to call real API
- [ ] Implement `GET /flashcards` endpoint
- [ ] Implement `GET /flashcards/due` endpoint
- [ ] Update `updateFlashcardSRS()` to call real API

### Phase 4: Remove Mock Profile Data
- [ ] Remove `MOCK_ADMIN_PROFILE` from mock-auth.ts
- [ ] Update `getProfile()` to always call real API
- [ ] Update `updateProfile()` to always call real API

### Phase 5: Implement Missing Endpoints
- [ ] `POST /onboarding/complete`
- [ ] `GET /flashcards`
- [ ] `GET /flashcards/due`
- [ ] `GET /flashcards/{flashcard_id}`
- [ ] `POST /sessions/{session_id}/turns`
- [ ] Admin endpoints (if needed for frontend)

### Phase 6: Testing & Verification
- [ ] Test all session flows with real API
- [ ] Test all flashcard flows with real API
- [ ] Test profile update with real API
- [ ] Verify error handling for API failures
- [ ] Test with real Cognito authentication

---

## 5. Code Locations Summary

| Feature | Files | Status |
|---------|-------|--------|
| **Session** | `features/session/actions/*.ts` | ⚠️ Mock-dependent |
| **Flashcards** | `features/flashcards/actions/practice-actions.ts` | ⚠️ Mock-dependent |
| **Profile** | `features/profile/api/profile.actions.ts` | ⚠️ Mock-dependent |
| **Auth** | `features/auth/mock-auth.ts` | ⚠️ Mock-dependent |
| **API Client** | `lib/api/client.ts` | ✅ Ready |
| **Env Config** | `.env.local` | ✅ Ready |

---

## 6. Recommendations

### Immediate Actions (High Priority)
1. **Remove mock authentication** — Switch to Cognito-only auth
2. **Remove mock session data** — Use real API for all session operations
3. **Remove mock flashcard data** — Use real API for all flashcard operations
4. **Implement missing endpoints** — Add handlers for POST /sessions/{id}/turns

### Medium Priority
1. **Add error boundaries** — Handle API failures gracefully
2. **Add loading states** — Show spinners during API calls
3. **Add retry logic** — Retry failed API calls with exponential backoff
4. **Add request logging** — Log all API calls for debugging

### Low Priority
1. **Implement admin endpoints** — If admin panel is needed
2. **Add caching strategy** — Cache frequently accessed data
3. **Add offline support** — Cache data for offline access

---

## 7. API Reference Compliance

**Backend API Base URL:** `https://htv5bybfsc.execute-api.ap-southeast-1.amazonaws.com/Prod/`

**Cognito Config:**
- User Pool ID: `ap-southeast-1_SGJAgKdrq`
- Client ID: `1b87am8h2lh4atll7cbqc22ago`
- Region: `ap-southeast-1`

**Auth Header Format:**
```
Authorization: Bearer <id_token>
Content-Type: application/json
```

**Error Response Format:**
```json
{
  "error": "Error message"
}
```

---

## 8. Next Steps

1. **Review this audit** with the team
2. **Prioritize endpoints** to migrate first
3. **Create implementation tasks** for each endpoint
4. **Set up testing** for real API calls
5. **Deploy to staging** for integration testing
6. **Monitor API errors** in production

---

**Generated:** April 23, 2026  
**Auditor:** Kiro AI  
**Status:** Ready for migration planning
