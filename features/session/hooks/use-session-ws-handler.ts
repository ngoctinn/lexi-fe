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

  const handleWsMessage = React.useCallback(
    (event: WsServerPayload) => {
      console.log("[ws-handler] ========== NEW MESSAGE ==========");
      console.log("[ws-handler] Full event:", JSON.stringify(event, null, 2));
      console.log("[ws-handler] Event type:", event.event);

      if (!("event" in event)) {
        console.warn("[ws-handler] Invalid message format (missing event field):", event);
        return;
      }

      console.log("[ws-handler] Processing event:", event.event);

      switch (event.event) {
        case WsServerEvent.SESSION_READY:
          console.log("[ws-handler] SESSION_READY");
          break;

        case WsServerEvent.AI_RESPONSE: {
          console.log("[ws-handler] ✅ AI_RESPONSE RECEIVED!");
          console.log("[ws-handler] AI_RESPONSE - text length:", event.text?.length);
          console.log("[ws-handler] AI_RESPONSE - text preview:", event.text?.substring(0, 100));
          console.log("[ws-handler] AI_RESPONSE - full event:", JSON.stringify(event, null, 2));

          const state = useSessionStore.getState();
          const audioUrl = state.currentAudioUrl;
          
          // Clear response timeout if exists
          if (state.responseTimeoutId) {
            clearTimeout(state.responseTimeoutId);
            state.setResponseTimeoutId?.(null);
          }

          if (event.text?.trim()) {
            setTurns((prev: Turn[]) => {
              // Calculate turn_index excluding partial turns
              const nextTurnIndex = prev.filter(t => !t.is_partial).length;
              console.log("[ws-handler] Adding AI turn (AI_RESPONSE) with index:", nextTurnIndex, "prev length:", prev.length);
              const newTurns = [
                ...prev,
                {
                  turn_index: nextTurnIndex,
                  speaker: TurnSpeaker.AI,
                  content: event.text,
                  audio_url: audioUrl,
                  is_hint_used: false,
                },
              ];
              console.log("[ws-handler] New turns array length:", newTurns.length);
              console.log("[ws-handler] ✅ AI turn added to UI successfully");
              return newTurns;
            });
          } else {
            console.warn("[ws-handler] ⚠️ AI_RESPONSE but text is empty!");
          }

          console.log("[ws-handler] Stopping AI streaming animation");
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
