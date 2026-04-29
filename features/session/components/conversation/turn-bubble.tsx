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
  enthusiastically: {
    emoji: "🎉",
    label: "Enthusiastic",
    bgLight: "bg-orange-50",
    bgDark: "bg-orange-100",
    textColor: "text-orange-900",
    borderColor: "border-orange-200",
  },
  playfully: {
    emoji: "😄",
    label: "Playful",
    bgLight: "bg-pink-50",
    bgDark: "bg-pink-100",
    textColor: "text-pink-900",
    borderColor: "border-pink-200",
  },
  supportively: {
    emoji: "🤲",
    label: "Supportive",
    bgLight: "bg-green-50",
    bgDark: "bg-green-100",
    textColor: "text-green-900",
    borderColor: "border-green-200",
  },
  calmly: {
    emoji: "🧘",
    label: "Calm",
    bgLight: "bg-cyan-50",
    bgDark: "bg-cyan-100",
    textColor: "text-cyan-900",
    borderColor: "border-cyan-200",
  },
  excitedly: {
    emoji: "✨",
    label: "Excited",
    bgLight: "bg-rose-50",
    bgDark: "bg-rose-100",
    textColor: "text-rose-900",
    borderColor: "border-rose-200",
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
  actualTurnIndex: number; // Actual position in conversation (excluding partials)
  silenceTimeoutMs?: number;
  timeSinceLastTranscript?: number;
  onPlayAudio?: (url: string) => void;
  onTranslate?: (turnIndex: number) => void;
  onTranslateWord?: (word: string, context: string) => Promise<TranslateWordResult>;
  onSaveFlashcard?: (turnIndex: number, vocabData?: TranslateWordResult) => Promise<void>;
  savingFlashcardTurnIndexes?: number[];
  analyzingTurnIndex?: number | null;
  onAnalyze?: (turnIndex: number) => void;
  isPlaying?: boolean;
}

