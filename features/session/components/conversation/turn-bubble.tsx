"use client";

import * as React from "react";
import { Volume2, Languages, BookmarkPlus, Loader2, XIcon, Sparkles } from "lucide-react";

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

// Tone configuration mapping
const TONE_CONFIG = {
  warmly: {
    emoji: "😊",
    label: "Warm",
    bgLight: "bg-primary-50",
    bgDark: "bg-primary-100",
    textColor: "text-primary-900",
    borderColor: "border-primary-200",
  },
  encouragingly: {
    emoji: "💪",
    label: "Encouraging",
    bgLight: "bg-blue-50",
    bgDark: "bg-blue-100",
    textColor: "text-blue-900",
    borderColor: "border-blue-200",
  },
  gently: {
    emoji: "🤝",
    label: "Gentle",
    bgLight: "bg-amber-50",
    bgDark: "bg-amber-100",
    textColor: "text-amber-900",
    borderColor: "border-amber-200",
  },
  thoughtfully: {
    emoji: "🤔",
    label: "Thoughtful",
    bgLight: "bg-purple-50",
    bgDark: "bg-purple-100",
    textColor: "text-purple-900",
    borderColor: "border-purple-200",
  },
  naturally: {
    emoji: "💬",
    label: "Natural",
    bgLight: "bg-gray-50",
    bgDark: "bg-gray-100",
    textColor: "text-gray-900",
    borderColor: "border-gray-200",
  },
} as const;

interface TurnBubbleProps {
  turn: Turn;
  onPlayAudio?: (url: string) => void;
  onTranslate?: (turnIndex: number) => void;
  onTranslateWord?: (word: string, context: string) => Promise<TranslateWordResult>;
  onAnalyze?: (turnIndex: number) => void;
  isPlaying?: boolean;
}

