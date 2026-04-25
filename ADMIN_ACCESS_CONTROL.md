# Admin Access Control - Full-Page Blocking

**Date**: April 25, 2026  
**Feature**: Admin role verification and access blocking  
**Status**: ✅ Implemented

---

## 🎯 Overview

Implemented **layout-level access control** for admin area. Non-admin users are blocked from accessing any admin pages with a clear, full-page banner.

---

## 🔐 Security Implementation

### 1. Role Verification at Layout Level

**File**: `app/(admin)/layout.tsx`

```typescript
// Check admin role before rendering any admin content
const [profile, isAdmin] = await Promise.all([
  getProfile(),
  isUserAdmin(),
]);

// Block non-admin users
if (!isAdmin) {
  return <AdminAccessDenied />;
}
```

**Benefits**:
- ✅ Blocks ALL admin routes at once
- ✅ No admin UI exposed to non-admin users
- ✅ Prevents accidental access
- ✅ Centralized control

### 2. Admin Role Checker

**File**: `lib/auth/admin.ts`

```typescript
export async function isUserAdmin(): Promise<boolean> {
  // Reads JWT token from Amplify session
  // Checks for admin role in:
  // 1. custom:role attribute (primary)
  // 2. cognito:groups (secondary)
  // 3. role claim (fallback)
  
  return role === "admin";
}
```

**Supports multiple role sources**:
- ✅ Custom Cognito attributes (`custom:role`)
- ✅ Cognito groups (`cognito:groups`)
- ✅ JWT role claims

### 3. Full-Page Blocking Banner

**File**: `features/admin/components/admin-access-denied.tsx`

```typescript
export function AdminAccessDenied() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Full-page overlay with explanation */}
      {/* Options to redirect to dashboard or home */}
    </div>
  );
}
```

**Features**:
- ✅ Full-page overlay (z-50)
- ✅ Clear explanation
- ✅ Redirect options
- ✅ Professional UI

---

## 📋 User Experience

### For Non-Admin Users

**When accessing `/admin/*`:**

1. **Layout checks role** → `isUserAdmin()` returns false
2. **Full-page banner shown** with:
   - ⚠️ "Truy cập bị từ chối" (Access Denied)
   - 📝 Explanation why blocked
   - 📋 Steps to get access
   - 🔘 Buttons to redirect

**Example:**
```
┌─────────────────────────────────────────┐
│                                         │
│  ⚠️  Truy cập bị từ chối                │
│                                         │
│  Khu vực dành cho quản trị viên         │
│                                         │
│  Bạn không có quyền truy cập trang này. │
│  Chỉ những người dùng có vai trò        │
│  quản trị viên mới có thể vào.          │
│                                         │
│  Để có quyền truy cập:                  │
│  • Liên hệ với quản trị viên hệ thống   │
│  • Yêu cầu được nâng cấp vai trò        │
│  • Đăng nhập lại sau khi được cấp quyền │
│                                         │
│  [Quay lại Dashboard] [Trang chủ]       │
│                                         │
└─────────────────────────────────────────┘
```

### For Admin Users

**When accessing `/admin/*`:**

1. **Layout checks role** → `isUserAdmin()` returns true
2. **Normal admin UI rendered**
3. **Full access to all features**

---

## 🛠 Implementation Details

### Files Created:

1. **`lib/auth/admin.ts`**
   - `isUserAdmin()` - Check if user is admin
   - `requireAdminRole()` - Throw error if not admin
   - Supports multiple role sources

2. **`features/admin/components/admin-access-denied.tsx`**
   - Full-page blocking banner
   - Professional UI with explanation
   - Redirect options

### Files Modified:

3. **`app/(admin)/layout.tsx`**
   - Added role check
   - Block non-admin users
   - Show blocking banner

4. **`app/(admin)/admin/users/page.tsx`**
   - Removed redundant warning banner
   - Cleaner UI

5. **`app/(admin)/admin/scenarios/page.tsx`**
   - Removed redundant warning banner
   - Cleaner UI

