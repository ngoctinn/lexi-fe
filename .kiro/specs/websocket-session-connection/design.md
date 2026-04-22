# WebSocket Session Connection Bugfix Design

## Overview

Khi người dùng tạo session mới và được điều hướng đến `/session/{id}`, WebSocket kết nối thất bại với `code=1006`. Nguyên nhân chính là **race condition**: frontend gọi `new WebSocket(url)` ngay lập tức, trong khi backend `$connect` handler tra cứu session trong DynamoDB — nếu bản ghi chưa persist xong, backend trả về 404, API Gateway từ chối kết nối.

Nguyên nhân phụ là **lỗi thứ tự trong `onerror` handler**: `wsRef.current` bị null trước khi log, khiến log hiển thị `url: undefined` / `readyState: undefined`.

Chiến lược fix:
1. **Frontend**: Thêm delay trước lần kết nối đầu tiên khi session vừa được tạo (hoặc retry với backoff ngắn hơn cho 1006 sớm), để DynamoDB có thời gian commit bản ghi.
2. **Frontend**: Sửa thứ tự trong `onerror` — capture thông tin log trước, null ref sau.

## Glossary

- **Bug_Condition (C)**: Điều kiện kích hoạt bug — kết nối WebSocket được thực hiện trong khoảng thời gian ngắn sau khi session vừa được tạo, trước khi DynamoDB commit xong bản ghi.
- **Property (P)**: Hành vi mong muốn khi bug condition xảy ra — kết nối phải thành công (hoặc retry gracefully) thay vì fail ngay với 1006.
- **Preservation**: Các hành vi hiện tại không được thay đổi bởi fix — reconnect logic, mock mode, disconnect, auth rejection.
- **useWebSocket**: Hook tại `lexi-fe/features/session/hooks/use-websocket.ts` quản lý vòng đời WebSocket connection.
- **$connect handler**: Hàm `connect()` trong `lexi-be/src/infrastructure/handlers/websocket_handler.py`, được gọi khi API Gateway nhận WebSocket connection mới — tra cứu session trong DynamoDB và trả về 404 nếu không tìm thấy.
- **timeSinceSessionCreated**: Khoảng thời gian (ms) từ khi `createSession` API trả về đến khi `new WebSocket()` được gọi.
- **PROPAGATION_THRESHOLD**: Ngưỡng thời gian (ước tính ~500–2000ms) để DynamoDB đảm bảo bản ghi session đã persist và có thể đọc được.

## Bug Details

### Bug Condition

Bug xảy ra khi frontend gọi `new WebSocket(url)` ngay sau khi `createSession` API trả về `session_id`, trong khoảng thời gian DynamoDB chưa commit xong bản ghi. Backend `$connect` handler gọi `session_repo.get_by_id(session_id)` và nhận `None` → trả về HTTP 404 → API Gateway từ chối kết nối → browser nhận `code=1006`.

**Formal Specification:**

```
FUNCTION isBugCondition(X)
  INPUT: X of type WebSocketConnectAttempt {
    session_id: string,
    token: string,
    timeSinceSessionCreated: milliseconds,
    isNewlyCreated: boolean
  }
  OUTPUT: boolean

  RETURN X.isNewlyCreated = true
         AND X.timeSinceSessionCreated < PROPAGATION_THRESHOLD
         AND backendCannotFindSession(X.session_id)
END FUNCTION
```

### Examples

- **Bug case**: User tạo session, frontend navigate ngay lập tức, `useWebSocket` gọi `new WebSocket()` sau ~50ms → backend DynamoDB lookup trả về `None` → 404 → `code=1006`.
- **Bug case**: User tạo session trên mạng chậm, `createSession` mất 800ms, nhưng DynamoDB write chưa propagate → kết nối sau 100ms vẫn fail.
- **Non-bug case**: User mở lại session đã tồn tại từ trước → DynamoDB đã có bản ghi → kết nối thành công ngay.
- **Edge case**: `timeSinceSessionCreated` = 0ms (navigate tức thì) → bug condition chắc chắn xảy ra.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Khi user mở lại session đã tồn tại (không phải session mới), WebSocket phải kết nối bình thường ngay khi trang load — không bị delay thêm.
- Khi token không hợp lệ hoặc session không thuộc về user, backend phải tiếp tục từ chối với 401/403.
- Khi WebSocket bị ngắt giữa chừng (mất mạng, server restart), reconnect với exponential backoff phải tiếp tục hoạt động.
- Khi ở môi trường development với mock token, mock WebSocket phải tiếp tục hoạt động không cần kết nối thực.
- Khi user gọi `disconnect()`, hệ thống phải dừng reconnect và đóng kết nối sạch.

