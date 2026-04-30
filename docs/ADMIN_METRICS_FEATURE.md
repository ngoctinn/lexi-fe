# Admin Metrics Feature

**Status**: ✅ Implemented  
**Date**: 2026-04-30

## Overview

Admin users can now view detailed performance metrics for AI conversations, including latency, token usage, and cost information. This feature helps monitor and optimize AI model performance.

## Features Implemented

### 1. Admin Mode Banner
- **Location**: Top of all pages when logged in as admin
- **Design**: Thin banner with primary-soft background, bold text, border
- **Purpose**: Visual indicator that user is in admin mode
- **Files**:
  - `components/admin/admin-mode-banner.tsx`
  - `components/admin/admin-mode-provider.tsx`

### 2. Turn-Level Metrics
- **Location**: Below each AI turn, next to "Dịch" button
- **Metrics Displayed**:
  - TTFT (Time to First Token) in milliseconds
  - Total Latency in milliseconds
  - Input/Output token counts
  - Cost in USD
  - Quality score (0-100)
- **UI**: Collapsible dropdown button
- **Files**:
  - `features/session/components/conversation/latency-metrics.tsx`
  - `features/session/components/conversation/turn-bubble.tsx`

### 3. Session-Level Metrics
- **Location**: Conversation sidebar (bottom section)
- **Metrics Displayed**:
  - Assigned model name
  - Average TTFT
  - Average latency
  - Average output tokens
  - Total cost
  - Turn statistics
- **UI**: Collapsible panel with Activity icon
- **Files**:
  - `features/session/components/conversation/session-metrics-panel.tsx`
  - `features/session/components/conversation/conversation-sidebar.tsx`

### 4. Role-Based Access Control
- **Mechanism**: 
  - User role synced to localStorage on login
  - Feature flag checks localStorage for "ADMIN" role
  - Metrics only visible when `isDebugMetricsEnabled()` returns true
- **Files**:
  - `features/session/utils/feature-flags.ts`
  - `features/profile/hooks/use-profile-role-sync.ts`
  - `features/profile/components/profile-role-provider.tsx`

## API Integration

### Backend Support
All metrics are already available in API responses:

**Turn-level** (from `/sessions/{id}` endpoint):
```json
{
  "ttft_ms": 420.5,
  "latency_ms": 1150.2,
  "input_tokens": 150,
  "output_tokens": 85,
  "cost_usd": 0.0012,
  "delivery_cue": "friendly",
  "quality_score": 0.95
}
```

**Session-level** (from `/sessions/{id}` endpoint):
```json
{
  "assigned_model": "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "avg_ttft_ms": 450.5,
  "avg_latency_ms": 1200.3,
  "avg_output_tokens": 85,
  "total_cost_usd": 0.0025
}
```

## Usage

### For Admin Users
1. Login with admin account (role: "ADMIN" in database)
2. Admin banner appears at top of all pages
3. Navigate to any conversation session
4. Metrics appear automatically:
   - Turn metrics: Click dropdown next to "Dịch" button
   - Session metrics: Expand panel in sidebar

### For Regular Users
- Metrics are completely hidden
- No UI changes visible
- No performance impact

## Environment Variables

Optional override for development:
```env
NEXT_PUBLIC_DEBUG_METRICS=true  # Force enable metrics for all users
```

## Testing

### Verify Admin Access
1. Login as admin user (admin@ngoctin.me)
2. Check admin banner appears at top
3. Open any conversation session
4. Verify metrics visible in:
   - Turn bubbles (AI responses)
   - Sidebar (session summary)

### Verify Regular User Access
1. Login as regular user
2. Verify NO admin banner
3. Open conversation session
4. Verify NO metrics visible

## Technical Details

### Data Flow
```
1. User logs in → Profile fetched from API
2. ProfileRoleProvider syncs role to localStorage
3. isDebugMetricsEnabled() checks localStorage
4. Metrics components conditionally render based on flag
```

### Performance Considerations
- Metrics data already in API response (no extra requests)
- Components only render when admin flag is true
- No impact on regular users
- Minimal bundle size increase (~2KB)

## Future Enhancements

Potential improvements:
- [ ] Export metrics to CSV
- [ ] Real-time metrics dashboard
- [ ] Historical metrics charts
- [ ] Alert thresholds for high latency/cost
- [ ] Model comparison view
- [ ] Per-scenario performance analytics

## Related Documentation

- API Spec: `lexi-be/docs/api/05-speaking.md`
- Architecture: `lexi-be/docs/ARCHITECTURE.md`
- Admin API: `lexi-be/docs/api/07-admin.md`
