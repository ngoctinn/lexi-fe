"use client";

import * as React from "react";
import { Volume2, Languages, BookmarkPlus, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Turn } from "@/features/session/types/session.types";
import { TurnSpeaker } from "@/features/session/types/session.types";

function splitTurnContent(content: string) {
  return content.match(/\s+|[^\s]+/g) ?? [content];
}

interface TurnBubbleProps {
  turn: Turn;
  aiName?: string;
  onPlayAudio?: (url: string) => void;
  onTranslate?: (turnIndex: number) => void;
  onTranslateWord?: (word: string) => Promise<string>;
  onSaveFlashcard?: (turnIndex: number) => void;
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
    Record<number, string>
  >({});
  const [isTranslatingWord, setIsTranslatingWord] = React.useState(false);

  // Reconstruct tokens while preserving whitespace from original content
  const tokens = React.useMemo(() => {
    const content = turn.content;
    const analysisItems = turn.analysis_items || [];
    
    type Token = { text: string; isToken: boolean; analysisIndex?: number };

    if (analysisItems.length === 0) {
      return splitTurnContent(content).map<Token>((text) => ({
        text,
        isToken: !/^\s+$/.test(text),
      }));
    }

    const result: Token[] = [];
    let lastIndex = 0;

    analysisItems.forEach((item, idx) => {
      const index = content.indexOf(item.text, lastIndex);
      if (index > lastIndex) {
        const gapText = content.substring(lastIndex, index);
        // Split gap text into words and spaces
        splitTurnContent(gapText).forEach((word) => {
          result.push({
            text: word,
            isToken: !/^\s+$/.test(word),
          });
        });
      }
      result.push({
        text: item.text,
        isToken: true,
        analysisIndex: idx,
      });
      lastIndex = index + item.text.length;
    });

    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      splitTurnContent(remainingText).forEach((word) => {
        result.push({
          text: word,
          isToken: !/^\s+$/.test(word),
        });
      });
    }

    return result;
  }, [turn.content, turn.analysis_items]);

  const hasTranslation =
    Boolean(turn.translated_content) &&
    turn.translated_content !== "Đang yêu cầu bản dịch...";
  const hasAnalysisItems = Boolean(turn.analysis_items?.length);

  const toggleTranslate = () => {
    if (!turn.translated_content) {
      onTranslate?.(turn.turn_index);
    }
    setShowTranslation((v) => !v);
  };

  const handleWordClick = async (tokenIndex: number) => {
    const token = tokens[tokenIndex];
    if (!token || !token.isToken) return;

    setActiveWordIndex(tokenIndex);

    // Nếu đã có bản dịch trong analysis_items thì dùng luôn
    if (token.analysisIndex !== undefined) {
      const analysis = turn.analysis_items?.[token.analysisIndex];
      if (analysis?.definition_vi) {
        setWordTranslations((prev) => ({
          ...prev,
          [tokenIndex]: analysis.definition_vi!,
        }));
        return;
      }
    }

    // Nếu chưa có thì gọi API dịch từ
    if (!wordTranslations[tokenIndex] && onTranslateWord) {
      setIsTranslatingWord(true);
      try {
        const translation = await onTranslateWord(token.text);
        setWordTranslations((prev) => ({
          ...prev,
          [tokenIndex]: translation,
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
            <div className="flex flex-wrap items-center">
              {tokens.map((token, idx) => {
                if (!token.isToken) {
                  return (
                    <span
                      key={`${turn.turn_index}-${idx}`}
                      className="whitespace-pre"
                    >
                      {token.text}
                    </span>
                  );
                }

                const isActiveWord = activeWordIndex === idx;
                const translation = wordTranslations[idx];
                const analysis =
                  token.analysisIndex !== undefined
                    ? turn.analysis_items?.[token.analysisIndex]
                    : null;

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
                          "inline-block rounded px-0.5 py-0.5 text-inherit transition-colors hover:bg-primary-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActiveWord && "bg-primary-100 text-primary",
                          analysis?.type === "phrase" &&
                            "border-b-2 border-dotted border-primary/40",
                        )}
                      >
                        {token.text}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      align={isUser ? "end" : "start"}
                      side="top"
                      sideOffset={10}
                      className="w-72 space-y-3"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {analysis?.type === "phrase"
                            ? "Cụm từ vừa chọn"
                            : "Từ vừa chọn"}
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {token.text}
                          {analysis?.base && (
                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                              ({analysis.base})
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-sm text-foreground">
                        {isTranslatingWord ? (
                          <div className="flex items-center gap-2 text-muted-foreground italic">
                            <div className="size-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            Đang dịch...
                          </div>
                        ) : translation ? (
                          translation
                        ) : (
                          "Không có bản dịch."
                        )}
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant={
                            turn.is_saved_to_flashcard
                              ? "soft-success"
                              : "outline"
                          }
                          size="xs"
                          onClick={() => onSaveFlashcard?.(turn.turn_index)}
                          disabled={
                            isSavingFlashcard ||
                            turn.is_saved_to_flashcard ||
                            (!translation && !isTranslatingWord)
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
