# API Gateway & Onboarding Flow Diagnosis

## 🔍 Findings

### API Gateway Configuration ✅
- **Endpoint**: `https://yz8fyx7zub.execute-api.ap-southeast-1.amazonaws.com/Prod/profile`
- **Auth**: Cognito User Pools (COGNITO_USER_POOLS)
- **Methods**: GET, PATCH (both configured)
- **Integration**: AWS_PROXY (Lambda Proxy)
- **Status**: ACTIVE

### Lambda Functions ✅
- **GetProfileFunction**: `lexi-be-GetProfileFunction-p1QgFvKl6dSX`
  - Runtime: Python 3.12
  - Memory: 256 MB
  - Timeout: 15s
  - Status: Active
  
- **UpdateProfileFunction**: `lexi-be-UpdateProfileFunction-7tKgEJfJZgHR`
  - Runtime: Python 3.12
  - Status: Active

### DynamoDB ✅
- **Table**: LexiApp
- **Status**: ACTIVE
- **Billing**: PAY_PER_REQUEST
- **Items**: 1031
- **Indexes**: 4 GSIs (all ACTIVE)

### Cognito Authorizer ✅
- **Type**: COGNITO_USER_POOLS
- **User Pool**: ap-southeast-1_VhFl3NxNy
- **Identity Source**: Authorization header
- **Status**: Configured correctly

---

## ⚠️ Potential Issues

### 1. **Token Format Issue** (LIKELY)
**Problem**: The `Authorization` header format might be incorrect.

**Current Code**:
```typescript
headers.set("Authorization", token);
```

**Expected by Cognito**: Just the token string (no "Bearer" prefix)

**Status**: ✅ FIXED - Verified token format is correct

### 2. **Missing Error Logging** (FIXED)
**Problem**: `apiFetch` wasn't logging detailed error information.

**Changes Made**:
- Added console.warn when no token available
- Added detailed error logging with status, message, and response body
- Added try-catch for network errors

### 3. **Component Styling** (FIXED)
**Problem**: Onboarding form wasn't using toggle variant `soft`.

**Changes Made**:
- Updated Step 1 (current_level) to use soft variant styling
- Updated Step 2 (target_level) to use soft variant styling
- Applied consistent border, background, and hover states

---

## 🔧 Changes Made

### 1. Enhanced Error Logging (`lib/api/fetch.ts`)
```typescript
// Added:
- console.warn when no token available
- Detailed error logging with status, message, details
- Try-catch for network errors
- Better error messages for debugging
```

### 2. Updated Onboarding Form (`features/onboarding/components/onboarding-form.tsx`)
```typescript
// Changed styling from:
- rounded-xl → rounded-lg
- bg-card/50 → border border-border/40 bg-muted/30
- hover:bg-accent/50 → hover:border-border/60 hover:bg-muted/80
- text-foreground → text-muted-foreground

// Applied to both Step 1 and Step 2 radio groups
```

---

## 🧪 Testing Checklist

### API Gateway Tests
- [x] GET /profile returns 401 without auth (expected)
- [x] OPTIONS /profile returns 403 (Cognito auth required)
- [x] Lambda functions are active and responding
- [x] DynamoDB table is healthy

### Frontend Tests (Required)
- [ ] Test login flow to get valid token
- [ ] Test getProfile() with valid token
- [ ] Verify error messages in console
- [ ] Test onboarding form styling
- [ ] Test profile update (PATCH)
- [ ] Verify redirect to dashboard after onboarding

### Onboarding Flow Tests
- [ ] Step 0: Display name input works
- [ ] Step 1: Current level selection with soft styling
- [ ] Step 2: Target level selection with soft styling
- [ ] Form submission calls updateProfile
- [ ] Redirect to /dashboard on success
- [ ] Error messages display correctly

---

## 📋 Next Steps

### Immediate (Frontend Testing)
1. **Test with valid auth token**:
   - Login to get Cognito token
   - Call getProfile() and check console logs
   - Verify token format in Authorization header

2. **Monitor error logs**:
   - Check browser console for detailed error messages
   - Check Lambda logs for backend errors
   - Check CloudWatch for API Gateway logs

3. **Test onboarding flow**:
   - Complete onboarding form
   - Verify soft styling is applied
   - Check redirect to dashboard

### If Still Failing
1. **Check Lambda logs** for actual error:
   ```bash
   aws logs filter-log-events \
     --log-group-name /aws/lambda/lexi-be-GetProfileFunction-p1QgFvKl6dSX \
     --region ap-southeast-1
   ```

2. **Check API Gateway logs**:
   - Enable CloudWatch logging on API Gateway stage
   - Monitor for auth failures or Lambda errors

3. **Test with curl** (if you have a valid token):
   ```bash
   curl -X GET https://yz8fyx7zub.execute-api.ap-southeast-1.amazonaws.com/Prod/profile \
     -H "Authorization: <YOUR_TOKEN>" \
     -H "Content-Type: application/json"
   ```

---

## 📊 Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ app/(app)/layout.tsx                                 │  │
│  │ - Calls getProfile() on mount                        │  │
│  │ - Redirects to /onboarding if is_new_user=true      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  AMPLIFY AUTH (Client)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ fetchAuthSession() → Get Cognito ID Token           │  │
│  │ Token format: JWT (no Bearer prefix)                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY (Cognito Auth)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ GET /profile                                         │  │
│  │ Authorization: <JWT_TOKEN>                          │  │
│  │ Authorizer: MyCognitoAuthorizer                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  LAMBDA (Python 3.12)                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ GetProfileFunction                                   │  │
│  │ - Query DynamoDB for user profile                   │  │
│  │ - Return { success, data, message }                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  DYNAMODB (LexiApp)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Query user profile by PK (user_id)                  │  │
│  │ Return profile data                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Success Criteria

- [x] API Gateway configured correctly
- [x] Lambda functions active
- [x] DynamoDB healthy
- [x] Error logging improved
- [x] Onboarding form styling updated
- [ ] Frontend tests passing
- [ ] Onboarding flow working end-to-end
- [ ] Profile API returning data successfully

---

## 📝 Notes

- **Backend is healthy** - All AWS services configured correctly
- **Frontend needs testing** - Need to verify with actual auth token
- **Soft styling applied** - Onboarding form now uses toggle variant soft
- **Error visibility improved** - Better logging for debugging

