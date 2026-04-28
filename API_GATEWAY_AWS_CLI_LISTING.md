# API Gateway - AWS CLI Complete Listing

**Generated:** April 27, 2026  
**Region:** ap-southeast-1  
**API ID:** yz8fyx7zub  
**API Name:** lexi-be  
**Endpoint:** https://yz8fyx7zub.execute-api.ap-southeast-1.amazonaws.com/Prod/

---

## 📊 API Gateway Overview

```
API Name: lexi-be
API ID: yz8fyx7zub
Created: 2026-04-23T06:17:52+00:00
Version: 1.0
Status: AVAILABLE
Endpoint Type: EDGE
Root Resource ID: 903iv613j1
```

---

## 🔗 Complete Resource Tree

### Root Resource
- **Path:** `/`
- **Resource ID:** 903iv613j1

---

## 📋 All Endpoints (Organized by Resource)

### 1. Profile Endpoints
**Resource Path:** `/profile`  
**Resource ID:** 0xjmhy

| Method | Path | Status |
|--------|------|--------|
| GET | `/profile` | ✅ Configured |
| PATCH | `/profile` | ✅ Configured |

---

### 2. Session Endpoints
**Resource Path:** `/sessions`  
**Resource ID:** i8i8xo

| Method | Path | Status |
|--------|------|--------|
| GET | `/sessions` | ✅ Configured |
| POST | `/sessions` | ✅ Configured |

**Sub-resource:** `/sessions/{session_id}`  
**Resource ID:** crta73

| Method | Path | Status |
|--------|------|--------|
| GET | `/sessions/{session_id}` | ✅ Configured |

**Sub-resource:** `/sessions/{session_id}/turns`  
**Resource ID:** 1idtup

| Method | Path | Status |
|--------|------|--------|
| POST | `/sessions/{session_id}/turns` | ✅ Configured |

**Sub-resource:** `/sessions/{session_id}/complete`  
**Resource ID:** se3xgb

| Method | Path | Status |
|--------|------|--------|
| POST | `/sessions/{session_id}/complete` | ✅ Configured |

---

### 3. Vocabulary Endpoints
**Resource Path:** `/vocabulary`  
**Resource ID:** wp6knk

**Sub-resource:** `/vocabulary/translate`  
**Resource ID:** 1brvwi

| Method | Path | Status |
|--------|------|--------|
| POST | `/vocabulary/translate` | ✅ Configured |

**Sub-resource:** `/vocabulary/translate-sentence`  
**Resource ID:** 6h19s2

| Method | Path | Status |
|--------|------|--------|
| POST | `/vocabulary/translate-sentence` | ✅ Configured |

---

### 4. Flashcard Endpoints
**Resource Path:** `/flashcards`  
**Resource ID:** 5gwgax

| Method | Path | Status |
|--------|------|--------|
| GET | `/flashcards` | ✅ Configured |
| POST | `/flashcards` | ✅ Configured |

**Sub-resource:** `/flashcards/due`  
**Resource ID:** 71vxfh

| Method | Path | Status |
|--------|------|--------|
| GET | `/flashcards/due` | ✅ Configured |

**Sub-resource:** `/flashcards/export`  
**Resource ID:** 4k14fh

| Method | Path | Status |
|--------|------|--------|
| GET | `/flashcards/export` | ✅ Configured |

**Sub-resource:** `/flashcards/import`  
**Resource ID:** o179cu

| Method | Path | Status |
|--------|------|--------|
| POST | `/flashcards/import` | ✅ Configured |

**Sub-resource:** `/flashcards/statistics`  
**Resource ID:** s57fxg

| Method | Path | Status |
|--------|------|--------|
| GET | `/flashcards/statistics` | ✅ Configured |

**Sub-resource:** `/flashcards/{flashcard_id}`  
**Resource ID:** mzz3uj

| Method | Path | Status |
|--------|------|--------|
| GET | `/flashcards/{flashcard_id}` | ✅ Configured |
| PATCH | `/flashcards/{flashcard_id}` | ✅ Configured |
| DELETE | `/flashcards/{flashcard_id}` | ✅ Configured |

**Sub-resource:** `/flashcards/{flashcard_id}/review`  
**Resource ID:** nc64sh

| Method | Path | Status |
|--------|------|--------|
| POST | `/flashcards/{flashcard_id}/review` | ✅ Configured |

