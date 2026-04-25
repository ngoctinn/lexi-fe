"use client";

import * as React from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import type {
  WsClientPayload,
  WsServerPayload,
  WsConnectionState,
} from "@/features/session/types/session.types";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "";
const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 30_000;
const RECONNECT_MAX_ATTEMPTS = 5;

function buildWebSocketUrl(base: string, token: string, sessionId: string) {
  const params = new URLSearchParams({ token, session_id: sessionId });
  return `${base}?${params.toString()}`;
}

/**
 * Get fresh ID token from Amplify (client-side)
 * Automatically refreshes if expired or expiring soon
 * Per AWS docs: ID tokens should be used for authentication/authorization
 * https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
 */
async function getFreshIdToken(): Promise<string> {
  try {
    // Check if token needs refresh (expires in < 5 minutes)
    const session = await fetchAuthSession({ forceRefresh: false });
    const idToken = session.tokens?.idToken;
    
    if (!idToken) {
      throw new Error("ID token not available from Amplify session");
    }
    
    // Check expiry - refresh if < 5 minutes remaining
    const expiresAt = idToken.payload.exp as number;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    if (timeUntilExpiry < 300) { // 5 minutes
      console.log(`[ws] Token expires in ${timeUntilExpiry}s, refreshing...`);
      const refreshedSession = await fetchAuthSession({ forceRefresh: true });
      const refreshedToken = refreshedSession.tokens?.idToken?.toString();
      if (!refreshedToken) {
        throw new Error("Failed to refresh ID token");
      }
      return refreshedToken;
    }
    
    return idToken.toString();
  } catch (error) {
    console.error("[ws] Failed to get fresh ID token:", error);
    throw error;
  }
}

interface UseWebSocketOptions {
  sessionId: string;
  idToken: string;
  onMessage: (event: WsServerPayload) => void;
  onConnectionChange?: (state: WsConnectionState) => void;
  initialDelayMs?: number;
}

interface UseWebSocketReturn {
  connectionState: WsConnectionState;
  send: (payload: WsClientPayload) => void;
  disconnect: () => void;
}

