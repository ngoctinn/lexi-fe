"use client";

import { Flashcard } from "../types";
import { cn } from "@/lib/utils";
import { Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FlashcardCardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  className?: string;
}

export function FlashcardCard({ card, isFlipped, onFlip, className }: FlashcardCardProps) {
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(card.word);
      utterance.lang = "en-US"; 
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className={cn("relative h-96 w-full max-w-[600px] cursor-pointer group", className)}
      style={{ perspective: "1000px" }}
      onClick={onFlip}
    >
      <div
        className={cn(
          "absolute inset-0 h-full w-full transition-all duration-500 ease-out [transform-style:preserve-3d]",
          isFlipped ? "[transform:rotateX(180deg)]" : ""
        )}
      >
        {/* Front Face */}
        <Card size="lg" className="absolute inset-0 m-0 h-full w-full backface-hidden [backface-visibility:hidden]">
          <CardContent className="relative flex flex-col items-center justify-center p-6 sm:p-8 w-full h-full text-center">
            {card.word_type && (
              <span className="absolute top-6 left-6 text-xs font-semibold px-2 py-1 rounded bg-muted text-muted-foreground uppercase tracking-widest">
                {card.word_type}
              </span>
            )}
            <button
              onClick={handlePlayAudio}
              className="absolute top-6 right-6 p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
              title="Nghe phát âm"
            >
              <Volume2 className="h-5 w-5" />
            </button>
            
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-2">
              {card.word}
            </h2>

            <p className="absolute bottom-6 text-sm text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
              Nhấn phím Space để lật thẻ
            </p>
          </CardContent>
        </Card>

        {/* Back Face */}
        <Card size="lg" className="absolute inset-0 m-0 h-full w-full backface-hidden [backface-visibility:hidden] [transform:rotateX(180deg)]">
          <CardContent className="relative flex flex-col p-6 sm:p-8 w-full h-full">
            
            {/* Header */}
            <div className="flex flex-col items-center justify-center pb-6 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight text-foreground">{card.word}</h2>
                <button
                  onClick={handlePlayAudio}
                  className="p-1.5 text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                {card.phonetic && <span className="text-muted-foreground font-mono text-[15px]">{card.phonetic}</span>}
                {card.word_type && <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">{card.word_type}</span>}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-6 text-left w-full space-y-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">Định nghĩa</h3>
                <p className="text-lg text-foreground leading-relaxed">
                  {card.definition_vi || "Chưa có định nghĩa"}
                </p>
              </div>
              
              {card.example_sentence && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Ví dụ</h3>
                  <div className="border-l-4 border-primary/20 pl-4 py-1">
                    <p className="text-base italic text-foreground/90 leading-relaxed">
                      &quot;{card.example_sentence}&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
