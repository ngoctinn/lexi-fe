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

  const requestHint = React.useCallback(() => {
    // UI TEST: Mocking hint response for development
    setUi((s) => ({ ...s, currentHint: null })); // reset
    
    // Send actual WS event
    send({ action: WsClientEvent.USE_HINT, session_id: sessionId });

    // Mock local response for testing
    setTimeout(() => {
      setUi((s) => ({
        ...s,
        currentHint: "I would like to order a double espresso, please.",
        hintPanelOpen: true,
      }));
    }, 1000);
  }, [send, sessionId]);

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
      is_hint_used: false, // will update if needed, normally text messages don't mark hint here
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

  const translateTurn = React.useCallback((turnIndex: number) => {
    // MOCK: In real app, this sends WS event or calls server action
    // session_id is accessible via sessionId from props
    setUi((s) => ({
      ...s,
      turns: s.turns.map((t) => 
        t.turn_index === turnIndex 
          ? { ...t, translated_content: "Đang yêu cầu bản dịch..." } 
          : t
      ),
    }));

    // Mock delay for translation
    setTimeout(() => {
      setUi((s) => ({
        ...s,
        turns: s.turns.map((t) => 
          t.turn_index === turnIndex 
            ? { ...t, translated_content: "Đây là bản dịch mẫu cho câu hội thoại này." } 
            : t
        ),
      }));
    }, 1000);
  }, []);

  return {
    ui: { ...ui, wsState: connectionState },
    uploadProgress,
    actions: {
      startSession,
      startRecording,
      stopRecording,
      requestHint,
      skipTurn,
      endSession,
      toggleHintPanel,
      translateTurn,
      sendMessage,
    },
  };
}
