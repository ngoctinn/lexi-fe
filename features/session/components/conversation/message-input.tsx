"use client";

import * as React from "react";
import { SendHorizontal, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";

import { MicButton } from "./mic-button";
import type { RecorderState } from "@/features/session/types/session.types";
import { useSessionStore } from "@/features/session/stores/use-session-store";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onToggleMic: () => void;
  onCancelRecording?: () => void;
  recorderState: RecorderState;
  disabled?: boolean;
  className?: string;
  value: string;
  onValueChange: (value: string) => void;
}

export function MessageInput({
  onSendMessage,
  onToggleMic,
  onCancelRecording,
  recorderState,
  disabled,
  className,
  value,
  onValueChange,
}: MessageInputProps) {
  const [timer, setTimer] = React.useState(0);
  const isRecording = recorderState === "recording";
  
  // Get partial turn from turns array to detect if user is speaking
  const turns = useSessionStore((state) => state.turns);
  const hasPartialText = turns.some(turn => turn.is_partial && turn.content.trim().length > 0);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      // Reset timer in next tick to avoid cascading render
      const resetTimer = setTimeout(() => setTimer(0), 0);
      interval = setInterval(() => {
        setTimer((v) => v + 1);
      }, 1000);
      
      return () => {
        clearTimeout(resetTimer);
        clearInterval(interval);
      };
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSendMessage(value);
      onValueChange("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-2 w-full max-w-4xl mx-auto", className)}
    >
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-1 group">
          <InputGroup
            size="xl"
            className={cn(
              "items-center transition-all bg-background border-border/60",
              isRecording && "border-primary ring-2 ring-primary-100 bg-primary-50",
            )}
          >
            {isRecording ? (
              <div className="flex-1 flex items-center gap-3 px-4 py-3 animate-in fade-in duration-300">
                {/* Simple horizontal bar - vibrates when speaking */}
                <div className="flex-1 flex items-center h-8">
                  <div 
                    className={cn(
                      "flex-1 h-1 bg-primary rounded-full transition-all duration-150",
                      hasPartialText ? "animate-pulse scale-y-150" : ""
                    )}
                  />
                </div>
                
                {/* Timer */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground font-mono tabular-nums">
                    {formatTime(timer)}
                  </span>
                </div>
                
                {/* Cancel button inside input */}
                {onCancelRecording && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCancelRecording}
                    className="h-8 px-2 shrink-0 hover:bg-destructive-50 hover:text-destructive"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ) : (
              <InputGroupInput
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu trả lời bằng tiếng Anh..."
                disabled={disabled}
                className="bg-transparent border-none shadow-none focus-visible:ring-0"
              />
            )}
            
            {!isRecording && (
              <InputGroupAddon align="inline-end" className="pr-2">
                <InputGroupButton
                  size="icon-sm"
                  variant="ghost"
                  disabled={disabled || !value.trim()}
                  onClick={handleSend}
                  className="hover:bg-primary-50 hover:text-primary rounded-lg transition-colors"
                >
                  <SendHorizontal className="size-5" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
        
        {/* Mic button - changes to Send when recording */}
        <MicButton
          recorderState={recorderState}
          onToggle={onToggleMic}
          disabled={disabled}
          className={cn(
            "shrink-0 transition-all duration-200",
            isRecording && "scale-110"
          )}
        />
      </div>
    </div>
  );
}
