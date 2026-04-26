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
      
      // Type guard for error messages
      type ErrorMessage = { message?: string; event?: never };
      type ValidEvent = WsServerPayload & { 
        message?: string;
        isStreaming?: boolean;
        isDone?: boolean;
      };
      
      const eventData = event as ErrorMessage | ValidEvent;
      
      // Check if it's an error response from BE (no event field)
      if (!('event' in eventData) || !eventData.event) {
        if ('message' in eventData && typeof eventData.message === 'string' && eventData.message === 'Internal server error') {
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

        case WsServerEvent.AI_TEXT_CHUNK: {
          console.log("[ws-handler] AI_TEXT_CHUNK:", {
            chunk: eventData.chunk,
            done: eventData.done,
            chunkLength: eventData.chunk?.length,
            currentStreamingText: useSessionStore.getState().aiStreamingText,
          });
          
          if (eventData.done) {
            const state = useSessionStore.getState();
            const fullText = `${state.aiStreamingText}${eventData.chunk}`;
            const audioUrl = state.currentAudioUrl;

            console.log("[ws-handler] AI_TEXT_CHUNK DONE - fullText:", fullText);

            // If we already have streaming text, just finalize it
            if (state.aiStreamingText) {
              setAiStreaming(false, fullText);
              // Add to turns after a short delay to ensure UI updates
              setTimeout(() => {
                const finalState = useSessionStore.getState();
                if (finalState.aiStreamingText.trim().length > 0) {
                  setTurns((prev: Turn[]) => [
                    ...prev,
                    {
                      turn_index: prev.length,
                      speaker: TurnSpeaker.AI,
                      content: finalState.aiStreamingText,
                      audio_url: audioUrl,
                      is_hint_used: false,
                    },
                  ]);
                  setAiStreamingText("");
                }
              }, 50);
            } else {
              // Backend sent full text in one chunk - simulate streaming
              console.log("[ws-handler] Backend sent full text at once, simulating streaming...");
              simulateTextStreaming(fullText, audioUrl);
            }
          } else {
            // Real streaming - accumulate chunk
            const currentText = useSessionStore.getState().aiStreamingText;
            const newText = currentText + eventData.chunk;
            console.log("[ws-handler] AI_TEXT_CHUNK accumulating:", {
              currentLength: currentText.length,
              chunkLength: eventData.chunk?.length,
              newLength: newText.length,
            });
            setAiStreamingText(newText);
            setAiStreaming(true, newText);
          }
          break;
        }

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

        case WsServerEvent.HINT_TEXT: {
          console.log("[ws-handler] HINT_TEXT RAW:", JSON.stringify(eventData, null, 2));
          console.log("[ws-handler] HINT_TEXT:", {
            hint: eventData.hint,
            isStreaming: eventData.isStreaming,
            isDone: eventData.isDone,
            hasIsStreamingFlag: 'isStreaming' in eventData,
          });
          
          const hintEvent = eventData as WsServerPayload & {
            hint: {
              level?: string;
              type?: string;
              markdown: { vi: string; en: string };
            };
            isStreaming?: boolean;
            isDone?: boolean;
          };
          
          const hintState = useSessionStore.getState();
          
          // Reset request flag when we receive first hint response
          if (hintState.requestHintInProgress) {
            console.log("[ws-handler] First hint response received, resetting flag");
            hintState.setRequestHintInProgress(false);
          }
          
          // Duplicate detection - check if this exact hint already exists in history
          const isDuplicate = hintState.hintHistory.some(h => 
            h.markdown.vi === hintEvent.hint.markdown.vi && 
            h.markdown.en === hintEvent.hint.markdown.en
          );
          
          if (isDuplicate && !hintEvent.isStreaming) {
            console.warn("[ws-handler] Duplicate hint detected, skipping");
            break;
          }
          
          // Handle streaming
          if (hintEvent.isStreaming) {
            console.log("[ws-handler] STREAMING CHUNK:", {
              vi: hintEvent.hint.markdown.vi,
              en: hintEvent.hint.markdown.en,
              isDone: hintEvent.isDone,
              viLength: hintEvent.hint.markdown.vi?.length,
              enLength: hintEvent.hint.markdown.en?.length,
            });
            
            const currentHint = hintState.currentHint;
            const newMarkdown = {
              vi: (currentHint?.markdown.vi || "") + hintEvent.hint.markdown.vi,
              en: (currentHint?.markdown.en || "") + hintEvent.hint.markdown.en,
            };
            
            console.log("[ws-handler] ACCUMULATED TEXT:", {
              vi: newMarkdown.vi,
              en: newMarkdown.en,
              viLength: newMarkdown.vi.length,
              enLength: newMarkdown.en.length,
            });
            
            setHint({
              level: hintEvent.hint.level || currentHint?.level || "Intermediate",
              type: hintEvent.hint.type || currentHint?.type || "guidance",
              markdown: newMarkdown,
            });
            
            // If done, add to history
            if (hintEvent.isDone) {
              console.log("[ws-handler] STREAMING DONE, adding to history");
              if (hintState.hintTimeoutId) {
                clearTimeout(hintState.hintTimeoutId);
                hintState.setHintTimeoutId?.(null);
              }
              hintState.addHintToHistory(newMarkdown);
              setHintPanelOpen(true);
            }
          } else {
            // Non-streaming (legacy) - simulate streaming
            console.log("[ws-handler] NON-STREAMING HINT, simulating streaming:", hintEvent.hint.markdown);
            
            const normalizedHint = {
              level: hintEvent.hint.level || "Intermediate",
              type: hintEvent.hint.type || "guidance",
              markdown: hintEvent.hint.markdown,
            };
            
            // Simulate streaming for both VI and EN
            simulateHintStreaming(normalizedHint, hintState);
          }
          break;
        }

        case WsServerEvent.TURN_ANALYSIS: {
          console.log("[ws-handler] TURN_ANALYSIS", {
            isStreaming: eventData.isStreaming,
            isDone: eventData.isDone,
            hasIsStreamingFlag: 'isStreaming' in eventData,
            analysis: eventData.analysis,
          });
          
          const analysisEvent = eventData as WsServerPayload & {
            analysis: {
              markdown: { vi: string; en: string };
            };
            turn_index?: number;
            isStreaming?: boolean;
            isDone?: boolean;
          };
          
          const analysisState = useSessionStore.getState();
          const turnIndex = analysisEvent.turn_index ?? 
            (analysisState.turns.length > 0 ? analysisState.turns[analysisState.turns.length - 1].turn_index : 0);
          
          // Handle streaming
          if (analysisEvent.isStreaming) {
            console.log("[ws-handler] ANALYSIS STREAMING CHUNK:", {
              vi: analysisEvent.analysis.markdown.vi,
              en: analysisEvent.analysis.markdown.en,
              isDone: analysisEvent.isDone,
              viLength: analysisEvent.analysis.markdown.vi?.length,
              enLength: analysisEvent.analysis.markdown.en?.length,
            });
            
            const currentTemp = analysisState.tempAnalysis;
            const newMarkdown = {
              vi: (currentTemp?.markdown.vi || "") + analysisEvent.analysis.markdown.vi,
              en: (currentTemp?.markdown.en || "") + analysisEvent.analysis.markdown.en,
            };
            
            console.log("[ws-handler] ANALYSIS ACCUMULATED:", {
              vi: newMarkdown.vi,
              en: newMarkdown.en,
              viLength: newMarkdown.vi.length,
              enLength: newMarkdown.en.length,
            });
            
            analysisState.setTempAnalysis({
              turnIndex,
              markdown: newMarkdown,
            });
            
            // If done, move to history
            if (analysisEvent.isDone) {
              console.log("[ws-handler] ANALYSIS STREAMING DONE");
              analysisState.addAnalysisToHistory(turnIndex, newMarkdown);
              analysisState.setTempAnalysis(null);
            }
          } else {
            // Non-streaming (legacy) - simulate streaming
            console.log("[ws-handler] ANALYSIS NON-STREAMING, simulating streaming");
            simulateAnalysisStreaming(
              turnIndex,
              analysisEvent.analysis.markdown,
              analysisState
            );
          }
          break;
        }

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

        default: {
          const unknownEvent = eventData as { event?: string };
          console.warn("[ws-handler] Unknown event:", unknownEvent.event);
          break;
        }
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