**Scope:**
Tất cả inputs không thuộc bug condition (session đã tồn tại, token invalid, disconnect chủ động, mock mode) phải hoàn toàn không bị ảnh hưởng bởi fix này.

## Hypothesized Root Cause

Dựa trên phân tích bug, các nguyên nhân có thể là:

1. **DynamoDB Write Propagation Delay (nguyên nhân chính)**: `createSession` API trả về `session_id` ngay sau khi write DynamoDB, nhưng bản ghi có thể chưa available cho read ngay lập tức (eventual consistency hoặc độ trễ nhỏ). Frontend navigate và connect WebSocket trong vòng vài chục ms — quá nhanh.

2. **Không có cơ chế "wait for ready" trên frontend**: `useWebSocket` không có khái niệm "session mới cần chờ" — nó connect ngay khi mount, không phân biệt session mới hay cũ.

3. **Thứ tự sai trong `onerror` handler (nguyên nhân phụ)**: Trong `use-websocket.ts`, `onerror` handler null `wsRef.current` trước khi log, khiến log mất thông tin `url` và `readyState`. Đây không phải nguyên nhân gây bug kết nối, nhưng làm khó debug.

4. **Reconnect không phân biệt loại lỗi**: Hiện tại reconnect logic dùng exponential backoff bắt đầu từ 1000ms. Với race condition, delay đầu tiên (1000ms + jitter) có thể đủ để DynamoDB sẵn sàng — nhưng không đảm bảo, và UX không tốt vì user thấy lỗi trước.

## Correctness Properties

Property 1: Bug Condition - WebSocket Kết Nối Thành Công Sau Race Condition

_For any_ `WebSocketConnectAttempt` X where `isBugCondition(X)` returns true (session vừa tạo, chưa persist xong), the fixed `useWebSocket` hook SHALL NOT fail immediately with a permanent error — it SHALL either delay the initial connection attempt until after `PROPAGATION_THRESHOLD`, or retry gracefully such that the connection eventually succeeds once the session is persisted.

**Validates: Requirements 2.1, 2.3**

Property 2: Preservation - Hành Vi Không Thay Đổi Với Session Đã Tồn Tại

_For any_ `WebSocketConnectAttempt` X where `isBugCondition(X)` returns false (session đã tồn tại, token invalid, disconnect chủ động, mock mode), the fixed `useWebSocket` hook SHALL produce exactly the same behavior as the original hook — no additional delay, no changed reconnect logic, no changed mock behavior.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Assuming root cause #1 và #3 là đúng:

**File**: `lexi-fe/features/session/hooks/use-websocket.ts`

**Specific Changes:**

1. **Thêm `initialDelayMs` option**: Thêm optional prop `initialDelayMs?: number` vào `UseWebSocketOptions`. Khi được truyền vào (ví dụ 1500ms), hook sẽ delay lần connect đầu tiên bằng `setTimeout` trước khi gọi `new WebSocket()`. Các lần reconnect sau không bị ảnh hưởng.

2. **Sửa thứ tự trong `onerror` handler**: Capture `ws.url` và `ws.readyState` vào local variables trước khi null `wsRef.current`, đảm bảo log có đầy đủ thông tin.

**File**: `lexi-fe/features/session/` (component gọi `useWebSocket`)

3. **Truyền `initialDelayMs` khi session mới**: Tại nơi `useWebSocket` được gọi trong session page, truyền `initialDelayMs` (ví dụ 1500) khi session vừa được tạo (có thể detect qua query param `?new=true` hoặc state từ navigation).

**Không thay đổi backend**: Backend `$connect` handler đã đúng — trả về 404 khi session không tồn tại là behavior hợp lệ. Fix nằm ở frontend.

### Pseudocode cho fix chính

