# Implementation Plan: Migrate Mock to Real API

## Overview

This implementation plan breaks down the migration from mock data and mock authentication to real API calls into 6 phases. Each phase removes mock implementations and replaces them with real API calls, ensuring all data flows through the backend. The migration maintains user experience through proper error handling and loading states.

**Implementation Language:** TypeScript

---

## Tasks

### Phase 1: Remove Mock Authentication

- [x] 1.1 Delete mock-auth.ts file
  - Remove `features/auth/mock-auth.ts` entirely
  - Verify no other files import from this module
  - _Requirements: 1.1, 1.6_

- [x] 1.2 Remove isMockAuthSession() function calls
  - Search codebase for all `isMockAuthSession()` calls
  - Remove conditional branches that check for mock auth
  - Keep only the real API call path
  - _Requirements: 1.7_

- [x] 1.3 Remove signInMockSession() and clearMockAuthSession() actions
  - Remove all `signInMockSession()` function calls
  - Remove all `clearMockAuthSession()` function calls
  - Verify sign-in flow uses Cognito only
  - _Requirements: 1.8_

- [ ]* 1.4 Write unit tests for Cognito sign-in
  - Test that sign-in calls Cognito `initiateAuth` API
  - Test that JWT tokens are stored after successful sign-in
  - Test that sign-out clears all tokens
  - _Requirements: 1.2, 1.3, 1.5_

- [ ]* 1.5 Write property test for JWT token injection
  - **Property 1: JWT Token Injection**
  - **Validates: Requirements 1.4, 9.2**
  - For all authenticated API requests, verify Authorization header contains valid Cognito JWT token in format `Bearer <id_token>`
  - _Requirements: 9.1_

- [x] 1.6 Checkpoint - Verify Cognito integration works
  - Ensure sign-in flow works without mock auth
  - Ensure JWT tokens are injected in API requests
  - Ask the user if questions arise.

---

### Phase 2: Remove Mock Session Data

- [-] 2.1 Delete session-mock.ts file
  - Remove `features/session/api/session-mock.ts` entirely
  - Verify no other files import from this module
  - _Requirements: 2.6_

- [ ] 2.2 Update get-sessions.ts to use real API only
  - Remove `isMockAuthSession()` conditional check
  - Remove mock data fallback
  - Keep only `apiRequest('/sessions')` call
  - Add error handling with user-friendly message
  - _Requirements: 2.1, 2.8_

- [ ] 2.3 Update get-session.ts to use real API only
  - Remove `isMockAuthSession()` conditional check
  - Remove mock data fallback
  - Keep only `apiRequest('/sessions/{sessionId}')` call
  - Add error handling with user-friendly message
  - _Requirements: 2.2, 2.8_

- [ ] 2.4 Update create-session.ts to use real API only
  - Remove `isMockAuthSession()` conditional check
  - Remove mock data fallback
  - Keep only `apiRequest('/sessions', { method: 'POST', body: ... })` call
  - Ensure request body includes scenario_id and learner_role_id
  - Add error handling with user-friendly message
  - _Requirements: 2.3, 2.8_

- [ ] 2.5 Update end-session.ts to use real API only
  - Remove `isMockAuthSession()` conditional check
  - Remove mock data fallback
  - Keep only `apiRequest('/sessions/{sessionId}/complete', { method: 'POST' })` call
  - Add error handling with user-friendly message
  - _Requirements: 2.5, 2.8_

- [ ] 2.6 Implement submit-turn.ts (NEW - POST /sessions/{id}/turns)
  - Create new file `features/session/actions/submit-turn.ts`
  - Implement function that calls `POST /sessions/{sessionId}/turns`
  - Request body: { text, is_hint_used, audio_url (optional) }
  - Response: { user_turn, ai_turn, analysis_keywords }
  - Add error handling with user-friendly message
  - _Requirements: 2.4, 5.1_

