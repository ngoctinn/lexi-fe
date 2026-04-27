"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Turn } from "@/features/session/types/session.types";
import {
  WsClientEvent,
  TurnSpeaker,
} from "@/features/session/types/session.types";
import type { TranslateWordResult } from "@/features/session/actions/translate-word";
import { useWebSocket } from "./use-websocket";
import { useClientStreamingRecorder } from "./use-client-streaming-recorder";
import { SessionService } from "../api/session.service";
import { SessionDomain } from "../domain/session.logic";

import { useSessionStore } from "../stores/use-session-store";

import { useSessionWsHandler } from "./use-session-ws-handler";

interface UseSessionOptions {
  sessionId: string;
  idToken: string;
  sessionLevel: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  initialTurns?: Turn[];
  isNewSession?: boolean;
}

export function useSession({
  sessionId,
  idToken,
  sessionLevel,
  initialTurns = [],
  isNewSession,
}: UseSessionOptions) {
  const [savingFlashcardTurnIndexes, setSavingFlashcardTurnIndexes] =
    React.useState<number[]>([]);

  // Debug logging
  React.useEffect(() => {
    console.log("[useSession] Initialized with:", {
      sessionId: sessionId?.substring(0, 8) + "..." || "undefined",
      idTokenLength: idToken?.length || 0,
      initialTurnsCount: initialTurns?.length || 0,
      isNewSession,
    });
  }, [sessionId, idToken, initialTurns, isNewSession]);

  const turns = useSessionStore((s) => s.turns);
  const hintPanelOpen = useSessionStore((s) => s.hintPanelOpen);
  const isAiStreaming = useSessionStore((s) => s.isAiStreaming);

  const currentHint = useSessionStore((s) => s.currentHint);
  const hintHistory = useSessionStore((s) => s.hintHistory);
  const tempAnalysis = useSessionStore((s) => s.tempAnalysis);
  const analysisHistory = useSessionStore((s) => s.analysisHistory);
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
    initialDelayMs: isNewSession ? 1500 : undefined,
  });

  const {
    state: streamingRecorderState,
    startRecording: startStreamingRecording,
    stopRecording: stopStreamingRecording,
    cancelRecording: cancelStreamingRecording,
  } = useClientStreamingRecorder({
    ws: { send, connectionState, disconnect },
    sessionId,
    sessionLevel, // Pass user level for adaptive timeout
    onPartialTranscript: (text) => {
      console.log("[Session] Partial transcript:", text);
    },
    onFinalTranscript: (text, confidence) => {
      console.log("[Session] Final transcript:", text, confidence);
    },
    onError: (message) => {
      SessionService.handleError(message, "Streaming Recorder");
      setRecorderState("error");
    },
  });

  React.useEffect(() => {
    setRecorderState(streamingRecorderState);
  }, [streamingRecorderState, setRecorderState]);

  const sendMessage = React.useCallback(
    (text: string) => {
      if (!text.trim()) return;

      // Calculate turn_index excluding partial turns
      const currentTurns = useSessionStore.getState().turns;
      const nextTurnIndex = currentTurns.filter(t => !t.is_partial).length;
      
      const newTurn: Turn = {
        turn_index: nextTurnIndex,
        speaker: TurnSpeaker.USER,
        content: text,
        is_hint_used: false,
        is_pending: true,
      };
      setTurns((prev: Turn[]) => [...prev, newTurn]);

      // Show loading animation while waiting for AI response
      useSessionStore.getState().setAiStreaming(true);

      send({ action: WsClientEvent.SEND_MESSAGE, session_id: sessionId, text });
    },
    [send, sessionId, setTurns],
  );

  const startSession = React.useCallback(() => {
    useSessionStore.getState().setIsStartingSession(true);
    send({ action: WsClientEvent.START_SESSION, session_id: sessionId });
  }, [send, sessionId]);

  const requestHint = React.useCallback(() => {
    const state = useSessionStore.getState();
    
    console.log("[useSession] requestHint called - checking flag:", state.requestHintInProgress);
    
    // Prevent double calls
    if (state.requestHintInProgress) {
      console.log("[useSession] requestHint already in progress, skipping");
      return;
    }
    
    console.log("[useSession] requestHint proceeding - setting flag to true");
    state.setRequestHintInProgress(true);
    
    // Clear current hint to prepare for new one (streaming will show in currentHint)
    setHint(null);
    
    // Set timeout to reset flag if no response from backend
    const timeoutId = setTimeout(() => {
      console.log("[useSession] requestHint timeout - resetting flag");
      useSessionStore.getState().setRequestHintInProgress(false);
      SessionService.handleError("Hint system is temporarily unavailable. Please try again in a few seconds.", "Hint");
    }, 15000); // 15 second timeout
    
    // Store timeout ID in state for cleanup
    useSessionStore.getState().setHintTimeoutId(timeoutId);
    
    console.log("[useSession] Sending USE_HINT WebSocket message");
    send({ action: WsClientEvent.USE_HINT, session_id: sessionId });
  }, [send, sessionId, setHint]);

  const toggleMicRef = React.useRef(false);

  const toggleMic = React.useCallback(async () => {
    if (streamingRecorderState === "recording") {
      stopStreamingRecording();
      return;
    }
    
    // Debounce to prevent multiple rapid calls
    if (toggleMicRef.current) {
      console.warn("toggleMic start already in progress, ignoring");
      return;
    }

    toggleMicRef.current = true;

    try {
      await startStreamingRecording();
    } finally {
      toggleMicRef.current = false;
    }
  }, [streamingRecorderState, stopStreamingRecording, startStreamingRecording]);

  const cancelRecording = React.useCallback(() => {
    if (streamingRecorderState === "recording") {
      cancelStreamingRecording();
    }
  }, [streamingRecorderState, cancelStreamingRecording]);

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
        const sourceText =
          useSessionStore
            .getState()
            .turns.find((turn) => turn.turn_index === turnIndex)?.content || "";

        const translationResult = await SessionService.translateTurn(
          sourceText,
        );
        setTurns((prev: Turn[]) =>
          prev.map((t: Turn) =>
            t.turn_index === turnIndex
              ? {
                  ...t,
                  translated_content: translationResult.translatedText,
                }
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
    [setTurns],
  );

  const translateWord = React.useCallback(async (word: string, context: string): Promise<TranslateWordResult> => {
    return await SessionService.translateWord(word, context);
  }, []);

  const toggleHintPanel = React.useCallback(() => {
    setHintPanelOpen(!hintPanelOpen);
  }, [setHintPanelOpen, hintPanelOpen]);

  const analyzeTurn = React.useCallback((turnIndex: number) => {
    const state = useSessionStore.getState();
    
    console.log("[useSession] analyzeTurn called for turn:", turnIndex, "currently analyzing:", state.analyzingTurnIndex);
    
    // If already analyzing this turn, ignore (prevent duplicate requests)
    if (state.analyzingTurnIndex === turnIndex) {
      console.log("[useSession] Turn already being analyzed, ignoring");
      return;
    }
    
    // Clear temp analysis to prepare for new one (streaming will show in tempAnalysis)
    state.setTempAnalysis(null);
    
    // Mark as analyzing
    state.setAnalyzingTurnIndex(turnIndex);
    
    // Send request to backend (creates new analysis alert)
    console.log("[useSession] Sending ANALYZE_TURN request for turn:", turnIndex);
    send({ 
      action: WsClientEvent.ANALYZE_TURN, 
      session_id: sessionId,
      turn_index: turnIndex 
    });
  }, [send, sessionId]);

  const saveWordToFlashcard = React.useCallback(
    async (turnIndex: number, vocabData?: TranslateWordResult) => {
      const targetTurn = useSessionStore
        .getState()
        .turns.find((turn) => turn.turn_index === turnIndex);

      if (!targetTurn) {
        return;
      }

      if (targetTurn.is_saved_to_flashcard) {
        toast.success("Nội dung này đã được lưu trước đó.");
        return;
      }

      // Nếu không có vocabData (save từ translation panel), kiểm tra translated_content
      if (!vocabData) {
        const translatedContent = targetTurn.translated_content?.trim();
        if (
          !translatedContent ||
          translatedContent === "Đang yêu cầu bản dịch..."
        ) {
          SessionService.handleError(
            "Hãy dịch nội dung trước khi lưu flashcard.",
            "Flashcard",
          );
          return;
        }
      }

      setSavingFlashcardTurnIndexes((previous) =>
        previous.includes(turnIndex) ? previous : [...previous, turnIndex],
      );

      try {
        const result = await SessionService.saveWordToFlashcard({
          sessionId,
          turnIndex,
          sourceText: targetTurn.content,
          translatedText: vocabData?.translation_vi || targetTurn.translated_content || "",
          vocabData,
        });

        if (!result.success) {
          SessionService.handleError(result.message, "Flashcard");
          return;
        }

        setTurns((prev: Turn[]) =>
          prev.map((turn) =>
            turn.turn_index === turnIndex
              ? { ...turn, is_saved_to_flashcard: true }
              : turn,
          ),
        );

        toast.success(result.message);
      } catch (err) {
        SessionService.handleError(
          err instanceof Error ? err.message : "Không thể lưu flashcard.",
          "Flashcard",
        );
      } finally {
        setSavingFlashcardTurnIndexes((previous) =>
          previous.filter((value) => value !== turnIndex),
        );
      }
    },
    [sessionId, setTurns],
  );

  return {
    ui: {
      turns,
      isAiStreaming,
      currentHint,
      hintHistory,
      tempAnalysis,
      analysisHistory,
      hintPanelOpen,
      recorderState: recorderStateFromStore,
      wsState: connectionState,
      currentAudioUrl,
      savingFlashcardTurnIndexes,
      isControlsDisabled: SessionDomain.isControlsDisabled(
        connectionState,
        streamingRecorderState,
        isAiStreaming,
      ),
    },
    actions: {
      startSession,
      toggleMic,
      cancelRecording,
      requestHint,
      analyzeTurn,
      endSession,
      toggleHintPanel,
      translateTurn,
      translateWord,
      saveTurnToFlashcard: saveWordToFlashcard,
      sendMessage,
      setCurrentAudioUrl,
    },
  };
}