export function useWebSocket({
  sessionId,
  idToken,
  onMessage,
  onConnectionChange,
  initialDelayMs,
}: UseWebSocketOptions): UseWebSocketReturn {
  const [connectionState, setConnectionState] =
    React.useState<WsConnectionState>("disconnected");

  // Dùng refs để tránh re-render không cần thiết và race condition
  const wsRef = React.useRef<WebSocket | null>(null);
  const reconnectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = React.useRef(0);
  const shouldReconnectRef = React.useRef(true);

  // Stable ref để tránh stale closure trong callbacks
  const onMessageRef = React.useRef(onMessage);
  const onConnectionChangeRef = React.useRef(onConnectionChange);
  React.useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
  React.useEffect(() => { onConnectionChangeRef.current = onConnectionChange; }, [onConnectionChange]);

  const setConnState = React.useCallback((state: WsConnectionState) => {
    setConnectionState(state);
    onConnectionChangeRef.current?.(state);
  }, []);

  const send = React.useCallback(
    (payload: WsClientPayload) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      } else {
        console.warn("[ws] Cannot send: not connected", payload.action);
      }
    },
    [],
  );

  const disconnect = React.useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "Client disconnect");
      wsRef.current = null;
    }
    setConnState("disconnected");
  }, [setConnState]);

  // Effect chính: chỉ chạy khi sessionId hoặc idToken thay đổi thực sự
  React.useEffect(() => {
    // Guard: bỏ qua nếu thiếu thông tin cần thiết
    if (!idToken || !sessionId || !WS_BASE) {
      console.warn("[ws] Skipping connection: missing idToken, sessionId or WS_BASE", {
        hasIdToken: !!idToken,
        hasSessionId: !!sessionId,
        hasWsBase: !!WS_BASE,
      });
      return;
    }

    shouldReconnectRef.current = true;
    reconnectAttemptRef.current = 0;
    let currentWs: WebSocket | null = null;

    function openConnection(token: string) {
      // Đóng kết nối cũ nếu còn tồn tại
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const url = buildWebSocketUrl(WS_BASE, token, sessionId);
      console.log(`[ws] Connecting... session=${sessionId} attempt=${reconnectAttemptRef.current}`);

      const ws = new WebSocket(url);
      currentWs = ws;
      wsRef.current = ws;
      setConnState("connecting");

      ws.onopen = () => {
        if (wsRef.current !== ws) return; // Bỏ qua nếu đã bị thay thế
        console.log("[ws] Connected");
        reconnectAttemptRef.current = 0;
        setConnState("connected");
      };

      ws.onmessage = (ev: MessageEvent) => {
        if (wsRef.current !== ws) return;
        try {
          const payload = JSON.parse(ev.data as string) as WsServerPayload;
          onMessageRef.current(payload);
        } catch {
          console.error("[ws] Parse error:", ev.data);
        }
      };

      ws.onclose = (ev: CloseEvent) => {
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
        console.warn(`[ws] Closed: code=${ev.code} reason="${ev.reason}" wasClean=${ev.wasClean}`);

        if (!shouldReconnectRef.current) return;

        // Code 1000/1001/1005 = đóng bình thường, không reconnect
        // 1000 = Normal Closure
        // 1001 = Going Away
        // 1005 = No Status Rcvd (client-side close)
        if (ev.code === 1000 || ev.code === 1001 || ev.code === 1005) return;

        const attempt = reconnectAttemptRef.current;
        if (attempt >= RECONNECT_MAX_ATTEMPTS) {
          console.warn(`[ws] Max reconnection attempts reached (${attempt})`);
          setConnState("error");
          return;
        }

        const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
        reconnectAttemptRef.current += 1;
        setConnState("reconnecting");

        console.log(`[ws] Reconnecting in ${delay}ms (attempt ${reconnectAttemptRef.current})`);
        reconnectTimerRef.current = setTimeout(() => {
          if (shouldReconnectRef.current) {
            // Get fresh token before reconnecting
            getFreshIdToken()
              .then((freshToken) => openConnection(freshToken))
              .catch((err) => {
                console.error("[ws] Failed to get fresh token for reconnect:", err);
                setConnState("error");
              });
          }
        }, delay);
      };

      ws.onerror = () => {
        // onerror luôn được theo sau bởi onclose, không cần xử lý thêm ở đây
        // chỉ log để debug
        if (wsRef.current === ws) {
          const state = ws.readyState;
          console.error(
            `[ws] Connection error: url=${WS_BASE} readyState=${state} attempt=${reconnectAttemptRef.current}`,
          );
        }
      };
    }

    // Get fresh token before connecting
    getFreshIdToken()
      .then((freshToken) => {
        // Delay lần kết nối đầu tiên nếu được cấu hình (tránh race condition khi navigate)
        if (initialDelayMs && initialDelayMs > 0) {
          const delayTimer = setTimeout(() => {
            if (shouldReconnectRef.current) {
              openConnection(freshToken);
            }
          }, initialDelayMs);

          return () => {
            clearTimeout(delayTimer);
            shouldReconnectRef.current = false;
            if (reconnectTimerRef.current) {
              clearTimeout(reconnectTimerRef.current);
              reconnectTimerRef.current = null;
            }
            if (currentWs) {
              currentWs.close();
            }
            wsRef.current = null;
          };
        }

        openConnection(freshToken);

        return () => {
          shouldReconnectRef.current = false;
          if (reconnectTimerRef.current) {
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
          }
          if (currentWs) {
            currentWs.close();
          }
          wsRef.current = null;
        };
      })
      .catch((err) => {
        console.error("[ws] Failed to get initial token:", err);
        setConnState("error");
      });

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (currentWs) {
        currentWs.close();
      }
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, idToken]);

  return { connectionState, send, disconnect };
}