export const TurnBubble = React.memo(function TurnBubble({
  turn,
  onPlayAudio,
  onTranslate,
  onTranslateWord,
  onAnalyze,
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

  // Extract tone from delivery_cue
  const getToneConfig = () => {
    if (isUser) return null;
    
    // Try to extract tone from content first: [warmly] text...
    const contentMatch = turn.content.match(/^\[(\w+)\]\s*/);
    const toneFromContent = contentMatch?.[1]?.toLowerCase();
    
    // Fallback to delivery_cue field
    const deliveryCue = toneFromContent || 
      turn.delivery_cue?.replace(/[\[\]]/g, "").toLowerCase() || 
      "naturally";
    
    return TONE_CONFIG[deliveryCue as keyof typeof TONE_CONFIG] || TONE_CONFIG.naturally;
  };

  const toneConfig = getToneConfig();

  // Clean content by removing delivery cue prefix
  const getCleanContent = () => {
    return turn.content.replace(/^\[\w+\]\s*/, "");
  };

  const cleanContent = getCleanContent();



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
        const vocabData = await onTranslateWord(cleanWord, cleanContent);
        setWordTranslations((prev) => ({
          ...prev,
          [cleanWord]: vocabData,
        }));
      } finally {
        setIsTranslatingWord(false);
      }
    }
  }, [wordTranslations, onTranslateWord, cleanContent]);

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
              className="w-[500px] p-0 shadow-2xl overflow-hidden bg-white rounded-xl border border-gray-300 ring-0"
              side="top"
              align="center"
              avoidCollisions={true}
              collisionPadding={16}
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
                        <div className="relative flex flex-col">
                          {/* Header - cố định */}
                          <div className="relative p-3 border-b bg-muted/40 border-border/60 shrink-0">
                            <button 
                              className="bg-muted absolute top-2 right-2 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors z-10"
                              onClick={() => setActiveWord(null)}
                            >
                              <XIcon className="h-4 w-4" />
                            </button>
                            <div className="space-y-2 pr-8">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-2xl text-foreground">{activeWord.word}</p>
                                {vocabData.phonetic && (
                                  <p className="text-sm text-muted-foreground italic">/{vocabData.phonetic}/</p>
                                )}
                              </div>
                              <p className="text-base font-medium text-foreground">{vocabData.translation_vi}</p>
                            </div>
                          </div>

                          {/* Meanings + Synonyms - scroll */}
                          <div className="max-h-[350px] overflow-y-auto">
                            {vocabData.definitions && vocabData.definitions.length > 0 && (
                              <div className="p-3 border-b border-border space-y-3">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Meanings</p>
                                <div className="space-y-3">
                                  {vocabData.definitions.map((def, idx) => (
                                    <div key={idx} className="pl-3 border-l-2 border-primary/30 space-y-1">
                                      <p className="text-xs font-bold text-primary uppercase tracking-wide">{def.part_of_speech}</p>
                                      <p className="text-sm text-foreground leading-relaxed">{def.definition_vi}</p>
                                      {def.example_en && (
                                        <p className="text-xs text-muted-foreground italic bg-muted p-2 rounded">
                                          &ldquo;{def.example_en}&rdquo;
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {vocabData.synonyms && vocabData.synonyms.length > 0 && (
                              <div className="p-3 border-b border-border">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Related Words</p>
                                <div className="flex flex-wrap gap-2">
                                  {vocabData.synonyms.map((synonym, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {synonym}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Footer - cố định */}
                          <div className="px-3 pt-2 pb-2 shrink-0">
                            <Button
                              variant="default"
                              size="sm"
                              className="w-full"
                              onClick={() => setActiveWord(null)}
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
  }, [handleWordClick, activeWord, isTranslatingWord, wordTranslations]);

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
        {/* Turn bubble with audio button beside it for AI */}
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "group relative rounded-2xl px-4 py-3 text-lg leading-relaxed transition-all",
              isUser
                ? "rounded-tr-sm bg-primary-500 text-white border border-primary-600 shadow-sm"
                : cn(
                    "rounded-tl-sm shadow-sm",
                    toneConfig
                      ? `${toneConfig.bgLight} ${toneConfig.textColor} border ${toneConfig.borderColor}`
                      : "bg-muted text-foreground ring-1 ring-border"
                  ),
              turn.is_pending && "opacity-70 animate-pulse",
            )}
          >
            <div className="flex flex-col gap-2">
              {/* Tone badge for AI turns */}
              {!isUser && toneConfig && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-lg">{toneConfig.emoji}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-75">
                    {toneConfig.label}
                  </span>
                </div>
              )}

              <div 
                ref={contentRef}
                className="leading-relaxed text-lg select-text"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
              >
                {tokenizeText(cleanContent)}
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
          </div>

          {/* Audio button for AI - beside turn, vertically centered */}
          {!isUser && turn.audio_url && (
            <button
              className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 h-9 rounded-full px-[7px] py-0 bg-transparent hover:bg-gray-100 text-gray-500 transition-all duration-200"
              onClick={() => onPlayAudio?.(turn.audio_url!)}
            >
              <Volume2 className={cn("h-5 w-5 text-gray-500", isPlaying && "text-primary")} />
            </button>
          )}
        </div>

        {/* Translate button for AI, Analyze button for user - below turn, left-aligned within container */}
        <div className="flex justify-start gap-2">
          {isUser ? (
            // Analyze button for user turns
            onAnalyze && (
              <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 border border-neutral-200 bg-white hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 shrink-0 gap-1 text-gray-600 hover:text-gray-900 text-xs px-2 py-1 h-auto"
                onClick={() => onAnalyze(turn.turn_index)}
                title="Phân tích turn này"
              >
                <Sparkles className="h-3 w-3" />
                Phân tích
              </button>
            )
          ) : (
            // Translate button for AI turns
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 border border-neutral-200 bg-white hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 shrink-0 gap-1 text-gray-600 hover:text-gray-900 text-xs px-2 py-1 h-auto"
              onClick={toggleTranslate}
            >
              <Languages className="h-3 w-3" />
              Dịch
            </button>
          )}
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
