"use client";

/**
 * Client-side Streaming Recorder (Presigned URL Approach)
 * 
 * Migrated from deprecated AWS SDK to presigned WebSocket URL
 * Reference: STT_MIGRATION_SUMMARY.md
 * 
 * Flow:
 * 1. Request presigned URL from backend (GET_TRANSCRIBE_URL)
 * 2. Connect directly to Transcribe WebSocket
 * 3. Stream audio via AudioWorklet
 * 4. Handle transcripts locally
 * 5. Submit final transcript to backend (SUBMIT_TRANSCRIPT)
 * 
 * AWS Best Practices Applied:
 * - PCM audio @ 16kHz (recommended by AWS)
 * - Chunk size: 50-200ms (current: ~42ms @ 48kHz)
 * - Proper event stream encoding with CRC32
 * - Silence detection with network latency buffer
 */

import * as React from "react";
import type { RecorderState } from "@/features/session/types/session.types";
import { WsClientEvent, TurnSpeaker, type Turn } from "@/features/session/types/session.types";
import type { useWebSocket } from "./use-websocket";
import { processAudioForTranscribe, supportsAudioWorklet } from "../utils/audio-converter";
import { encodeAudioEvent, parseTranscriptEvent } from "../utils/event-stream-encoder";
import { useSessionStore } from "../stores/use-session-store";

const SAMPLE_RATE = 16_000;

// Adaptive silence detection based on user level
const SILENCE_TIMEOUTS = {
  A1: 2000,
  A2: 1800,
  B1: 1500,
  B2: 1200,
  C1: 1000,
  C2: 800,
} as const;

const MIN_SPEECH_DURATION_MS = 500;
const NETWORK_LATENCY_BUFFER_MS = 500; // Buffer for network latency
const TRANSCRIBE_URL_TIMEOUT_MS = 5000; // Timeout for URL request
const FINAL_TRANSCRIPT_WAIT_MS = 1000; // Wait for final transcript after stop

interface UseClientStreamingRecorderOptions {
  ws: ReturnType<typeof useWebSocket>;
  sessionId: string;
  sessionLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  onPartialTranscript: (text: string, confidence: number) => void;
  onFinalTranscript: (text: string, confidence: number) => void;
  onError: (message: string) => void;
}

interface UseClientStreamingRecorderReturn {
  state: RecorderState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  cancelRecording: () => void;
}

