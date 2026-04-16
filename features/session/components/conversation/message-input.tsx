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
      {/* Hiệu ứng sóng âm phía trên input khi đang ghi âm */}
      {isRecording && (
        <div className="flex items-center gap-3 mb-1">
          <Waveform className="h-6" />
          <span className="text-xs text-primary font-semibold tabular-nums ml-2">
            {formatTime(timer)}
          </span>
          <span className="text-xs text-muted-foreground font-medium ml-4">
            Đang ghi âm...
          </span>
        </div>
      )}
      <div className="flex items-center gap-3 w-full">
        <InputGroup
          size="xl"
          className={cn(
            "flex-1 items-center transition-all bg-background",
            isRecording && "border-primary bg-primary/5",
          )}
        >
          <InputGroupInput
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecording
                ? "Đang ghi âm..."
                : "Nhập câu trả lời bằng tiếng Anh..."
            }
            disabled={disabled || isRecording}
            aria-label={
              isRecording
                ? "Đang ghi âm, nhập liệu tạm khóa"
                : "Nhập câu trả lời"
            }
          />
          <InputGroupAddon align="inline-end" className="pr-1.5 h-full">
            <InputGroupButton
              size="icon-sm"
              variant="ghost"
              disabled={disabled || !value.trim() || isRecording}
              onClick={handleSend}
              className="hover:bg-primary/10 hover:text-primary shrink-0"
            >
              <SendHorizontal />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <MicButton
          recorderState={recorderState}
          onToggle={onToggleMic}
          disabled={disabled}
          className="shrink-0"
        />
      </div>
    </div>
  );
}