- [ ]* 2.7 Write unit tests for session actions
  - Test `getSessions()` calls `GET /sessions` with correct headers
  - Test `getSession()` calls `GET /sessions/{id}` with correct headers
  - Test `createSession()` calls `POST /sessions` with correct body
  - Test `submitTurn()` calls `POST /sessions/{id}/turns` with correct body
  - Test `endSession()` calls `POST /sessions/{id}/complete`
  - Test error handling: 401 triggers redirect, 5xx shows error message
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ]* 2.8 Write property test for session response schema
  - **Property 2: Session Response Schema Compliance**
  - **Validates: Requirements 12.1**
  - For all session responses, verify required fields present: session_id, status, turns, scoring (when completed)
  - Verify field types match schema (string, array, object)
  - Verify nested Turn objects have required fields
  - _Requirements: 12.1_

- [ ] 2.9 Checkpoint - Verify session flow works end-to-end
  - Create session → Submit turn → Complete session
  - Verify scoring is saved to backend
  - Verify no mock data is used
  - Ask the user if questions arise.

---

### Phase 3: Remove Mock Flashcard Data

- [ ] 3.1 Remove mock flashcards array from practice-actions.ts
  - Search for hardcoded mock flashcards array
  - Remove entire array definition
  - Verify no other code references the mock array
  - _Requirements: 3.6, 11.3_

- [ ] 3.2 Implement fetchFlashcards() (GET /flashcards)
  - Create function that calls `GET /flashcards` with pagination params
  - Support limit and lastKey parameters
  - Response: { cards: Flashcard[], nextKey?: string }
  - Add error handling with user-friendly message
  - _Requirements: 3.1_

- [ ] 3.3 Implement fetchPracticeQueue() (GET /flashcards/due)
  - Create function that calls `GET /flashcards/due`
  - Returns flashcards scheduled for today
  - Response: { cards: Flashcard[] }
  - Add error handling with user-friendly message
  - _Requirements: 3.2, 6.1_

- [ ] 3.4 Implement getFlashcard() (GET /flashcards/{id})
  - Create function that calls `GET /flashcards/{flashcardId}`
  - Returns full flashcard details
  - Response: Flashcard object with all fields
  - Add error handling with user-friendly message
  - _Requirements: 3.3, 6.2_

- [ ] 3.5 Update updateFlashcardSRS() to use real API
  - Update existing function to call `POST /flashcards/{flashcardId}/review`
  - Request body: { rating: 'forgot' | 'hard' | 'good' | 'easy' }
  - Response: { interval_days, review_count, next_review_at }
  - Add error handling with user-friendly message
  - _Requirements: 3.5_

- [ ]* 3.6 Write unit tests for flashcard actions
  - Test `fetchFlashcards()` calls `GET /flashcards` with pagination
  - Test `fetchPracticeQueue()` calls `GET /flashcards/due`
  - Test `getFlashcard()` calls `GET /flashcards/{id}`
  - Test `updateFlashcardSRS()` calls `POST /flashcards/{id}/review` with rating
  - Test error handling: 404 shows "not found" message
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 3.7 Write property test for flashcard response schema
  - **Property 3: Flashcard Response Schema Compliance**
  - **Validates: Requirements 12.2**
  - For all flashcard responses, verify required fields present: flashcard_id, word, translation_vi, definition_vi, phonetic, audio_url, example_sentence, review_count, interval_days, difficulty, next_review_at, last_reviewed_at
  - Verify field types match schema
  - Verify date fields are valid ISO 8601 timestamps
  - _Requirements: 12.2_

- [ ]* 3.8 Write property test for SRS consistency
  - **Property 6: Flashcard SRS Consistency**
  - **Validates: Requirements 3.5**
  - For all flashcard reviews, verify SRS scheduling (interval_days, next_review_at) is calculated by backend
  - Review flashcard with different ratings, verify backend-calculated values are returned
  - _Requirements: 3.5_

- [ ] 3.9 Checkpoint - Verify flashcard flow works end-to-end
  - Fetch due flashcards → Review flashcard → Verify SRS updated
  - Verify no mock data is used
  - Ask the user if questions arise.

---

### Phase 4: Remove Mock Profile Data

