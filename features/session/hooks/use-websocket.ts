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
const RECONNECT_BASE_MS = 2000;
const RECONNECT_MAX_MS = 30_000;
const RECONNECT_MAX_ATTEMPTS = 5;

function buildWebSocketUrl(base: string, token: string, sessionId: string) {
  const params = new URLSearchParams({ token, session_id: sessionId });
  return `${base}?${params.toString()}`;
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

  // isDevMock: chỉ dùng khi không có WS_BASE (local dev không có backend)
  const isDevMock = !WS_BASE;

  const handleMockPayload = React.useCallback(
    async (payload: WsClientPayload) => {
      switch (payload.action) {
        case WsClientEvent.START_SESSION:
          onMessageRef.current({
            event: WsServerEvent.SESSION_READY,
            upload_url: "https://mock-upload.com",
          });
          break;
        case WsClientEvent.SEND_MESSAGE: {
          const turns = useSessionStore.getState().turns;
          const turnIndex = Math.max(0, turns.length - 1);
          setTimeout(
            () =>
              onMessageRef.current({
                event: WsServerEvent.TURN_SAVED,
                turn_index: turnIndex,
              }),
            200,
          );
          setTimeout(
            () =>
              onMessageRef.current({
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
              onMessageRef.current({
                event: WsServerEvent.TURN_SAVED,
                turn_index: turnIndex,
              }),
            300,
          );
          break;
        }
        case WsClientEvent.USE_HINT:
          const hint = await mockSessionApi.getHint(sessionId);
          onMessageRef.current({ event: WsServerEvent.HINT_TEXT, hint });
          break;
        case WsClientEvent.END_SESSION:
          setTimeout(
            () =>
              onMessageRef.current({
                event: WsServerEvent.SCORING_COMPLETE,
                session_id: sessionId,
              }),
            200,
          );
          break;
      }
    },
    [sessionId],
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
        console.warn("[WS] Cannot send — not connected", payload.action);
      }
    },
    [isDevMock, handleMockPayload],
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
    // Mock mode: không cần kết nối thật
    if (isDevMock) {
      reconnectAttemptRef.current = 0;
      shouldReconnectRef.current = true;
      setConnState("connected");
      return () => {
        setConnState("disconnected");
      };
    }

    // Guard: bỏ qua nếu thiếu thông tin cần thiết
    if (!idToken || !sessionId || !WS_BASE) {
      console.warn("[WS] Bỏ qua kết nối: thiếu idToken, sessionId hoặc WS_BASE");
      return;
    }

    shouldReconnectRef.current = true;
    reconnectAttemptRef.current = 0;
    let currentWs: WebSocket | null = null;

    function openConnection() {
      // Đóng kết nối cũ nếu còn tồn tại
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      const url = buildWebSocketUrl(WS_BASE, idToken, sessionId);
      console.log(`[WS] Đang kết nối... session=${sessionId} attempt=${reconnectAttemptRef.current}`);

      const ws = new WebSocket(url);
      currentWs = ws;
      wsRef.current = ws;
      setConnState("connecting");

      ws.onopen = () => {
        if (wsRef.current !== ws) return; // Bỏ qua nếu đã bị thay thế
        console.log("[WS] Đã kết nối");
        reconnectAttemptRef.current = 0;
        setConnState("connected");
      };

      ws.onmessage = (ev: MessageEvent) => {
        if (wsRef.current !== ws) return;
        try {
          const payload = JSON.parse(ev.data as string) as WsServerPayload;
          onMessageRef.current(payload);
        } catch {
          console.error("[WS] Không thể parse message:", ev.data);
        }
      };

      ws.onclose = (ev: CloseEvent) => {
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
        console.warn(`[WS] Đã đóng: code=${ev.code} reason="${ev.reason}" wasClean=${ev.wasClean}`);

        if (!shouldReconnectRef.current) return;

        // Code 1000/1001 = đóng bình thường, không reconnect
        if (ev.code === 1000 || ev.code === 1001) return;

        const attempt = reconnectAttemptRef.current;
        if (attempt >= RECONNECT_MAX_ATTEMPTS) {
          console.warn(`[WS] Đã đạt giới hạn reconnect (${attempt})`);
          setConnState("error");
          return;
        }

        const delay = Math.min(RECONNECT_BASE_MS * 2 ** attempt, RECONNECT_MAX_MS);
        reconnectAttemptRef.current += 1;
        setConnState("reconnecting");

        console.log(`[WS] Sẽ reconnect sau ${delay}ms (attempt ${reconnectAttemptRef.current})`);
        reconnectTimerRef.current = setTimeout(() => {
          if (shouldReconnectRef.current) {
            openConnection();
          }
        }, delay);
      };

      ws.onerror = () => {
        // onerror luôn được theo sau bởi onclose, không cần xử lý thêm ở đây
        // chỉ log để debug
        if (wsRef.current === ws) {
          const state = ws.readyState;
          console.error(
            `[WS] Lỗi kết nối: url=${WS_BASE} readyState=${state} attempt=${reconnectAttemptRef.current}`,
          );
        }
      };
    }

    // Delay lần kết nối đầu tiên nếu được cấu hình (tránh race condition khi navigate)
    if (initialDelayMs && initialDelayMs > 0) {
      const delayTimer = setTimeout(openConnection, initialDelayMs);
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

    openConnection();

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
  }, [sessionId, idToken, isDevMock, initialDelayMs]);

  return { connectionState, send, disconnect };
}
