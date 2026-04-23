/**
 * Preservation Property Tests — useWebSocket
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 *
 * MỤC ĐÍCH: Xác nhận các behavior hiện tại KHÔNG thay đổi sau khi fix.
 * Tất cả tests này PHẢI PASS trên code CHƯA FIX — chúng encode baseline behavior.
 *
 * Property 2: Preservation — Behavior không thay đổi với non-bug-condition inputs.
 *
 * Prop 2a: Với initialDelayMs=0 (hoặc undefined, existing session), hook connect ngay — không delay thêm
 * Prop 2b: Với isDevMock=true (NODE_ENV=development + no WS_BASE hoặc mock token), mock behavior — không gọi new WebSocket()
 * Prop 2c: Sau disconnect(), shouldReconnect là false — không có reconnect timer được schedule
 * Prop 2d: Reconnect logic (exponential backoff) hoạt động đúng sau khi onclose được trigger
 */

import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWebSocket } from "../use-websocket";

// ─── Mock WebSocket ───────────────────────────────────────────────────────────

class MockWebSocket {
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

  triggerClose(code = 1006) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close", { code, wasClean: false }));
  }

  triggerError() {
    this.onerror?.(new Event("error"));
  }
}

// ─── Setup / Teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.useFakeTimers();
  vi.stubGlobal("WebSocket", MockWebSocket);
  // Math.random() = 0 → jitter = 0 → delays are deterministic
  vi.spyOn(Math, "random").mockReturnValue(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Options dùng token thực (không phải MOCK_SESSION_TOKEN) để tránh dev mock path */
function realTokenOptions() {
  return {
    sessionId: "existing-session-abc",
    idToken: "real-id-token-xyz",
    onMessage: vi.fn(),
    onConnectionChange: vi.fn(),
  };
}

// ─── Prop 2a: Existing session — connect ngay, không delay ───────────────────
//
// Validates: Requirement 3.1
//
// Khi initialDelayMs không được truyền (undefined) — tức là existing session —
// hook phải gọi new WebSocket() ngay lập tức khi mount (không cần advance timers).
// Đây là baseline behavior cần được preserve sau khi fix.

describe("Prop 2a: Existing session — connect immediately, no extra delay", () => {
  it("should call new WebSocket() immediately on mount when no initialDelayMs is provided", () => {
    // Observe: trên code chưa fix, không có initialDelayMs option
    // Hook connect ngay lập tức khi mount — không cần advance timers
    renderHook(() => useWebSocket(realTokenOptions()));

    // Baseline: WebSocket được tạo ngay lập tức sau renderHook (không cần advance)
    expect(
      MockWebSocket.instances.length,
      "Existing session phải connect ngay lập tức — không có delay thêm",
    ).toBe(1);
  });

  it("should connect immediately for multiple different sessionIds (property: all existing sessions)", () => {
    // Property: với bất kỳ sessionId nào (existing session), connect ngay
    const sessionIds = ["session-1", "session-abc", "session-xyz-999"];

    for (const sessionId of sessionIds) {
      MockWebSocket.instances = [];

      const { unmount } = renderHook(() =>
        useWebSocket({ ...realTokenOptions(), sessionId }),
      );

      expect(
        MockWebSocket.instances.length,
        `Session ${sessionId} phải connect ngay lập tức`,
      ).toBe(1);

      unmount();
      MockWebSocket.instances = [];
    }
  });
});

// ─── Prop 2b: Dev mock mode — không gọi new WebSocket() ──────────────────────
//
// Validates: Requirement 3.4
//
// Khi isDevMock=true (NODE_ENV=development + mock token hoặc không có WS_BASE),
// hook phải dùng mock path — không gọi new WebSocket() thực sự.
// Mock behavior phải được preserve sau khi fix.
//
// isDevMock = NODE_ENV === 'development' && (!WS_BASE || idToken === MOCK_SESSION_TOKEN)

describe("Prop 2b: Dev mock mode — no new WebSocket() called", () => {
  it("should NOT call new WebSocket() when using a mock token in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_WS_URL", "");

    const { result } = renderHook(() =>
      useWebSocket({
        sessionId: "mock-session-123",
        idToken: "mock-id-token",
        onMessage: vi.fn(),
        onConnectionChange: vi.fn(),
      }),
    );

    // Mock path: không gọi new WebSocket()
    expect(
      MockWebSocket.instances.length,
      "Dev mock mode không được gọi new WebSocket()",
    ).toBe(0);

    // Mock path: connectionState phải là 'connected' ngay lập tức
    expect(
      result.current.connectionState,
      "Dev mock mode phải set connectionState = 'connected' ngay lập tức",
    ).toBe("connected");
  });

  it("should NOT call new WebSocket() when WS_BASE is empty in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_WS_URL", "");

    const { result } = renderHook(() =>
      useWebSocket({
        sessionId: "session-no-ws-base",
        idToken: "any-token",
        onMessage: vi.fn(),
        onConnectionChange: vi.fn(),
      }),
    );

    // Khi WS_BASE empty trong development, isDevMock=true → không gọi WebSocket
    expect(
      MockWebSocket.instances.length,
      "Không có WS_BASE trong development → mock mode, không gọi new WebSocket()",
    ).toBe(0);

    expect(result.current.connectionState).toBe("connected");
  });
});

// ─── Prop 2c: Sau disconnect() — không reconnect ─────────────────────────────
//
// Validates: Requirement 3.5
//
// Khi disconnect() được gọi, shouldReconnectRef phải là false.
// Sau đó dù advance timers bao nhiêu, không có WebSocket mới nào được tạo.
// Behavior này phải được preserve sau khi fix.