```
// Trong useWebSocket connect():
FUNCTION connect()
  IF isFirstAttempt AND initialDelayMs > 0 THEN
    WAIT initialDelayMs
  END IF
  // ... existing connect logic
END FUNCTION

// Trong onerror handler:
ws.onerror = (ev) => {
  // Capture TRƯỚC khi null ref
  const url = wsRef.current?.url
  const readyState = wsRef.current?.readyState
  // ... log với url và readyState
  // Null ref SAU khi log
  wsRef.current = null
}
```

## Testing Strategy

### Validation Approach

Chiến lược hai giai đoạn: (1) viết test reproduce bug trên code chưa fix để xác nhận root cause, (2) verify fix hoạt động và không phá vỡ behavior hiện tại.

### Exploratory Bug Condition Checking

**Goal**: Reproduce bug trên code chưa fix để xác nhận race condition là nguyên nhân thực sự.

**Test Plan**: Mock DynamoDB lookup để simulate "session chưa persist" (trả về 404 cho lần đầu, 200 cho lần sau). Gọi `useWebSocket` ngay lập tức và assert kết nối fail với 1006.

**Test Cases**:
1. **Race Condition Test**: Simulate `$connect` trả về 404 (session chưa persist) → assert `onclose` được gọi với `code=1006` (sẽ fail trên code chưa fix vì không có delay).
2. **onerror Log Test**: Trigger `onerror` và assert log có `url: undefined` (confirm bug phụ trên code chưa fix).
3. **Immediate Connect Test**: Mount `useWebSocket` với session mới, không có delay → assert kết nối fail ngay lập tức.

**Expected Counterexamples**:
- `useWebSocket` connect ngay lập tức, không có delay → backend nhận request trước khi session persist → 404 → 1006.
- `onerror` log thiếu `url` và `readyState` vì ref đã bị null.

### Fix Checking

**Goal**: Verify rằng với bug condition, fix tạo ra behavior đúng.

**Pseudocode:**
```
FOR ALL X WHERE isBugCondition(X) DO
  result := useWebSocket_fixed(X, initialDelayMs=1500)
  ASSERT result.connectionState != "error" WITHIN reasonable_time
         OR result.connectionState = "connected" AFTER delay
END FOR
```

### Preservation Checking

**Goal**: Verify rằng với non-bug inputs, behavior không thay đổi.

**Pseudocode:**
```
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT useWebSocket_original(X) = useWebSocket_fixed(X, initialDelayMs=0)
END FOR
```

**Testing Approach**: Property-based testing phù hợp cho preservation checking vì:
- Tự động generate nhiều test case với các trạng thái session khác nhau.
- Bắt edge case mà unit test thủ công có thể bỏ sót.
- Đảm bảo behavior không đổi trên toàn bộ input domain không thuộc bug condition.

**Test Cases**:
1. **Existing Session Preservation**: Session đã tồn tại → `initialDelayMs=0` → kết nối ngay, không delay thêm.
2. **Auth Rejection Preservation**: Token invalid → backend vẫn trả về 401/403, behavior không đổi.
3. **Reconnect Logic Preservation**: Ngắt kết nối giữa chừng → exponential backoff vẫn hoạt động như cũ.
4. **Mock Mode Preservation**: `isDevMock=true` → mock behavior không bị ảnh hưởng.
5. **Disconnect Preservation**: Gọi `disconnect()` → `shouldReconnectRef=false`, không reconnect.

### Unit Tests

- Test `useWebSocket` với `initialDelayMs=1500`: assert không gọi `new WebSocket()` trong 1500ms đầu.
- Test `onerror` handler: assert log có `url` và `readyState` trước khi ref bị null.
- Test reconnect sau delay: assert sau `initialDelayMs`, kết nối được thực hiện bình thường.

### Property-Based Tests

- Generate random `timeSinceSessionCreated` values: với `initialDelayMs` đủ lớn, kết nối luôn xảy ra sau threshold.
- Generate random session states (existing/new): verify `initialDelayMs=0` cho existing sessions không thêm delay.
- Generate random disconnect/reconnect sequences: verify reconnect logic không bị ảnh hưởng bởi `initialDelayMs`.

### Integration Tests

- Test full flow: tạo session mới → navigate → `useWebSocket` với delay → kết nối thành công sau delay.
- Test existing session flow: mở session cũ → kết nối ngay, không delay.
- Test onerror log: trigger error → verify log output đầy đủ thông tin.
