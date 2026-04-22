# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Race Condition: WebSocket Kết Nối Ngay Khi Session Chưa Persist
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior — it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the race condition bug exists
  - **Scoped PBT Approach**: Scope the property to the concrete failing case — `useWebSocket` được mount ngay lập tức (timeSinceSessionCreated ≈ 0ms) với `initialDelayMs` không được set (undefined/0)
  - Test rằng khi `useWebSocket` được gọi không có `initialDelayMs`, `new WebSocket()` được gọi ngay lập tức (trong vòng 10ms sau mount)
  - Assert rằng trên code chưa fix, không có delay nào trước lần connect đầu tiên — đây là bug condition
  - Cũng test `onerror` handler: trigger error event, assert log hiển thị `url: undefined` và `readyState: undefined` (bug phụ trên code chưa fix)
  - Run test trên UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (confirms bug exists — hook connect ngay, không delay)
  - Document counterexamples: "useWebSocket gọi new WebSocket() sau 0ms, không có initialDelayMs → race condition với DynamoDB"
  - Mark task complete khi test đã viết, chạy, và failure được document
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Behavior Không Thay Đổi Với Non-Bug-Condition Inputs
  - **IMPORTANT**: Follow observation-first methodology — observe behavior trên UNFIXED code trước
  - Observe: khi `initialDelayMs` không được truyền (undefined), hook connect ngay lập tức — đây là baseline cho existing sessions
  - Observe: khi `isDevMock=true`, mock path được kích hoạt, không gọi `new WebSocket()`
  - Observe: khi `disconnect()` được gọi, `shouldReconnectRef=false`, không reconnect
  - Observe: khi `onclose` được trigger, exponential backoff reconnect được schedule
  - Write property-based tests cho các non-bug-condition cases:
    - **Prop 2a**: Với mọi `initialDelayMs=0` (existing session), hook connect ngay, không delay thêm
    - **Prop 2b**: Với `isDevMock=true`, mock behavior không bị ảnh hưởng — không gọi `new WebSocket()`
    - **Prop 2c**: Sau khi `disconnect()`, `shouldReconnectRef=false` — không có reconnect timer được schedule
    - **Prop 2d**: Reconnect logic (exponential backoff) hoạt động đúng sau khi `onclose` được trigger
  - Verify tất cả tests PASS trên UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline behavior to preserve)
  - Mark task complete khi tests đã viết, chạy, và passing trên unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix race condition và onerror handler

  - [x] 3.1 Thêm `initialDelayMs` option vào `useWebSocket`
    - Thêm `initialDelayMs?: number` vào interface `UseWebSocketOptions` trong `use-websocket.ts`
    - Trong hàm `connect()`, thêm biến `isFirstAttemptRef` (useRef, init = true)
    - Khi `isFirstAttemptRef.current = true` và `initialDelayMs > 0`: wrap toàn bộ connect logic trong `setTimeout(initialDelayMs)`, set `isFirstAttemptRef.current = false` trước khi connect
    - Các lần reconnect (từ `onclose`) không bị ảnh hưởng — `isFirstAttemptRef` đã là false
    - Cleanup: clear initial delay timer trong cleanup function của useEffect nếu component unmount trước khi delay xong
    - _Bug_Condition: isBugCondition(X) where X.isNewlyCreated=true AND X.timeSinceSessionCreated < PROPAGATION_THRESHOLD_
    - _Expected_Behavior: useWebSocket delay lần connect đầu tiên bằng initialDelayMs, sau đó connect bình thường_
    - _Preservation: initialDelayMs=undefined/0 → behavior giống hệt code cũ, không delay_
    - _Requirements: 2.1, 2.3, 3.1, 3.3_

  - [x] 3.2 Sửa thứ tự trong `onerror` handler
    - Trong `wsRef.current!.onerror` handler của `use-websocket.ts`, capture `url` và `readyState` vào local variables TRƯỚC khi null ref
    - Thay `url: wsRef.current?.url` và `readyState: wsRef.current?.readyState` trong log bằng local variables đã capture
    - Đảm bảo `wsRef.current = null` chỉ xảy ra SAU khi log đã dùng xong thông tin
    - _Bug_Condition: onerror handler null wsRef.current trước khi log → url/readyState undefined_
    - _Expected_Behavior: log hiển thị đầy đủ url và readyState của WebSocket bị lỗi_
    - _Requirements: 2.4_

  - [x] 3.3 Truyền `initialDelayMs` tại nơi gọi `useWebSocket` trong session page
    - Tìm component trong `lexi-fe/features/session/` nơi `useWebSocket` được gọi
    - Detect session mới qua query param `?new=true` hoặc navigation state
    - Truyền `initialDelayMs={1500}` khi session mới được tạo (`isNewSession=true`)
    - Không truyền `initialDelayMs` (hoặc truyền `0`) khi mở lại session đã tồn tại
    - _Bug_Condition: useWebSocket được mount ngay sau createSession, không có delay_
    - _Expected_Behavior: với session mới, hook delay 1500ms trước khi connect_
    - _Preservation: session đã tồn tại → initialDelayMs=0, kết nối ngay như cũ_
    - _Requirements: 2.1, 2.3, 3.1_

  - [x] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Race Condition Được Fix Bằng initialDelayMs
    - **IMPORTANT**: Re-run the SAME test từ task 1 — do NOT write a new test
    - Test từ task 1 encode expected behavior: `useWebSocket` với `initialDelayMs=1500` KHÔNG gọi `new WebSocket()` trong 1500ms đầu
    - Run bug condition exploration test từ step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.3_

  - [x] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Bug-Condition Behavior Không Thay Đổi
    - **IMPORTANT**: Re-run the SAME tests từ task 2 — do NOT write new tests
    - Run preservation property tests từ step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm tất cả preservation cases vẫn đúng: existing session connect ngay, mock mode hoạt động, disconnect clean, reconnect backoff đúng

- [x] 4. Checkpoint — Ensure all tests pass
  - Chạy toàn bộ test suite liên quan đến `useWebSocket`
  - Verify: Property 1 (bug condition) PASS
  - Verify: Property 2 (preservation) PASS
  - Verify: không có TypeScript/lint errors trong các file đã sửa
  - Hỏi user nếu có vấn đề phát sinh
