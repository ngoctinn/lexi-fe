# Requirements Document: Migrate Mock to Real API

## Introduction

The Lexi Frontend currently uses mock data and mock authentication for development. This feature involves a complete migration from mock implementations to real API calls, ensuring all frontend features use the actual backend endpoints defined in the API Reference. The migration maintains user experience, adds proper error handling, and integrates Cognito authentication throughout the application.

---

## Glossary

- **System**: The Lexi Frontend application
- **Mock_Auth**: Cookie-based authentication using `lexi_mock_auth=admin` for development
- **Real_Auth**: AWS Cognito-based authentication using JWT tokens
- **Mock_Data**: Hardcoded data in frontend files (sessions, flashcards, profiles, scenarios)
- **Real_API**: Backend REST endpoints at `https://htv5bybfsc.execute-api.ap-southeast-1.amazonaws.com/Prod/`
- **API_Client**: The HTTP client in `lib/api/client.ts` that handles JWT injection and error handling
- **Session**: A speaking practice session with AI role-play
- **Flashcard**: A vocabulary learning card with SRS (Spaced Repetition System) scheduling
- **Profile**: User account information including display name, level, and avatar
- **Scenario**: A speaking practice scenario template with roles and goals
- **Turn**: A single exchange in a session (user speaks, AI responds)
- **Cognito**: AWS authentication service managing user sign-up, sign-in, and JWT tokens
- **JWT_Token**: JSON Web Token from Cognito containing user identity and claims
- **Error_Handling**: Graceful response to API failures with user-friendly messages
- **Loading_State**: Visual indicator (spinner, skeleton) shown during async API operations

---

## Requirements

### Requirement 1: Remove Mock Authentication

**User Story:** As a developer, I want to remove mock authentication, so that the application uses only Cognito for user identity management.

#### Acceptance Criteria

1. WHEN the application starts, THE System SHALL NOT check for `lexi_mock_auth` cookie
2. WHEN a user attempts to sign in, THE System SHALL use Cognito `initiateAuth` API (not mock credentials)
3. WHEN a user is authenticated, THE System SHALL store Cognito JWT tokens (not mock cookies)
4. WHEN the API_Client makes a request, THE System SHALL inject the Cognito JWT token in the `Authorization: Bearer <id_token>` header
5. WHEN a user signs out, THE System SHALL clear Cognito tokens (not mock cookies)
6. THE System SHALL remove the `features/auth/mock-auth.ts` file entirely
7. THE System SHALL remove all `isMockAuthSession()` function calls from the codebase
8. THE System SHALL remove `signInMockSession()` and `clearMockAuthSession()` actions

#### Correctness Properties

- FOR ALL authenticated API requests, the Authorization header SHALL contain a valid Cognito JWT token
- FOR ALL sign-out operations, no authentication tokens SHALL remain in storage
- FOR ALL sign-in flows, Cognito SHALL be the only authentication mechanism

---

### Requirement 2: Remove Mock Session Data

**User Story:** As a user, I want to practice speaking with real scenarios and sessions, so that my progress is saved and shared across devices.

#### Acceptance Criteria

1. WHEN the user requests a list of sessions, THE System SHALL call `GET /sessions` (not return mock data)
2. WHEN the user requests a specific session, THE System SHALL call `GET /sessions/{session_id}` (not return mock data)
3. WHEN the user creates a new session, THE System SHALL call `POST /sessions` with scenario_id and learner_role_id
4. WHEN the user submits a turn in a session, THE System SHALL call `POST /sessions/{session_id}/turns` with text and is_hint_used
5. WHEN the user completes a session, THE System SHALL call `POST /sessions/{session_id}/complete` and receive scoring
6. THE System SHALL remove the `features/session/api/session-mock.ts` file entirely
7. THE System SHALL remove all hardcoded mock session data from `features/session/actions/*.ts`
8. WHEN an API error occurs during session operations, THE System SHALL display an error message to the user (not silently fall back to mock data)

#### Correctness Properties

- FOR ALL session operations, the response SHALL match the schema defined in API_REFERENCE.md
- FOR ALL session data, the source SHALL be the Real_API (never mock data)
- FOR ALL session state changes, the backend SHALL be the source of truth

---

### Requirement 3: Remove Mock Flashcard Data

**User Story:** As a user, I want to manage my vocabulary flashcards with real SRS scheduling, so that my learning progress is persistent and synchronized.

#### Acceptance Criteria

