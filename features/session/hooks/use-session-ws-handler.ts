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
  const setAiStreaming = useSessionStore((s) => s.setAiStreaming);
  const setHint = useSessionStore((s) => s.setHint);
  const setHintPanelOpen = useSessionStore((s) => s.setHintPanelOpen);
  const setCurrentAudioUrl = useSessionStore((s) => s.setCurrentAudioUrl);
  const setStreamingTranscript = useSessionStore((s) => s.setStreamingTranscript);
  const setStreamingError = useSessionStore((s) => s.setStreamingError);

  // Accumulate full response before rendering
  const aiTextAccumRef = React.useRef<string>("");
  const hintAccumRef = React.useRef<{ vi: string; en: string }>({ vi: "", en: "" });
  const analysisAccumRef = React.useRef<{ vi: string; en: string }>({ vi: "", en: "" });

  const handleWsMessage = React.useCallback(
    (event: WsServerPayload) => {
      console.log("[ws-handler] Received message:", JSON.stringify(event).substring(0, 200));
      
      if (!('event' in event)) {
        console.warn("[ws-handler] Invalid message format (missing event field):", event);
        return;
      }
      
      console.log("[ws-handler] Processing event:", event.event);
      
      switch (event.event) {
        case WsServerEvent.SESSION_READY:
          console.log("[ws-handler] SESSION_READY");
          break;

        case WsServerEvent.STT_RESULT:
          console.log("[ws-handler] STT_RESULT:", event.text);
          setLastSttResult({ text: event.text, confidence: event.confidence });
          break;

        case WsServerEvent.STT_LOW_CONFIDENCE:
          console.log("[ws-handler] STT_LOW_CONFIDENCE");
          setLastSttResult({ text: "", confidence: event.confidence });
          setStreamingError("Không thể hiểu rõ. Vui lòng thử lại.");
          setRecorderState("idle");
          break;

        case WsServerEvent.AI_TEXT_CHUNK: {
          console.log("[ws-handler] AI_TEXT_CHUNK - done:", event.done);
          
          if (event.done) {
            // Render full response when done
            const finalText = aiTextAccumRef.current;
            const state = useSessionStore.getState();
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

            // Reset state
            aiTextAccumRef.current = "";
            setAiStreaming(false, "");
          } else {
            // Accumulate chunk
            aiTextAccumRef.current += event.chunk;
            // Show loading animation while accumulating
            setAiStreaming(true, "");
          }
          break;
        }

        case WsServerEvent.TURN_SAVED:
          console.log("[ws-handler] TURN_SAVED:", event.turn_index);
          setTurns((prev: Turn[]) =>
            prev.map((turn: Turn) =>
              turn.turn_index === event.turn_index
                ? { ...turn, is_pending: false }
                : turn,
            ),
          );
          break;

        case WsServerEvent.AI_AUDIO_URL:
          console.log("[ws-handler] AI_AUDIO_URL");
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

        case WsServerEvent.HINT_TEXT: {
          console.log("[ws-handler] HINT_TEXT - done:", event.isDone);
          
          const hintState = useSessionStore.getState();
          
          // Clear timeout when hint is received
          if (hintState.hintTimeoutId) {
            clearTimeout(hintState.hintTimeoutId);
            hintState.setHintTimeoutId(null);
          }
          
          if (hintState.requestHintInProgress) {
            hintState.setRequestHintInProgress(false);
          }
          
          if (event.isDone === true) {
            // Render full hint when done
            const finalMarkdown = {
              vi: hintAccumRef.current.vi + event.hint.markdown.vi,
              en: hintAccumRef.current.en + event.hint.markdown.en,
            };
            
            const finalHint = {
              level: event.hint.level || "Intermediate",
              type: event.hint.type || "guidance",
              markdown: finalMarkdown,
            };
            
            hintState.addHintToHistory(finalHint.markdown);
            setHint(null);
            setHintPanelOpen(true);
            hintAccumRef.current = { vi: "", en: "" };
          } else {
            // Accumulate chunk and show loading
            hintAccumRef.current.vi += event.hint.markdown.vi;
            hintAccumRef.current.en += event.hint.markdown.en;
            
            setHint({
              level: event.hint.level || "Intermediate",
              type: event.hint.type || "guidance",
              markdown: hintAccumRef.current,
            });
          }
          break;
        }

        case WsServerEvent.TURN_ANALYSIS: {
          console.log("[ws-handler] TURN_ANALYSIS - done:", event.isDone);
          
          const analysisState = useSessionStore.getState();
          const turnIndex = event.turn_index ?? 
            (analysisState.turns.length > 0 ? analysisState.turns[analysisState.turns.length - 1].turn_index : 0);
          
          if (event.isDone === true) {
            // Render full analysis when done
            const finalMarkdown = {
              vi: analysisAccumRef.current.vi + event.analysis.markdown.vi,
              en: analysisAccumRef.current.en + event.analysis.markdown.en,
            };
            
            if (finalMarkdown.vi || finalMarkdown.en) {
              analysisState.addAnalysisToHistory(turnIndex, finalMarkdown);
            }
            analysisAccumRef.current = { vi: "", en: "" };
            analysisState.setTempAnalysis(null);
            // Clear analyzing flag
            analysisState.setAnalyzingTurnIndex(null);
          } else {
            // Accumulate chunk and show loading
            analysisAccumRef.current.vi += event.analysis.markdown.vi;
            analysisAccumRef.current.en += event.analysis.markdown.en;
            
            if (!analysisState.tempAnalysis?.turnIndex) {
              analysisState.setTempAnalysis({
                turnIndex,
                markdown: { vi: "", en: "" },
              });
            }
            
            analysisState.setTempAnalysis({
              turnIndex,
              markdown: analysisAccumRef.current,
            });
          }
          break;
        }

        case WsServerEvent.ERROR:
          console.error("[ws-handler] ERROR:", event.message);
          if (event.message && event.message.toLowerCase().includes("hint")) {
            setHint(null);
            setHintPanelOpen(false);
            // Reset hint request flag on error
            const hintState = useSessionStore.getState();
            
            // Clear timeout
            if (hintState.hintTimeoutId) {
              clearTimeout(hintState.hintTimeoutId);
              hintState.setHintTimeoutId(null);
            }
            
            hintState.setRequestHintInProgress(false);
          }
          SessionService.handleError(event.message, "WebSocket");
          break;

        case WsServerEvent.STREAMING_READY:
          console.log("[ws-handler] STREAMING_READY");
          break;

        case WsServerEvent.PARTIAL_TRANSCRIPT:
          console.log("[ws-handler] PARTIAL_TRANSCRIPT");
          setStreamingTranscript(
            useSessionStore.getState().streamingTranscript?.finalText || "",
            event.text,
            true
          );
          break;

        case WsServerEvent.FINAL_TRANSCRIPT:
          console.log("[ws-handler] FINAL_TRANSCRIPT");
          setStreamingTranscript(event.text, "", false);
          setLastSttResult({ text: event.text, confidence: event.confidence });
          break;

        case WsServerEvent.STT_ERROR:
          console.error("[ws-handler] STT_ERROR");
          setStreamingError(event.message);
          setRecorderState("idle");
          break;

        case WsServerEvent.SCORING_COMPLETE:
          console.log("[ws-handler] SCORING_COMPLETE");
          break;

        default:
          const _exhaustive: never = event;
          console.warn("[ws-handler] Unknown event:", _exhaustive);
      }
    },
    [
      setTurns,
      setLastSttResult,
      setRecorderState,
      setAiStreaming,
      setHint,
      setHintPanelOpen,
      setCurrentAudioUrl,
      setStreamingTranscript,
      setStreamingError,
    ],
  );

  return { handleWsMessage };
}
