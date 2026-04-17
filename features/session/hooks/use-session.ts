"use client";

import * as React from "react";
import type {
  Turn,
  WsServerPayload,
} from "@/features/session/types/session.types";
import {
  WsServerEvent,
  WsClientEvent,
  TurnSpeaker,
} from "@/features/session/types/session.types";
import { useWebSocket } from "./use-websocket";
import { useAudioRecorder } from "./use-audio-recorder";
import { SessionService } from "../api/session.service";
import { SessionDomain } from "../domain/session.logic";

import { useSessionStore } from "../stores/use-session-store";

interface UseSessionOptions {
  sessionId: string;
  idToken: string;
  initialTurns?: Turn[];
}

export function useSession({
  sessionId,
  idToken,
  initialTurns = [],
}: UseSessionOptions) {
  // Select specific pieces from the store to avoid subscribing to the whole store
  const turns = useSessionStore((s) => s.turns);
  const uploadUrl = useSessionStore((s) => s.uploadUrl);
  const hintPanelOpen = useSessionStore((s) => s.hintPanelOpen);
  const isAiStreaming = useSessionStore((s) => s.isAiStreaming);

  // Select additional pieces that should trigger re-renders when changed
  const aiStreamingText = useSessionStore((s) => s.aiStreamingText);
  const lastSttResult = useSessionStore((s) => s.lastSttResult);
  const currentHint = useSessionStore((s) => s.currentHint);
  const recorderStateFromStore = useSessionStore((s) => s.recorderState);
  const currentAudioUrl = useSessionStore((s) => s.currentAudioUrl);

  const setTurns = useSessionStore((s) => s.setTurns);
  const setUploadUrls = useSessionStore((s) => s.setUploadUrls);
  const setLastSttResult = useSessionStore((s) => s.setLastSttResult);
  const setRecorderState = useSessionStore((s) => s.setRecorderState);
  const setAiStreamingText = useSessionStore((s) => s.setAiStreamingText);
  const setAiStreaming = useSessionStore((s) => s.setAiStreaming);
  const setHint = useSessionStore((s) => s.setHint);
  const setHintPanelOpen = useSessionStore((s) => s.setHintPanelOpen);
  const setCurrentAudioUrl = useSessionStore((s) => s.setCurrentAudioUrl);
  const resetSessionState = useSessionStore((s) => s.reset);

  // Reset state khi đổi session để không leak dữ liệu giữa các phiên.
  React.useEffect(() => {
    resetSessionState();
  }, [resetSessionState, sessionId]);

  // Chỉ nạp turns ban đầu sau khi đã reset state.
  React.useEffect(() => {
    if (initialTurns.length > 0 && turns.length === 0) {
      setTurns(initialTurns);
    }
  }, [initialTurns, turns, setTurns]);

  // --- WebSocket Message Orchestration ---
  const handleWsMessage = React.useCallback(
    (event: WsServerPayload) => {
      switch (event.event) {
        case WsServerEvent.SESSION_READY:
          setUploadUrls(event.upload_url);
          break;

        case WsServerEvent.STT_RESULT:
          setLastSttResult({ text: event.text, confidence: event.confidence });
          break;

        case WsServerEvent.STT_LOW_CONFIDENCE:
          setLastSttResult({ text: "", confidence: event.confidence });
          setRecorderState("idle");
          break;

        case WsServerEvent.AI_TEXT_CHUNK:
          if (event.done) {
            const finalText = `${useSessionStore.getState().aiStreamingText}${event.chunk}`;
            const currentAudioUrl = useSessionStore.getState().currentAudioUrl;

            if (finalText.trim().length > 0) {
              setTurns((prev: Turn[]) => [
                ...prev,
                {
                  turn_index: prev.length,
                  speaker: TurnSpeaker.AI,
                  content: finalText,
                  audio_url: currentAudioUrl,
                  is_hint_used: false,
                },
              ]);
            }

            setAiStreamingText("");
            setAiStreaming(false, "");
          } else {
            setAiStreamingText((prev) => prev + event.chunk);
            setAiStreaming(true);
          }
          break;

        case WsServerEvent.TURN_SAVED:
          setTurns((prev: Turn[]) =>
            prev.map((turn: Turn) =>
              turn.turn_index === event.turn_index
                ? { ...turn, is_pending: false }
                : turn,
            ),
          );
          break;

        case WsServerEvent.AI_AUDIO_URL:
          setCurrentAudioUrl(event.url);
          setTurns((prev: Turn[]) => {
            const next = [...prev];

            for (let index = next.length - 1; index >= 0; index -= 1) {
              if (next[index].speaker === TurnSpeaker.AI) {
                next[index] = {
                  ...next[index],
                  audio_url: event.url,
                };
                break;
              }
            }

            return next;
          });
          break;

        case WsServerEvent.HINT_TEXT:
          setHint(event.hint);
          setHintPanelOpen(true);
          break;

        case WsServerEvent.ERROR:
          SessionService.handleError(event.message, "WebSocket");
          break;

        default:
          break;
      }
    },
    [
      setUploadUrls,
      setLastSttResult,
      setRecorderState,
      setAiStreamingText,
      setAiStreaming,
      setTurns,
      setHint,
      setHintPanelOpen,
      setCurrentAudioUrl,
    ],
  );

  // --- WebSocket infrastructure ---
  const { connectionState, send, disconnect } = useWebSocket({
    sessionId,
    idToken,
    onMessage: handleWsMessage,
    onConnectionChange: (wsState) =>
      useSessionStore.getState().setWsState(wsState),
  });

  // --- Audio infrastructure ---
  const {
    state: recorderState,
    startRecording,
    stopRecording,
    uploadProgress,
  } = useAudioRecorder({
    onRecordingComplete: (s3Key) => {
      send({
        action: WsClientEvent.AUDIO_UPLOADED,
        session_id: sessionId,
        s3_key: s3Key,
      });
    },
    onError: (message) => {
      SessionService.handleError(message, "Recorder");
      setRecorderState("error");
    },
  });

  // Keep store recorder state in sync
  React.useEffect(() => {
    setRecorderState(recorderState);
  }, [recorderState, setRecorderState]);

  // --- Actions ---

  const sendMessage = React.useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const newTurn: Turn = {
        turn_index: turns.length,
        speaker: TurnSpeaker.USER,
        content: text,
        is_hint_used: false,
        is_pending: true,
      };
      setTurns((prev: Turn[]) => [...prev, newTurn]);

      send({ action: WsClientEvent.SEND_MESSAGE, session_id: sessionId, text });
    },
    [send, sessionId, setTurns, turns.length],
  );

  const startSession = React.useCallback(() => {
    send({ action: WsClientEvent.START_SESSION, session_id: sessionId });
  }, [send, sessionId]);

  const requestHint = React.useCallback(async () => {
    setHint(null);
    send({ action: WsClientEvent.USE_HINT, session_id: sessionId });

    // Parallel fetch mock if in dev
    if (process.env.NODE_ENV === "development") {
      const hint = await SessionService.getHint(sessionId);
      setHint(hint);
      setHintPanelOpen(true);
    }
  }, [send, sessionId, setHint, setHintPanelOpen]);

  const toggleMic = React.useCallback(async () => {
    if (recorderState === "recording") {
      stopRecording();
    } else {
      const targetUrl = uploadUrl || "https://mock-upload.com";
      const s3Key = `sessions/${sessionId}/${Date.now()}.webm`;
      startRecording(targetUrl, s3Key);
    }
  }, [recorderState, stopRecording, startRecording, uploadUrl, sessionId]);

  const endSession = React.useCallback(() => {
    send({ action: WsClientEvent.END_SESSION, session_id: sessionId });
    disconnect();
  }, [send, disconnect, sessionId]);

  const translateTurn = React.useCallback(
    async (turnIndex: number) => {
      setTurns((prev: Turn[]) =>
        prev.map((t: Turn) =>
          t.turn_index === turnIndex
            ? { ...t, translated_content: "Đang yêu cầu bản dịch..." }
            : t,
        ),
      );

      try {
        const translation = await SessionService.translateTurn(
          sessionId,
          turnIndex,
        );
        setTurns((prev: Turn[]) =>
          prev.map((t: Turn) =>
            t.turn_index === turnIndex
              ? { ...t, translated_content: translation }
              : t,
          ),
        );
      } catch (err) {
        SessionService.handleError(
          err instanceof Error ? err.message : "Đã xảy ra lỗi dịch.",
          "Translation",
        );
      }
    },
    [sessionId, setTurns],
  );

  const toggleHintPanel = React.useCallback(() => {
    setHintPanelOpen(!hintPanelOpen);
  }, [setHintPanelOpen, hintPanelOpen]);

  return {
    ui: {
      turns,
      aiStreamingText,
      isAiStreaming,
      lastSttResult,
      currentHint,
      hintPanelOpen,
      recorderState: recorderStateFromStore,
      wsState: connectionState,
      currentAudioUrl,
      uploadUrl: uploadUrl,
      isControlsDisabled: SessionDomain.isControlsDisabled(
        connectionState,
        recorderState,
        isAiStreaming,
      ),
    },
    uploadProgress,
    actions: {
      startSession,
      toggleMic,
      requestHint,
      endSession,
      toggleHintPanel,
      translateTurn,
      sendMessage,
      setCurrentAudioUrl,
    },
  };
}
