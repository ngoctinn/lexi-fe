"use client";

import * as React from "react";
import type { RecorderState } from "@/features/session/types/session.types";
import { useS3Upload } from "./use-s3-upload";

const SAMPLE_RATE = 16_000;
const MIME_TYPE = "audio/webm;codecs=opus";

interface UseAudioRecorderOptions {
  onRecordingComplete: (s3Key: string) => void;
  onError: (message: string) => void;
}

interface UseAudioRecorderReturn {
  state: RecorderState;
  startRecording: (presignedUrl: string, s3Key: string) => Promise<void>;
  stopRecording: () => void;
  uploadProgress: number;
}

export function useAudioRecorder({
  onRecordingComplete,
  onError,
}: UseAudioRecorderOptions): UseAudioRecorderReturn {
  const [state, setState] = React.useState<RecorderState>("idle");

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<BlobPart[]>([]);
  const streamRef = React.useRef<MediaStream | null>(null);
  const s3KeyRef = React.useRef<string>("");
  const presignedUrlRef = React.useRef<string>("");

  const { upload: uploadToS3, progress: uploadProgress } = useS3Upload();

  const stopRecording = React.useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = React.useCallback(
    async (presignedUrl: string, s3Key: string) => {
      if (state === "recording") {
        stopRecording();
        return;
      }

      presignedUrlRef.current = presignedUrl;
      s3KeyRef.current = s3Key;
      chunksRef.current = [];

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: SAMPLE_RATE,
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

      const mimeType = MediaRecorder.isTypeSupported(MIME_TYPE)
        ? MIME_TYPE
        : "";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;

        setState("uploading");
        try {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          const result = await uploadToS3(presignedUrlRef.current, blob);

          if (result.success) {
            setState("idle");
            onRecordingComplete(s3KeyRef.current);
          } else {
            setState("error");
            onError(result.error ?? "Upload audio thất bại.");
          }
        } catch {
          setState("error");
          onError("Upload audio thất bại.");
        } finally {
          chunksRef.current = [];
          mediaRecorderRef.current = null;
        }
      };

      recorder.onerror = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        setState("error");
        onError("Lỗi ghi âm.");
      };

      setState("recording");
      recorder.start(250);
    },
    [state, stopRecording, uploadToS3, onRecordingComplete, onError],
  );

  React.useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      chunksRef.current = [];
      mediaRecorderRef.current = null;
    };
  }, []);

  return { state, startRecording, stopRecording, uploadProgress };
}