1. WHEN the user requests a list of flashcards, THE System SHALL call `GET /flashcards` (not return mock data)
2. WHEN the user requests due flashcards for today, THE System SHALL call `GET /flashcards/due` (not return mock data)
3. WHEN the user requests a specific flashcard, THE System SHALL call `GET /flashcards/{flashcard_id}` (not return mock data)
4. WHEN the user creates a new flashcard, THE System SHALL call `POST /flashcards` with vocab and metadata
5. WHEN the user reviews a flashcard, THE System SHALL call `POST /flashcards/{flashcard_id}/review` with rating (forgot/hard/good/easy)
6. THE System SHALL remove all hardcoded mock flashcard data from `features/flashcards/actions/practice-actions.ts`
7. WHEN an API error occurs during flashcard operations, THE System SHALL display an error message to the user (not silently fall back to mock data)

#### Correctness Properties

- FOR ALL flashcard operations, the response SHALL match the schema defined in API_REFERENCE.md
- FOR ALL flashcard data, the source SHALL be the Real_API (never mock data)
- FOR ALL SRS scheduling, the backend calculation SHALL be the source of truth

---

### Requirement 4: Remove Mock Profile Data

**User Story:** As a user, I want my profile information to be stored on the backend, so that my settings persist across sessions and devices.

#### Acceptance Criteria

1. WHEN the user requests their profile, THE System SHALL call `GET /profile` (not return mock data)
2. WHEN the user updates their profile, THE System SHALL call `PATCH /profile` with updated fields
3. THE System SHALL remove all hardcoded mock profile data (MOCK_ADMIN_PROFILE) from the codebase
4. WHEN an API error occurs during profile operations, THE System SHALL display an error message to the user (not silently fall back to mock data)

#### Correctness Properties

- FOR ALL profile operations, the response SHALL match the schema defined in API_REFERENCE.md
- FOR ALL profile data, the source SHALL be the Real_API (never mock data)

---

### Requirement 5: Implement Missing Session Endpoints

**User Story:** As a user, I want to submit my spoken responses during a session, so that the AI can respond and provide feedback.

#### Acceptance Criteria

1. WHEN the user submits a turn in a session, THE System SHALL call `POST /sessions/{session_id}/turns` with request body containing text, is_hint_used, and optional audio_url
2. WHEN the API responds with a turn, THE System SHALL parse the response and display the AI's response content and audio_url
3. WHEN the API returns analysis_keywords, THE System SHALL store them for later use (e.g., flashcard creation)
4. WHEN an API error occurs, THE System SHALL display an error message and allow the user to retry

#### Correctness Properties

- FOR ALL turn submissions, the request body SHALL match the schema defined in API_REFERENCE.md
- FOR ALL turn responses, the System SHALL correctly parse and display AI_Turn content

---

### Requirement 6: Implement Missing Flashcard Endpoints

**User Story:** As a user, I want to retrieve individual flashcards and due flashcards, so that I can review my vocabulary efficiently.

#### Acceptance Criteria

1. WHEN the user requests due flashcards, THE System SHALL call `GET /flashcards/due` and return cards scheduled for today
2. WHEN the user requests a specific flashcard, THE System SHALL call `GET /flashcards/{flashcard_id}` and return full card details
3. WHEN the API returns flashcard data, THE System SHALL parse and display all fields (word, translation_vi, definition_vi, phonetic, audio_url, example_sentence, review_count, interval_days, difficulty, next_review_at, last_reviewed_at)
4. WHEN an API error occurs, THE System SHALL display an error message

#### Correctness Properties

- FOR ALL flashcard requests, the response SHALL match the schema defined in API_REFERENCE.md
- FOR ALL due flashcard queries, the System SHALL correctly filter cards by next_review_at <= today

---

### Requirement 7: Add Error Handling for API Failures

**User Story:** As a user, I want to see clear error messages when the API is unavailable, so that I understand what went wrong and can retry.

#### Acceptance Criteria

1. WHEN an API request fails with a 4xx error, THE System SHALL display a user-friendly error message (e.g., "Invalid request. Please try again.")
2. WHEN an API request fails with a 5xx error, THE System SHALL display a user-friendly error message (e.g., "Server error. Please try again later.")
3. WHEN an API request times out, THE System SHALL display a user-friendly error message (e.g., "Request timed out. Please check your connection.")
4. WHEN an API request fails, THE System SHALL log the error details (status, message, timestamp) for debugging
5. WHEN an API error occurs, THE System SHALL NOT fall back to mock data
6. WHEN an API error occurs, THE System SHALL provide a retry button or mechanism to the user

#### Correctness Properties

- FOR ALL API errors, the System SHALL display a message (not silently fail)
- FOR ALL error responses, the System SHALL log sufficient details for debugging

---

### Requirement 8: Add Loading States for Async Operations

**User Story:** As a user, I want to see visual feedback during API calls, so that I know the application is processing my request.

#### Acceptance Criteria

