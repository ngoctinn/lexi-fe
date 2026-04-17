"use client";

import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const FLASHCARDS = [
  {
    term: "Serendipity",
    desc: "Finding something good without looking for it.",
    type: "Noun",
  },
  {
    term: "Ephemeral",
    desc: "Lasting for a very short time.",
    type: "Adjective",
  },
  {
    term: "Luminous",
    desc: "Emitting or reflecting light; shining.",
    type: "Adjective",
  },
  {
    term: "Mellifluous",
    desc: "Sweet or musical; pleasant to hear.",
    type: "Adverb",
  },
];

export function FlashcardShowcase() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="px-6 pt-6">
        <h3 className="text-xl font-bold tracking-tight">Flashcard Deck</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Advanced z-axis elevation and baseline alignment techniques.
        </p>
      </div>

      <div className="relative isolate py-4 px-6">
        <Carousel
          opts={{ align: "center", loop: true }}
          className="w-full max-w-4xl mx-auto group"
        >
          <CarouselContent className="-ml-6">
            {FLASHCARDS.map((card, index) => (
              <CarouselItem key={index} className="pl-6 basis-full">
                <div className="p-2">
                  <Card
                    className={cn(
                      "aspect-3/4 flex flex-col p-8 border-none bg-card shadow-flashcard rounded-[2.5rem] relative overflow-hidden transition-all",
                      "group-active:translate-y-0.5",
                    )}
                  >
                    <div className="flex-1 flex flex-col justify-center items-center text-center gap-6">
                      <div className="size-14 rounded-3xl bg-primary/5 flex items-center justify-center mb-2 ring-1 ring-primary/10">
                        <span className="text-primary font-bold text-lg">
                          # {index + 1}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <h4 className="text-3xl font-bold tracking-tighter text-primary leading-none uppercase">
                          {card.term}
                        </h4>
                        <div className="h-1 w-8 bg-primary/20 mx-auto rounded-full" />
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground antialiased font-medium px-4">
                        {card.desc}
                      </p>
                    </div>

                    {/* Technique 3: Baseline alignment */}
                    <div className="flex items-baseline justify-between mt-auto pt-6 border-t border-primary/5">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
                        {card.type}
                      </span>
                      <span className="text-sm font-black text-primary tracking-tighter opacity-80">
                        LEXI.IO
                      </span>
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="size-10 left-2 shadow-flashcard bg-white active:translate-y-0 active:scale-95 border-none hover:bg-white" />
          <CarouselNext className="size-10 right-2 shadow-flashcard bg-white active:translate-y-0 active:scale-95 border-none hover:bg-white" />
        </Carousel>
      </div>
    </div>
  );
}
