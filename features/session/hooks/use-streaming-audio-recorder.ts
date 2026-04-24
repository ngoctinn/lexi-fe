"use client";

import * as React from "react";
import type { RecorderState } from "@/features/session/types/session.types";
import { WsClientEvent } from "@/features/session/types/session.types";
import type { useWebSocket } from "./use-websocket";

const SAMPLE_RATE = 16_000;
const MIME_TYPE = "audio/webm;codecs=opus";
const AUDIO_BITS_PER_SECOND = 16000;
const CHUNK_DURATION_MS = 250;

interface UseStreamingAudioRecorderOptions {
  ws: ReturnType<typeof useWebSocket>;
  sessionId: string;
  onError: (message: string) => void;
}

interface UseStreamingAudioRecorderReturn {
  state: RecorderState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export function useStreamingAudioRecorder({
  ws,
  sessionId,
  onError,
}: UseStreamingAudioRecorderOptions): UseStreamingAudioRecorderReturn {
  const [state, setState] = React.useState<RecorderState>("idle");

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const isStreamingRef = React.useRef(false);

  const stopRecording = React.useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = React.useCallback(async () => {
    if (state === "recording") {
      stopRecording();
      return;
    }

    // Check if WebSocket is connected
    if (ws.connectionState !== "connected") {
      onError("Mất kết nối máy chủ. Vui lòng thử lại.");
      return;
    }

    let stream: MediaStream;
    try {
      // Request microphone with audio constraints for 16kHz mono
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: { ideal: SAMPLE_RATE },
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
    } catch {
      setState("permission-denied");
      onError("Trình duyệt không cho phép truy cập microphone.");
      return;
    }

    try {
      // Initialize streaming on backend
      ws.send({
        action: WsClientEvent.START_STREAMING,
        session_id: sessionId,
      });

      // Create MediaRecorder with Opus encoding
      const mimeType = MediaRecorder.isTypeSupported(MIME_TYPE)
        ? MIME_TYPE
        : "";
      const recorder = new MediaRecorder(
        stream,
        mimeType
          ? {
              mimeType,
              audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
            }
          : {}
      );
      mediaRecorderRef.current = recorder;
      isStreamingRef.current = true;

      // Send audio chunks immediately as they become available
      recorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data.size > 0 && isStreamingRef.current) {
          // Convert Blob to ArrayBuffer, then to byte array
          ev.data.arrayBuffer().then((buffer) => {
            const byteArray = Array.from(new Uint8Array(buffer));
            ws.send({
              action: WsClientEvent.AUDIO_CHUNK,
              session_id: sessionId,
              data: byteArray,
            });
          });
        }
      };

      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        isStreamingRef.current = false;

        // Signal end of streaming to backend
        ws.send({
          action: WsClientEvent.END_STREAMING,
          session_id: sessionId,
        });

        setState("idle");
        mediaRecorderRef.current = null;
      };

      recorder.onerror = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        isStreamingRef.current = false;
        mediaRecorderRef.current = null;
        setState("error");
        onError("Lỗi ghi âm.");
      };

      setState("recording");
      // Start recording with 250ms chunk intervals
      recorder.start(CHUNK_DURATION_MS);
    } catch {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setState("error");
      onError("Không thể khởi động streaming.");
    }
  }, [state, stopRecording, ws, sessionId, onError]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isStreamingRef.current = false;
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
    };
  }, []);

  return { state, startRecording, stopRecording };
}