---

### 5. Scenario Endpoints
**Resource Path:** `/scenarios`  
**Resource ID:** 7g4qgo

| Method | Path | Status |
|--------|------|--------|
| GET | `/scenarios` | ✅ Configured |

---

### 6. Admin Endpoints
**Resource Path:** `/admin`  
**Resource ID:** 56855i

**Sub-resource:** `/admin/users`  
**Resource ID:** ygtf2m

| Method | Path | Status |
|--------|------|--------|
| GET | `/admin/users` | ✅ Configured |

**Sub-resource:** `/admin/users/{user_id}`  
**Resource ID:** 2ms9k0

| Method | Path | Status |
|--------|------|--------|
| PATCH | `/admin/users/{user_id}` | ✅ Configured |

**Sub-resource:** `/admin/scenarios`  
**Resource ID:** yu9v5t

| Method | Path | Status |
|--------|------|--------|
| GET | `/admin/scenarios` | ✅ Configured |
| POST | `/admin/scenarios` | ✅ Configured |

**Sub-resource:** `/admin/scenarios/{scenario_id}`  
**Resource ID:** 4ss5f1

| Method | Path | Status |
|--------|------|--------|
| PATCH | `/admin/scenarios/{scenario_id}` | ✅ Configured |

---

### 7. Onboarding Endpoints
**Resource Path:** `/onboarding`  
**Resource ID:** shia5k

**Sub-resource:** `/onboarding/complete`  
**Resource ID:** h8zzxn

| Method | Path | Status |
|--------|------|--------|
| POST | `/onboarding/complete` | ✅ Configured |

---

## 📊 Summary Statistics

### By Resource Type
| Resource | Count | Methods |
|----------|-------|---------|
| Profile | 1 | 2 (GET, PATCH) |
| Sessions | 4 | 5 (GET, POST, GET, POST, POST) |
| Vocabulary | 2 | 2 (POST, POST) |
| Flashcards | 8 | 10 (GET, POST, GET, POST, GET, GET, POST, GET, PATCH, DELETE, POST) |
| Scenarios | 1 | 1 (GET) |
| Admin | 4 | 5 (GET, PATCH, GET, POST, PATCH) |
| Onboarding | 1 | 1 (POST) |
| **Total** | **21** | **26** |

### By HTTP Method
| Method | Count | Endpoints |
|--------|-------|-----------|
| GET | 10 | `/profile`, `/sessions`, `/sessions/{id}`, `/flashcards`, `/flashcards/due`, `/flashcards/export`, `/flashcards/statistics`, `/flashcards/{id}`, `/scenarios`, `/admin/users` |
| POST | 10 | `/sessions`, `/sessions/{id}/turns`, `/sessions/{id}/complete`, `/vocabulary/translate`, `/vocabulary/translate-sentence`, `/flashcards`, `/flashcards/import`, `/flashcards/{id}/review`, `/admin/scenarios`, `/onboarding/complete` |
| PATCH | 4 | `/profile`, `/flashcards/{id}`, `/admin/users/{id}`, `/admin/scenarios/{id}` |
| DELETE | 1 | `/flashcards/{id}` |
| **Total** | **25** | - |

---

## 🔍 Detailed Endpoint Listing

### All Endpoints (Alphabetical)

1. **DELETE /flashcards/{flashcard_id}**
   - Resource ID: mzz3uj
   - Parent: /flashcards
   - Status: ✅ Configured

2. **GET /admin/users**
   - Resource ID: ygtf2m
   - Parent: /admin
   - Status: ✅ Configured

3. **GET /admin/scenarios**
   - Resource ID: yu9v5t
   - Parent: /admin
   - Status: ✅ Configured

4. **GET /flashcards**
   - Resource ID: 5gwgax
   - Parent: /
   - Status: ✅ Configured

5. **GET /flashcards/due**
   - Resource ID: 71vxfh
   - Parent: /flashcards
   - Status: ✅ Configured

6. **GET /flashcards/export**
   - Resource ID: 4k14fh
   - Parent: /flashcards
   - Status: ✅ Configured

7. **GET /flashcards/statistics**
   - Resource ID: s57fxg
   - Parent: /flashcards
   - Status: ✅ Configured

8. **GET /flashcards/{flashcard_id}**
   - Resource ID: mzz3uj
   - Parent: /flashcards
   - Status: ✅ Configured

