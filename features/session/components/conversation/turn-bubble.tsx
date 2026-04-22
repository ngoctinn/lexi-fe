"use client";

import * as React from "react";
import { Volume2, Languages, BookmarkPlus, Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Turn } from "@/features/session/types/session.types";
import { TurnSpeaker } from "@/features/session/types/session.types";
import type { TranslateWordResult } from "@/features/session/actions/translate-word";

interface TurnBubbleProps {
  turn: Turn;
  aiName?: string;
  onPlayAudio?: (url: string) => void;
  onTranslate?: (turnIndex: number) => void;
  onTranslateWord?: (word: string, context: string) => Promise<TranslateWordResult>;
  onSaveFlashcard?: (turnIndex: number, vocabData?: TranslateWordResult) => void;
  isSavingFlashcard?: boolean;
  isPlaying?: boolean;
}

export function TurnBubble({
  turn,
  aiName = "AI",
  onPlayAudio,
  onTranslate,
  onTranslateWord,
  onSaveFlashcard,
  isSavingFlashcard = false,
  isPlaying,
}: TurnBubbleProps) {
  const isUser = turn.speaker === TurnSpeaker.USER;
  const [showTranslation, setShowTranslation] = React.useState(false);
  const [activeWordIndex, setActiveWordIndex] = React.useState<number | null>(
    null,
  );
  const [wordTranslations, setWordTranslations] = React.useState<
    Record<number, TranslateWordResult>
  >({});
  const [isTranslatingWord, setIsTranslatingWord] = React.useState(false);

  // Split text into words - every word is clickable
  const tokens = React.useMemo(() => {
    const content = turn.content;
    
    type Token = { 
      text: string;
    };

    // Split by word boundaries - mọi từ đều clickable
    // Regex: match words (letters, numbers, apostrophes) or punctuation
    const words = content.match(/[\w']+|[^\w\s]/g) || [];
    
    return words.map<Token>((word) => ({ text: word }));
  }, [turn.content]);

  const hasTranslation =
    Boolean(turn.translated_content) &&
    turn.translated_content !== "Đang yêu cầu bản dịch...";

  const toggleTranslate = () => {
    if (!turn.translated_content) {
      onTranslate?.(turn.turn_index);
    }
    setShowTranslation((v) => !v);
  };

  const handleWordClick = async (tokenIndex: number) => {
    const token = tokens[tokenIndex];
    if (!token) return;

    setActiveWordIndex(tokenIndex);

    // Nếu chưa có bản dịch thì gọi API với context
    if (!wordTranslations[tokenIndex] && onTranslateWord) {
      setIsTranslatingWord(true);
      try {
        // Pass context để backend detect phrase
        const vocabData = await onTranslateWord(token.text, turn.content);
        setWordTranslations((prev) => ({
          ...prev,
          [tokenIndex]: vocabData,
        }));
      } finally {
        setIsTranslatingWord(false);
      }
    }
  };

  return (
    <div
      className={cn(
        "flex w-full items-end gap-2 px-4 py-2",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <Avatar size="sm" className="shrink-0 mb-1 border shadow-sm">
          <AvatarImage
            src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${aiName}`}
            alt={aiName}
          />
          <AvatarFallback className="text-2xs">AI</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-1.5 max-w-[80%]",
          isUser && "items-end",
        )}
      >
        <div
          className={cn(
            "group relative rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all",
            isUser
              ? "rounded-tr-sm bg-primary-50 text-primary border border-primary-100 shadow-sm"
              : "rounded-tl-sm bg-muted text-foreground ring-1 ring-border shadow-sm",
            turn.is_pending && "opacity-70 animate-pulse",
          )}
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-1 leading-relaxed">
              {tokens.map((token, idx) => {
                const isActiveWord = activeWordIndex === idx;
                const vocabData = wordTranslations[idx];
                const isPhrase = vocabData?.is_phrase || false;

                return (
                  <Popover
                    key={`${turn.turn_index}-${idx}`}
                    open={isActiveWord}
                    onOpenChange={(open) => {
                      if (!open) {
                        setActiveWordIndex(null);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        onClick={() => handleWordClick(idx)}
                        className={cn(
                          "inline-block cursor-pointer transition-colors duration-100 rounded-sm px-0.5",
                          "hover:bg-primary/8",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30",
                          isActiveWord && "bg-primary/12",
                          isPhrase
                            ? "border-b border-primary/40 font-medium"
                            : "border-b border-transparent hover:border-primary/30",
                        )}
                      >
                        {token.text}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align={isUser ? "end" : "start"}
                      side="top"
                      sideOffset={10}
                      className="w-72 p-0 z-[100]"
                    >
                      {isTranslatingWord ? (
                        <div className="flex items-center justify-center gap-2 p-6 text-muted-foreground">
                          <Loader2 className="size-4 animate-spin" />
                          <span className="text-sm">Đang tra từ...</span>
                        </div>
                      ) : vocabData ? (
                        <div className="space-y-0">
                          {/* Header with word, phonetic, and audio */}
                          <div className="p-3 pb-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                  <h4 className="text-base font-bold text-foreground">
                                    {token.text}
                                  </h4>
                                  {vocabData.detected_phrase && token.text !== vocabData.detected_phrase && (
                                    <span className="text-xs text-muted-foreground">
                                      → {vocabData.detected_phrase}
                                    </span>
                                  )}
                                  {vocabData.part_of_speech && (
                                    <Badge variant="secondary" className="text-2xs px-1.5 py-0 h-4">
                                      {vocabData.part_of_speech}
                                    </Badge>
                                  )}
                                </div>
                                {vocabData.phonetic && (
                                  <p className="text-xs text-muted-foreground font-mono mb-1.5">
                                    {vocabData.phonetic}
                                  </p>
                                )}
                                {/* Translation - prominent */}
                                <p className="text-sm font-semibold text-primary leading-snug">
                                  {vocabData.translation_vi}
                                </p>
                              </div>
                              {vocabData.audio_url && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="shrink-0 h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPlayAudio?.(vocabData.audio_url!);
                                  }}
                                >
                                  <Volume2 className="size-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Definition - if different from translation */}
                          {vocabData.definition_vi && vocabData.definition_vi !== vocabData.translation_vi && (
                            <>
                              <Separator />
                              <div className="px-3 py-2.5">
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                  {vocabData.definition_vi}
                                </p>
                              </div>
                            </>
                          )}

                          {/* Example sentence */}
                          {vocabData.example_sentence && (
                            <>
                              <Separator />
                              <div className="px-3 py-2.5 bg-muted/30">
                                <p className="text-xs leading-relaxed text-muted-foreground italic">
                                  &ldquo;{vocabData.example_sentence}&rdquo;
                                </p>
                              </div>
                            </>
                          )}

                          {/* Context: câu gốc highlight từ + câu dịch */}
                          {turn.translated_content && (
                            <>
                              <Separator />
                              <div className="px-3 py-2.5 bg-muted/20 space-y-1.5">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {turn.content.split(/\b/).map((part, i) =>
                                    part.toLowerCase() === token.text.toLowerCase() ? (
                                      <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5 not-italic font-medium">
                                        {part}
                                      </mark>
                                    ) : (
                                      <span key={i}>{part}</span>
                                    )
                                  )}
                                </p>
                                <p className="text-xs text-primary/80 font-medium leading-relaxed">
                                  {turn.translated_content}
                                </p>
                              </div>
                            </>
                          )}

                          <Separator />

                          {/* Save button */}
                          <div className="p-2">
                            <Button
                              variant={
                                turn.is_saved_to_flashcard
                                  ? "soft-success"
                                  : "default"
                              }
                              size="sm"
                              className="w-full h-8 text-xs"
                              onClick={() => onSaveFlashcard?.(turn.turn_index, vocabData)}
                              disabled={
                                isSavingFlashcard ||
                                turn.is_saved_to_flashcard
                              }
                            >
                              {isSavingFlashcard ? (
                                <>
                                  <Loader2 className="size-3 animate-spin" />
                                  Đang lưu...
                                </>
                              ) : turn.is_saved_to_flashcard ? (
                                <>
                                  <Check className="size-3" />
                                  Đã lưu
                                </>
                              ) : (
                                <>
                                  <BookmarkPlus className="size-3" />
                                  Lưu flashcard
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-sm text-muted-foreground">
                            Không thể tra từ này.
                          </p>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                );
              })}
            </div>

            {showTranslation && (
              <div
                className={cn(
                  "text-sm border-t pt-2 mt-1",
                  isUser
                    ? "border-primary-100 text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                <div className="italic font-medium whitespace-pre-wrap">
                  {hasTranslation
                    ? turn.translated_content
                    : "Đang yêu cầu bản dịch..."}
                </div>

                <div className="mt-2 flex justify-end">
                  <Button
                    variant={
                      turn.is_saved_to_flashcard ? "soft-success" : "outline"
                    }
                    size="xs"
                    onClick={() => onSaveFlashcard?.(turn.turn_index)}
                    disabled={
                      isSavingFlashcard ||
                      turn.is_saved_to_flashcard ||
                      !hasTranslation
                    }
                  >
                    {turn.is_saved_to_flashcard ? (
                      <Check className="size-3" />
                    ) : (
                      <BookmarkPlus className="size-3" />
                    )}
                    {turn.is_saved_to_flashcard
                      ? "Đã lưu"
                      : isSavingFlashcard
                        ? "Đang lưu..."
                        : "Lưu flashcard"}
                  </Button>
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
                className="rounded-full bg-background/80 backdrop-blur shadow-sm border border-border/50"
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
                "rounded-full bg-background/80 backdrop-blur shadow-sm border border-border/50",
                showTranslation && "text-primary",
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
      </div>
    </div>
  );
}
