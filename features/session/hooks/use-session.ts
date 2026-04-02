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
  SessionStatus,
} from "@/features/session/types/session.types";
import { toast } from "sonner";
import { useWebSocket } from "./use-websocket";
import { useAudioRecorder } from "./use-audio-recorder";

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

  // --- Handle incoming WS messages ---
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

      case WsServerEvent.TURN_SAVED:
        // Backend confirms turn was persisted — nothing extra needed in UI
        break;

      case WsServerEvent.HINT_TEXT:
        setUi((s) => ({
          ...s,
          currentHint: event.hint,
          hintPanelOpen: true,
        }));
        break;

      case WsServerEvent.SCORING_COMPLETE:
        // Redirect handled by parent component via callback
        setUi((s) => ({ ...s, wsState: "disconnected" }));
        break;

      case WsServerEvent.ERROR:
        toast.error(`Máy chủ báo lỗi: ${event.message}`);
        console.error("[WS server error]", event.message);
        break;
    }
  }, []);

  // --- WebSocket ---
  const { connectionState, send, disconnect } = useWebSocket({
    sessionId,
    idToken,
    onMessage: handleWsMessage,
    onConnectionChange: (wsState) => setUi((s) => ({ ...s, wsState })),
  });

  // --- Audio Recorder ---
  const { state: recorderState, startRecording, stopRecording, uploadProgress } = useAudioRecorder({
    onRecordingComplete: (s3Key) => {
      send({ action: WsClientEvent.AUDIO_UPLOADED, session_id: sessionId, s3_key: s3Key });
    },
    onError: (message) => {
      toast.error(message);
      setUi((s) => ({ ...s, recorderState: "error" }));
    },
  });

  // Sync recorder state into UI state
  React.useEffect(() => {
    setUi((s) => ({ ...s, recorderState }));
  }, [recorderState]);

  // --- Derived actions ---
  const startSession = React.useCallback(() => {
    send({ action: WsClientEvent.START_SESSION, session_id: sessionId });
  }, [send, sessionId]);

  const requestHint = React.useCallback(async () => {
    setUi((s) => ({ ...s, currentHint: null })); // reset
    send({ action: WsClientEvent.USE_HINT, session_id: sessionId });

    // Mock local response for testing
    if (process.env.NODE_ENV === "development") {
      const { mockSessionService } = await import("../api/session-mock");
      const hint = await mockSessionService.getHint(sessionId);
      setUi((s) => ({
        ...s,
        currentHint: hint,
        hintPanelOpen: true,
      }));
    }
  }, [send, sessionId]);

  const toggleMic = React.useCallback(async () => {
    if (recorderState === "recording") {
      stopRecording();
    } else {
      const { mockSessionService } = await import("../api/session-mock");
      const targetUrl = ui.uploadUrl ?? mockSessionService.getMockUploadUrl();
      const s3Key = mockSessionService.generateUploadKey(sessionId);
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
    
    // Optimistic UI update: add user turn locally
    const newTurn: Turn = {
      turn_index: ui.turns.length,
      speaker: TurnSpeaker.USER,
      content: text,
      created_at: new Date().toISOString(),
      is_hint_used: false,
      is_skipped: false,
    };

    setUi((s) => ({ ...s, turns: [...s.turns, newTurn] }));
    
    send({ 
      action: WsClientEvent.SEND_MESSAGE, 
      session_id: sessionId, 
      text 
    });
  }, [send, sessionId, ui.turns.length]);

  const toggleHintPanel = React.useCallback(() => {
    setUi((s) => ({ ...s, hintPanelOpen: !s.hintPanelOpen }));
  }, []);

  const translateTurn = React.useCallback(async (turnIndex: number) => {
    setUi((s) => ({
      ...s,
      turns: s.turns.map((t) => 
        t.turn_index === turnIndex 
          ? { ...t, translated_content: "Đang yêu cầu bản dịch..." } 
          : t
      ),
    }));

    if (process.env.NODE_ENV === "development") {
      const { mockSessionService } = await import("../api/session-mock");
      const translation = await mockSessionService.translateTurn(sessionId, turnIndex);
      setUi((s) => ({
        ...s,
        turns: s.turns.map((t) => 
          t.turn_index === turnIndex 
            ? { ...t, translated_content: translation } 
            : t
        ),
      }));
    }
  }, [sessionId]);

  return {
    ui: { ...ui, wsState: connectionState },
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
