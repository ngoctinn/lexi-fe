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

import { useSessionStore } from "../stores/use-session-store";

interface UseSessionOptions {
  sessionId: string;
  idToken: string;
  initialTurns?: Turn[];
}

export function useSession({ sessionId, idToken, initialTurns = [] }: UseSessionOptions) {
  const store = useSessionStore();
  
  // React 19 useOptimistic for immediate UI feedback on turns
  const [optimisticTurns, addOptimisticTurn] = React.useOptimistic<Turn[], string>(
    store.turns,
    (state, text) => [
      ...state,
      {
        turn_index: state.length,
        speaker: TurnSpeaker.USER,
        content: text,
        is_hint_used: false,
        is_pending: true, // Custom flag for premium UI feedback
      } as Turn
    ]
  );

  // Sync initial turns once
  React.useEffect(() => {
    if (initialTurns.length > 0 && store.turns.length === 0) {
      store.setTurns(initialTurns);
    }
  }, [initialTurns, store]);

  // --- WebSocket Message Orchestration ---
  const handleWsMessage = React.useCallback((event: WsServerPayload) => {
    switch (event.event) {
      case WsServerEvent.SESSION_READY:
        store.setUploadUrls(event.upload_url);
        break;

      case WsServerEvent.STT_RESULT:
        store.setLastSttResult({ text: event.text, confidence: event.confidence });
        break;

      case WsServerEvent.STT_LOW_CONFIDENCE:
        store.setLastSttResult({ text: "", confidence: event.confidence });
        store.setRecorderState("idle");
        break;

      case WsServerEvent.AI_TEXT_CHUNK:
        store.setAiStreaming(!event.done, event.done ? "" : store.aiStreamingText + event.chunk);
        
        // If done, we might want to refresh turns from API or add the AI turn
        if (event.done) {
          // You might fetch updated turns here using React Query invalidate
        }
        break;

      case WsServerEvent.AI_AUDIO_URL:
        // Handle audio...
        break;

      case WsServerEvent.HINT_TEXT:
        store.setHint(event.hint);
        store.setHintPanelOpen(true);
        break;

      case WsServerEvent.ERROR:
        SessionService.handleError(event.message, "WebSocket");
        break;
      
      default:
        break;
    }
  }, [store]);

  // --- WebSocket infrastructure ---
  const { connectionState, send, disconnect } = useWebSocket({
    sessionId,
    idToken,
    onMessage: handleWsMessage,
    onConnectionChange: (wsState) => store.setWsState(wsState),
  });

  // --- Audio infrastructure ---
  const { state: recorderState, startRecording, stopRecording, uploadProgress } = useAudioRecorder({
    onRecordingComplete: (s3Key) => {
      send({ action: WsClientEvent.AUDIO_UPLOADED, session_id: sessionId, s3_key: s3Key });
    },
    onError: (message) => {
      SessionService.handleError(message, "Recorder");
      store.setRecorderState("error");
    },
  });

  // Keep store recorder state in sync
  React.useEffect(() => {
    store.setRecorderState(recorderState);
  }, [recorderState, store]);

  // --- Actions ---

  const sendMessage = React.useCallback((text: string) => {
    if (!text.trim()) return;
    
    // React 19 Optimistic Update
    React.startTransition(() => {
      addOptimisticTurn(text);
    });

    // Real turn added to store (actually usually we wait for server ack or add it next)
    const newTurn: Turn = {
      turn_index: store.turns.length,
      speaker: TurnSpeaker.USER,
      content: text,
      is_hint_used: false,
    };
    store.setTurns((prev) => [...prev, newTurn]);

    send({ action: WsClientEvent.SEND_MESSAGE, session_id: sessionId, text });
  }, [send, sessionId, store, addOptimisticTurn]);

  const startSession = React.useCallback(() => {
    send({ action: WsClientEvent.START_SESSION, session_id: sessionId });
  }, [send, sessionId]);

  const requestHint = React.useCallback(async () => {
    store.setHint(null);
    send({ action: WsClientEvent.USE_HINT, session_id: sessionId });

    // Parallel fetch mock if in dev
    if (process.env.NODE_ENV === "development") {
      const hint = await SessionService.getHint(sessionId);
      store.setHint(hint);
      store.setHintPanelOpen(true);
    }
  }, [send, sessionId, store]);

  const toggleMic = React.useCallback(async () => {
    if (recorderState === "recording") {
      stopRecording();
    } else {
      const targetUrl = store.uploadUrl || "https://mock-upload.com";
      const s3Key = `sessions/${sessionId}/${Date.now()}.webm`;
      startRecording(targetUrl, s3Key);
    }
  }, [recorderState, stopRecording, startRecording, store.uploadUrl, sessionId]);

  const endSession = React.useCallback(() => {
    send({ action: WsClientEvent.END_SESSION, session_id: sessionId });
    disconnect();
  }, [send, disconnect, sessionId]);

  const translateTurn = React.useCallback(async (turnIndex: number) => {
    store.setTurns((prev) => prev.map((t) => 
      t.turn_index === turnIndex 
        ? { ...t, translated_content: "Đang yêu cầu bản dịch..." } 
        : t
    ));

    try {
      const translation = await SessionService.translateTurn(sessionId, turnIndex);
      store.setTurns((prev) => prev.map((t) => 
        t.turn_index === turnIndex ? { ...t, translated_content: translation } : t
      ));
    } catch (err: any) {
      SessionService.handleError(err.message, "Translation");
    }
  }, [sessionId, store]);

  const toggleHintPanel = React.useCallback(() => {
    store.setHintPanelOpen(!store.hintPanelOpen);
  }, [store]);

  return {
    ui: { 
      ...store, 
      turns: optimisticTurns, // Sử dụng optimistic turns cho UI mượt mà
      wsState: connectionState,
      isControlsDisabled: SessionDomain.isControlsDisabled(connectionState, recorderState, store.isAiStreaming)
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
    },
  };
}
