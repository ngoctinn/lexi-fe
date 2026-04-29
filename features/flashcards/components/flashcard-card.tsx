"use client";

import { type KeyboardEvent, type MouseEvent } from "react";
import { Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Flashcard } from "../schemas/flashcard.schema";

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
        "group relative w-full max-w-3xl cursor-pointer overflow-hidden border-border/70 shadow-lg shadow-black/5 transition-all duration-300",
        "min-h-104",
        "hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10",
        "focus-visible:outline-none",
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
      style={{ perspective: "1000px" }}
    >
      <CardContent className="relative flex flex-1 flex-col">
        {/* Mặt trước: Ẩn đáp án */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center text-center p-5 sm:p-6",
            "transition-all duration-500 ease-out",
            isRevealed
              ? "pointer-events-none opacity-0"
              : "opacity-100",
          )}
          style={{
            transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              {card.word}
            </h2>
            {card.word_type && (
              <Badge className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                {card.word_type}
              </Badge>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
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
              className="transition-all hover:scale-110 active:scale-95"
              aria-label={`Nghe phát âm ${card.word}`}
            >
              <Volume2 className="size-4" />
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground animate-in fade-in duration-700 delay-300">
            Nhấn Space hoặc chạm vào thẻ để xem đáp án.
          </p>
        </div>

        {/* Mặt sau: Hiện đáp án */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center text-center p-5 sm:p-6",
            "transition-all duration-500 ease-out",
            isRevealed
              ? "opacity-100"
              : "pointer-events-none opacity-0",
          )}
          style={{
            transform: isRevealed ? "rotateY(0deg)" : "rotateY(-180deg)",
            backfaceVisibility: "hidden",
          }}
        >
          <div className="space-y-5 w-full max-w-2xl animate-in fade-in duration-700">
            {/* Word and type */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {card.word}
              </h2>
              {card.word_type && (
                <Badge className="animate-in fade-in duration-700 delay-100">
                  {card.word_type}
                </Badge>
              )}
            </div>

            {/* Phonetic and audio */}
            <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in duration-700 delay-150">
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
                className="transition-all hover:scale-110 active:scale-95"
                aria-label={`Nghe phát âm ${card.word}`}
              >
                <Volume2 className="size-4" />
              </Button>
            </div>

            <Separator className="animate-in fade-in duration-700 delay-200" />

            {/* Translation - BOLD and CENTERED */}
            <div className="animate-in fade-in duration-700 delay-300">
              <p className="text-3xl font-bold text-foreground leading-relaxed">
                {card.translation_vi || "Chưa có định nghĩa"}
              </p>
            </div>

            {/* Example sentence */}
            {card.example_sentence && (
              <div className="space-y-1 animate-in fade-in duration-700 delay-400">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ví dụ</p>
                <p className="text-sm leading-relaxed text-foreground/70 sm:text-base italic">
                  "{card.example_sentence}"
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
