# WebSocket Flow Analysis & Session ID Issue

**Date**: April 26, 2026  
**Status**: Investigating session_id missing from API response

---

## 🔍 Issue Summary

**Error**: "Phiên học không có ID hợp lệ" (Session has no valid ID)  
**Location**: `app/(app)/session/[id]/page.tsx` line 195  
**Symptom**: `session.session_id` is undefined after fetching from API

---

## 📊 Investigation Findings

### 1. **FE Code Flow** ✅ CORRECT
- `use-session-setup.ts` creates session with `selected_goal` (singular) - CORRECT per API spec
- `create-session.ts` sends POST /sessions with proper DTO
- `get-session.ts` fetches GET /sessions/{id}

### 2. **BE Lambda Execution** ✅ WORKING
CloudWatch logs show:
```
"Session created successfully", "session_id": "01KQ3XARR44HD4V1C538CG9VZ4"
```
- Lambda successfully creates session
- Lambda logs include session_id
- Lambda returns HTTP 200

### 3. **API Gateway** ✅ CONFIGURED
- Using AWS_PROXY (Lambda Proxy Integration)
- Passes Lambda response directly through
- No response mapping/transformation

### 4. **Response Structure** ❓ NEEDS VERIFICATION
**Expected by FE**:
```typescript
{
  success: true,
  data: {
    session_id: "...",
    user_id: "..."
  }
}
```

**Actual from Lambda**: Unknown - need to capture actual response body

---

## 🛠 Debugging Steps Taken

1. ✅ Added comprehensive logging to:
   - `features/session/actions/create-session.ts` - logs full API response
   - `features/session/actions/get-session.ts` - logs response structure
   - `app/(app)/session/[id]/page.tsx` - logs session validation

2. ✅ Verified Lambda is working correctly via CloudWatch

3. ✅ Confirmed API Gateway is using AWS_PROXY (no transformation)

---

## 📋 Next Steps

### Immediate Actions
1. **Reproduce the issue** - Create a new session and check browser console logs
2. **Capture actual API response** - Look for `[createSession] API Response:` in console
3. **Verify response structure** - Check if `data` field contains `session_id`

### If Response Structure is Wrong
- Check Lambda handler's response format
- Verify it returns `{ statusCode: 201, body: JSON.stringify({...}) }`
- Ensure response body has correct structure

### If Response is Correct
- Check if there's a field name mismatch (e.g., `session_id` vs `sessionId`)
- Verify `apiFetch` is parsing response correctly
- Check if response is being wrapped incorrectly

---

## 🔗 Related Files

**FE Session Flow**:
- `features/session/hooks/use-session-setup.ts` - Form data construction
- `features/session/actions/create-session.ts` - API call (with logging)
- `features/session/actions/get-session.ts` - Fetch session (with logging)
- `app/(app)/session/[id]/page.tsx` - Session validation (with logging)

**BE Lambda**:
- `/aws/lambda/lexi-be-SpeakingSessionFunction-DMj2qTyWTsDP` - CloudWatch logs

**API Documentation**:
- `API_DOCUMENTATION.md` - Section: "Create Speaking Session"
  - Expected request: `{ scenario_id, learner_role_id, ai_role_id, ai_gender, level, selected_goal }`
  - Expected response: `{ session_id, user_id, scenario_id, status, created_at, turn_count, ... }`

---

## 📝 Type Definitions

**CreateSessionDto** (FE sends):
```typescript
{
  scenario_id: string;
  learner_role_id?: string;
  ai_role_id?: string;
  ai_gender: "male" | "female";
  level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  selected_goal?: string;  // ✅ SINGULAR (correct)
  prompt_snapshot: string;
}
```

**Session** (FE expects):
```typescript
{
  session_id: string;  // ✅ Required for validation
  user_id?: string;
  scenario_id: string;
  // ... other fields
}
```

---

## 🎯 Success Criteria

- [ ] Capture actual API response in browser console
- [ ] Verify `session_id` is present in response
- [ ] Session page loads without "Phiên học không có ID hợp lệ" error
- [ ] WebSocket connects successfully with valid session_id

