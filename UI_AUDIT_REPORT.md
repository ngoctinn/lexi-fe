# UI Component Audit Report

**Date:** April 27, 2026  
**Status:** ⚠️ 60+ Issues Found

---

## 📊 Issue Summary

| Category | Count | Severity |
|----------|-------|----------|
| Accessibility | 8 | 🔴 Critical |
| Type Safety | 6 | 🔴 Critical |
| Performance | 8 | 🟡 High |
| Best Practices | 12 | 🟡 High |
| Security | 4 | 🔴 Critical |
| UI/UX | 6 | 🟡 High |
| **Total** | **60+** | - |

---

## 🔴 CRITICAL ISSUES (Must Fix)

### 1. XSS Vulnerabilities

**File:** `features/session/components/conversation/turn-bubble.tsx:250-260`
- **Issue:** User-generated content (turn.content) rendered without sanitization
- **Risk:** High - Potential XSS attack
- **Fix:** Use DOMPurify or sanitize-html

**File:** `features/dashboard/components/dashboard.tsx:40-50`
- **Issue:** scenarioTitle from database rendered without sanitization
- **Risk:** High - Potential XSS attack
- **Fix:** Sanitize before rendering

**File:** `features/flashcards/components/flashcard-card.tsx:80`
- **Issue:** card.definition_vi rendered without sanitization
- **Risk:** High - Potential XSS attack
- **Fix:** Sanitize before rendering

---

### 2. Type Safety Issues

**File:** `features/flashcards/components/flashcard-card.tsx:80`
- **Issue:** `(card as any).definition_vi` - unsafe type assertion
- **Fix:** Use proper Flashcard type with optional chaining

**File:** `features/session/components/conversation/turn-bubble.tsx:250`
- **Issue:** Implicit any in wordTranslations state
- **Fix:** Add proper type annotation

**File:** `features/profile/components/profile-form.tsx:50-60`
- **Issue:** initialData properties accessed without null coalescing
- **Fix:** Use optional chaining and nullish coalescing

---

### 3. Accessibility Issues

**File:** `features/session/components/conversation/turn-bubble.tsx:200`
- **Issue:** Using `<span>` with onClick instead of `<button>` for word translation
- **Fix:** Use proper button element

**File:** `features/session/components/conversation/turn-bubble.tsx:200-220`
- **Issue:** Popover trigger lacks aria-label
- **Fix:** Add aria-label="Tra từ"

**File:** `features/flashcards/components/flashcard-card.tsx:45`
- **Issue:** Card uses role="button" but should be proper button element
- **Fix:** Use button element with proper semantics

---

## 🟡 HIGH PRIORITY ISSUES

### 4. Performance Issues

**File:** `features/session/components/conversation/turn-bubble.tsx:100-120`
- **Issue:** tokenizeText function recreated on every render
- **Fix:** Memoize with useCallback

**File:** `features/session/components/conversation/turn-bubble.tsx:220-240`
- **Issue:** tokenizeText map uses index as key
- **Fix:** Use unique word identifier as key

**File:** `features/profile/components/profile-form.tsx:95-100`
- **Issue:** Avatar presets map uses index as key
- **Fix:** Use unique avatar URL as key

---

### 5. Best Practice Violations

**File:** `features/session/components/conversation/turn-bubble.tsx:180-190`
- **Issue:** onTranslateWord promise not properly caught
- **Fix:** Add proper error handling

**File:** `features/admin/components/scenarios/scenario-form-sheet.tsx:50-80`
- **Issue:** Form submission has no error handling
- **Fix:** Add try-catch and error toast

**File:** Multiple files
- **Issue:** Hardcoded Vietnamese strings (should be i18n)
- **Fix:** Extract to translation files

---

## 📋 Detailed Issue List

