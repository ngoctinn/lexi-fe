"use client";

import * as React from "react";
import { SendHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";

import { MicButton } from "./mic-button";
import { Waveform } from "@/components/ui/waveform";
import type { RecorderState } from "@/features/session/types/session.types";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onToggleMic: () => void;
  recorderState: RecorderState;
  disabled?: boolean;
  className?: string;
  value: string;
  onValueChange: (value: string) => void;
}

export function MessageInput({
  onSendMessage,
  onToggleMic,
  recorderState,
  disabled,
  className,
  value,
  onValueChange,
}: MessageInputProps) {
  const [timer, setTimer] = React.useState(0);
  const isRecording = recorderState === "recording";

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      setTimer(0);
      interval = setInterval(() => {
        setTimer((v) => v + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
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
      className={cn("flex flex-col gap-1 w-full max-w-4xl mx-auto", className)}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="relative flex-1 group">
          <InputGroup
            size="xl"
            className={cn(
              "items-center transition-all bg-background border-border/60",
              isRecording && "border-primary ring-2 ring-primary-100 bg-primary-50",
            )}
          >
            {isRecording ? (
              <div className="flex-1 flex items-center px-4 h-full gap-4 animate-in fade-in duration-300">
                <Waveform className="h-6 flex-1 text-primary" />
                <div className="flex items-center gap-2 px-3 py-1 bg-primary-100 rounded-full border border-primary-100">
                  <div className="size-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs text-primary font-bold tabular-nums">
                    {formatTime(timer)}
                  </span>
                </div>
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
        
        <MicButton
          recorderState={recorderState}
          onToggle={onToggleMic}
          disabled={disabled}
          className={cn(
            "shrink-0 transition-transform duration-200",
            isRecording && "scale-110"
          )}
        />
      </div>
      
    </div>
  );
}
