"use client";

import * as React from "react";
import type { RecorderState } from "@/features/session/types/session.types";
import { WsClientEvent } from "@/features/session/types/session.types";
import type { useWebSocket } from "./use-websocket";
import { useTranscribeStreaming, TranscriptResult } from "./use-transcribe-streaming";
import { processAudioForTranscribe, supportsAudioWorklet } from "../utils/audio-converter";

const SAMPLE_RATE = 16_000;

interface UseClientStreamingRecorderOptions {
  ws: ReturnType<typeof useWebSocket>;
  sessionId: string;
  onPartialTranscript: (text: string, confidence: number) => void;
  onFinalTranscript: (text: string, confidence: number) => void;
  onError: (message: string) => void;
}

interface UseClientStreamingRecorderReturn {
  state: RecorderState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
}

export function useClientStreamingRecorder({
  ws,
  sessionId,
  onPartialTranscript,
  onFinalTranscript,
  onError,
}: UseClientStreamingRecorderOptions): UseClientStreamingRecorderReturn {
  const [state, setState] = React.useState<RecorderState>("idle");

  const audioContextRef = React.useRef<AudioContext | null>(null);
  const audioWorkletNodeRef = React.useRef<AudioWorkletNode | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const finalTranscriptRef = React.useRef<string>("");
  const finalConfidenceRef = React.useRef<number>(0);
  const isStartingRef = React.useRef<boolean>(false);

  const handleTranscript = React.useCallback(
    (result: TranscriptResult) => {
      if (result.isPartial) {
        onPartialTranscript(result.text, result.confidence);
      } else {
        // Store final transcript
        finalTranscriptRef.current = result.text;
        finalConfidenceRef.current = result.confidence;
        onFinalTranscript(result.text, result.confidence);
      }
    },
    [onPartialTranscript, onFinalTranscript]
  );

  const handleTranscribeError = React.useCallback(
    (error: string) => {
      setState("error");
      onError(error);
    },
    [onError]
  );

  const transcribe = useTranscribeStreaming({
    onTranscript: handleTranscript,
    onError: handleTranscribeError,
    onReady: () => {
      // Transcribe client is ready
    },
  });

  // Store transcribe methods in refs to avoid recreating startRecording
  const transcribeMethodsRef = React.useRef({
    isStreaming: false,
    startStream: transcribe.startStream,
    sendAudioChunk: transcribe.sendAudioChunk,
    closeStream: transcribe.closeStream,
  });

  // Update refs when transcribe methods change
  React.useEffect(() => {
    transcribeMethodsRef.current = {
      isStreaming: transcribe.isStreaming,
      startStream: transcribe.startStream,
      sendAudioChunk: transcribe.sendAudioChunk,
      closeStream: transcribe.closeStream,
    };
  }, [transcribe]);

  const stopRecording = React.useCallback(() => {
    console.log("[Recorder] Stopping recording...");
    
    // Stop audio worklet
    if (audioWorkletNodeRef.current) {
      audioWorkletNodeRef.current.disconnect();
      audioWorkletNodeRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    // Close Transcribe stream
    transcribeMethodsRef.current.closeStream();

    // Submit final transcript to backend via WebSocket
    if (finalTranscriptRef.current) {
      ws.send({
        action: WsClientEvent.SUBMIT_TRANSCRIPT,
        session_id: sessionId,
        text: finalTranscriptRef.current,
        confidence: finalConfidenceRef.current,
      });
    }

    setState("idle");
    isStartingRef.current = false;
  }, [ws, sessionId]);

  const startRecording = React.useCallback(async () => {
    // Prevent multiple simultaneous recordings
    if (state === "recording" || state === "uploading" || state === "processing") {
      console.warn("[Recorder] Recording already in progress, ignoring start request");
      return;
    }

    // Prevent race condition from multiple clicks
    if (isStartingRef.current) {
      console.warn("[Recorder] Recording start already in progress, ignoring duplicate request");
      return;
    }

    isStartingRef.current = true;

    // Check if WebSocket is connected
    if (ws.connectionState !== "connected") {
      isStartingRef.current = false;
      onError("Mất kết nối máy chủ. Vui lòng thử lại.");
      return;
    }

    // Check browser support
    if (!supportsAudioWorklet()) {
      isStartingRef.current = false;
      setState("error");
      onError("Trình duyệt không hỗ trợ AudioWorklet. Vui lòng cập nhật trình duyệt.");
      return;
    }

    try {
      // Reset final transcript
      finalTranscriptRef.current = "";
      finalConfidenceRef.current = 0;

      // Request microphone access
      console.log("[Recorder] Requesting microphone access...");
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
      console.log("[Recorder] Creating AudioContext...");
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const sourceSampleRate = audioContext.sampleRate;
      console.log(`[Recorder] Browser sample rate: ${sourceSampleRate}Hz`);

      // Load AudioWorklet module
      console.log("[Recorder] Loading AudioWorklet module...");
      try {
        await audioContext.audioWorklet.addModule('/audio-worklet-processor.js');
      } catch (moduleError) {
        console.error("[Recorder] Failed to load AudioWorklet module:", moduleError);
        throw new Error("Không thể tải audio processor. Vui lòng thử lại.");
      }

      // Create AudioWorklet node
      console.log("[Recorder] Creating AudioWorklet node...");
      const workletNode = new AudioWorkletNode(audioContext, 'audio-capture-processor');
      audioWorkletNodeRef.current = workletNode;

      // Handle audio data from worklet
      workletNode.port.onmessage = (event: MessageEvent<Float32Array>) => {
        if (transcribeMethodsRef.current.isStreaming) {
          try {
            // Process audio: resample to 16kHz and convert to Int16 PCM
            const pcmData = processAudioForTranscribe(event.data, sourceSampleRate, SAMPLE_RATE);
            
            // Create Blob from ArrayBuffer (TypeScript-safe)
            const pcmBlob = new Blob([pcmData.buffer as ArrayBuffer], { type: 'audio/pcm' });
            transcribeMethodsRef.current.sendAudioChunk(pcmBlob);
          } catch (error) {
            console.error("[Recorder] Failed to process audio chunk:", error);
          }
        }
      };

      // Connect microphone → worklet → destination (for monitoring, optional)
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(workletNode);
      // Note: We don't connect to destination to avoid feedback

      console.log("[Recorder] AudioWorklet setup complete");

      // Start Transcribe streaming
      console.log("[Recorder] Starting Transcribe stream...");
      setState("recording");
      
      try {
        await transcribeMethodsRef.current.startStream("en-US");
        console.log("[Recorder] Transcribe stream started successfully");
      } catch (err) {
        console.error("[Recorder] Transcribe start failed:", err);
        // Cleanup
        workletNode.disconnect();
        audioContext.close();
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        audioContextRef.current = null;
        audioWorkletNodeRef.current = null;
        isStartingRef.current = false;
        setState("error");
        onError("Không thể kết nối Transcribe. Vui lòng thử lại.");
        return;
      }

      isStartingRef.current = false;
    } catch (error) {
      console.error("[Recorder] Failed to start recording:", error);
      
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
      
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setState("permission-denied");
        onError("Trình duyệt không cho phép truy cập microphone.");
      } else {
        setState("error");
        onError("Không thể khởi động streaming.");
      }
    }
  }, [
    state,
    ws,
    onError,
  ]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (audioWorkletNodeRef.current) {
        audioWorkletNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      transcribeMethodsRef.current.closeStream();
      isStartingRef.current = false;
    };
  }, []);

  return { state, startRecording, stopRecording };
}
