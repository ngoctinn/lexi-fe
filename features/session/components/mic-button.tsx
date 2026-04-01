"use client";

import * as React from "react";
import { Mic, Loader2, MicOff, Square } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { RecorderState } from "@/features/session/types/session.types";

interface MicButtonProps {
  recorderState: RecorderState;
  onToggle: () => void;
  className?: string;
  disabled?: boolean;
}

export function MicButton({ recorderState, onToggle, className, disabled }: MicButtonProps) {
  const isListening = recorderState === "recording";
  const isProcessing = recorderState === "uploading" || recorderState === "processing";

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <Button
        type="button"
        variant={isListening ? "soft" : "default"}
        size="icon-2xl"
        disabled={disabled || isProcessing || recorderState === "permission-denied"}
        onClick={onToggle}
        className="shrink-0"
        title={isListening ? "Nhấn để dừng và gửi" : "Nhấn để bắt đầu nói"}
        aria-label={isListening ? "Stop recording" : "Start recording"}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin size-5" />
        ) : isListening ? (
          <Square className="fill-current size-5" />
        ) : recorderState === "permission-denied" ? (
          <MicOff className="size-5" />
        ) : (
          <Mic className="size-5" />
        )}
      </Button>
    </div>
  );
}
