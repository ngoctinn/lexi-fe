"use client";

import * as React from "react";
import { Volume2, Languages, BookmarkPlus, Loader2, XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Turn } from "@/features/session/types/session.types";
import { TurnSpeaker } from "@/features/session/types/session.types";
import type { TranslateWordResult } from "@/features/session/actions/translate-word";
import { LatencyMetrics } from "./latency-metrics";
import { isDebugMetricsEnabled } from "@/features/session/utils/feature-flags";

interface TurnBubbleProps {
  turn: Turn;
  onPlayAudio?: (url: string) => void;
  onTranslate?: (turnIndex: number) => void;
  onTranslateWord?: (word: string, context: string) => Promise<TranslateWordResult>;
  isPlaying?: boolean;
}

export const TurnBubble = React.memo(function TurnBubble({
  turn,
  onPlayAudio,
  onTranslate,
  onTranslateWord,
  isPlaying,
}: TurnBubbleProps) {
  const isUser = turn.speaker === TurnSpeaker.USER;
  const [showTranslation, setShowTranslation] = React.useState(false);
  const [activeWord, setActiveWord] = React.useState<{
    word: string;
    index: number;
  } | null>(null);
  const [wordTranslations, setWordTranslations] = React.useState<
    Record<string, TranslateWordResult>
  >({});
  const [isTranslatingWord, setIsTranslatingWord] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const isSelectingRef = React.useRef(false);



  const hasTranslation =
    Boolean(turn.translated_content) &&
    turn.translated_content !== "Đang yêu cầu bản dịch...";

  const toggleTranslate = () => {
    if (!turn.translated_content) {
      onTranslate?.(turn.turn_index);
    }
    setShowTranslation((v) => !v);
  };

  const handleWordClick = React.useCallback(async (word: string) => {
    // Prevent if user is selecting text
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    const cleanWord = word.trim();
    if (!cleanWord) return;

    setActiveWord({
      word: cleanWord,
      index: Date.now(),
    });

    // Check if we already have translation for this word
    if (!wordTranslations[cleanWord] && onTranslateWord) {
      setIsTranslatingWord(true);
      try {
        const vocabData = await onTranslateWord(cleanWord, turn.content);
        setWordTranslations((prev) => ({
          ...prev,
          [cleanWord]: vocabData,
        }));
      } finally {
        setIsTranslatingWord(false);
      }
    }
  }, [wordTranslations, onTranslateWord, turn.content]);

  // Tokenize text into clickable words
  const tokenizeText = React.useCallback((text: string) => {
    // Split by word boundaries but keep separators
    const tokens = text.split(/(\s+|[^\w\s]+)/);
    
    return tokens.map((token, index) => {
      // Check if token is a word (contains letters/numbers)
      const isWord = /\w/.test(token);
      
      if (isWord) {
        return (
          <Popover
            key={index}
            open={activeWord?.word === token && activeWord?.index !== undefined}
            onOpenChange={(open) => {
              if (!open) {
                setActiveWord(null);
              }
            }}
          >
            <PopoverTrigger asChild>
              <span
                className="cursor-pointer inline-block mx-px rounded hover:bg-yellow-300 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWordClick(token);
                }}
              >
                {token}
              </span>
            </PopoverTrigger>
            <PopoverContent 
              className="w-96 p-0 shadow-xl overflow-hidden bg-white rounded-xl border-2 border-blue-100"
              side="right"
              align="center"
            >
              {isTranslatingWord ? (
                <div className="flex items-center justify-center gap-2 p-6 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="text-sm">Đang tra từ...</span>
                </div>
              ) : activeWord && wordTranslations[activeWord.word] ? (
                <>
                  {(() => {
                    const vocabData = wordTranslations[activeWord.word];
                    return (
                      <>
                        <div className="relative">
                          <button 
                            className="bg-gray-200 absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
                            onClick={() => setActiveWord(null)}
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                          
                          <div className="p-3 border-b bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border-blue-100">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Word</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-xl text-gray-800">{activeWord.word}</p>
                                {vocabData.audio_url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1.5 rounded-full transition-colors text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onPlayAudio?.(vocabData.audio_url!);
                                    }}
                                  >
                                    <Volume2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                              <p className="font-medium text-blue-700">{vocabData.translation_vi}</p>
                            </div>
                          </div>

                          <div className="p-3 border-b bg-gradient-to-r from-gray-50 to-gray-50 border-gray-100 space-y-2">
                            <p className="text-sm leading-relaxed text-gray-700">
                              {turn.content.split(new RegExp(`(${activeWord.word})`, 'gi')).map((part, i) =>
                                part.toLowerCase() === activeWord.word.toLowerCase() ? (
                                  <span key={i} className="bg-yellow-300 px-1.5 py-0.5 rounded-md font-bold text-gray-900 ring-2 ring-yellow-100/50">
                                    {part}
                                  </span>
                                ) : (
                                  <span key={i}>{part}</span>
                                )
                              )}
                            </p>
                            {turn.translated_content && (
                              <div className="border-t border-gray-100 pt-2">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Translation</p>
                                <p className="text-sm text-blue-600 font-medium">{turn.translated_content}</p>
                              </div>
                            )}
                          </div>

                          {vocabData.example_sentence && (
                            <div className="p-3 border-b border-gray-100">
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Example</p>
                              <p className="text-sm text-gray-700 italic">
                                &ldquo;{vocabData.example_sentence}&rdquo;
                              </p>
                            </div>
                          )}

                          <div className="px-3 pt-2 pb-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => {
                                setActiveWord(null);
                              }}
                            >
                              <BookmarkPlus className="size-4 mr-2" />
                              Lưu flashcard
                            </Button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </>
              ) : activeWord ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Không thể tra từ &ldquo;{activeWord.word}&rdquo;.
                  </p>
                </div>
              ) : null}
            </PopoverContent>
          </Popover>
        );
      }
      
      // Return spaces and punctuation as-is
      return <span key={index}>{token}</span>;
    });
  }, [handleWordClick, activeWord, isTranslatingWord, wordTranslations, turn.content, turn.translated_content, onPlayAudio]);

  // Track text selection to prevent word lookup when selecting
  const handleMouseDown = React.useCallback(() => {
    isSelectingRef.current = false;
  }, []);

  const handleMouseMove = React.useCallback(() => {
    isSelectingRef.current = true;
  }, []);

  return (
    <div
      className={cn(
        "flex w-full items-end gap-3 px-4 py-2",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-1.5 max-w-[80%]",
          isUser && "items-end",
        )}
      >
        <div
          className={cn(
            "group relative rounded-2xl px-4 py-3 text-lg leading-relaxed transition-all",
            isUser
              ? "rounded-tr-sm bg-primary-500 text-white border border-primary-600 shadow-sm"
              : "rounded-tl-sm bg-muted text-foreground ring-1 ring-border shadow-sm",
            turn.is_pending && "opacity-70 animate-pulse",
          )}
        >
          <div className="flex flex-col gap-2">
            <div 
              ref={contentRef}
              className="leading-relaxed text-lg select-text"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
            >
              {tokenizeText(turn.content)}
            </div>

            {/* Popover for word translation is now handled in tokenizeText */}

            {showTranslation && (
              <div
                className={cn(
                  "text-base border-t pt-2 mt-1",
                  isUser
                    ? "border-white/20 text-white/95"
                    : "border-border text-muted-foreground",
                )}
              >
                <div className="italic font-medium whitespace-pre-wrap text-lg">
                  {hasTranslation
                    ? turn.translated_content
                    : "Đang yêu cầu bản dịch..."}
                </div>
              </div>
            )}
          </div>

          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              isUser ? "right-full mr-2" : "left-full ml-2",
            )}
          >
            {!isUser && turn.audio_url && (
              <Button
                variant="secondary"
                size="icon-xs"
                className="rounded-full bg-background/90 backdrop-blur shadow-sm border border-border/50 hover:bg-background"
                onClick={() => onPlayAudio?.(turn.audio_url!)}
              >
                <Volume2
                  className={cn("size-3", isPlaying && "text-primary")}
                />
              </Button>
            )}
            <Button
              variant="secondary"
              size="icon-xs"
              className={cn(
                "rounded-full bg-background/90 backdrop-blur shadow-sm border border-border/50 hover:bg-background",
                showTranslation && "text-primary bg-primary/10",
              )}
              onClick={toggleTranslate}
            >
              <Languages className="size-3" />
            </Button>
          </div>
        </div>

        {turn.is_hint_used && (
          <div
            className={cn(
              "flex px-1",
              isUser ? "justify-end" : "justify-start",
            )}
          >
            <Badge
              variant="warning"
              size="xs"
              className="text-2xs font-bold uppercase tracking-widest"
            >
              Dùng gợi ý
            </Badge>
          </div>
        )}

        {!isUser && isDebugMetricsEnabled() && (turn.ttft_ms !== undefined || turn.latency_ms !== undefined) && (
          <div
            className={cn(
              "flex px-1",
              isUser ? "justify-end" : "justify-start",
            )}
          >
            <LatencyMetrics
              ttftMs={turn.ttft_ms}
              latencyMs={turn.latency_ms}
              inputTokens={turn.input_tokens}
              outputTokens={turn.output_tokens}
              costUsd={turn.cost_usd}
              qualityScore={turn.quality_score}
            />
          </div>
        )}
      </div>
    </div>
  );
});
