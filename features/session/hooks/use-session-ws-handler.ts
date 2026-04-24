"use client";

import * as React from "react";
import type { Turn, WsServerPayload } from "@/features/session/types/session.types";
import { WsServerEvent, TurnSpeaker } from "@/features/session/types/session.types";
import { useSessionStore } from "@/features/session/stores/use-session-store";
import { SessionService } from "@/features/session/api/session.service";

export function useSessionWsHandler() {
  const setTurns = useSessionStore((s) => s.setTurns);
  const setUploadUrls = useSessionStore((s) => s.setUploadUrls);
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
      switch (event.event) {
        case WsServerEvent.SESSION_READY:
          setUploadUrls(event.upload_url, event.s3_key);
          break;

        case WsServerEvent.STT_RESULT:
          setLastSttResult({ text: event.text, confidence: event.confidence });
          break;

        case WsServerEvent.STT_LOW_CONFIDENCE:
          setLastSttResult({ text: "", confidence: event.confidence });
          setStreamingError("Không thể hiểu rõ. Vui lòng thử lại.");
          setRecorderState("idle");
          break;

        case WsServerEvent.AI_TEXT_CHUNK:
          if (event.done) {
            const state = useSessionStore.getState();
            const finalText = `${state.aiStreamingText}${event.chunk}`;
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
            setAiStreamingText((prev) => prev + event.chunk);
            setAiStreaming(true);
          }
          break;

        case WsServerEvent.TURN_SAVED:
          setTurns((prev: Turn[]) =>
            prev.map((turn: Turn) =>
              turn.turn_index === event.turn_index
                ? { ...turn, is_pending: false }
                : turn,
            ),
          );
          break;

        case WsServerEvent.AI_AUDIO_URL:
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

        case WsServerEvent.HINT_TEXT:
          setHint(event.hint);
          setHintPanelOpen(true);
          break;

        case WsServerEvent.ERROR:
          SessionService.handleError(event.message, "WebSocket");
          break;

        case WsServerEvent.STREAMING_READY:
          // Streaming session initialized successfully
          break;

        case WsServerEvent.PARTIAL_TRANSCRIPT:
          // Update partial transcript (gray text)
          setStreamingTranscript(
            useSessionStore.getState().streamingTranscript?.finalText || "",
            event.text,
            true
          );
          break;

        case WsServerEvent.FINAL_TRANSCRIPT:
          // Update final transcript (black text)
          setStreamingTranscript(event.text, "", false);
          setLastSttResult({ text: event.text, confidence: event.confidence });
          break;

        case WsServerEvent.STT_ERROR:
          // Handle streaming error
          setStreamingError(event.message);
          setRecorderState("idle");
          break;

        default:
          break;
      }
    },
    [
      setUploadUrls,
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
