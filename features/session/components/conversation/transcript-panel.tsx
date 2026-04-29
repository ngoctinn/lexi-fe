"use client";

import * as React from "react";
import type { Turn } from "@/features/session/types/session.types";
import type { TranslateWordResult } from "@/features/session/actions/translate-word";
import { TurnBubble } from "./turn-bubble";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface TranscriptPanelProps {
  turns: Turn[];
  isAiStreaming: boolean;
  silenceTimeoutMs?: number;
  timeSinceLastTranscript?: number;
  onPlayAudio?: (url: string) => void;
  playingAudioUrl?: string | null;
  onTranslate?: (turnIndex: number) => void;
  onTranslateWord?: (word: string, context: string) => Promise<TranslateWordResult>;
  onSaveFlashcard?: (turnIndex: number, vocabData?: TranslateWordResult) => Promise<void>;
  savingFlashcardTurnIndexes?: number[];
  analyzingTurnIndex?: number | null;
  onAnalyze?: (turnIndex: number) => void;
  className?: string;
}

export function TranscriptPanel({
  turns,
  isAiStreaming,
  silenceTimeoutMs = 3000,
  timeSinceLastTranscript = 0,
  onPlayAudio,
  playingAudioUrl,
  onTranslate,
  onTranslateWord,
  onSaveFlashcard,
  savingFlashcardTurnIndexes = [],
  analyzingTurnIndex,
  onAnalyze,
  className,
}: TranscriptPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  // Debug: Log turns changes
  React.useEffect(() => {
    console.log("[TranscriptPanel] Turns updated, count:", turns.length);
    if (turns.length > 0) {
      console.log("[TranscriptPanel] Last turn:", turns[turns.length - 1]);
    }
  }, [turns]);

  // Auto-scroll to bottom when new content arrives
  React.useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    const timeoutId = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => cancelAnimationFrame(timeoutId);
  }, [turns.length, isAiStreaming]);

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

        {turns.map((turn, idx) => {
          // Calculate actual turn_index by counting non-partial turns before this one
          const actualTurnIndex = turns
            .slice(0, idx)
            .filter(t => !t.is_partial)
            .length;
          
          return (
            <TurnBubble
              key={`${turn.turn_index}-${idx}`}
              turn={turn}
              actualTurnIndex={actualTurnIndex}
              silenceTimeoutMs={silenceTimeoutMs}
              timeSinceLastTranscript={timeSinceLastTranscript}
              onPlayAudio={onPlayAudio}
              isPlaying={turn.audio_url === playingAudioUrl}
              onTranslate={onTranslate}
              onTranslateWord={onTranslateWord}
              onSaveFlashcard={onSaveFlashcard}
              savingFlashcardTurnIndexes={savingFlashcardTurnIndexes}
              analyzingTurnIndex={analyzingTurnIndex}
              onAnalyze={onAnalyze}
            />
          );
        })}

        {isAiStreaming && (
          <div className="flex w-full items-end gap-3 px-4 py-2 justify-start">
            <div className="relative rounded-2xl rounded-tl-sm bg-muted text-foreground ring-1 ring-inset ring-border px-4 py-3 text-base leading-relaxed max-w-[80%] shadow-sm">
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
            </div>
          </div>
        )}

        {/* Invisible anchor for auto-scroll */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