---

## 🔄 How It Works

### Request Flow

```
User visits /admin/users
    ↓
Next.js renders app/(admin)/layout.tsx
    ↓
Layout calls isUserAdmin()
    ↓
isUserAdmin() reads JWT token from Amplify
    ↓
Checks for admin role in JWT claims
    ↓
If admin: Render normal layout + children
If not admin: Render AdminAccessDenied banner
```

### Role Detection

```typescript
// JWT payload from Amplify
{
  "sub": "user-123",
  "email": "user@example.com",
  "custom:role": "admin",  // ← Primary check
  "cognito:groups": ["admin"],  // ← Secondary check
  "role": "admin"  // ← Fallback check
}
```

---

## 🧪 Testing

### Test Non-Admin Access

```bash
# 1. Sign in as non-admin user
# 2. Navigate to http://localhost:3000/admin

# Expected:
# ✅ Full-page blocking banner shown
# ✅ No admin UI visible
# ✅ Redirect buttons work
# ✅ No console errors
```

### Test Admin Access

```bash
# 1. Sign in as admin user (with custom:role = admin)
# 2. Navigate to http://localhost:3000/admin

# Expected:
# ✅ Normal admin layout rendered
# ✅ Sidebar visible
# ✅ All admin features accessible
# ✅ No blocking banner
```

### Test Role Detection

```bash
# In browser console:
const token = localStorage.getItem('CognitoIdentityServiceProvider.xxx.idToken');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Role:', payload['custom:role']); // Should be "admin"
```

---

## 🔐 Security Considerations

### 1. Server-Side Verification
- ✅ Role check happens on server (layout)
- ✅ Cannot be bypassed by client-side code
- ✅ JWT token verified by Amplify

### 2. Defense in Depth
- ✅ Layout-level blocking (primary)
- ✅ API-level authorization (backend)
- ✅ Fallback data for development

### 3. No Data Leakage
- ✅ Non-admin users don't see admin UI
- ✅ Admin data not exposed to non-admin users
- ✅ Backend enforces 403 Forbidden

---

## 📊 Comparison: Before vs After

### Before (Vulnerable)
```
Non-admin user visits /admin
    ↓
✅ Can see admin UI
✅ Can see admin pages
❌ API calls return 403
❌ Shows warning banner
❌ Not secure
```

### After (Secure)
```
Non-admin user visits /admin
    ↓
❌ Cannot see admin UI
❌ Cannot see admin pages
✅ Full-page blocking banner
✅ Clear explanation
✅ Redirect options
✅ Secure
```

---

## 🚀 Future Enhancements

### 1. Role-Based Features
```typescript
// Check specific permissions
if (await hasPermission('users.edit')) {
  // Show edit button
}
```

### 2. Audit Logging
```typescript
// Log access attempts
await logAccessAttempt({
  user_id: userId,
  route: '/admin/users',
  allowed: isAdmin,
  timestamp: new Date(),
});
```

### 3. Rate Limiting
```typescript
// Limit failed access attempts
if (failedAttempts > 5) {
  // Lock account temporarily
}
```

---

## 🔗 Related Documentation

- [Admin Setup Guide](./docs/ADMIN_SETUP.md) - How to create admin user
- [Admin Fallback Fix](./ADMIN_FALLBACK_FIX.md) - 403 Forbidden handling
- [Admin Date Fix](./ADMIN_DATE_FIX.md) - Date formatting fix
- [Refactor Summary](./REFACTOR_SUMMARY.md) - Pure Next.js pattern

---

## 📝 Checklist

- [x] Created admin role checker (`lib/auth/admin.ts`)
- [x] Created blocking banner component
- [x] Updated admin layout with role check
- [x] Removed redundant warning banners
- [x] Tested non-admin access
- [x] Tested admin access
- [x] Verified security
- [x] Documentation created

---

**Implemented by**: Kiro AI Agent  
**Date**: April 25, 2026  
**Status**: Production Ready ✅