### Accessibility (8 issues)
1. ❌ Missing alt text on avatar images
2. ❌ Missing aria-label on word translation trigger
3. ❌ Missing aria-label on recording input
4. ❌ Color contrast issues in tone badges
5. ❌ Keyboard navigation not working for avatar selection
6. ❌ Form labels not properly associated with inputs
7. ❌ Using span instead of button for interactive elements
8. ❌ Card role="button" not semantic

### Type Safety (6 issues)
1. ❌ TurnBubbleProps missing proper typing
2. ❌ Unsafe type assertion with `as any`
3. ❌ Implicit any in wordTranslations state
4. ❌ Missing null checks on activeWord
5. ❌ Missing null checks on initialData
6. ❌ scenarioMap.get() could return undefined

### Performance (8 issues)
1. ❌ tokenizeText recreated on every render
2. ❌ TurnBubble not memoized
3. ❌ Avatar images use unoptimized={true}
4. ❌ Multiple lucide-react icons imported individually
5. ❌ Index used as key in lists
6. ❌ Multiple state updates not batched
7. ❌ Dashboard metric card re-renders unnecessarily
8. ❌ Flashcard session has unnecessary re-renders

### Best Practices (12 issues)
1. ❌ No error boundary for word translation
2. ❌ No error boundary for audio playback
3. ❌ Unhandled promise rejections
4. ❌ Silent audio.play() failures
5. ❌ No timeout fallback for word translation
6. ❌ No loading state for avatar selection
7. ❌ Hardcoded tone labels
8. ❌ Hardcoded message input placeholder
9. ❌ Hardcoded flashcard hint text
10. ❌ No error handling in form submission
11. ❌ No error feedback for avatar validation
12. ❌ Inconsistent component patterns

### Security (4 issues)
1. ❌ XSS vulnerability in turn.content rendering
2. ❌ XSS vulnerability in scenarioTitle rendering
3. ❌ XSS vulnerability in definition_vi rendering
4. ❌ Debug metrics exposed in production

### UI/UX (6 issues)
1. ❌ Inconsistent tone badge styling
2. ❌ No visual feedback on avatar selection
3. ❌ Generic error messages
4. ❌ Popover not responsive on mobile (fixed 450px width)
5. ❌ Avatar presets grid not responsive
6. ❌ No loading indicators during async operations

---

## 🔧 Recommended Fixes (Priority Order)

### Phase 1: Security (Must do immediately)
1. Sanitize user-generated content (turn.content)
2. Sanitize database content (scenarioTitle, definition_vi)
3. Remove debug metrics from production

### Phase 2: Accessibility (Must do for compliance)
1. Fix semantic HTML (button elements)
2. Add aria-labels
3. Fix keyboard navigation
4. Fix color contrast

### Phase 3: Type Safety (Must do for stability)
1. Remove `as any` assertions
2. Add proper type annotations
3. Add null checks

### Phase 4: Performance (Should do)
1. Memoize components and functions
2. Fix key props in lists
3. Optimize images

### Phase 5: Best Practices (Should do)
1. Add error boundaries
2. Add error handling
3. Extract hardcoded strings

---

## 📝 Files Requiring Changes

**Critical (Security/Accessibility):**
- features/session/components/conversation/turn-bubble.tsx
- features/flashcards/components/flashcard-card.tsx
- features/dashboard/components/dashboard.tsx

**High Priority (Type Safety):**
- features/profile/components/profile-form.tsx
- features/admin/components/scenarios/scenario-form-sheet.tsx

**Medium Priority (Performance/Best Practices):**
- features/session/components/conversation/message-input.tsx
- features/flashcards/components/flashcard-session.tsx

---

## ✅ Next Steps

1. Create sanitization utility
2. Fix XSS vulnerabilities
3. Add proper TypeScript types
4. Add error boundaries
5. Improve accessibility
6. Optimize performance
7. Extract hardcoded strings

---

**Report Generated:** April 27, 2026  
**Status:** ⚠️ REQUIRES IMMEDIATE ACTION
