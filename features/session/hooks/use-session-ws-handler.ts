"use client";

import * as React from "react";
import type { Turn, WsServerPayload } from "@/features/session/types/session.types";
import { WsServerEvent, TurnSpeaker } from "@/features/session/types/session.types";
import { useSessionStore } from "@/features/session/stores/use-session-store";
import { SessionService } from "@/features/session/api/session.service";

export function useSessionWsHandler() {
  const setTurns = useSessionStore((s) => s.setTurns);
  const setLastSttResult = useSessionStore((s) => s.setLastSttResult);
  const setRecorderState = useSessionStore((s) => s.setRecorderState);
  const setAiStreamingText = useSessionStore((s) => s.setAiStreamingText);
  const setAiStreaming = useSessionStore((s) => s.setAiStreaming);
  const setHint = useSessionStore((s) => s.setHint);
  const setHintPanelOpen = useSessionStore((s) => s.setHintPanelOpen);
  const setCurrentAudioUrl = useSessionStore((s) => s.setCurrentAudioUrl);
  const setStreamingTranscript = useSessionStore((s) => s.setStreamingTranscript);
  const setStreamingError = useSessionStore((s) => s.setStreamingError);

  const handleWsMessage = React.useCallback(
    (event: WsServerPayload) => {
      console.log("[ws-handler] Received message:", JSON.stringify(event).substring(0, 200));
      
      const eventData = event as WsServerPayload & { [key: string]: unknown };
      
      if (!eventData || !eventData.event) {
        // Check if it's an error response from BE
        if (eventData && eventData.message === 'Internal server error') {
          console.error("[ws-handler] BE Internal Server Error:", eventData);
          SessionService.handleError(
            `Lỗi máy chủ: ${eventData.message}`,
            "WebSocket"
          );
          return;
        }
        
        console.warn("[ws-handler] Invalid message format (missing event field):", eventData);
        return;
      }
      
      console.log("[ws-handler] Processing event:", eventData.event);
      
      switch (eventData.event) {
        case WsServerEvent.SESSION_READY:
          console.log("[ws-handler] SESSION_READY - upload_url:", eventData.upload_url?.substring(0, 50) + "...");
          break;

        case WsServerEvent.STT_RESULT:
          console.log("[ws-handler] STT_RESULT:", eventData.text, "confidence:", eventData.confidence);
          setLastSttResult({ text: eventData.text, confidence: eventData.confidence });
          break;

        case WsServerEvent.STT_LOW_CONFIDENCE:
          console.log("[ws-handler] STT_LOW_CONFIDENCE:", eventData.confidence);
          setLastSttResult({ text: "", confidence: eventData.confidence });
          setStreamingError("Không thể hiểu rõ. Vui lòng thử lại.");
          setRecorderState("idle");
          break;

        case WsServerEvent.AI_TEXT_CHUNK:
          console.log("[ws-handler] AI_TEXT_CHUNK:", eventData.chunk, "done:", eventData.done);
          if (eventData.done) {
            const state = useSessionStore.getState();
            const finalText = `${state.aiStreamingText}${eventData.chunk}`;
            const audioUrl = state.currentAudioUrl;

            if (finalText.trim().length > 0) {
              setTurns((prev: Turn[]) => [
                ...prev,
                {
                  turn_index: prev.length,
                  speaker: TurnSpeaker.AI,
                  content: finalText,
                  audio_url: audioUrl,
                  is_hint_used: false,
                },
              ]);
            }

            setAiStreamingText("");
            setAiStreaming(false, "");
          } else {
            setAiStreamingText((prev) => prev + eventData.chunk);
            setAiStreaming(true);
          }
          break;

        case WsServerEvent.TURN_SAVED:
          console.log("[ws-handler] TURN_SAVED:", eventData.turn_index);
          setTurns((prev: Turn[]) =>
            prev.map((turn: Turn) =>
              turn.turn_index === eventData.turn_index
                ? { ...turn, is_pending: false }
                : turn,
            ),
          );
          break;

        case WsServerEvent.AI_AUDIO_URL:
          console.log("[ws-handler] AI_AUDIO_URL:", eventData.url?.substring(0, 50) + "...");
          setCurrentAudioUrl(eventData.url);
          setTurns((prev: Turn[]) => {
            const next = [...prev];
            for (let index = next.length - 1; index >= 0; index -= 1) {
              if (next[index].speaker === TurnSpeaker.AI) {
                next[index] = {
                  ...next[index],
                  audio_url: eventData.url,
                };
                break;
              }
            }
            return next;
          });
          break;

        case WsServerEvent.HINT_TEXT:
          console.log("[ws-handler] HINT_TEXT:", eventData.hint);
          // Clear timeout if exists
          const hintState = useSessionStore.getState();
          if (hintState.hintTimeoutId) {
            clearTimeout(hintState.hintTimeoutId);
            hintState.setHintTimeoutId?.(null);
          }
          
          // Handle both old format (with level/type) and new format (markdown only)
          const hintData = eventData.hint;
          const normalizedHint = {
            level: hintData.level || "Intermediate",
            type: hintData.type || "guidance",
            markdown: hintData.markdown || {
              vi: hintData.vi || hintData.markdown?.vi || "",
              en: hintData.en || hintData.markdown?.en || "",
            },
          };
          
          // Add to history
          hintState.addHintToHistory(normalizedHint.markdown);
          
          setHint(normalizedHint);
          setHintPanelOpen(true);
          break;

        case WsServerEvent.TURN_ANALYSIS:
          console.log("[ws-handler] TURN_ANALYSIS");
          // Extract turn_index from the event or use the last user turn
          const analysisState = useSessionStore.getState();
          const turnIndex = eventData.turn_index || 
            (analysisState.turns.length > 0 ? analysisState.turns[analysisState.turns.length - 1].turn_index : 0);
          
          // Add to history (this will also add to analyzedTurns set)
          analysisState.addAnalysisToHistory(turnIndex, eventData.analysis.markdown);
          
          // Don't set tempAnalysis - it causes flicker
          break;

        case WsServerEvent.ERROR:
          console.error("[ws-handler] ERROR:", eventData.message);
          // Check if this is a hint error
          if (eventData.message && eventData.message.toLowerCase().includes("hint")) {
            console.warn("[ws-handler] Hint request failed:", eventData.message);
            setHint(null);
            setHintPanelOpen(false);
          }
          SessionService.handleError(eventData.message, "WebSocket");
          break;

        case WsServerEvent.STREAMING_READY:
          console.log("[ws-handler] STREAMING_READY");
          // Streaming session initialized successfully
          break;

        case WsServerEvent.PARTIAL_TRANSCRIPT:
          console.log("[ws-handler] PARTIAL_TRANSCRIPT:", eventData.text);
          // Update partial transcript (gray text)
          setStreamingTranscript(
            useSessionStore.getState().streamingTranscript?.finalText || "",
            eventData.text,
            true
          );
          break;

        case WsServerEvent.FINAL_TRANSCRIPT:
          console.log("[ws-handler] FINAL_TRANSCRIPT:", eventData.text);
          // Update final transcript (black text)
          setStreamingTranscript(eventData.text, "", false);
          setLastSttResult({ text: eventData.text, confidence: eventData.confidence });
          break;

        case WsServerEvent.STT_ERROR:
          console.error("[ws-handler] STT_ERROR:", eventData.message);
          // Handle streaming error
          setStreamingError(eventData.message);
          setRecorderState("idle");
          break;

        case WsServerEvent.SCORING_COMPLETE:
          console.log("[ws-handler] SCORING_COMPLETE");
          // Session completed and scoring is ready
          // Just mark completion - session data will be fetched separately
          break;

        default:
          console.warn("[ws-handler] Unknown event:", eventData.event);
          break;
      }
    },
    [
      setLastSttResult,
      setRecorderState,
      setAiStreamingText,
      setAiStreaming,
      setTurns,
      setHint,
      setHintPanelOpen,
      setCurrentAudioUrl,
      setStreamingTranscript,
      setStreamingError,
    ],
  );

  return { handleWsMessage };
}
