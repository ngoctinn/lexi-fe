"use client";

import * as React from "react";
import type {
  Turn,
  WsServerPayload,
  SessionUiState,
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

interface UseSessionOptions {
  sessionId: string;
  idToken: string;
  initialTurns?: Turn[];
}

const INITIAL_STATE: SessionUiState = {
  turns: [],
  aiStreamingText: "",
  isAiStreaming: false,
  lastSttResult: null,
  currentHint: null,
  hintPanelOpen: false,
  recorderState: "idle",
  wsState: "disconnected",
  currentAudioUrl: null,
  uploadUrl: null,
};

export function useSession({ sessionId, idToken, initialTurns = [] }: UseSessionOptions) {
  const [ui, setUi] = React.useState<SessionUiState>({
    ...INITIAL_STATE,
    turns: initialTurns,
  });

  // --- WebSocket Message Orchestration ---
  const handleWsMessage = React.useCallback((event: WsServerPayload) => {
    switch (event.event) {
      case WsServerEvent.SESSION_READY:
        setUi((s) => ({ ...s, uploadUrl: event.upload_url }));
        break;

      case WsServerEvent.STT_RESULT:
        setUi((s) => ({
          ...s,
          lastSttResult: { text: event.text, confidence: event.confidence },
        }));
        break;

      case WsServerEvent.STT_LOW_CONFIDENCE:
        setUi((s) => ({
          ...s,
          lastSttResult: { text: "", confidence: event.confidence },
          recorderState: "idle",
        }));
        break;

      case WsServerEvent.AI_TEXT_CHUNK:
        setUi((s) => ({
          ...s,
          isAiStreaming: !event.done,
          aiStreamingText: event.done ? "" : s.aiStreamingText + event.chunk,
        }));
        break;

      case WsServerEvent.AI_AUDIO_URL:
        setUi((s) => ({ ...s, currentAudioUrl: event.url }));
        break;

      case WsServerEvent.HINT_TEXT:
        setUi((s) => ({
          ...s,
          currentHint: event.hint,
          hintPanelOpen: true,
        }));
        break;

      case WsServerEvent.SCORING_COMPLETE:
        setUi((s) => ({ ...s, wsState: "disconnected" }));
        break;

      case WsServerEvent.ERROR:
        SessionService.handleError(event.message, "WebSocket");
        break;
      
      default:
        break;
    }
  }, []);

  // --- WebSocket infrastructure ---
  const { connectionState, send, disconnect } = useWebSocket({
    sessionId,
    idToken,
    onMessage: handleWsMessage,
    onConnectionChange: (wsState) => setUi((s) => ({ ...s, wsState })),
  });

  // --- Audio infrastructure ---
  const { state: recorderState, startRecording, stopRecording, uploadProgress } = useAudioRecorder({
    onRecordingComplete: (s3Key) => {
      send({ action: WsClientEvent.AUDIO_UPLOADED, session_id: sessionId, s3_key: s3Key });
    },
    onError: (message) => {
      SessionService.handleError(message, "Recorder");
      setUi((s) => ({ ...s, recorderState: "error" }));
    },
  });

  // Keep recorder state in sync
  React.useEffect(() => {
    setUi((s) => ({ ...s, recorderState }));
  }, [recorderState]);

  // --- Active Actions ---

  const startSession = React.useCallback(() => {
    send({ action: WsClientEvent.START_SESSION, session_id: sessionId });
  }, [send, sessionId]);

  const requestHint = React.useCallback(async () => {
    setUi((s) => ({ ...s, currentHint: null })); // reset
    send({ action: WsClientEvent.USE_HINT, session_id: sessionId });

    // Parallel fetch mock if in dev
    if (process.env.NODE_ENV === "development") {
      const hint = await SessionService.getHint(sessionId);
      setUi((s) => ({ ...s, currentHint: hint, hintPanelOpen: true }));
    }
  }, [send, sessionId]);

  const toggleMic = React.useCallback(async () => {
    if (recorderState === "recording") {
      stopRecording();
    } else {
      // In development, we use mock upload url if backend didn't provide one
      const targetUrl = ui.uploadUrl || "https://mock-upload.com";
      const s3Key = `sessions/${sessionId}/${Date.now()}.webm`;
      startRecording(targetUrl, s3Key);
    }
  }, [recorderState, stopRecording, startRecording, ui.uploadUrl, sessionId]);

  const skipTurn = React.useCallback(() => {
    send({ action: WsClientEvent.SKIP_TURN, session_id: sessionId });
  }, [send, sessionId]);

  const endSession = React.useCallback(() => {
    send({ action: WsClientEvent.END_SESSION, session_id: sessionId });
    disconnect();
  }, [send, disconnect, sessionId]);

  const sendMessage = React.useCallback((text: string) => {
    if (!text.trim()) return;
    
    // Add User Turn local/optimistic
    const newTurn: Turn = {
      turn_index: ui.turns.length,
      speaker: TurnSpeaker.USER,
      content: text,
      created_at: new Date().toISOString(),
      is_hint_used: false,
      is_skipped: false,
    };

    setUi((s) => ({ ...s, turns: [...s.turns, newTurn] }));
    send({ action: WsClientEvent.SEND_MESSAGE, session_id: sessionId, text });
  }, [send, sessionId, ui.turns.length]);

  const translateTurn = React.useCallback(async (turnIndex: number) => {
    // Initial UI signal
    setUi((s) => ({
      ...s,
      turns: s.turns.map((t) => 
        t.turn_index === turnIndex 
          ? { ...t, translated_content: "Đang yêu cầu bản dịch..." } 
          : t
      ),
    }));

    try {
      const translation = await SessionService.translateTurn(sessionId, turnIndex);
      setUi((s) => ({
        ...s,
        turns: s.turns.map((t) => 
          t.turn_index === turnIndex ? { ...t, translated_content: translation } : t
        ),
      }));
    } catch (err: any) {
      SessionService.handleError(err.message, "Translation");
    }
  }, [sessionId]);

  const toggleHintPanel = React.useCallback(() => {
    setUi((s) => ({ ...s, hintPanelOpen: !s.hintPanelOpen }));
  }, []);

  return {
    ui: { 
      ...ui, 
      wsState: connectionState,
      isControlsDisabled: SessionDomain.isControlsDisabled(connectionState, recorderState, ui.isAiStreaming)
    },
    uploadProgress,
    actions: {
      startSession,
      toggleMic,
      requestHint,
      skipTurn,
      endSession,
      toggleHintPanel,
      translateTurn,
      sendMessage,
    },
  };
}
