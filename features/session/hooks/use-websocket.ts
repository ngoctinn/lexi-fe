"use client";

import * as React from "react";
import type {
  WsClientPayload,
  WsServerPayload,
  WsConnectionState,
} from "@/features/session/types/session.types";
import {
  WsClientEvent,
  WsServerEvent,
} from "@/features/session/types/session.types";
import { useSessionStore } from "@/features/session/stores/use-session-store";
import { mockSessionApi } from "@/features/session/api/session-mock";
import { MOCK_SESSION_TOKEN } from "@/features/auth/mock-auth";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "";
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;
const RECONNECT_MAX_ATTEMPTS = 8;

function buildWebSocketUrl(base: string, token: string, sessionId: string) {
  let url = base || "";

  // If user provided a non-ws scheme (http/https) or no scheme, normalize to ws/wss
  const isSecurePage =
    typeof window !== "undefined" && window.location?.protocol === "https:";

  if (!/^wss?:\/\//i.test(url)) {
    const scheme = isSecurePage ? "wss:" : "ws:";
    if (url.startsWith("/")) {
      url = `${scheme}//${window.location.host}${url}`;
    } else if (url) {
      url = `${scheme}//${url}`;
    } else {
      // No base provided: default to current host
      url = `${scheme}//${window.location.host}`;
    }
  } else if (isSecurePage && url.startsWith("ws://")) {
    // upgrade insecure ws to wss on secure pages
    url = url.replace(/^ws:\/\//i, "wss://");
  }

  const params = new URLSearchParams({ token, session_id: sessionId });
  return `${url}${url.includes("?") ? "&" : "?"}${params.toString()}`;
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
  const wsRef = React.useRef<WebSocket | null>(null);
  const connectingRef = React.useRef(false);
  const reconnectAttemptRef = React.useRef(0);
  const reconnectTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const initialDelayTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = React.useRef(true);
  const shouldReconnectRef = React.useRef(true);
  const isFirstAttemptRef = React.useRef(true);
  const connectRef = React.useRef<() => void>(() => {});

  const isDevMock = React.useMemo(
    () =>
      process.env.NODE_ENV === "development" &&
      (!WS_BASE || idToken === MOCK_SESSION_TOKEN),
    [idToken],
  );

  const setConnState = React.useCallback(
    (state: WsConnectionState) => {
      if (!isMountedRef.current) return;
      setConnectionState(state);
      onConnectionChange?.(state);
    },
    [onConnectionChange],
  );

  const connect = React.useCallback(() => {
    if (!isMountedRef.current) return;
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING ||
      connectingRef.current
    )
      return;

    // Delay lần kết nối đầu tiên nếu initialDelayMs được cung cấp
    if (isFirstAttemptRef.current && initialDelayMs && initialDelayMs > 0) {
      isFirstAttemptRef.current = false;
      initialDelayTimerRef.current = setTimeout(() => {
        initialDelayTimerRef.current = null;
        connectRef.current();
      }, initialDelayMs);
      return;
    }
    isFirstAttemptRef.current = false;

    if (isDevMock) {
      reconnectAttemptRef.current = 0;
      setConnState("connected");
      return;
    }

    const url = buildWebSocketUrl(WS_BASE, idToken, sessionId);
    try {
      connectingRef.current = true;
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setConnState("connecting");

      ws.onopen = () => {
        connectingRef.current = false;
        if (!isMountedRef.current) {
          ws.close();
          return;
        }
        reconnectAttemptRef.current = 0;
        setConnState("connected");
      };
    } catch (err) {
      // If constructing the WebSocket throws (invalid URL, bad params), mark error and bail
      console.error("[WS] failed to construct WebSocket", err);
      connectingRef.current = false;
      setConnState("error");
      return;
    }

    wsRef.current!.onmessage = (ev: MessageEvent) => {
      if (!isMountedRef.current) return;
      try {
        const payload = JSON.parse(ev.data as string) as WsServerPayload;
        onMessage(payload);
      } catch {
        console.error("[WS] Failed to parse message", ev.data);
      }
    };
    wsRef.current!.onclose = (ev: CloseEvent) => {
      if (!isMountedRef.current) return;
      console.warn(`[WS] closed (code=${ev.code}, reason=${ev.reason})`);
      // ensure we don't remain in a 'connecting' state
      connectingRef.current = false;
      // clear current socket reference so future connects can proceed
      wsRef.current = null;
      setConnState("disconnected");

      if (!shouldReconnectRef.current) return;

      const attempt = reconnectAttemptRef.current;
      if (attempt >= RECONNECT_MAX_ATTEMPTS) {
        console.warn(`[WS] max reconnect attempts reached (${attempt})`);
        return;
      }

      // clear any existing timer to avoid duplicate schedules
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      const baseDelay = Math.min(
        RECONNECT_BASE_MS * 2 ** attempt,
        RECONNECT_MAX_MS,
      );
      const jitter = Math.floor(Math.random() * 500);
      const delay = baseDelay + jitter;

      reconnectAttemptRef.current += 1;
      setConnState("reconnecting");

      reconnectTimerRef.current = setTimeout(() => {
        // allow next connect attempts
        connectingRef.current = false;
        connectRef.current();
      }, delay);
    };

    wsRef.current!.onerror = (ev: Event) => {
      if (!isMountedRef.current) return;
      try {
        const errorEvent = ev instanceof ErrorEvent ? ev : null;
        // ErrorEvent có thể có chi tiết hữu ích; Event thường không có thông tin thêm.
        if (errorEvent) {
          console.error(
            "[WS] error (ErrorEvent)",
            errorEvent.message,
            errorEvent.error,
          );
        } else {
          const url = ws.url;
          const readyState = ws.readyState;
          console.error("[WS] error (Event)", {
            type: ev.type,
            url,
            readyState,
            reconnectAttempt: reconnectAttemptRef.current,
          });
        }
      } catch (logErr) {
        console.error("[WS] error while logging error event", logErr);
      }
      // mark not connecting and null the ref so reconnect logic can proceed
      connectingRef.current = false;
      setConnState("error");
      try {
        wsRef.current?.close();
      } catch (e) {
        console.warn("[WS] error while closing socket", e);
      }
      wsRef.current = null;
    };
  }, [idToken, sessionId, setConnState, onMessage, isDevMock]);

  React.useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = React.useCallback(() => {
    shouldReconnectRef.current = false;
    if (initialDelayTimerRef.current) {
      clearTimeout(initialDelayTimerRef.current);
      initialDelayTimerRef.current = null;
    }
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnState("disconnected");
  }, [setConnState]);

  const handleMockPayload = React.useCallback(
    async (payload: WsClientPayload) => {
      switch (payload.action) {
        case WsClientEvent.START_SESSION:
          onMessage({
            event: WsServerEvent.SESSION_READY,
            upload_url: "https://mock-upload.com",
          });
          break;
        case WsClientEvent.SEND_MESSAGE: {
          const turns = useSessionStore.getState().turns;
          const turnIndex = Math.max(0, turns.length - 1);
          setTimeout(
            () =>
              onMessage({
                event: WsServerEvent.TURN_SAVED,
                turn_index: turnIndex,
              }),
            200,
          );
          setTimeout(
            () =>
              onMessage({
                event: WsServerEvent.AI_TEXT_CHUNK,
                chunk: `Mock AI: trả lời "${payload.text}"`,
                done: true,
              }),
            600,
          );
          break;
        }
        case WsClientEvent.AUDIO_UPLOADED: {
          const turns = useSessionStore.getState().turns;
          const turnIndex = Math.max(0, turns.length - 1);
          setTimeout(
            () =>
              onMessage({
                event: WsServerEvent.TURN_SAVED,
                turn_index: turnIndex,
              }),
            300,
          );
          break;
        }
        case WsClientEvent.USE_HINT:
          const hint = await mockSessionApi.getHint(sessionId);
          onMessage({ event: WsServerEvent.HINT_TEXT, hint });
          break;
        case WsClientEvent.END_SESSION:
          setTimeout(
            () =>
              onMessage({
                event: WsServerEvent.SCORING_COMPLETE,
                session_id: sessionId,
              }),
            200,
          );
          break;
      }
    },
    [onMessage, sessionId],
  );

  const send = React.useCallback(
    (payload: WsClientPayload) => {
      if (isDevMock) {
        handleMockPayload(payload);
        return;
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(payload));
      } else {
        console.warn("[WS] Cannot send — not connected", payload);
      }
    },
    [isDevMock, handleMockPayload],
  );

  React.useEffect(() => {
    isMountedRef.current = true;
    shouldReconnectRef.current = true;
    connect();
    return () => {
      isMountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  return { connectionState, send, disconnect };
}
