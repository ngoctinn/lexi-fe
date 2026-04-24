"use client";

import * as React from "react";
import { useSessionStore } from "../stores/use-session-store";
import { cn } from "@/lib/utils";
import { Mic } from "lucide-react";

export function TranscriptDisplay() {
  const streamingTranscript = useSessionStore((state) => state.streamingTranscript);
  const recorderState = useSessionStore((state) => state.recorderState);
  const isRecording = recorderState === "recording";

  // Chỉ hiển thị khi đang recording
  if (!isRecording) {
    return null;
  }

  const hasFinalText = Boolean(streamingTranscript?.finalText);
  const hasPartialText = Boolean(streamingTranscript?.partialText);
  const isListening = !hasFinalText && !hasPartialText;

  return (
    <div className="flex w-full items-start gap-3 px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Mic icon với animation */}
      <div className="shrink-0 mt-1">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative size-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Mic className="size-4 text-primary" />
          </div>
        </div>
      </div>

      {/* Transcript content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Final text - màu đen */}
        {hasFinalText && streamingTranscript && (
          <p className="text-sm text-foreground font-medium leading-relaxed">
            {streamingTranscript.finalText}
          </p>
        )}

        {/* Partial text - màu xám */}
        {hasPartialText && streamingTranscript && (
          <p className="text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
            {streamingTranscript.partialText}
          </p>
        )}

        {/* Listening state */}
        {isListening && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground italic">
              Đang lắng nghe...
            </p>
            <div className="flex items-center gap-1">
              <span
                className="size-1.5 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <span
                className="size-1.5 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: "0.15s" }}
              />
              <span
                className="size-1.5 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
