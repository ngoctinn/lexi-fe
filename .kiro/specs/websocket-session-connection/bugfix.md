# Bugfix Requirements Document

## Introduction

Khi người dùng tạo session mới và được điều hướng đến trang `/session/{id}`, WebSocket không kết nối được với backend. Browser log cho thấy kết nối bị đóng ngay lập tức với `code=1006` (abnormal closure), sau đó hook tự động thử reconnect 8 lần và đều thất bại. Kết quả là người dùng không thể bắt đầu buổi luyện nói.

Điều tra cho thấy có hai nguyên nhân liên quan:

1. **Race condition (nguyên nhân chính)**: Frontend điều hướng đến trang session ngay sau khi `createSession` API trả về `session_id`. Trang session mount component và `useWebSocket` gọi `new WebSocket(url)` gần như ngay lập tức. Tuy nhiên, backend `$connect` handler tra cứu session trong DynamoDB — nếu bản ghi chưa được commit hoàn toàn hoặc có độ trễ propagation, backend trả về HTTP 404, khiến API Gateway từ chối kết nối WebSocket → `code=1006`.

2. **Lỗi trong `onerror` handler (nguyên nhân phụ)**: Khi WebSocket gặp lỗi, `onerror` set `wsRef.current = null` rồi gọi `wsRef.current?.close()`. Sau đó `onclose` cũng được trigger, nhưng lúc này `wsRef.current` đã là `null` nên log hiển thị `url: undefined` và `readyState: undefined`, gây khó debug.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN người dùng tạo session mới và frontend điều hướng đến `/session/{id}` THEN `useWebSocket` khởi tạo kết nối WebSocket ngay lập tức mà không chờ session sẵn sàng trên backend

1.2 WHEN WebSocket `$connect` được gọi và backend không tìm thấy session trong DynamoDB THEN backend trả về HTTP 404, API Gateway từ chối kết nối, browser nhận `code=1006` (abnormal closure)

1.3 WHEN WebSocket nhận `code=1006` THEN hook tự động reconnect tối đa 8 lần với exponential backoff, tất cả đều thất bại vì session vẫn không tồn tại hoặc vẫn chưa sẵn sàng

1.4 WHEN `onerror` được trigger THEN handler set `wsRef.current = null` trước khi log, khiến log hiển thị `url: undefined` và `readyState: undefined`, che giấu thông tin debug thực sự

### Expected Behavior (Correct)

2.1 WHEN người dùng tạo session mới và frontend điều hướng đến `/session/{id}` THEN `useWebSocket` chỉ khởi tạo kết nối WebSocket sau khi có xác nhận session đã sẵn sàng trên backend (hoặc có cơ chế retry phù hợp cho trường hợp race condition)

2.2 WHEN WebSocket `$connect` được gọi với `session_id` hợp lệ và token hợp lệ THEN backend SHALL trả về HTTP 200, API Gateway chấp nhận kết nối, và `onopen` được trigger trên frontend

2.3 WHEN kết nối thất bại do race condition (session chưa kịp persist) THEN hệ thống SHALL retry với delay phù hợp thay vì báo lỗi ngay lập tức cho người dùng

2.4 WHEN `onerror` được trigger THEN handler SHALL log đầy đủ thông tin (`url`, `readyState`) trước khi null `wsRef.current`, để debug log có giá trị

### Unchanged Behavior (Regression Prevention)

3.1 WHEN người dùng mở lại một session đã tồn tại (không phải session mới) THEN hệ thống SHALL CONTINUE TO kết nối WebSocket bình thường ngay khi trang load

3.2 WHEN token không hợp lệ hoặc session không thuộc về user THEN hệ thống SHALL CONTINUE TO từ chối kết nối với lỗi 401/403 tương ứng

3.3 WHEN WebSocket bị ngắt kết nối giữa chừng (mất mạng, server restart) THEN hệ thống SHALL CONTINUE TO tự động reconnect với exponential backoff

3.4 WHEN người dùng ở môi trường development với mock token THEN hệ thống SHALL CONTINUE TO hoạt động với mock WebSocket mà không cần kết nối thực

3.5 WHEN người dùng chủ động gọi `disconnect()` THEN hệ thống SHALL CONTINUE TO dừng reconnect và đóng kết nối sạch

---

## Bug Condition (Pseudocode)

```pascal
FUNCTION isBugCondition(X)
  INPUT: X of type WebSocketConnectAttempt {
    session_id: string,
    token: string,
    timeSinceSessionCreated: milliseconds
  }
  OUTPUT: boolean

  // Bug xảy ra khi kết nối được thực hiện ngay sau khi tạo session mới
  // và session chưa kịp persist vào DynamoDB
  RETURN X.timeSinceSessionCreated < PROPAGATION_THRESHOLD
         AND X.session_id IS newly_created
END FUNCTION

// Property: Fix Checking
FOR ALL X WHERE isBugCondition(X) DO
  result ← connectWebSocket'(X)
  ASSERT result.connected = true
         OR result.retrying = true  // graceful retry, không fail ngay
END FOR

// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition(X) DO
  ASSERT connectWebSocket(X) = connectWebSocket'(X)
END FOR
```