1. WHEN the System is fetching sessions, THE System SHALL display a loading indicator (spinner or skeleton)
2. WHEN the System is fetching flashcards, THE System SHALL display a loading indicator
3. WHEN the System is fetching profile data, THE System SHALL display a loading indicator
4. WHEN the System is submitting a turn, THE System SHALL display a loading indicator and disable the submit button
5. WHEN the System is reviewing a flashcard, THE System SHALL display a loading indicator
6. WHEN the API response is received, THE System SHALL hide the loading indicator and display the data
7. WHEN an API error occurs, THE System SHALL hide the loading indicator and display the error message

#### Correctness Properties

- FOR ALL async operations, a loading indicator SHALL be visible during the request
- FOR ALL loading indicators, they SHALL be hidden when the request completes (success or error)

---

### Requirement 9: Ensure Cognito Integration

**User Story:** As a developer, I want Cognito tokens to be automatically injected into all API requests, so that the backend can verify user identity.

#### Acceptance Criteria

1. WHEN the API_Client makes an authenticated request, THE System SHALL retrieve the Cognito ID token from storage
2. WHEN the API_Client makes an authenticated request, THE System SHALL inject the token in the `Authorization: Bearer <id_token>` header
3. WHEN the Cognito token expires, THE System SHALL refresh the token using the refresh_token
4. WHEN the Cognito token refresh fails, THE System SHALL redirect the user to sign in
5. WHEN the API returns a 401 Unauthorized error, THE System SHALL attempt to refresh the token and retry the request
6. WHEN the API returns a 403 Forbidden error, THE System SHALL display an error message (user lacks permissions)

#### Correctness Properties

- FOR ALL authenticated API requests, the Authorization header SHALL contain a valid Cognito JWT token
- FOR ALL token refreshes, the System SHALL use the refresh_token from Cognito
- FOR ALL 401 errors, the System SHALL attempt token refresh before failing

---

### Requirement 10: Maintain User Experience During Migration

**User Story:** As a user, I want the application to work smoothly during the migration, so that I don't experience broken features or data loss.

#### Acceptance Criteria

1. WHEN the user navigates between pages, THE System SHALL maintain session state (no data loss)
2. WHEN the user creates a session and then refreshes the page, THE System SHALL fetch the session from the Real_API (not lose the session)
3. WHEN the user creates a flashcard and then refreshes the page, THE System SHALL fetch the flashcard from the Real_API (not lose the flashcard)
4. WHEN the user is in the middle of a session and the connection drops, THE System SHALL allow the user to resume the session (fetch from Real_API)
5. WHEN the user completes a session, THE System SHALL save the scoring to the backend (not lose the score)

#### Correctness Properties

- FOR ALL user data, the backend SHALL be the source of truth (no local-only data)
- FOR ALL page refreshes, the System SHALL fetch fresh data from the Real_API

---

### Requirement 11: Remove All Mock Files

**User Story:** As a developer, I want to remove all mock files from the codebase, so that there is no confusion about which data is real.

#### Acceptance Criteria

1. THE System SHALL remove `features/auth/mock-auth.ts` file
2. THE System SHALL remove `features/session/api/session-mock.ts` file
3. THE System SHALL remove all hardcoded mock data arrays from `features/flashcards/actions/practice-actions.ts`
4. THE System SHALL remove all hardcoded mock data from `features/profile/api/profile.actions.ts`
5. THE System SHALL remove all `isMockAuthSession()` function calls
6. THE System SHALL remove all `signInMockSession()` function calls
7. THE System SHALL remove all `clearMockAuthSession()` function calls
8. WHEN the codebase is searched for "mock", THE System SHALL return zero results related to authentication, sessions, flashcards, or profiles

#### Correctness Properties

- FOR ALL mock-related code, it SHALL be completely removed (not commented out)
- FOR ALL imports of mock files, they SHALL be removed

---

### Requirement 12: Verify API Response Schemas

**User Story:** As a developer, I want to ensure all API responses match the backend schema, so that the frontend can reliably parse and display data.

#### Acceptance Criteria

1. WHEN the System receives a session response, THE System SHALL verify it contains session_id, status, turns, and scoring fields
2. WHEN the System receives a flashcard response, THE System SHALL verify it contains flashcard_id, word, translation_vi, definition_vi, phonetic, audio_url, example_sentence, review_count, interval_days, difficulty, next_review_at, and last_reviewed_at fields
3. WHEN the System receives a profile response, THE System SHALL verify it contains user_id, email, display_name, avatar_url, current_level, target_level, current_streak, total_words_learned, role, is_active, and is_new_user fields
4. WHEN the System receives a scenario response, THE System SHALL verify it contains scenario_id, scenario_title, context, roles, goals, is_active, usage_count, difficulty_level, and order fields
5. WHEN an API response is missing required fields, THE System SHALL log a warning and handle the missing data gracefully

