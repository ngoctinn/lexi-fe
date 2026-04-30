# Admin Backend Response Format Issue

**Date**: 2026-04-30  
**Status**: ⚠️ DISCREPANCY FOUND

## Issue Summary

Backend admin API documentation says endpoints return **direct body** (no wrapper), but actual implementation returns **wrapped response** with `{success: true, data: {...}}` format.

## Evidence

### Documentation Says (docs/api/07-admin.md):

```json
// GET /admin/users
{
  "users": [...],
  "total_count": 2
}

// GET /admin/scenarios  
{
  "scenarios": [...],
  "total_count": 1
}
```

### Actual Backend Returns:

```json
// GET /admin/users
{
  "success": true,
  "message": "Success",
  "data": {
    "users": [...],
    "total_count": 2
  }
}

// GET /admin/scenarios
{
  "success": true,
  "message": "Success", 
  "data": {
    "scenarios": [...],
    "total_count": 1
  }
}
```

## Root Cause

Backend admin handlers use `HttpPresenter.present_success()` which wraps the response:

```python
# src/infrastructure/handlers/admin/list_admin_users_handler.py
result = controller.list_users()
if result.is_success:
    return presenter.present_success(result.value)  # ← Wraps with {success, data}
```

The `present_success()` method adds wrapper:

```python
# src/interfaces/presenters/http_presenter.py
def present_success(self, data: Any, message: str = "Success", status_code: int = 200):
    return self._format_response(status_code, {
        "success": True,
        "message": message,
        "data": data_dict,  # ← Wraps data
    })
```

## Frontend Fix Applied

Updated `admin.actions.ts` to handle both formats:

```typescript
export async function getAdminUsers(): Promise<AdminUser[]> {
  const response = await apiFetchDirect<any>("/admin/users", {
    cache: "no-store",
  });

  // Handle both direct body and wrapped response
  const data = response.data || response;
  const users = data.users || [];
  
  return users;
}
```

## Recommendation

**Option 1: Update Backend** (Preferred - matches docs)
- Modify admin handlers to return direct body
- Remove `HttpPresenter.present_success()` wrapper for admin endpoints
- Keep consistency with documented API

**Option 2: Update Documentation** (Alternative)
- Update docs to reflect actual wrapped response format
- Keep current backend implementation

**Option 3: Keep Current** (Current solution)
- Frontend handles both formats
- Works but not ideal for long-term maintenance

## Files Affected

### Backend:
- `src/infrastructure/handlers/admin/list_admin_users_handler.py`
- `src/infrastructure/handlers/admin/list_admin_scenarios_handler.py`
- `src/infrastructure/handlers/admin/update_admin_user_handler.py`
- `src/infrastructure/handlers/admin/create_admin_scenario_handler.py`
- `src/infrastructure/handlers/admin/update_admin_scenario_handler.py`

### Frontend:
- ✅ `features/admin/actions/admin.actions.ts` - Fixed to handle wrapped response

### Documentation:
- ⚠️ `docs/api/07-admin.md` - Needs update to reflect actual format

## Testing

To verify the actual response format:

```bash
# Get JWT token from browser DevTools
curl -X GET https://mnjxcw3o1e.execute-api.ap-southeast-1.amazonaws.com/Prod/admin/users \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" | jq
```

Expected output (actual):
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "users": [...],
    "total_count": 2
  }
}
```

## Conclusion

Frontend has been fixed to work with actual backend response format. Documentation should be updated to match reality, or backend should be changed to match documentation.
