"use client";

import * as React from "react";
import type { Turn } from "@/features/session/types/session.types";
import { TurnBubble } from "./turn-bubble";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TranscriptPanelProps {
  turns: Turn[];
  isAiStreaming: boolean;
  aiStreamingText: string;
  aiName: string;
  onTranslate?: (turnIndex: number) => void;
  className?: string;
}

export function TranscriptPanel({
  turns,
  isAiStreaming,
  aiStreamingText,
  aiName,
  onTranslate,
  className,
}: TranscriptPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Auto scroll on new turn or while streaming
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [turns.length, aiStreamingText, isAiStreaming]);

  return (
    <div ref={scrollRef} className={cn("relative flex-1 min-h-0 overflow-y-auto px-4 py-4", className)}>
      <div className="flex flex-col gap-6 w-full pb-8 lg:px-4">
        
        {turns.length === 0 && !isAiStreaming && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
            <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <span className="text-2xl">👋</span>
            </div>
            <p className="text-sm font-medium">Phiên học đã sẵn sàng.</p>
            <p className="text-xs max-w-xs mt-1">
              Bạn có thể bắt đầu trước hoặc chờ AI gửi lời chào.
            </p>
          </div>
        )}

        {turns.map((turn, idx) => (
          <TurnBubble
            key={`${turn.turn_index}-${idx}`}
            turn={turn}
            aiName={aiName}
            onTranslate={onTranslate}
          />
        ))}

        {/* AI Streaming Bubble */}
        {(isAiStreaming || aiStreamingText) && (
          <div className="flex w-full items-end gap-2 px-4 py-2 justify-start slide-in-bottom">
            <Avatar className="size-8 shrink-0 mb-1 border shadow-sm">
              <AvatarImage src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${aiName}`} alt={aiName} />
              <AvatarFallback className="text-[10px]">AI</AvatarFallback>
            </Avatar>
            <div className="relative rounded-2xl rounded-bl-sm bg-muted text-foreground ring-1 ring-inset ring-border px-4 py-2.5 text-sm md:text-base max-w-[85%] sm:max-w-[75%]">
              {aiStreamingText}
              {isAiStreaming && (
                <span className="ml-1 inline-flex w-3 items-center">
                  <span className="animate-[pulse_1.5s_infinite] text-primary">.</span>
                  <span className="animate-[pulse_1.5s_0.2s_infinite] text-primary">.</span>
                  <span className="animate-[pulse_1.5s_0.4s_infinite] text-primary">.</span>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
