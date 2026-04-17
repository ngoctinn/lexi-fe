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
  const reconnectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const isMountedRef = React.useRef(true);
  const shouldReconnectRef = React.useRef(true);
  const connectRef = React.useRef<(() => void) | null>(null);
  const scheduleReconnectRef = React.useRef<(() => void) | null>(null);
  const onMessageRef = React.useRef(onMessage);
  const onConnectionChangeRef = React.useRef(onConnectionChange);

  const [connectionState, setConnectionState] =
    React.useState<WsConnectionState>("disconnected");

  // Keep refs updated without re-running effects
  React.useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectionChangeRef.current = onConnectionChange;
  }, [onConnectionChange, onMessage]);

  const setConnState = React.useCallback((state: WsConnectionState) => {
    setConnectionState(state);
    onConnectionChangeRef.current?.(state);
  }, []);

  const emitServerMessage = React.useCallback((message: WsServerPayload) => {
    onMessageRef.current?.(message);
  }, []);

  const connect = React.useCallback(() => {
    if (!isMountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    // Development mock fallback: if no WS_BASE is provided, simulate a connected WS
    const isDevMock = process.env.NODE_ENV === "development" && !WS_BASE;
    if (isDevMock) {
      reconnectAttemptRef.current = 0;
      setConnState("connected");
      return;
    }

    const url = `${WS_BASE}?token=${idToken}&session_id=${sessionId}`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setConnState("connecting");

    ws.onopen = () => {
      if (!isMountedRef.current) {
        ws.close();
        return;
      }
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
  }, [connect, scheduleReconnect]);

  function disconnect() {
    const isDevMock = process.env.NODE_ENV === "development" && !WS_BASE;
    shouldReconnectRef.current = false;
    isMountedRef.current = false;
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    if (isDevMock) {
      setConnectionState("disconnected");
      onConnectionChangeRef.current?.("disconnected");
      return;
    }
    wsRef.current?.close();
  }

  function send(payload: WsClientPayload) {
    const isDevMock = process.env.NODE_ENV === "development" && !WS_BASE;
    if (isDevMock) {
      // Simulate server responses for dev when there's no real WS
      try {
        switch (payload.action) {
          case WsClientEvent.START_SESSION:
            emitServerMessage({
              event: WsServerEvent.SESSION_READY,
              upload_url: "https://mock-upload.com",
            });
            break;
          case WsClientEvent.SEND_MESSAGE: {
            // Determine the optimistic turn index from the session store
            const turns = useSessionStore.getState().turns;
            const turnIndex = Math.max(0, turns.length - 1);
            // Mark turn saved
            setTimeout(() => {
              emitServerMessage({
                event: WsServerEvent.TURN_SAVED,
                turn_index: turnIndex,
              });
            }, 200);

            // Simulate AI reply
            setTimeout(() => {
              emitServerMessage({
                event: WsServerEvent.AI_TEXT_CHUNK,
                chunk: `Mock AI: trả lời "${payload.text}"`,
                done: true,
              });
            }, 600);
            break;
          }
          case WsClientEvent.AUDIO_UPLOADED: {
            const turns = useSessionStore.getState().turns;
            const turnIndex = Math.max(0, turns.length - 1);
            setTimeout(() => {
              emitServerMessage({
                event: WsServerEvent.TURN_SAVED,
                turn_index: turnIndex,
              });
            }, 300);
            break;
          }
          case WsClientEvent.USE_HINT:
            setTimeout(async () => {
              const hint = await mockSessionApi.getHint(sessionId);
              emitServerMessage({
                event: WsServerEvent.HINT_TEXT,
                hint: hint,
              });
            }, 150);
            break;
          case WsClientEvent.END_SESSION:
            setTimeout(() => {
              emitServerMessage({
                event: WsServerEvent.SCORING_COMPLETE,
                session_id: sessionId,
              });
            }, 200);
            break;
          default:
            break;
        }
      } catch (err) {
        console.warn("[WS mock] failed to handle payload", payload, err);
      }
      return;
    }

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
