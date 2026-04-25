# Admin Date Format Fix - Invalid Time Value

**Date**: April 25, 2026  
**Issue**: `RangeError: Invalid time value` in admin tables  
**Status**: ✅ Fixed

---

## 🐛 Problem

```
RangeError: Invalid time value
at formatDateTime (features/admin/components/scenarios/scenario-table.tsx:21:6)
```

**Root Cause:**
- Public scenarios from `/scenarios` don't have `updated_at` field
- Mock users might have invalid date strings
- `formatDateTime()` tried to format `undefined` → crash

---

## ⚠️ Missing Fields in Fallback Data

### Public Scenarios (from `/scenarios`)
Missing admin-specific fields:
- ❌ `updated_at` - Not provided
- ❌ `usage_count` - Not provided
- ❌ `notes` - Not provided
- ❌ `order` - Not provided

### Mock Users
All fields present but might have invalid dates.

---

## ✅ Solution Implemented

### 1. Safe Date Formatting

**Before (Crash):**
```typescript
function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value)); // ← Crashes if value is undefined
}
```

**After (Safe):**
```typescript
function formatDateTime(value: string | undefined) {
  // Handle missing or invalid dates
  if (!value) {
    return "N/A";
  }
  
  try {
    const date = new Date(value);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "N/A";
  }
}
```

### 2. Safe Field Access

**Before:**
```typescript
{scenario.usage_count} // ← undefined for public scenarios
```

**After:**
```typescript
{scenario.usage_count ?? 0} // ← Fallback to 0
```

### 3. Correct Public Data Detection

**Before (Wrong):**
```typescript
const isUsingPublicData = scenarios.length > 0 && !scenarios[0].notes;
// ← notes might be empty string, not undefined
```

**After (Correct):**
```typescript
const isUsingPublicData = scenarios.length > 0 && !scenarios[0].updated_at;
// ← updated_at is definitely missing in public scenarios
```

---

## 📋 Changes Made

### Files Modified:

1. **`features/admin/components/scenarios/scenario-table.tsx`**
   - Fixed `formatDateTime()` to handle undefined/invalid dates
   - Added fallback for `usage_count` field
   - Returns "N/A" for missing dates

2. **`features/admin/components/users/users-management.tsx`**
   - Fixed `formatDateTime()` to handle undefined/invalid dates
   - Prevents crash with mock user data

3. **`app/(admin)/admin/scenarios/page.tsx`**
   - Fixed public data detection logic
   - Now checks `updated_at` instead of `notes`

---

## 🎯 Behavior

### For Public Scenarios (Non-Admin)

**Display:**
- ✅ Scenario title, level, roles, goals
- ✅ Status badge
- ⚠️ Usage count: `0` (fallback)
- ⚠️ Updated date: `N/A` (missing field)

**Example:**
```
| Kịch bản          | Level | Vai trò & mục tiêu | Trạng thái | Lượt dùng | Cập nhật | Hành động |
|-------------------|-------|-------------------|-----------|-----------|----------|-----------|
| Restaurant Order  | B1    | Customer · Waiter | Đang mở   | 0         | N/A      | [Ẩn] [Sửa]|
```

### For Admin Scenarios (Admin User)

**Display:**
- ✅ All fields with real data
- ✅ Actual usage count
- ✅ Formatted update date

**Example:**
```
| Kịch bản          | Level | Vai trò & mục tiêu | Trạng thái | Lượt dùng | Cập nhật           | Hành động |
|-------------------|-------|-------------------|-----------|-----------|-------------------|-----------|
| Restaurant Order  | B1    | Customer · Waiter | Đang mở   | 127       | 24 thg 4, 14:30   | [Ẩn] [Sửa]|
```

---

## 🧪 Testing

### Test with Public Data:
```bash
# As non-admin user
1. Navigate to /admin/scenarios
2. Should see:
   - ✅ Scenarios displayed
   - ⚠️ Warning banner
   - ⚠️ "N/A" in Updated column
   - ⚠️ "0" in Usage count column
   - ✅ No crash
```

### Test with Admin Data:
```bash
# As admin user
1. Navigate to /admin/scenarios
2. Should see:
   - ✅ Scenarios displayed
   - ✅ No warning banner
   - ✅ Real dates in Updated column
   - ✅ Real counts in Usage column
   - ✅ No crash
```

---

## 📊 Impact

### Before Fix:
- ❌ Admin pages crash with date error
- ❌ Cannot view scenarios
- ❌ Poor user experience

### After Fix:
- ✅ Admin pages work with public data
- ✅ Graceful fallback for missing fields
- ✅ Shows "N/A" instead of crashing
- ✅ Production-ready error handling

---

## 🔗 Related Fixes

- [Admin Fallback Fix](./ADMIN_FALLBACK_FIX.md) - 403 Forbidden handling
- [Admin Setup Guide](./docs/ADMIN_SETUP.md) - How to create admin user
- [Refactor Summary](./REFACTOR_SUMMARY.md) - Pure Next.js pattern

---

## 💡 Lessons Learned

### 1. Always Handle Missing Data
```typescript
// ❌ Bad - assumes field exists
const date = new Date(scenario.updated_at);

// ✅ Good - handles missing field
const date = scenario.updated_at ? new Date(scenario.updated_at) : null;
```

### 2. Validate Dates Before Formatting
```typescript
// ❌ Bad - crashes on invalid date
new Date("invalid").toISOString();

// ✅ Good - checks validity
const date = new Date(value);
if (isNaN(date.getTime())) {
  return "N/A";
}
```

### 3. Use Nullish Coalescing
```typescript
// ❌ Bad - 0 is falsy
const count = scenario.usage_count || 0; // Wrong if count is 0

// ✅ Good - only null/undefined
const count = scenario.usage_count ?? 0; // Correct
```

---

**Fixed by**: Kiro AI Agent  
**Date**: April 25, 2026  
**Status**: Production Ready ✅