- [ ] 4.1 Remove MOCK_ADMIN_PROFILE from codebase
  - Search for `MOCK_ADMIN_PROFILE` constant
  - Remove entire constant definition
  - Verify no other code references the mock profile
  - _Requirements: 4.3, 11.4_

- [ ] 4.2 Update getProfile() to use real API only
  - Remove `isMockAuthSession()` conditional check
  - Remove mock data fallback
  - Keep only `apiRequest('/profile')` call
  - Add error handling with user-friendly message
  - _Requirements: 4.1_

- [ ] 4.3 Update updateProfile() to use real API only
  - Remove `isMockAuthSession()` conditional check
  - Remove mock data fallback
  - Keep only `apiRequest('/profile', { method: 'PATCH', body: ... })` call
  - Add error handling with user-friendly message
  - _Requirements: 4.2_

- [ ]* 4.4 Write unit tests for profile actions
  - Test `getProfile()` calls `GET /profile`
  - Test `updateProfile()` calls `PATCH /profile` with updates
  - Test error handling: 403 shows "permission denied" message
  - _Requirements: 4.1, 4.2_

- [ ]* 4.5 Write property test for profile response schema
  - **Property 4: Profile Response Schema Compliance**
  - **Validates: Requirements 12.3**
  - For all profile responses, verify required fields present: user_id, email, display_name, avatar_url, current_level, target_level, current_streak, total_words_learned, role, is_active, is_new_user
  - Verify field types match schema
  - Verify enum fields (level, role) have valid values
  - _Requirements: 12.3_

- [ ]* 4.6 Write property test for profile update round-trip
  - **Property 8: Round-Trip Consistency (Profile Update)**
  - **Validates: Requirements 10.4**
  - For all profile updates, updating a field and fetching profile SHALL return updated value
  - Update display_name, fetch profile, verify value matches
  - Update current_level, fetch profile, verify value matches
  - _Requirements: 10.4_

- [ ] 4.7 Checkpoint - Verify profile flow works end-to-end
  - Fetch profile → Update profile → Verify changes persisted
  - Verify no mock data is used
  - Ask the user if questions arise.

---

### Phase 5: Add Error Handling & Loading States

- [ ] 5.1 Add error handling to session actions
  - Wrap all session API calls in try-catch blocks
  - Map error codes to user-friendly messages (400, 401, 403, 404, 5xx, timeout)
  - Log error details (status, message, timestamp, userId) for debugging
  - Return error state for UI to display
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 5.2 Add error handling to flashcard actions
  - Wrap all flashcard API calls in try-catch blocks
  - Map error codes to user-friendly messages
  - Log error details for debugging
  - Return error state for UI to display
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 5.3 Add error handling to profile actions
  - Wrap all profile API calls in try-catch blocks
  - Map error codes to user-friendly messages
  - Log error details for debugging
  - Return error state for UI to display
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 5.4 Add loading states to session components
  - Add loading spinner during `getSessions()` call
  - Add loading spinner during `createSession()` call
  - Add loading spinner during `submitTurn()` call
  - Add loading spinner during `endSession()` call
  - Disable submit button during submission
  - Hide loading spinner when response arrives or error occurs
  - _Requirements: 8.1, 8.6, 8.7_

- [ ] 5.5 Add loading states to flashcard components
  - Add loading spinner during `fetchFlashcards()` call
  - Add loading spinner during `fetchPracticeQueue()` call
  - Add loading spinner during `getFlashcard()` call
  - Add loading spinner during `updateFlashcardSRS()` call
  - Hide loading spinner when response arrives or error occurs
  - _Requirements: 8.2, 8.5, 8.6, 8.7_

- [ ] 5.6 Add loading states to profile components
  - Add loading spinner during `getProfile()` call
  - Add loading spinner during `updateProfile()` call
  - Hide loading spinner when response arrives or error occurs
  - _Requirements: 8.3, 8.6, 8.7_

- [ ] 5.7 Add retry buttons to error messages
  - Display error message with retry button
  - Retry button re-triggers the failed API call
  - Retry button is disabled during retry attempt
  - _Requirements: 7.6_