describe("Prop 2c: After disconnect() — no reconnect scheduled", () => {
  it("should not create new WebSocket instances after explicit disconnect()", () => {
    const { result } = renderHook(() => useWebSocket(realTokenOptions()));

    // WebSocket được tạo ngay khi mount
    expect(MockWebSocket.instances.length).toBe(1);

    // Gọi disconnect() — shouldReconnectRef phải là false
    act(() => {
      result.current.disconnect();
    });

    // Advance thêm thời gian — không có reconnect nào được schedule
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Vẫn chỉ 1 instance — không reconnect
    expect(
      MockWebSocket.instances.length,
      "Sau disconnect(), không được tạo thêm WebSocket instance nào",
    ).toBe(1);
  });

  it("should not reconnect even after advancing timers post-disconnect()", () => {
    const { result } = renderHook(() => useWebSocket(realTokenOptions()));

    expect(MockWebSocket.instances.length).toBe(1);

    // Disconnect ngay sau mount (không cần triggerOpen)
    act(() => {
      result.current.disconnect();
    });

    // Advance nhiều thời gian — không có reconnect
    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    // Vẫn chỉ có 1 instance ban đầu — không reconnect
    expect(
      MockWebSocket.instances.length,
      "Không được reconnect sau khi đã disconnect()",
    ).toBe(1);
  });
});

// ─── Prop 2d: Reconnect với exponential backoff sau onclose ───────────────────
//
// Validates: Requirement 3.3
//
// Khi WebSocket bị đóng (onclose trigger), hook phải tự động reconnect
// với exponential backoff: delay = RECONNECT_BASE_MS * 2^attempt + jitter
// RECONNECT_BASE_MS=1000, RECONNECT_MAX_ATTEMPTS=8
//
// Observable: sau khi triggerClose(), một WebSocket mới được tạo sau delay.
// Behavior này phải được preserve sau khi fix.

describe("Prop 2d: Reconnect with exponential backoff after onclose", () => {
  it("should create new WebSocket after onclose with attempt=0 (delay ~1000ms)", () => {
    renderHook(() => useWebSocket(realTokenOptions()));

    expect(MockWebSocket.instances.length).toBe(1);
    const ws = MockWebSocket.instances[0];

    // Trigger close — attempt=0, delay = 1000 * 2^0 + jitter = 1000ms (jitter=0)
    // Gọi ngoài act() để tránh act() flush setTimeout
    ws.triggerClose(1006);

    // Chưa đủ 1000ms — chưa reconnect
    act(() => {
      vi.advanceTimersByTime(999);
    });

    expect(
      MockWebSocket.instances.length,
      "Chưa đủ delay — chưa được reconnect",
    ).toBe(1);

    // Advance thêm 1ms để đạt đúng 1000ms
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Sau khi delay xong, phải có WebSocket mới
    expect(
      MockWebSocket.instances.length,
      "Sau delay backoff 1000ms, phải tạo WebSocket mới để reconnect",
    ).toBeGreaterThan(1);
  });

  it("should use exponential backoff: attempt=1 delay is ~2000ms", () => {
    renderHook(() => useWebSocket(realTokenOptions()));

    const ws0 = MockWebSocket.instances[0];

    // Close lần 1 — attempt=0, delay 1000ms (jitter=0)
    ws0.triggerClose(1006);

    // Advance qua delay lần 1 (1000ms)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Phải có WebSocket thứ 2
    expect(MockWebSocket.instances.length).toBeGreaterThanOrEqual(2);

    const ws1 = MockWebSocket.instances[MockWebSocket.instances.length - 1];

    // Close lần 2 — attempt=1, delay = 1000 * 2^1 = 2000ms (jitter=0)
    ws1.triggerClose(1006);

    const instanceCountBefore = MockWebSocket.instances.length;

    // Advance 1999ms — chưa đủ delay lần 2
    act(() => {
      vi.advanceTimersByTime(1999);
    });

    expect(
      MockWebSocket.instances.length,
      "Chưa đủ 2000ms — chưa reconnect lần 2",
    ).toBe(instanceCountBefore);

    // Advance thêm 1ms để đạt đúng 2000ms
    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(
      MockWebSocket.instances.length,
      "Sau 2000ms, phải reconnect lần 2",
    ).toBeGreaterThan(instanceCountBefore);
  });

  it("should stop reconnecting after RECONNECT_MAX_ATTEMPTS (8) attempts", () => {
    renderHook(() => useWebSocket(realTokenOptions()));

    // Simulate 8 failed reconnect attempts
    // Mỗi attempt: triggerClose → advance qua delay → WebSocket mới được tạo
    for (let attempt = 0; attempt < 8; attempt++) {
      const ws = MockWebSocket.instances[MockWebSocket.instances.length - 1];

      // Gọi triggerClose ngoài act() để tránh act() flush setTimeout
      ws.triggerClose(1006);

      // Advance qua delay tối đa cho attempt này
      // delay = min(1000 * 2^attempt, 30000) (jitter=0)
      const baseDelay = Math.min(1000 * Math.pow(2, attempt), 30_000);
      act(() => {
        vi.advanceTimersByTime(baseDelay);
      });
    }

    // Sau 8 attempts, không còn reconnect nữa
    const finalCount = MockWebSocket.instances.length;

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(
      MockWebSocket.instances.length,
      "Sau RECONNECT_MAX_ATTEMPTS (8), không được tạo thêm WebSocket",
    ).toBe(finalCount);
  });
});
