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
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {/* AI Avatar */}
      {!isUser && (
        <Avatar className="size-8 shrink-0 mb-1 border shadow-sm">
          <AvatarImage src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${aiName}`} alt={aiName} />
          <AvatarFallback className="text-[10px]">AI</AvatarFallback>
        </Avatar>
      )}

      {/* Bubble Container */}
      <div className={cn("flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]", isUser && "items-end")}>


        <div
          className={cn(
            "relative rounded-2xl px-4 py-2.5 text-sm md:text-base transition-opacity duration-300",
            "shadow-sm ring-1 ring-inset",
            isUser
              ? "rounded-br-sm bg-primary/10 text-foreground ring-primary/20"
              : "rounded-bl-sm bg-muted text-foreground ring-border",
            turn.is_pending && "opacity-60 grayscale-[30%]"
          )}
        >
          <span>{turn.content}</span>
          
          {turn.is_pending && (
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium animate-pulse">
              <div className="size-1 rounded-full bg-muted-foreground" />
              Đang gửi...
            </div>
          )}

          {/* Translation */}
          {showTranslation && turn.translated_content && (
            <div className="mt-2 text-sm text-muted-foreground border-t border-border/50 pt-2 font-medium">
              {turn.translated_content}
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className={cn("flex items-center gap-1 mt-0.5", isUser ? "justify-end" : "justify-start")}>
          {!isUser && turn.audio_url && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-full hover:bg-muted"
              onClick={() => onPlayAudio?.(turn.audio_url!)}
              title="Phát ghi âm"
            >
              <Volume2 className={cn("size-3.5", isPlaying && "text-primary")} />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className={cn("size-6 rounded-full hover:bg-muted", showTranslation && "bg-muted")}
            onClick={toggleTranslate}
            title="Dịch câu này"
          >
            <Languages className="size-3.5" />
          </Button>

          {turn.is_hint_used && (
            <Badge variant="warning" size="xs" className="ml-1">
              Dùng gợi ý
            </Badge>
          )}
        </div>
      </div>

    </div>
  );
}
