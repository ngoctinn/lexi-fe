"use client";

import * as React from "react";
import type { Turn } from "@/features/session/types/session.types";
import type { TranslateWordResult } from "@/features/session/actions/translate-word";
import { TurnBubble } from "./turn-bubble";
import { extractDeliveryCue, getCueEmoji, getCueLabel } from "@/features/session/utils/delivery-cue";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TranscriptPanelProps {
  turns: Turn[];
  isAiStreaming: boolean;
  aiStreamingText: string;
  aiName: string;
  onTranslate?: (turnIndex: number) => void;
  onTranslateWord?: (word: string, context: string) => Promise<TranslateWordResult>;
  onAnalyze?: (turnIndex: number) => void;
  savingTurnIndexes?: number[];
  className?: string;
}

export function TranscriptPanel({
  turns,
  isAiStreaming,
  aiStreamingText,
  aiName,
  onTranslate,
  onTranslateWord,
  onAnalyze,
  savingTurnIndexes = [],
  className,
}: TranscriptPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new content arrives
  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns.length, aiStreamingText, isAiStreaming]);

  return (
    <ScrollArea
      className={cn("relative flex-1 min-h-0", className)}
      ref={scrollRef}
    >
      <div className="flex flex-col gap-4 w-full pb-8 px-4 py-4 lg:px-8">
        {turns.length === 0 && !isAiStreaming && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground animate-in fade-in duration-500">
            <div className="size-16 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-4 shadow-sm">
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
            onTranslate={onTranslate}
            onTranslateWord={onTranslateWord}
            onAnalyze={onAnalyze}
          />
        ))}

        {(isAiStreaming || aiStreamingText) && (
          <div className="flex w-full items-end gap-3 px-4 py-2 justify-start">
            <div className="relative rounded-2xl rounded-tl-sm bg-muted text-foreground ring-1 ring-inset ring-border px-4 py-3 text-base leading-relaxed max-w-[80%] shadow-sm">
              {aiStreamingText ? (
                <div className="flex flex-col gap-2">
                  {(() => {
                    const { cue, cleanText } = extractDeliveryCue(aiStreamingText);
                    return (
                      <>
                        {cue && (
                          <Badge variant="secondary" className="w-fit text-xs">
                            <span className="mr-1">{getCueEmoji(cue)}</span>
                            {getCueLabel(cue)}
                          </Badge>
                        )}
                        {cleanText}
                      </>
                    );
                  })()}
                  {isAiStreaming && (
                    <div className="flex items-center gap-1 h-5 ml-1">
                      <span
                        className="size-1.5 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "0s" }}
                      />
                      <span
                        className="size-1.5 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <span
                        className="size-1.5 rounded-full bg-primary/60 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 h-5">
                  <span
                    className="size-1.5 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "0s" }}
                  />
                  <span
                    className="size-1.5 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="size-1.5 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invisible anchor for auto-scroll */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
