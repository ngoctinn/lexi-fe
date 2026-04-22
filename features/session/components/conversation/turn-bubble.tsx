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
  onSaveFlashcard?: (turnIndex: number) => void;
  isSavingFlashcard?: boolean;
  isPlaying?: boolean;
}

export function TurnBubble({
  turn,
  aiName = "AI",
  onPlayAudio,
  onTranslate,
  onSaveFlashcard,
  isSavingFlashcard = false,
  isPlaying,
}: TurnBubbleProps) {
  const isUser = turn.speaker === TurnSpeaker.USER;
  const [showTranslation, setShowTranslation] = React.useState(false);
  const [activeWordIndex, setActiveWordIndex] = React.useState<number | null>(
    null,
  );
  const contentTokens = React.useMemo(
    () => splitTurnContent(turn.content),
    [turn.content],
  );
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

  const handleWordClick = (tokenIndex: number) => {
    setActiveWordIndex(tokenIndex);
    setShowTranslation(true);

    if (!turn.translated_content) {
      onTranslate?.(turn.turn_index);
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
            <div className="whitespace-pre-wrap wrap-break-word">
              {contentTokens.map((token, tokenIndex) => {
                if (/^\s+$/.test(token)) {
                  return (
                    <span key={`${turn.turn_index}-${tokenIndex}`}>
                      {token}
                    </span>
                  );
                }

                const isActiveWord = activeWordIndex === tokenIndex;

                return (
                  <Popover
                    key={`${turn.turn_index}-${tokenIndex}`}
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
                        onClick={() => handleWordClick(tokenIndex)}
                        className={cn(
                          "inline rounded px-0.5 py-0.5 text-inherit transition-colors hover:bg-primary-100 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActiveWord && "bg-primary-100 text-primary",
                        )}
                      >
                        {token}
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
                          Từ vừa chọn
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {token}
                        </p>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-muted/40 p-3 text-sm text-foreground">
                        {hasTranslation
                          ? turn.translated_content
                          : "Đang yêu cầu bản dịch..."}
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
                <span className="italic font-medium">
                  {hasTranslation
                    ? turn.translated_content
                    : "Đang yêu cầu bản dịch..."}
                </span>

                {hasAnalysisItems && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {turn.analysis_items?.map((item, index) =>
                      item.type === "phrase" ? (
                        <Badge
                          key={`${turn.turn_index}-${item.text}-${index}`}
                          variant="info"
                          size="xs"
                        >
                          {item.text}
                          {item.base ? ` -> ${item.base}` : ""}
                        </Badge>
                      ) : (
                        <span
                          key={`${turn.turn_index}-${item.text}-${index}`}
                          className="rounded border border-border/60 px-1.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {item.text}
                        </span>
                      ),
                    )}
                  </div>
                )}

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
