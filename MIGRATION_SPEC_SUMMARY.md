# Migration Spec Summary — Mock to Real API

**Date:** April 23, 2026  
**Status:** ✅ **SPEC COMPLETE** — Ready for implementation  
**Spec Location:** `lexi-fe/.kiro/specs/migrate-mock-to-real-api/`

---

## What Was Created

A comprehensive spec for migrating the Lexi Frontend from mock data and mock authentication to real API calls. The spec follows the **Requirements-First Workflow** and includes:

### 1. Requirements Document (`requirements.md`)
**12 Requirements** covering all aspects of the migration:
- Remove Mock Authentication (Cognito-only)
- Remove Mock Session Data (Real API calls)
- Remove Mock Flashcard Data (Real API calls)
- Remove Mock Profile Data (Real API calls)
- Implement Missing Session Endpoints (POST /sessions/{id}/turns)
- Implement Missing Flashcard Endpoints (GET /flashcards/due, GET /flashcards/{id})
- Add Error Handling for API Failures
- Add Loading States for Async Operations
- Ensure Cognito Integration (Token injection, refresh)
- Maintain User Experience During Migration
- Remove All Mock Files
- Verify API Response Schemas

**8 Correctness Properties** for Property-Based Testing:
1. API Response Schema Compliance (Model-Based Testing)
2. No Mock Data in Production (Invariant)
3. Cognito Token Injection (Invariant)
4. Error Handling Completeness (Error Conditions)
5. Session State Consistency (Invariant)
6. Flashcard SRS Consistency (Invariant)
7. Loading State Visibility (Invariant)
8. Round-Trip Consistency for Profile Updates (Round-Trip Properties)

### 2. Design Document (`design.md`)
**High-Level & Low-Level Design** including:
- Architecture diagrams (UI → Server Actions → API Client → Real Backend)
- Authentication flow (Cognito JWT injection)
- Data flow examples (Session creation, flashcard review, profile update)
- Component specifications (API Client, Auth, Session, Flashcard, Profile)
- Error handling strategy (user-friendly messages, logging)
- Loading state implementation (spinners, skeletons)
- Data models (TypeScript interfaces)
- Testing strategy (unit, integration, property-based)
- Migration rollout plan (6 phases)
- Files to remove/modify

### 3. Implementation Plan (`tasks.md`)
**47 Tasks** organized in 6 phases:

**Phase 1: Remove Mock Authentication (6 tasks)**
- Delete mock-auth.ts
- Remove isMockAuthSession() calls
- Remove signInMockSession() and clearMockAuthSession()
- Write unit tests for Cognito sign-in
- Write property test for JWT token injection
- Checkpoint: Verify Cognito integration works

**Phase 2: Remove Mock Session Data (9 tasks)**
- Delete session-mock.ts
- Update get-sessions.ts, get-session.ts, create-session.ts, end-session.ts
- Implement submit-turn.ts (NEW - POST /sessions/{id}/turns)
- Write unit tests for session actions
- Write property test for session response schema
- Checkpoint: Verify session flow works end-to-end

**Phase 3: Remove Mock Flashcard Data (9 tasks)**
- Remove mock flashcards array
- Implement fetchFlashcards() (GET /flashcards)
- Implement fetchPracticeQueue() (GET /flashcards/due)
- Implement getFlashcard() (GET /flashcards/{id})
- Update updateFlashcardSRS() to use real API
- Write unit tests for flashcard actions
- Write property tests for schema and SRS consistency
- Checkpoint: Verify flashcard flow works end-to-end

**Phase 4: Remove Mock Profile Data (7 tasks)**
- Remove MOCK_ADMIN_PROFILE
- Update getProfile() and updateProfile()
- Write unit tests for profile actions
- Write property tests for schema and round-trip consistency
- Checkpoint: Verify profile flow works end-to-end

**Phase 5: Add Error Handling & Loading States (11 tasks)**
- Add error handling to session, flashcard, profile actions
- Add loading states to session, flashcard, profile components
- Add retry buttons to error messages
- Write unit tests for error handling
- Write property tests for error handling and loading states
- Checkpoint: Verify error handling and loading states work

**Phase 6: Testing & Verification (7 tasks)**
- Run unit tests for all API calls
- Run integration tests for end-to-end flows
- Run property-based tests for schema validation (100+ iterations)
- Verify no mock references remain
- Manual testing on staging environment
- Code review and cleanup
- Final checkpoint: Ensure all tests pass

---

## Key Metrics

| Metric | Value |
|--------|-------|
| **Total Requirements** | 12 |
| **Correctness Properties** | 8 |
| **Total Tasks** | 47 |
| **Required Tasks** | 31 |
| **Optional Tasks** | 16 (testing) |
| **Files to Remove** | 2 |
| **Files to Modify** | 7 |
| **Estimated Effort** | 2-3 weeks |
| **Phases** | 6 |

---

## Files Affected

### Files to Remove
1. `features/auth/mock-auth.ts` — Mock authentication module
2. `features/session/api/session-mock.ts` — Mock session data

### Files to Modify
1. `features/session/actions/get-sessions.ts` — Remove mock fallback
2. `features/session/actions/get-session.ts` — Remove mock fallback
3. `features/session/actions/create-session.ts` — Remove mock fallback
4. `features/session/actions/end-session.ts` — Remove mock fallback
5. `features/session/actions/submit-turn.ts` — **NEW** - Implement POST /sessions/{id}/turns
6. `features/flashcards/actions/practice-actions.ts` — Remove mock data, implement real API calls
7. `features/profile/api/profile.actions.ts` — Remove mock data, use real API only

### Files to Keep (No Changes)
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

---

## How to Use This Spec

### 1. Review the Spec
- Read `requirements.md` to understand what needs to be done
- Read `design.md` to understand how to do it
- Read `tasks.md` to see the step-by-step implementation plan

### 2. Start Implementation
- Open `tasks.md` in the editor
- Click "Start task" next to task items to begin implementation
- Follow the incremental steps to migrate from mock to real API
- Use checkpoints to validate progress at each phase

### 3. Track Progress
- Each task has a checkbox that can be marked as complete
- Checkpoints ensure incremental validation
- Optional tasks (marked with `*`) can be skipped for MVP

### 4. Verify Completion
- Run all unit tests
- Run all integration tests
- Run all property-based tests (100+ iterations)
- Verify no mock references remain in codebase
- Manual testing on staging environment

---

## Next Steps

1. **Review this summary** with the team
2. **Review the spec documents** (requirements.md, design.md, tasks.md)
3. **Start Phase 1** — Remove Mock Authentication
4. **Follow the phases** in order (dependencies between phases)
5. **Use checkpoints** to validate progress
6. **Run tests** at each phase to ensure correctness

---

## Additional Resources

- **API Reference:** `/lexi-be/docs/API_REFERENCE.md`
- **Frontend Audit:** `lexi-fe/FRONTEND_API_AUDIT.md`
- **Spec Location:** `lexi-fe/.kiro/specs/migrate-mock-to-real-api/`

---

**Generated:** April 23, 2026  
**Spec Type:** Feature (Requirements-First Workflow)  
**Status:** Ready for implementation
