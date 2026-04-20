"use client";

import * as React from "react";
import type { Turn } from "@/features/session/types/session.types";
import {
  WsClientEvent,
  TurnSpeaker,
} from "@/features/session/types/session.types";
import { useWebSocket } from "./use-websocket";
import { useAudioRecorder } from "./use-audio-recorder";
import { SessionService } from "../api/session.service";
import { SessionDomain } from "../domain/session.logic";

import { useSessionStore } from "../stores/use-session-store";

import { useSessionWsHandler } from "./use-session-ws-handler";

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
  const turns = useSessionStore((s) => s.turns);
  const uploadUrl = useSessionStore((s) => s.uploadUrl);
  const hintPanelOpen = useSessionStore((s) => s.hintPanelOpen);
  const isAiStreaming = useSessionStore((s) => s.isAiStreaming);

  const aiStreamingText = useSessionStore((s) => s.aiStreamingText);
  const lastSttResult = useSessionStore((s) => s.lastSttResult);
  const currentHint = useSessionStore((s) => s.currentHint);
  const recorderStateFromStore = useSessionStore((s) => s.recorderState);
  const currentAudioUrl = useSessionStore((s) => s.currentAudioUrl);

  const setTurns = useSessionStore((s) => s.setTurns);
  const setRecorderState = useSessionStore((s) => s.setRecorderState);
  const setHint = useSessionStore((s) => s.setHint);
  const setHintPanelOpen = useSessionStore((s) => s.setHintPanelOpen);
  const setCurrentAudioUrl = useSessionStore((s) => s.setCurrentAudioUrl);
  const resetSessionState = useSessionStore((s) => s.reset);

  const { handleWsMessage } = useSessionWsHandler();

  React.useEffect(() => {
    resetSessionState();
  }, [resetSessionState, sessionId]);

  React.useEffect(() => {
    if (initialTurns.length > 0 && turns.length === 0) {
      setTurns(initialTurns);
    }
  }, [initialTurns, turns, setTurns]);

  const { connectionState, send, disconnect } = useWebSocket({
    sessionId,
    idToken,
    onMessage: handleWsMessage,
    onConnectionChange: (wsState) =>
      useSessionStore.getState().setWsState(wsState),
  });

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

  React.useEffect(() => {
    setRecorderState(recorderState);
  }, [recorderState, setRecorderState]);

  const sendMessage = React.useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const nextTurnIndex = useSessionStore.getState().turns.length;
      const newTurn: Turn = {
        turn_index: nextTurnIndex,
        speaker: TurnSpeaker.USER,
        content: text,
        is_hint_used: false,
        is_pending: true,
      };
      setTurns((prev: Turn[]) => [...prev, newTurn]);

      send({ action: WsClientEvent.SEND_MESSAGE, session_id: sessionId, text });
    },
    [send, sessionId, setTurns],
  );

  const startSession = React.useCallback(() => {
    send({ action: WsClientEvent.START_SESSION, session_id: sessionId });
  }, [send, sessionId]);

  const requestHint = React.useCallback(async () => {
    setHint(null);
    send({ action: WsClientEvent.USE_HINT, session_id: sessionId });

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