9. **GET /profile**
   - Resource ID: 0xjmhy
   - Parent: /
   - Status: ✅ Configured

10. **GET /scenarios**
    - Resource ID: 7g4qgo
    - Parent: /
    - Status: ✅ Configured

11. **GET /sessions**
    - Resource ID: i8i8xo
    - Parent: /
    - Status: ✅ Configured

12. **GET /sessions/{session_id}**
    - Resource ID: crta73
    - Parent: /sessions
    - Status: ✅ Configured

13. **PATCH /admin/scenarios/{scenario_id}**
    - Resource ID: 4ss5f1
    - Parent: /admin/scenarios
    - Status: ✅ Configured

14. **PATCH /admin/users/{user_id}**
    - Resource ID: 2ms9k0
    - Parent: /admin/users
    - Status: ✅ Configured

15. **PATCH /flashcards/{flashcard_id}**
    - Resource ID: mzz3uj
    - Parent: /flashcards
    - Status: ✅ Configured

16. **PATCH /profile**
    - Resource ID: 0xjmhy
    - Parent: /
    - Status: ✅ Configured

17. **POST /admin/scenarios**
    - Resource ID: yu9v5t
    - Parent: /admin
    - Status: ✅ Configured

18. **POST /flashcards**
    - Resource ID: 5gwgax
    - Parent: /
    - Status: ✅ Configured

19. **POST /flashcards/import**
    - Resource ID: o179cu
    - Parent: /flashcards
    - Status: ✅ Configured

20. **POST /flashcards/{flashcard_id}/review**
    - Resource ID: nc64sh
    - Parent: /flashcards/{flashcard_id}
    - Status: ✅ Configured

21. **POST /onboarding/complete**
    - Resource ID: h8zzxn
    - Parent: /onboarding
    - Status: ✅ Configured

22. **POST /sessions**
    - Resource ID: i8i8xo
    - Parent: /
    - Status: ✅ Configured

23. **POST /sessions/{session_id}/complete**
    - Resource ID: se3xgb
    - Parent: /sessions/{session_id}
    - Status: ✅ Configured

24. **POST /sessions/{session_id}/turns**
    - Resource ID: 1idtup
    - Parent: /sessions/{session_id}
    - Status: ✅ Configured

25. **POST /vocabulary/translate**
    - Resource ID: 1brvwi
    - Parent: /vocabulary
    - Status: ✅ Configured

26. **POST /vocabulary/translate-sentence**
    - Resource ID: 6h19s2
    - Parent: /vocabulary
    - Status: ✅ Configured

---

## 🔐 Authentication & Authorization

All endpoints (except `/scenarios`) require:
- **Authentication:** AWS Cognito ID Token
- **Authorization:** Cognito User Pool
- **Header:** `Authorization: <id_token>`

Admin endpoints require additional:
- **Role:** Admin role in Cognito User Pool

---

## 📝 Comparison with Frontend Actions

### ✅ Endpoints Implemented in Frontend

| Endpoint | Frontend Action | Status |
|----------|-----------------|--------|
| GET /profile | `getProfile()` | ✅ Implemented |
| PATCH /profile | `updateProfile()` | ✅ Implemented |
| GET /sessions | `getSessions()` | ✅ Implemented |
| POST /sessions | `createSession()` | ✅ Implemented |
| GET /sessions/{id} | `getSession()` | ✅ Implemented |
| POST /sessions/{id}/turns | `submitTurn()` | ✅ Implemented |
| POST /sessions/{id}/complete | `endSession()` | ✅ Implemented |
| GET /scenarios | `getScenarios()` | ✅ Implemented |
| POST /vocabulary/translate | `translateWordAction()` | ✅ Implemented |
| POST /vocabulary/translate-sentence | `translateSentenceAction()` | ✅ Implemented |
| GET /flashcards | `fetchFlashcards()` | ✅ Implemented |
| GET /flashcards/due | `fetchPracticeQueue()` | ✅ Implemented |
| GET /flashcards/{id} | `getFlashcard()` | ✅ Implemented |
| POST /flashcards | `saveFlashcardFromSession()` | ✅ Implemented |
| POST /flashcards/{id}/review | `updateFlashcardSRS()` | ✅ Implemented |
| GET /admin/users | `getAdminUsers()` | ✅ Implemented |
| PATCH /admin/users/{id} | `upsertAdminUser()` | ✅ Implemented |
| GET /admin/scenarios | `getAdminScenarios()` | ✅ Implemented |
| POST /admin/scenarios | `upsertAdminScenario()` | ✅ Implemented |
| PATCH /admin/scenarios/{id} | `upsertAdminScenario()` | ✅ Implemented |

