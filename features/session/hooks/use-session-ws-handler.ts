"use client";

import * as React from "react";
import type { Turn, WsServerPayload } from "@/features/session/types/session.types";
import { WsServerEvent, TurnSpeaker } from "@/features/session/types/session.types";
import { useSessionStore } from "@/features/session/stores/use-session-store";
import { SessionService } from "@/features/session/api/session.service";

export function useSessionWsHandler() {
  const setTurns = useSessionStore((s) => s.setTurns);
  const setAiStreaming = useSessionStore((s) => s.setAiStreaming);
  const setHintPanelOpen = useSessionStore((s) => s.setHintPanelOpen);
  const setCurrentAudioUrl = useSessionStore((s) => s.setCurrentAudioUrl);

  // Accumulate AI text response before rendering
  const aiTextAccumRef = React.useRef<string>("");

  const handleWsMessage = React.useCallback(
    (event: WsServerPayload) => {
      console.log("[ws-handler] Received message:", JSON.stringify(event).substring(0, 200));

      if (!("event" in event)) {
        console.warn("[ws-handler] Invalid message format (missing event field):", event);
        return;
      }

      console.log("[ws-handler] Processing event:", event.event);

      switch (event.event) {
        case WsServerEvent.SESSION_READY:
          console.log("[ws-handler] SESSION_READY");
          break;

        case WsServerEvent.AI_TEXT_CHUNK: {
          console.log("[ws-handler] AI_TEXT_CHUNK - done:", event.done);

          if (event.done) {
            // Render full response when done
            const finalText = aiTextAccumRef.current;
            const state = useSessionStore.getState();
            const audioUrl = state.currentAudioUrl;

            if (finalText.trim().length > 0) {
              setTurns((prev: Turn[]) => {
                // Calculate turn_index excluding partial turns
                const nextTurnIndex = prev.filter(t => !t.is_partial).length;
                return [
                  ...prev,
                  {
                    turn_index: nextTurnIndex,
                    speaker: TurnSpeaker.AI,
                    content: finalText,
                    audio_url: audioUrl,
                    is_hint_used: false,
                  },
                ];
              });
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

        case WsServerEvent.AI_RESPONSE: {
          console.log("[ws-handler] AI_RESPONSE:", event.text?.substring(0, 100));

          const state = useSessionStore.getState();
          const audioUrl = state.currentAudioUrl;

          if (event.text?.trim()) {
            setTurns((prev: Turn[]) => {
              // Calculate turn_index excluding partial turns
              const nextTurnIndex = prev.filter(t => !t.is_partial).length;
              return [
                ...prev,
                {
                  turn_index: nextTurnIndex,
                  speaker: TurnSpeaker.AI,
                  content: event.text,
                  audio_url: audioUrl,
                  is_hint_used: false,
                },
              ];
            });
          }

          setAiStreaming(false, "");
          break;
        }

        case WsServerEvent.TURN_SAVED:
          console.log("[ws-handler] TURN_SAVED:", event.turn_index);
          // Mark the turn as no longer pending (fully saved)
          // Find turn by actual position (excluding partials), not by turn_index field
          setTurns((prev: Turn[]) => {
            let actualIndex = 0;
            const updated = prev.map((turn: Turn) => {
              const isMatch = !turn.is_partial && actualIndex === event.turn_index;
              if (!turn.is_partial) {
                actualIndex++;
              }
              if (isMatch) {
                console.log("[ws-handler] Clearing is_pending for turn at position:", event.turn_index, "content:", turn.content.substring(0, 30));
              }
              return isMatch ? { ...turn, is_pending: false } : turn;
            });
            return updated;
          });
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
          console.log("[ws-handler] HINT_TEXT received");

          const hintState = useSessionStore.getState();

          // Clear timeout when hint is received
          if (hintState.hintTimeoutId) {
            clearTimeout(hintState.hintTimeoutId);
            hintState.setHintTimeoutId(null);
          }

          if (hintState.requestHintInProgress) {
            hintState.setRequestHintInProgress(false);
          }

          // Backend sends complete hint in one message - add directly to history
          hintState.addHintToHistory({
            vi: event.hint.markdown.vi,
            en: event.hint.markdown.en,
          });

          setHintPanelOpen(true);
          break;
        }

        case WsServerEvent.TURN_ANALYSIS: {
          console.log("[ws-handler] TURN_ANALYSIS received");

          const analysisState = useSessionStore.getState();
          const turnIndex =
            event.turn_index ??
            (analysisState.turns.length > 0
              ? analysisState.turns[analysisState.turns.length - 1].turn_index
              : 0);

          // Backend sends complete analysis in one message - add directly to history
          analysisState.addAnalysisToHistory(turnIndex, {
            vi: event.analysis.markdown.vi,
            en: event.analysis.markdown.en,
          });

          // Clear analyzing flag
          analysisState.setAnalyzingTurnIndex(null);
          break;
        }

        case WsServerEvent.ERROR:
          console.error("[ws-handler] ERROR:", event.message);
          SessionService.handleError(event.message, "WebSocket");
          break;

        case WsServerEvent.TRANSCRIBE_URL: {
          console.log("[ws-handler] TRANSCRIBE_URL received");
          // Store the URL in session store for the recorder to pick up
          useSessionStore.getState().setTranscribeUrl(event.url);
          break;
        }

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
      setAiStreaming,
      setHintPanelOpen,
      setCurrentAudioUrl,
    ],
  );

  return { handleWsMessage };
}
