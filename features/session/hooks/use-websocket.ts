"use client";

import * as React from "react";
import type {
  WsClientPayload,
  WsServerPayload,
  WsConnectionState,
} from "@/features/session/types/session.types";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? "";
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;
const RECONNECT_MAX_ATTEMPTS = 8;

interface UseWebSocketOptions {
  sessionId: string;
  idToken: string;
  onMessage: (event: WsServerPayload) => void;
  onConnectionChange?: (state: WsConnectionState) => void;
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
}: UseWebSocketOptions): UseWebSocketReturn {
  const wsRef = React.useRef<WebSocket | null>(null);
  const reconnectAttemptRef = React.useRef(0);
  const reconnectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = React.useRef(true);
  const shouldReconnectRef = React.useRef(true);
  const connectRef = React.useRef<(() => void) | null>(null);
  const scheduleReconnectRef = React.useRef<(() => void) | null>(null);
  const onMessageRef = React.useRef(onMessage);
  const onConnectionChangeRef = React.useRef(onConnectionChange);

  const [connectionState, setConnectionState] = React.useState<WsConnectionState>("disconnected");

  // Keep refs updated without re-running effects
  React.useLayoutEffect(() => {
    onMessageRef.current = onMessage;
    onConnectionChangeRef.current = onConnectionChange;
  });

  const setConnState = React.useCallback((state: WsConnectionState) => {
    setConnectionState(state);
    onConnectionChangeRef.current?.(state);
  }, []);

  const connect = React.useCallback(() => {
    if (!isMountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const url = `${WS_BASE}?token=${idToken}&session_id=${sessionId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setConnState("connecting");

    ws.onopen = () => {
      if (!isMountedRef.current) { ws.close(); return; }
      reconnectAttemptRef.current = 0;
      setConnState("connected");
    };

    ws.onmessage = (ev: MessageEvent) => {
      if (!isMountedRef.current) return;
      try {
        const payload = JSON.parse(ev.data as string) as WsServerPayload;
        onMessageRef.current(payload);
      } catch {
        console.error("[WS] Failed to parse message", ev.data);
      }
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      setConnState("disconnected");
      if (shouldReconnectRef.current) {
        scheduleReconnectRef.current?.();
      }
    };

    ws.onerror = () => {
      if (!isMountedRef.current) return;
      setConnState("error");
      ws.close();
    };
  }, [idToken, sessionId, setConnState]);

  const scheduleReconnect = React.useCallback(() => {
    const attempt = reconnectAttemptRef.current;
    if (attempt >= RECONNECT_MAX_ATTEMPTS || !isMountedRef.current) return;

    const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
    reconnectAttemptRef.current += 1;
    setConnState("reconnecting");

    reconnectTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) connectRef.current?.();
    }, delay);
  }, [setConnState]);

  React.useEffect(() => {
    connectRef.current = connect;
    scheduleReconnectRef.current = scheduleReconnect;
  });

  function disconnect() {
    shouldReconnectRef.current = false;
    isMountedRef.current = false;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    wsRef.current?.close();
  }

  function send(payload: WsClientPayload) {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    } else {
      console.warn("[WS] Cannot send — not connected", payload);
    }
  }

  React.useEffect(() => {
    shouldReconnectRef.current = true;
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      shouldReconnectRef.current = false;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { connectionState, send, disconnect };
}