export function TurnBubble({
  turn,
  actualTurnIndex,
  silenceTimeoutMs = 3000,
  timeSinceLastTranscript = 0,
  onPlayAudio,
  onTranslate,
  onTranslateWord,
  onSaveFlashcard,
  savingFlashcardTurnIndexes = [],
  analyzingTurnIndex,
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

  // Calculate countdown for partial turns
  const remainingMs = Math.max(0, silenceTimeoutMs - timeSinceLastTranscript);
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const showCountdown = turn.is_partial && remainingSeconds <= 3 && remainingSeconds > 0;

  // Extract tone from delivery_cue
  const getToneConfig = () => {
    if (isUser) return null;
    
    // Try to extract tone from content (anywhere in text): [warmly], [encouragingly], etc.
    const contentMatch = turn.content.match(/\[(\w+)\]/);
    const toneFromContent = contentMatch?.[1]?.toLowerCase();
    
    // Fallback to delivery_cue field
    const deliveryCue = toneFromContent || 
      turn.delivery_cue?.replace(/[\[\]]/g, "").toLowerCase() || 
      "naturally";
    
    return TONE_CONFIG[deliveryCue as keyof typeof TONE_CONFIG] || TONE_CONFIG.naturally;
  };

  const toneConfig = getToneConfig();

  // Clean content by removing ALL tone tags [word]
  const getCleanContent = () => {
    return turn.content.replace(/\[\w+\]\s*/g, "").trim();
  };

  const cleanContent = getCleanContent();



  const hasTranslation =
    Boolean(turn.translated_content) &&
    turn.translated_content !== "Đang yêu cầu bản dịch...";

  const toggleTranslate = () => {
    if (!turn.translated_content) {
      onTranslate?.(actualTurnIndex);
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
    // Split by whitespace only, keep hyphens as part of words
    const tokens = text.split(/(\s+)/);
    
    return tokens.map((token, index) => {
      // Check if token is whitespace
      const isWhitespace = /^\s+$/.test(token);
      
      if (isWhitespace) {
        return <span key={index}>{token}</span>;
      }
      
      // Remove trailing punctuation for word lookup, but keep hyphens
      const cleanToken = token.replace(/[.,!?;:]+$/, '');
      const trailingPunctuation = token.slice(cleanToken.length);
      
      // Check if token contains letters/numbers (is a word)
      const isWord = /[\w-]/.test(cleanToken);
      
      if (isWord && cleanToken) {
        return (
          <React.Fragment key={index}>
            <Popover
              open={activeWord?.word === cleanToken && activeWord?.index !== undefined}
              onOpenChange={(open) => {
                if (!open) {
                  setActiveWord(null);
                }
              }}
            >
              <PopoverTrigger asChild>
                <span
                  className="cursor-pointer inline-block rounded hover:bg-yellow-300 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWordClick(cleanToken);
                  }}
                >
                  {cleanToken}
                </span>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[450px] p-0 shadow-2xl overflow-hidden bg-white rounded-xl border border-gray-300 ring-0"
                side="bottom"
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
                            <div className="relative p-4 border-b bg-muted/40 border-border/60 shrink-0">
                              <button 
                                className="bg-muted absolute top-2 right-2 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors z-10"
                                onClick={() => setActiveWord(null)}
                              >
                                <XIcon className="h-4 w-4" />
                              </button>
                              <div className="pr-8">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-bold text-xl text-foreground">{vocabData.word}</p>
                                  {vocabData.phonetic && (
                                    <p className="text-sm text-muted-foreground italic">/{vocabData.phonetic}/</p>
                                  )}
                                  <span className="text-muted-foreground">•</span>
                                  <p className="text-xl font-bold text-primary">{vocabData.translation_vi}</p>
                                  {vocabData.audio_url && (
                                    <button 
                                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 h-8 rounded-full px-[7px] py-0 bg-transparent hover:bg-gray-100 text-gray-500 transition-all duration-200"
                                      onClick={() => onPlayAudio?.(vocabData.audio_url!)}
                                      title="Nghe phát âm"
                                    >
                                      <Volume2 className="h-4 w-4 text-gray-500" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Meanings + Synonyms - scroll */}
                            <div className="max-h-[320px] overflow-y-auto">
                              {vocabData.definitions && vocabData.definitions.length > 0 && (
                                <div className="p-4 border-b border-border space-y-3">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meanings</p>
                                  <div className="space-y-3">
                                    {vocabData.definitions.map((def, idx) => (
                                      <div key={idx} className="pl-3 border-l-2 border-primary/30 space-y-1">
                                        <p className="text-xs font-bold text-primary uppercase tracking-wide">{def.part_of_speech}</p>
                                        <p className="text-base text-foreground leading-relaxed">{def.definition_vi}</p>
                                        {def.example_en && (
                                          <p className="text-sm text-muted-foreground italic bg-muted p-2 rounded">
                                            &ldquo;{def.example_en}&rdquo;
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {vocabData.synonyms && vocabData.synonyms.length > 0 && (
                                <div className="p-4">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Related Words</p>
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

                            {/* Footer - nút lưu flashcard */}
                            <div className="p-4 border-t border-border bg-muted/20 shrink-0">
                              <Button
                                variant="default"
                                size="default"
                                className="w-full gap-2"
                                onClick={async () => {
                                  if (onSaveFlashcard && activeWord) {
                                    await onSaveFlashcard(actualTurnIndex, wordTranslations[activeWord.word]);
                                  }
                                  setActiveWord(null);
                                }}
                                disabled={savingFlashcardTurnIndexes.includes(actualTurnIndex)}
                              >
                                {savingFlashcardTurnIndexes.includes(actualTurnIndex) ? (
                                  <>
                                    <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Đang lưu...
                                  </>
                                ) : (
                                  <>
                                    <BookmarkPlus className="size-4" />
                                    {turn.is_saved_to_flashcard ? "Đã lưu flashcard" : "Lưu flashcard"}
                                  </>
                                )}
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
            {trailingPunctuation && <span>{trailingPunctuation}</span>}
          </React.Fragment>
        );
      }
      
      // Return non-word tokens as-is
      return <span key={index}>{token}</span>;
    });
  }, [handleWordClick, activeWord, isTranslatingWord, wordTranslations, onSaveFlashcard, actualTurnIndex, turn.is_saved_to_flashcard, onPlayAudio]);

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
              "group relative rounded-2xl px-5 py-4 transition-all",
              isUser
                ? "rounded-tr-sm bg-primary-500 text-white border border-primary-600 shadow-sm"
                : cn(
                    "rounded-tl-sm shadow-sm",
                    toneConfig
                      ? `${toneConfig.bgLight} ${toneConfig.textColor} border ${toneConfig.borderColor}`
                      : "bg-muted text-foreground ring-1 ring-border"
                  ),
              // Only fade when pending (waiting for backend), not when partial (recording)
              turn.is_pending && !turn.is_partial && "opacity-70",
            )}
          >
            <div className="flex flex-col gap-3">
              {/* Tone badge for AI turns */}
              {!isUser && toneConfig && (
                <div className="flex items-center gap-2 pb-1 border-b border-current/10">
                  <span className="text-xl">{toneConfig.emoji}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    {toneConfig.label}
                  </span>
                </div>
              )}

              <div 
                ref={contentRef}
                className="leading-relaxed text-base sm:text-lg select-text"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
              >
                {tokenizeText(cleanContent)}
              </div>

              {/* Popover for word translation is now handled in tokenizeText */}

              {showTranslation && (
                <div
                  className={cn(
                    "border-t pt-3 mt-2",
                    isUser
                      ? "border-white/20 text-white/95"
                      : "border-current/15 text-muted-foreground",
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">
                    Bản dịch
                  </p>
                  <div className="italic font-medium whitespace-pre-wrap text-base sm:text-lg leading-relaxed">
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

        {/* Translate button for AI, Analyze/Countdown for user - below turn, left-aligned within container */}
        <div className="flex justify-start gap-2">
          {isUser ? (
            <>
              {/* Show countdown badge when recording (partial turn) */}
              {turn.is_partial && showCountdown ? (
                <Badge
                  variant="warning"
                  size="sm"
                  className="gap-1.5 animate-pulse"
                >
                  <span className="text-xs">Gửi sau</span>
                  <span className="text-xs font-bold tabular-nums">{remainingSeconds}s</span>
                </Badge>
              ) : (
                // Show Analyze button when NOT recording
                onAnalyze && !turn.is_partial && (
                  <button
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 border border-neutral-200 bg-white hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 shrink-0 gap-1 text-gray-600 hover:text-gray-900 text-xs px-2 py-1 h-auto"
                    onClick={() => onAnalyze(actualTurnIndex)}
                    disabled={analyzingTurnIndex === actualTurnIndex}
                    title="Phân tích turn này"
                  >
                    {analyzingTurnIndex === actualTurnIndex ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        Phân tích
                      </>
                    )}
                  </button>
                )
              )}
            </>
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
}