#### Correctness Properties

- FOR ALL API responses, the System SHALL validate against the schema defined in API_REFERENCE.md
- FOR ALL schema mismatches, the System SHALL log a warning for debugging

---

## Acceptance Criteria Summary

| Requirement | Key Acceptance Criteria |
|-------------|------------------------|
| 1. Remove Mock Auth | No mock cookies, Cognito only, JWT injection |
| 2. Remove Mock Sessions | All calls to Real_API, no mock data, error handling |
| 3. Remove Mock Flashcards | All calls to Real_API, no mock data, error handling |
| 4. Remove Mock Profile | All calls to Real_API, no mock data, error handling |
| 5. Implement Session Turns | POST /sessions/{id}/turns endpoint working |
| 6. Implement Flashcard Endpoints | GET /flashcards/due and GET /flashcards/{id} working |
| 7. Error Handling | User-friendly messages, logging, no silent failures |
| 8. Loading States | Spinners/skeletons during async operations |
| 9. Cognito Integration | Token injection, refresh, 401 handling |
| 10. User Experience | No data loss, session resumption, backend as source of truth |
| 11. Remove Mock Files | All mock files deleted, zero mock references |
| 12. Verify Schemas | All responses validated against API_REFERENCE.md |

---

## Correctness Properties (Property-Based Testing)

### Property 1: API Response Schema Compliance
**Pattern:** Model-Based Testing

FOR ALL API responses from the Real_API, the response structure SHALL match the schema defined in API_REFERENCE.md.

**Test Strategy:** 
- Validate session responses contain required fields (session_id, status, turns, scoring)
- Validate flashcard responses contain required fields (flashcard_id, word, translation_vi, etc.)
- Validate profile responses contain required fields (user_id, email, display_name, etc.)
- Validate scenario responses contain required fields (scenario_id, scenario_title, context, etc.)

### Property 2: No Mock Data in Production
**Pattern:** Invariant

FOR ALL data displayed in the System, the source SHALL be the Real_API (never mock data).

**Test Strategy:**
- Search codebase for hardcoded mock data arrays
- Verify all data-fetching functions call Real_API endpoints
- Verify no fallback to mock data on API errors

### Property 3: Cognito Token Injection
**Pattern:** Invariant

FOR ALL authenticated API requests, the Authorization header SHALL contain a valid Cognito JWT token.

**Test Strategy:**
- Intercept API requests and verify Authorization header format
- Verify token is refreshed when expired
- Verify 401 errors trigger token refresh

### Property 4: Error Handling Completeness
**Pattern:** Error Conditions

FOR ALL API errors (4xx, 5xx, timeout), the System SHALL display a user-friendly error message (not silently fail).

**Test Strategy:**
- Simulate API errors (400, 401, 403, 404, 500, 502, timeout)
- Verify error messages are displayed to the user
- Verify error details are logged for debugging

### Property 5: Session State Consistency
**Pattern:** Invariant

FOR ALL session operations, the backend state SHALL match the frontend state (no divergence).

**Test Strategy:**
- Create a session, refresh page, verify session is fetched from backend
- Submit a turn, refresh page, verify turn is persisted in backend
- Complete a session, refresh page, verify scoring is persisted in backend

### Property 6: Flashcard SRS Consistency
**Pattern:** Invariant

FOR ALL flashcard reviews, the SRS scheduling (interval_days, next_review_at) SHALL be calculated by the backend (not frontend).

**Test Strategy:**
- Review a flashcard with rating "good", verify interval_days is updated by backend
- Verify next_review_at is calculated by backend
- Verify frontend displays backend-calculated values

### Property 7: Loading State Visibility
**Pattern:** Invariant

FOR ALL async operations, a loading indicator SHALL be visible during the request and hidden when the request completes.

**Test Strategy:**
- Fetch sessions, verify loading spinner is visible
- Fetch flashcards, verify loading spinner is visible
- Verify loading spinner is hidden when data is received or error occurs

### Property 8: Round-Trip Consistency (Profile Update)
**Pattern:** Round-Trip Properties

FOR ALL profile updates, updating a field and then fetching the profile SHALL return the updated value.

**Test Strategy:**
- Update display_name to "New Name"
- Fetch profile
- Verify display_name is "New Name"
- Update current_level to "B2"
- Fetch profile
- Verify current_level is "B2"

---

## Notes

- This migration is critical for data persistence and multi-device synchronization
- All mock files must be completely removed (not commented out) to avoid confusion
- Error handling is essential to maintain user trust during the transition
- Loading states improve perceived performance and user confidence
- Cognito integration must be seamless and transparent to the user
- The backend (Real_API) is the source of truth for all data

