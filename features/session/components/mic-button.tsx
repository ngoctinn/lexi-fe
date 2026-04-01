"use client";

import * as React from "react";
import { Mic, Loader2, MicOff } from "lucide-react";

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
      {isListening && (
        <span className="absolute inset-0 z-0 animate-ping rounded-full bg-destructive/60 opacity-75" />
      )}
      <Button
        type="button"
        variant="outline"
        size={isListening ? "icon-2xl" : "icon-xl"}
        disabled={disabled || isProcessing || recorderState === "permission-denied"}
        onClick={onToggle}
        className={cn(
          "relative z-10 transition-all duration-300 rounded-full",
          isListening
            ? "bg-destructive text-destructive-foreground hover:bg-destructive shadow-[0_0_20px_rgba(239,68,68,0.5)] border-transparent"
            : "bg-background hover:bg-muted shadow-sm",
        )}
        title={isListening ? "Nhấn để dừng và gửi" : "Nhấn để bắt đầu nói"}
        aria-label={isListening ? "Stop recording" : "Start recording"}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin" />
        ) : isListening ? (
          <Mic />
        ) : recorderState === "permission-denied" ? (
          <MicOff className="text-muted-foreground" />
        ) : (
          <Mic className="text-primary" />
        )}
      </Button>
    </div>
  );
}
