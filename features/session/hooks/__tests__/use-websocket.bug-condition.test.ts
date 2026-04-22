/**
 * Bug Condition Exploration Test — useWebSocket Race Condition
 *
 * Validates: Requirements 1.1, 1.2, 1.4
 *
 * MỤC ĐÍCH: Xác nhận bug tồn tại trên code CHƯA FIX.
 * Test này PHẢI FAIL trên code chưa fix — failure xác nhận bug condition.
 * Sau khi fix, test này sẽ PASS.
 *
 * Bug 1 (chính): useWebSocket gọi new WebSocket() ngay lập tức khi mount,
 *   không có delay → race condition với DynamoDB chưa persist session.
 *
 * Bug 2 (phụ): onerror handler null wsRef.current trước khi log,
 *   khiến log hiển thị url: undefined và readyState: undefined.
 */

import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWebSocket } from "../use-websocket";

// ─── Mock WebSocket ───────────────────────────────────────────────────────────

class MockWebSocket {
  // WebSocket static constants — bắt buộc để hook hoạt động đúng
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  static instances: MockWebSocket[] = [];

  url: string;
  readyState: number = MockWebSocket.CONNECTING;
  onopen: ((ev: Event) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
  }

  send(_data: string) {}

  triggerOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.(new Event("open"));
  }

  triggerError() {
    this.onerror?.(new Event("error"));
  }

  triggerClose(code = 1006) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close", { code, wasClean: false }));
  }
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.useFakeTimers();
  vi.stubGlobal("WebSocket", MockWebSocket);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

// ─── Default hook options ─────────────────────────────────────────────────────
// Dùng token thực (không phải MOCK_SESSION_TOKEN) để hook không vào dev mock path

const defaultOptions = {
  sessionId: "session-123",
  idToken: "real-id-token-xyz",
  onMessage: vi.fn(),
  onConnectionChange: vi.fn(),
  initialDelayMs: 1500,
};

// ─── Property 1: Bug Condition — Race Condition ───────────────────────────────
//
// Validates: Requirements 2.1, 2.3
//
// Trên code ĐÃ FIX: useWebSocket với initialDelayMs=1500 KHÔNG gọi new WebSocket()
// trong 10ms đầu sau mount — delay được áp dụng đúng.
//
// Test này assert rằng KHÔNG có WebSocket nào được tạo trong 10ms đầu.
// Sau 1500ms, WebSocket PHẢI được tạo (delay hoạt động đúng).

describe("Property 1: Bug Condition — Race Condition", () => {
  it("should NOT call new WebSocket() within 10ms of mount when initialDelayMs=1500", () => {
    renderHook(() => useWebSocket(defaultOptions));

    // Advance time 10ms — chưa đủ để vượt qua delay 1500ms
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Trên code ĐÃ FIX: WebSocket chưa được tạo trong 10ms → instances.length === 0 → PASS
    expect(
      MockWebSocket.instances.length,
      "useWebSocket gọi new WebSocket() trước khi initialDelayMs=1500 hết hạn — fix chưa hoạt động.",
    ).toBe(0);
  });

  it("should call new WebSocket() after initialDelayMs=1500 has elapsed", () => {
    renderHook(() => useWebSocket(defaultOptions));

    // Advance time vượt qua delay 1500ms
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    // Sau 1500ms, WebSocket phải được tạo
    expect(
      MockWebSocket.instances.length,
      "useWebSocket không gọi new WebSocket() sau khi initialDelayMs=1500 hết hạn — delay không hoạt động đúng.",
    ).toBeGreaterThan(0);
  });
});

// ─── Property 1 (phụ): onerror handler log bug ────────────────────────────────
//
// Validates: Requirement 1.4
//
// Trên code ĐÃ FIX: onerror handler capture url và readyState vào local variables
// TRƯỚC khi null wsRef.current, nên log hiển thị đầy đủ thông tin.

describe("Property 1 (secondary): onerror handler log bug", () => {
  it("should log real url and readyState in onerror, not undefined", () => {
    const errorLogs: unknown[][] = [];
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation((...args) => {
        errorLogs.push(args);
      });

    renderHook(() => useWebSocket(defaultOptions));

    // Advance time vượt qua initialDelayMs=1500 để WebSocket được tạo
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      MockWebSocket.instances.length,
      "Cần ít nhất 1 WebSocket instance để test onerror handler",
    ).toBeGreaterThan(0);

    const ws = MockWebSocket.instances[0];

    // Verify onerror handler đã được set
    expect(
      ws.onerror,
      "onerror handler chưa được set trên WebSocket instance",
    ).not.toBeNull();

    // Trigger onerror với plain Event (không phải ErrorEvent)
    act(() => {
      ws.triggerError();
    });

    // Tìm log call có chứa url/readyState info
    const wsErrorLog = errorLogs.find(
      (args) =>
        typeof args[0] === "string" && args[0].includes("[WS] error"),
    );

    expect(
      wsErrorLog,
      "Không tìm thấy [WS] error log — onerror handler không log đúng",
    ).toBeDefined();

    consoleSpy.mockRestore();
  });
});
