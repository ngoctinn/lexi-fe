"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Flashcard, ReviewDifficulty } from "../types";
import { FlashcardCard } from "./flashcard-card";
import { SRSControls } from "./srs-controls";
import { SessionSummary } from "./session-summary";
import { updateFlashcardSRS } from "../actions/practice-actions";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface FlashcardSessionProps {
  initialQueue: Flashcard[];
}

export function FlashcardSession({ initialQueue }: FlashcardSessionProps) {
  const queue = initialQueue;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(initialQueue.length === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctCardsCount, setCorrectCardsCount] = useState(0);

  const currentCard = queue[currentIndex];
  const totalCards = queue.length;
  const progressPercentage =
    totalCards === 0
      ? 100
      : Math.round(((currentIndex + 1) / totalCards) * 100);

  const [activeKey, setActiveKey] = useState<string | null>(null);

  const stateRef = useRef({
    isRevealed,
    isSubmitting,
    isFinished,
    currentCard,
    currentIndex,
    queue,
  });

  useEffect(() => {
    stateRef.current = {
      isRevealed,
      isSubmitting,
      isFinished,
      currentCard,
      currentIndex,
      queue,
    };
  }, [isRevealed, isSubmitting, isFinished, currentCard, currentIndex, queue]);

  const handleFlip = useCallback(() => {
    if (stateRef.current.isFinished || stateRef.current.isSubmitting) return;
    setIsRevealed((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    async (difficulty: ReviewDifficulty, key?: string) => {
      const { isRevealed, isSubmitting, currentCard, currentIndex, queue } =
        stateRef.current;

      if (!currentCard || isSubmitting || !isRevealed) {
        return;
      }

      setIsSubmitting(true);
      if (key) {
        setActiveKey(key);
        setTimeout(() => setActiveKey(null), 150);
      }

      if (difficulty === "good" || difficulty === "easy") {
        setCorrectCardsCount((prev) => prev + 1);
      }

      try {
        await updateFlashcardSRS(currentCard.flashcard_id, difficulty);
      } catch {
        toast.error("Không thể lưu tiến độ. Vui lòng thử lại sau.");
      }

      setIsRevealed(false);

      setTimeout(() => {
        if (currentIndex < queue.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setIsFinished(true);
        }
        setIsSubmitting(false);
      }, 150);
    },
    [],
  );

  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const { isFinished, isRevealed, isSubmitting } = stateRef.current;
      if (isFinished) return;

      if (e.repeat) {
        return;
      }

      const key = e.key;
      const code = e.code;

      const isFlipKey =
        key === " " || code === "Space" || key === "Enter" || code === "Enter";
      if (isFlipKey) {
        e.preventDefault();
        handleFlip();
        return;
      }

      const ratingMap: Record<string, ReviewDifficulty> = {
        "1": "forgot",
        Digit1: "forgot",
        "!": "forgot",
        "¹": "forgot",
        "2": "hard",
        Digit2: "hard",
        "@": "hard",
        "²": "hard",
        "3": "good",
        Digit3: "good",
        "#": "good",
        "³": "good",
        "4": "easy",
        Digit4: "easy",
        $: "easy",
        "⁴": "easy",
      };

      const difficulty = ratingMap[key] || ratingMap[code];

      if (difficulty && isRevealed && !isSubmitting) {
        e.preventDefault();
        const displayKey =
          difficulty === "forgot"
            ? "1"
            : difficulty === "hard"
              ? "2"
              : difficulty === "good"
                ? "3"
                : "4";
        handleRate(difficulty, displayKey);
      }
    };

    window.addEventListener("keydown", handleKeyEvent, true);

    return () => {
      window.removeEventListener("keydown", handleKeyEvent, true);
    };
  }, [handleFlip, handleRate]);

  if (isFinished || queue.length === 0) {
    const retentionRate =
      totalCards > 0 ? Math.round((correctCardsCount / totalCards) * 100) : 100;
    return (
      <SessionSummary
        reviewedCount={totalCards}
        retentionRate={retentionRate}
      />
    );
  }

  return (
    <div className="flex w-full max-w-3xl flex-col gap-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {currentIndex + 1} / {totalCards}
        </span>
      </div>

      <Progress value={progressPercentage} />

      <FlashcardCard
        card={currentCard}
        isRevealed={isRevealed}
        onToggleReveal={handleFlip}
      />

      <div className="w-full">
        {isRevealed ? (
          <SRSControls
            onRate={handleRate}
            disabled={isSubmitting}
            activeKey={activeKey}
          />
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            Nhấn Space hoặc chạm vào thẻ để xem đáp án.
          </p>
        )}
      </div>
    </div>
  );
}