- [ ]* 5.8 Write unit tests for error handling
  - Test 4xx errors display user-friendly messages
  - Test 5xx errors display user-friendly messages
  - Test timeout errors display user-friendly messages
  - Test error details are logged for debugging
  - Test retry button re-triggers API call
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [ ]* 5.9 Write property test for error handling completeness
  - **Property 5: Error Handling Completeness**
  - **Validates: Requirements 7.1, 7.2, 7.3**
  - For all API errors (4xx, 5xx, timeout), verify System displays user-friendly error message (not silently fail)
  - Simulate various error codes, verify appropriate messages displayed
  - _Requirements: 7.1, 7.2, 7.3_

- [ ]* 5.10 Write property test for loading state visibility
  - **Property 7: Loading State Visibility**
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.6, 8.7**
  - For all async operations, verify loading indicator is visible during request and hidden when request completes
  - Fetch sessions, verify loading spinner visible then hidden
  - Fetch flashcards, verify loading spinner visible then hidden
  - _Requirements: 8.1, 8.2, 8.3, 8.6, 8.7_

- [ ] 5.11 Checkpoint - Verify error handling and loading states work
  - Simulate API errors and verify error messages display
  - Verify loading spinners appear and disappear correctly
  - Verify retry buttons work
  - Ask the user if questions arise.

---

### Phase 6: Testing & Verification

- [ ]* 6.1 Run unit tests for all API calls
  - Run tests for session actions (getSessions, getSession, createSession, submitTurn, endSession)
  - Run tests for flashcard actions (fetchFlashcards, fetchPracticeQueue, getFlashcard, updateFlashcardSRS)
  - Run tests for profile actions (getProfile, updateProfile)
  - Verify all tests pass
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2_

- [ ]* 6.2 Run integration tests for end-to-end flows
  - Test session flow: Create session → Submit turn → Complete session → Verify scoring saved
  - Test flashcard flow: Fetch due flashcards → Review flashcard → Verify SRS updated
  - Test profile flow: Fetch profile → Update profile → Verify changes persisted
  - Verify all tests pass
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 6.3 Run property-based tests for schema validation
  - Run Property 1: JWT Token Injection (100+ iterations)
  - Run Property 2: Session Response Schema Compliance (100+ iterations)
  - Run Property 3: Flashcard Response Schema Compliance (100+ iterations)
  - Run Property 4: Profile Response Schema Compliance (100+ iterations)
  - Run Property 5: Error Handling Completeness (100+ iterations)
  - Run Property 6: Flashcard SRS Consistency (100+ iterations)
  - Run Property 7: Loading State Visibility (100+ iterations)
  - Run Property 8: Round-Trip Consistency (Profile Update) (100+ iterations)
  - Verify all properties pass
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ] 6.4 Verify no mock references remain in codebase
  - Search for "mock" in codebase (case-insensitive)
  - Verify zero results for mock auth, mock sessions, mock flashcards, mock profiles
  - Verify all mock files are deleted
  - Verify all mock function calls are removed
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8_

- [ ] 6.5 Manual testing on staging environment
  - Sign in with Cognito credentials
  - Create a session and submit turns
  - Review flashcards and verify SRS updates
  - Update profile and verify changes persist
  - Test error scenarios (disconnect network, simulate API errors)
  - Verify loading states and error messages display correctly
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2_

- [ ] 6.6 Code review and cleanup
  - Review all changes for code quality and consistency
  - Verify no console.log statements left in production code
  - Verify error logging is comprehensive
  - Verify TypeScript types are correct
  - Verify no unused imports or variables
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2_

- [ ] 6.7 Final checkpoint - Ensure all tests pass
  - Ensure all unit tests pass
  - Ensure all integration tests pass
  - Ensure all property-based tests pass
  - Ensure no mock references remain
  - Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP, but are strongly recommended for quality assurance
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and early error detection
- Property tests validate universal correctness properties across many inputs
- Unit tests validate specific examples and edge cases
- All error handling must be user-friendly and not silently fail
- Loading states improve perceived performance and user confidence
- The backend (Real_API) is the source of truth for all data

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