export function useClientStreamingRecorder({
  ws,
  sessionId,
  sessionLevel = "B1",
  onPartialTranscript,
  onFinalTranscript,
  onError,
}: UseClientStreamingRecorderOptions): UseClientStreamingRecorderReturn {
  const [state, setState] = React.useState<RecorderState>("idle");

  const SILENCE_TIMEOUT_MS = SILENCE_TIMEOUTS[sessionLevel];

  // Audio processing refs
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = React.useRef<AudioWorkletNode | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const transcribeSocketRef = React.useRef<WebSocket | null>(null);
  const isStartingRef = React.useRef<boolean>(false);

  // Transcript accumulation refs
  const finalTranscriptsRef = React.useRef<string[]>([]); // Array of final transcripts
  const currentPartialRef = React.useRef<string>(""); // Current partial transcript
  const finalConfidenceRef = React.useRef<number>(0);

  // Silence detection refs
  const lastTranscriptTimeRef = React.useRef<number>(0);
  const recordingStartTimeRef = React.useRef<number>(0);
  const silenceTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const hasReceivedTranscriptRef = React.useRef<boolean>(false);
  const isStoppingRef = React.useRef<boolean>(false); // Prevent double stop

  // URL request tracking
  const urlRequestTimeRef = React.useRef<number>(0);
  const pendingUrlRequestRef = React.useRef<boolean>(false);

  // Forward declare stopRecording to fix ESLint error
  const stopRecordingRef = React.useRef<(() => void) | null>(null);

  const handleTranscript = React.useCallback(
    (result: { text: string; confidence: number; isPartial: boolean }) => {
      lastTranscriptTimeRef.current = Date.now();
      hasReceivedTranscriptRef.current = true;

      if (result.isPartial) {
        // Update current partial (don't accumulate partials)
        currentPartialRef.current = result.text;
        onPartialTranscript(result.text, result.confidence);
        
        // Update partial turn in UI
        useSessionStore.getState().updatePartialTurn(result.text);
      } else {
        // Accumulate final transcripts
        const newText = result.text.trim();
        if (newText) {
          finalTranscriptsRef.current.push(newText);
          finalConfidenceRef.current = result.confidence;
          
          // Build full transcript
          const fullTranscript = finalTranscriptsRef.current.join(" ");
          onFinalTranscript(fullTranscript, result.confidence);
          
          // Update partial turn with final text
          useSessionStore.getState().updatePartialTurn(fullTranscript);
        }
        
        // Clear partial after final
        currentPartialRef.current = "";
      }
    },
    [onPartialTranscript, onFinalTranscript]
  );

  const connectToTranscribe = React.useCallback(
    (url: string) => {
      const socket = new WebSocket(url);
      transcribeSocketRef.current = socket;
      socket.binaryType = "arraybuffer";

      socket.onopen = () => {
        setState("recording");
        isStartingRef.current = false;
        pendingUrlRequestRef.current = false;

        // Start silence detection with network latency buffer
        silenceTimerRef.current = setInterval(() => {
          const now = Date.now();
          const timeSinceLastTranscript = now - lastTranscriptTimeRef.current;
          const recordingDuration = now - recordingStartTimeRef.current;

          if (
            hasReceivedTranscriptRef.current &&
            recordingDuration > MIN_SPEECH_DURATION_MS &&
            timeSinceLastTranscript > SILENCE_TIMEOUT_MS + NETWORK_LATENCY_BUFFER_MS
          ) {
            stopRecordingRef.current?.();
          }
        }, 500);
      };

      socket.onmessage = (event: MessageEvent) => {
        if (event.data instanceof ArrayBuffer) {
          try {
            const transcript = parseTranscriptEvent(event.data);
            if (transcript) {
              handleTranscript(transcript);
            }
          } catch (err) {
            console.error("[Recorder] Failed to parse transcript:", err);
          }
        }
      };

      socket.onerror = () => {
        setState("error");
        onError("Transcribe connection error");
        isStartingRef.current = false;
        pendingUrlRequestRef.current = false;
      };

      socket.onclose = (event) => {
        // Check for AWS error codes
        if (event.code === 1000 && event.reason.includes("exception")) {
          if (event.reason.includes("AccessDeniedException") || event.reason.includes("not authorized")) {
            onError("Không có quyền truy cập AWS Transcribe. Vui lòng liên hệ admin.");
          } else {
            onError("AWS Transcribe từ chối yêu cầu. Vui lòng thử lại.");
          }
        }
        
        transcribeSocketRef.current = null;
      };
    },
    [handleTranscript, onError, SILENCE_TIMEOUT_MS]
  );

  const stopRecording = React.useCallback(async () => {
    // Prevent double stop
    if (isStoppingRef.current) {
      return;
    }
    
    isStoppingRef.current = true;
    
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Send empty audio event to signal end of stream
    if (transcribeSocketRef.current && transcribeSocketRef.current.readyState === WebSocket.OPEN) {
      const emptyEvent = encodeAudioEvent(new Uint8Array(0));
      transcribeSocketRef.current.send(emptyEvent);
    }

    // Wait for final transcript
    await new Promise((resolve) => setTimeout(resolve, FINAL_TRANSCRIPT_WAIT_MS));

    // Close Transcribe WebSocket
    if (transcribeSocketRef.current) {
      transcribeSocketRef.current.close();
      transcribeSocketRef.current = null;
    }

    // Submit transcript
    const finalTranscript = finalTranscriptsRef.current.join(" ").trim();
    const partialTranscript = currentPartialRef.current.trim();
    const transcriptToSend = finalTranscript || partialTranscript;
    const confidenceToSend = finalTranscript ? finalConfidenceRef.current : 0.8;

    if (transcriptToSend) {
      // Calculate correct turn_index BEFORE removing partial turn
      const currentTurns = useSessionStore.getState().turns;
      const nextTurnIndex = currentTurns.filter(t => !t.is_partial).length;
      
      // Remove partial turn
      useSessionStore.getState().removePartialTurn();
      
      const newTurn: Turn = {
        turn_index: nextTurnIndex,
        speaker: TurnSpeaker.USER,
        content: transcriptToSend,
        is_hint_used: false,
        is_pending: true,
      };

      useSessionStore.getState().setTurns((prev: Turn[]) => [...prev, newTurn]);
      useSessionStore.getState().setAiStreaming(true, "");

      ws.send({
        action: WsClientEvent.SUBMIT_TRANSCRIPT,
        session_id: sessionId,
        text: transcriptToSend,
        confidence: confidenceToSend,
      });
    } else {
      // Remove partial turn if no transcript
      useSessionStore.getState().removePartialTurn();
      onError("Không nhận được văn bản. Vui lòng thử lại.");
    }

    // Reset refs
    finalTranscriptsRef.current = [];
    currentPartialRef.current = "";
    finalConfidenceRef.current = 0;
    lastTranscriptTimeRef.current = 0;
    recordingStartTimeRef.current = 0;
    hasReceivedTranscriptRef.current = false;

    setState("idle");
    isStartingRef.current = false;
    pendingUrlRequestRef.current = false;
    isStoppingRef.current = false; // Reset stopping flag
  }, [ws, sessionId, onError]);

  const cancelRecording = React.useCallback(() => {
    // Prevent double stop
    if (isStoppingRef.current) {
      return;
    }
    
    isStoppingRef.current = true;
    
    if (silenceTimerRef.current) {
      clearInterval(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Close Transcribe WebSocket without sending data
    if (transcribeSocketRef.current) {
      transcribeSocketRef.current.close();
      transcribeSocketRef.current = null;
    }

    // Remove partial turn (don't submit anything)
    useSessionStore.getState().removePartialTurn();

    // Reset refs
    finalTranscriptsRef.current = [];
    currentPartialRef.current = "";
    finalConfidenceRef.current = 0;
    lastTranscriptTimeRef.current = 0;
    recordingStartTimeRef.current = 0;
    hasReceivedTranscriptRef.current = false;

    setState("idle");
    isStartingRef.current = false;
    pendingUrlRequestRef.current = false;
    isStoppingRef.current = false;
  }, []);

  // Set the ref after callback is defined
  React.useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  const waitForTranscribeUrl = React.useCallback(
    (timeout: number): Promise<string | null> => {
      return new Promise((resolve) => {
        const startTime = Date.now();

        const check = () => {
          const url = useSessionStore.getState().transcribeUrl;
          if (url) {
            useSessionStore.getState().setTranscribeUrl(null);
            resolve(url);
            return;
          }

          if (Date.now() - startTime > timeout) {
            resolve(null);
            return;
          }

          setTimeout(check, 100);
        };

        check();
      });
    },
    []
  );

  const startRecording = React.useCallback(async () => {
    if (state === "recording" || state === "uploading" || state === "processing") {
      return;
    }

    if (isStartingRef.current) {
      return;
    }

    isStartingRef.current = true;

    if (ws.connectionState !== "connected") {
      isStartingRef.current = false;
      onError("Mất kết nối máy chủ. Vui lòng thử lại.");
      return;
    }

    if (!supportsAudioWorklet()) {
      isStartingRef.current = false;
      setState("error");
      onError("Trình duyệt không hỗ trợ AudioWorklet. Vui lòng cập nhật trình duyệt.");
      return;
    }

    try {
      // Reset all transcript refs
      finalTranscriptsRef.current = [];
      currentPartialRef.current = "";
      finalConfidenceRef.current = 0;
      lastTranscriptTimeRef.current = Date.now();
      recordingStartTimeRef.current = Date.now();
      hasReceivedTranscriptRef.current = false;

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Create AudioContext
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const sourceSampleRate = audioContext.sampleRate;

      // Load AudioWorklet module
      try {
        await audioContext.audioWorklet.addModule("/audio-worklet-processor.js");
      } catch {
        throw new Error("Không thể tải audio processor. Vui lòng thử lại.");
      }

      // Create AudioWorklet node
      const workletNode = new AudioWorkletNode(audioContext, "audio-capture-processor");
      audioWorkletNodeRef.current = workletNode;

      // Request presigned URL from backend
      urlRequestTimeRef.current = Date.now();
      pendingUrlRequestRef.current = true;
      
      ws.send({
        action: WsClientEvent.GET_TRANSCRIBE_URL,
        session_id: sessionId,
      });

      // Wait for URL with timeout
      const url = await waitForTranscribeUrl(TRANSCRIBE_URL_TIMEOUT_MS);

      if (!url) {
        throw new Error("Không nhận được URL từ server. Vui lòng thử lại.");
      }

      // Connect to Transcribe
      connectToTranscribe(url);

      // Handle audio data from worklet
      workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
        if (transcribeSocketRef.current?.readyState === WebSocket.OPEN) {
          try {
            const pcmData = processAudioForTranscribe(event.data, sourceSampleRate, SAMPLE_RATE);
            const encoded = encodeAudioEvent(pcmData);
            transcribeSocketRef.current.send(encoded);
          } catch (error) {
            console.error("[Recorder] Failed to process audio chunk:", error);
          }
        }
      };

      // Connect microphone → worklet
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(workletNode);
    } catch (error) {
      // Cleanup
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.disconnect();
        audioWorkletNodeRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      isStartingRef.current = false;
      pendingUrlRequestRef.current = false;
      isStoppingRef.current = false; // Reset on error
      
      // Remove partial turn on error
      useSessionStore.getState().removePartialTurn();

      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setState("permission-denied");
        onError("Trình duyệt không cho phép truy cập microphone.");
      } else {
        setState("error");
        onError(error instanceof Error ? error.message : "Không thể khởi động streaming.");
      }
    }
  }, [state, ws, sessionId, onError, waitForTranscribeUrl, connectToTranscribe]);

  // Listen for transcribeUrl changes and connect
  const transcribeUrl = useSessionStore((s) => s.transcribeUrl);

  React.useEffect(() => {
    if (transcribeUrl && pendingUrlRequestRef.current) {
      // URL will be picked up by waitForTranscribeUrl
    }
  }, [transcribeUrl]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearInterval(silenceTimerRef.current);
      }
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (transcribeSocketRef.current) {
        transcribeSocketRef.current.close();
      }
      isStartingRef.current = false;
      pendingUrlRequestRef.current = false;
      isStoppingRef.current = false;
      
      // Remove partial turn on cleanup
      useSessionStore.getState().removePartialTurn();
      
      finalTranscriptsRef.current = [];
      currentPartialRef.current = "";
      finalConfidenceRef.current = 0;
      lastTranscriptTimeRef.current = 0;
      recordingStartTimeRef.current = 0;
      hasReceivedTranscriptRef.current = false;
    };
  }, []);

  return { state, startRecording, stopRecording, cancelRecording };
}
