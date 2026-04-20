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
  const [connectionState, setConnectionState] =
    React.useState<WsConnectionState>("disconnected");
  const wsRef = React.useRef<WebSocket | null>(null);
  const reconnectAttemptRef = React.useRef(0);
  const reconnectTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = React.useRef(true);
  const shouldReconnectRef = React.useRef(true);
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
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

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
        onMessage(payload);
      } catch {
        console.error("[WS] Failed to parse message", ev.data);
      }
    };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      setConnState("disconnected");
      if (shouldReconnectRef.current) {
        const attempt = reconnectAttemptRef.current;
        if (attempt >= RECONNECT_MAX_ATTEMPTS) return;

        const delay = Math.min(
          RECONNECT_BASE_MS * 2 ** attempt,
          RECONNECT_MAX_MS,
        );
        reconnectAttemptRef.current += 1;
        setConnState("reconnecting");

        reconnectTimerRef.current = setTimeout(() => {
          connectRef.current();
        }, delay);
      }
    };

    ws.onerror = () => {
      if (!isMountedRef.current) return;
      setConnState("error");
      ws.close();
    };
  }, [idToken, sessionId, setConnState, onMessage, isDevMock]);

  React.useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = React.useCallback(() => {
    shouldReconnectRef.current = false;
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
