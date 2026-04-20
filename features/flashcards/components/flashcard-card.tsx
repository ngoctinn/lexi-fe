"use client";

import { type KeyboardEvent, type MouseEvent } from "react";
import { Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Flashcard } from "../types";

interface FlashcardCardProps {
  card: Flashcard;
  isRevealed: boolean;
  onToggleReveal: () => void;
  className?: string;
}

export function FlashcardCard({
  card,
  isRevealed,
  onToggleReveal,
  className,
}: FlashcardCardProps) {
  const handlePlayAudio = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (card.audio_url) {
      const audio = new Audio(card.audio_url);
      void audio.play().catch(() => {});
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(card.word);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggleReveal();
    }
  };

  return (
    <Card
      size="lg"
      className={cn(
        "w-full max-w-3xl cursor-pointer border-border/70 shadow-lg shadow-black/5 transition-transform duration-200 hover:-translate-y-0.5",
        "min-h-104",
        className,
      )}
      onClick={onToggleReveal}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isRevealed}
      aria-label={
        isRevealed
          ? `Ẩn đáp án của ${card.word}`
          : `Xem đáp án của ${card.word}`
      }
    >
      <CardContent className="relative flex flex-1 flex-col">
        {/* Mặt trước: Ẩn đáp án */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center text-center p-5 sm:p-6 transition-all duration-300 ease-out motion-reduce:transition-none",
            isRevealed
              ? "pointer-events-none translate-y-1 scale-[0.98] opacity-0"
              : "translate-y-0 scale-100 opacity-100",
          )}
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {card.word}
            </h2>
            {card.word_type && (
              <Badge>
                {card.word_type}
              </Badge>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {card.phonetic && (
              <p className="font-mono text-sm text-muted-foreground sm:text-base">
                {card.phonetic}
              </p>
            )}
            <Button
              variant="soft"
              size="icon"
              type="button"
              onClick={handlePlayAudio}
              aria-label={`Nghe phát âm ${card.word}`}
            >
              <Volume2 className="size-4" />
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Nhấn Space hoặc chạm vào thẻ để xem đáp án.
          </p>
        </div>

        {/* Mặt sau: Hiện đáp án */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-start text-left p-5 sm:p-6 transition-all duration-300 ease-out motion-reduce:transition-none",
            isRevealed
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-1 opacity-0",
          )}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {card.word}
              </h2>
              {card.word_type && (
              <Badge>
                {card.word_type}
              </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {card.phonetic && (
                <p className="font-mono text-sm text-muted-foreground sm:text-base">
                  {card.phonetic}
                </p>
              )}
              <Button
                variant="soft"
                size="icon"
                type="button"
                onClick={handlePlayAudio}
                aria-label={`Nghe phát âm ${card.word}`}
              >
                <Volume2 className="size-4" />
              </Button>
            </div>
          </div>

          <Separator className="my-4 sm:my-5" />

          <div className="space-y-5">
            <section className="space-y-2">
              <p className="text-sm font-bold text-foreground">Định nghĩa</p>
              <p className="max-w-2xl text-base leading-relaxed text-foreground/90">
                {card.definition_vi || "Chưa có định nghĩa"}
              </p>
            </section>

            {card.example_sentence && (
              <section className="space-y-2">
                <p className="text-sm font-bold text-foreground">Ví dụ</p>
                <p className="max-w-2xl text-sm leading-relaxed text-foreground/70 sm:text-base">
                  - {card.example_sentence}
                </p>
              </section>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