### ⚠️ Endpoints NOT Implemented in Frontend

| Endpoint | Purpose | Status |
|----------|---------|--------|
| DELETE /flashcards/{id} | Delete flashcard | ❌ Not Implemented |
| GET /flashcards/export | Export flashcards | ❌ Not Implemented |
| POST /flashcards/import | Import flashcards | ❌ Not Implemented |
| GET /flashcards/statistics | Get flashcard statistics | ❌ Not Implemented |
| PATCH /flashcards/{id} | Update flashcard | ❌ Not Implemented |
| POST /onboarding/complete | Complete onboarding | ❌ Not Implemented |

---

## 🎯 Implementation Status

### Summary
- **Total Endpoints:** 26
- **Implemented:** 20 (77%)
- **Not Implemented:** 6 (23%)

### Not Implemented Endpoints

1. **DELETE /flashcards/{flashcard_id}**
   - Purpose: Delete a flashcard
   - Reason: Not required for current MVP

2. **GET /flashcards/export**
   - Purpose: Export flashcards to file
   - Reason: Not required for current MVP

3. **POST /flashcards/import**
   - Purpose: Import flashcards from file
   - Reason: Not required for current MVP

4. **GET /flashcards/statistics**
   - Purpose: Get flashcard learning statistics
   - Reason: Not required for current MVP

5. **PATCH /flashcards/{flashcard_id}**
   - Purpose: Update flashcard details
   - Reason: Not required for current MVP

6. **POST /onboarding/complete**
   - Purpose: Mark onboarding as complete
   - Reason: Functionality merged into `updateProfile()`

---

## 🔗 AWS CLI Commands Reference

### List all REST APIs
```bash
aws apigateway get-rest-apis --region ap-southeast-1
```

### List all resources for an API
```bash
aws apigateway get-resources --rest-api-id yz8fyx7zub --region ap-southeast-1
```

### Get details of a specific resource
```bash
aws apigateway get-resource --rest-api-id yz8fyx7zub --resource-id 0xjmhy --region ap-southeast-1
```

### Get method details
```bash
aws apigateway get-method --rest-api-id yz8fyx7zub --resource-id 0xjmhy --http-method GET --region ap-southeast-1
```

### Get integration details
```bash
aws apigateway get-integration --rest-api-id yz8fyx7zub --resource-id 0xjmhy --http-method GET --region ap-southeast-1
```

### Get authorizer details
```bash
aws apigateway get-authorizers --rest-api-id yz8fyx7zub --region ap-southeast-1
```

---

## 📊 Resource Hierarchy

```
/
├── /profile
│   ├── GET
│   └── PATCH
├── /sessions
│   ├── GET
│   ├── POST
│   └── /{session_id}
│       ├── GET
│       ├── /turns
│       │   └── POST
│       └── /complete
│           └── POST
├── /vocabulary
│   ├── /translate
│   │   └── POST
│   └── /translate-sentence
│       └── POST
├── /flashcards
│   ├── GET
│   ├── POST
│   ├── /due
│   │   └── GET
│   ├── /export
│   │   └── GET
│   ├── /import
│   │   └── POST
│   ├── /statistics
│   │   └── GET
│   └── /{flashcard_id}
│       ├── GET
│       ├── PATCH
│       ├── DELETE
│       └── /review
│           └── POST
├── /scenarios
│   └── GET
├── /admin
│   ├── /users
│   │   ├── GET
│   │   └── /{user_id}
│   │       └── PATCH
│   └── /scenarios
│       ├── GET
│       ├── POST
│       └── /{scenario_id}
│           └── PATCH
└── /onboarding
    └── /complete
        └── POST
```

---

## ✅ Verification Checklist

- [x] All endpoints listed from AWS API Gateway
- [x] Resource hierarchy documented
- [x] HTTP methods specified
- [x] Resource IDs provided
- [x] Comparison with frontend actions
- [x] Implementation status tracked
- [x] AWS CLI commands documented
- [x] Summary statistics provided
