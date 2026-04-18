"use client";

import * as React from "react";
import { Volume2, Languages } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Turn } from "@/features/session/types/session.types";
import { TurnSpeaker } from "@/features/session/types/session.types";

interface TurnBubbleProps {
  turn: Turn;
  aiName?: string;
  onPlayAudio?: (url: string) => void;
  onTranslate?: (turnIndex: number) => void;
  isPlaying?: boolean;
}

export function TurnBubble({
  turn,
  aiName = "AI",
  onPlayAudio,
  onTranslate,
  isPlaying,
}: TurnBubbleProps) {
  const isUser = turn.speaker === TurnSpeaker.USER;
  const [showTranslation, setShowTranslation] = React.useState(false);

  const toggleTranslate = () => {
    if (!turn.translated_content) {
      onTranslate?.(turn.turn_index);
    }
    setShowTranslation((v) => !v);
  };

  return (
    <div
      className={cn(
        "flex w-full items-end gap-2 px-4 py-2",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <Avatar className="size-8 shrink-0 mb-1 border shadow-sm">
          <AvatarImage
            src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${aiName}`}
            alt={aiName}
          />
          <AvatarFallback className="text-[10px]">AI</AvatarFallback>
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
            "group relative rounded-2xl px-4 py-3 text-[15px] leading-relaxed transition-all",
            isUser
              ? "rounded-tr-sm bg-primary-50 text-primary border border-primary-100 shadow-sm"
              : "rounded-tl-sm bg-muted text-foreground ring-1 ring-border shadow-sm",
            turn.is_pending && "opacity-70 animate-pulse",
          )}
        >
          <div className="flex flex-col gap-2">
            <span>{turn.content}</span>

            {showTranslation && turn.translated_content && (
              <div
                className={cn(
                  "text-sm border-t pt-2 mt-1",
                  isUser
                    ? "border-primary-100 text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                <span className="italic font-medium">
                  {turn.translated_content}
                </span>
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
              className="text-[9px] font-bold uppercase tracking-widest"
            >
              Dùng gợi ý
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
