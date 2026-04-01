"use client";

import * as React from "react";
import { SendHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { 
  InputGroup, 
  InputGroupInput, 
  InputGroupAddon, 
  InputGroupButton 
} from "@/components/ui/input-group";
import { MicButton } from "./mic-button";
import type { RecorderState } from "@/features/session/types/session.types";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onToggleMic: () => void;
  recorderState: RecorderState;
  disabled?: boolean;
  className?: string;
}

export function MessageInput({
  onSendMessage,
  onToggleMic,
  recorderState,
  disabled,
  className,
}: MessageInputProps) {
  const [text, setText] = React.useState("");

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const isRecording = recorderState === "recording";

  return (
    <div className={cn("flex items-center gap-3 w-full max-w-4xl mx-auto", className)}>
      <InputGroup 
        size="2xl" 
        className={cn(
          "flex-1 items-center bg-background rounded-2xl transition-all",
          isRecording && "opacity-50 pointer-events-none"
        )}
      >
        <InputGroupInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isRecording ? "Đang lắng nghe..." : "Nhập câu trả lời bằng tiếng Anh..."}
          className="px-4"
          disabled={disabled || isRecording}
        />
        
        <InputGroupAddon align="inline-end" className="pr-1.5 h-full">
          <InputGroupButton
            size="icon-sm"
            variant="ghost"
            disabled={disabled || !text.trim() || isRecording}
            onClick={handleSend}
            className="rounded-xl hover:bg-primary/10 hover:text-primary shrink-0"
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
  );
}
