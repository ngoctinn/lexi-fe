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
  initialTurns?: Turn[];
  isNewSession?: boolean;
}

export function useSession({
  sessionId,
  idToken,
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

  const aiStreamingText = useSessionStore((s) => s.aiStreamingText);
  const lastSttResult = useSessionStore((s) => s.lastSttResult);
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
  } = useClientStreamingRecorder({
    ws: { send, connectionState, disconnect },
    sessionId,
    onPartialTranscript: (text) => {
      console.log("[Session] Partial transcript:", text);
      useSessionStore.getState().setStreamingTranscript(
        useSessionStore.getState().streamingTranscript?.finalText || "",
        text,
        true
      );
    },
    onFinalTranscript: (text, confidence) => {
      console.log("[Session] Final transcript:", text, confidence);
      useSessionStore.getState().setStreamingTranscript(text, "", false);
      useSessionStore.getState().setLastSttResult({ text, confidence });
    },
    onError: (message) => {
      SessionService.handleError(message, "Streaming Recorder");
      useSessionStore.getState().setStreamingError(message);
      setRecorderState("error");
    },
  });

  React.useEffect(() => {
    setRecorderState(streamingRecorderState);
  }, [streamingRecorderState, setRecorderState]);

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
    console.log("[useSession] requestHint called", { sessionId });
    
    // Clear old hint first
    setHint(null);
    
    // Show loading state
    setHint({
      level: "Intermediate",
      type: "guidance",
      markdown: {
        vi: "Đang lấy gợi ý...",
        en: "Getting hint...",
      },
    });
    
    // Set timeout to clear loading state if no response
    const timeoutId = setTimeout(() => {
      console.warn("[useSession] Hint request timeout");
      state.setRequestHintInProgress(false);
      setHint({
        level: "Intermediate",
        type: "guidance",
        markdown: {
          vi: "💡 Hệ thống gợi ý đang gặp sự cố tạm thời. Vui lòng thử lại sau vài giây.",
          en: "💡 Hint system is temporarily unavailable. Please try again in a few seconds.",
        },
      });
    }, 5000);
    
    // Store timeout ID in ref to clear it when response arrives
    state.setHintTimeoutId?.(timeoutId);
    
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
      // Clear previous streaming transcript when starting new recording
      useSessionStore.getState().setStreamingTranscript("", "", false);
      useSessionStore.getState().setStreamingError(null);
      await startStreamingRecording();
    } finally {
      toggleMicRef.current = false;
    }
  }, [streamingRecorderState, stopStreamingRecording, startStreamingRecording]);

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
    
    // Check if this turn was already analyzed
    if (state.analyzedTurns.has(turnIndex)) {
      console.log("[useSession] Turn already analyzed, moving to top:", turnIndex);
      
      // Find the existing analysis
      const existingAnalysis = state.analysisHistory.find(a => a.turnIndex === turnIndex);
      if (existingAnalysis) {
        // Remove from current position
        state.removeAnalysisFromHistory(existingAnalysis.timestamp);
        
        // Add back to top with new timestamp
        state.addAnalysisToHistory(turnIndex, existingAnalysis.markdown);
      }
      return;
    }
    
    // Clear old temp analysis first
    state.setTempAnalysis(null);
    
    // Send request to backend
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
          translatedText: vocabData?.definition_vi || targetTurn.translated_content || "",
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
      aiStreamingText,
      isAiStreaming,
      lastSttResult,
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
