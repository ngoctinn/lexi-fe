"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as React from "react";
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
  const [queue, setQueue] = useState<Flashcard[]>(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(initialQueue.length === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track stats
  const [goodCardsCount, setGoodCardsCount] = useState(0);

  const currentCard = queue[currentIndex];
  // Calculate progress
  const totalCards = queue.length;
  const progressPercentage = totalCards === 0 ? 100 : Math.round((currentIndex / totalCards) * 100);

  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Use Refs to keep the listener stable and avoid constant re-attachment
  const stateRef = useRef({ isFlipped, isSubmitting, isFinished, currentCard, currentIndex, queue });
  stateRef.current = { isFlipped, isSubmitting, isFinished, currentCard, currentIndex, queue };

  const handleFlip = useCallback(() => {
    if (stateRef.current.isFinished) return;
    console.log("[Flashcard] Flipping card via key/click");
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(async (difficulty: ReviewDifficulty, key?: string) => {
    const { isFlipped, isSubmitting, currentCard, currentIndex, queue } = stateRef.current;
    
    console.log("[Flashcard] Rating attempt:", { difficulty, key, isSubmitting, isFlipped });
    
    if (!currentCard || isSubmitting || !isFlipped) {
      console.warn("[Flashcard] Rating ignored: invalid state", { hasCard: !!currentCard, isSubmitting, isFlipped });
      return;
    }

    setIsSubmitting(true);
    if (key) {
      setActiveKey(key);
      setTimeout(() => setActiveKey(null), 150);
    }
    
    // Stats tracking
    if (difficulty === "good" || difficulty === "easy") {
       setGoodCardsCount(prev => prev + 1);
    }
    
    try {
      updateFlashcardSRS(currentCard.flashcard_id, difficulty).catch(err => {
        console.error("Failed to update SRS", err);
        toast.error("Không thể lưu tiến độ. Vui lòng thử lại sau.");
      });

      setIsFlipped(false);
      
      setTimeout(() => {
        if (currentIndex < queue.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setIsFinished(true);
        }
        setIsSubmitting(false);
      }, 150);
      
    } finally {
      setIsSubmitting(false);
    }
  }, [currentIndex, queue.length]);

  // Robust Global Hotkeys
  useEffect(() => {
    const handleKeyEvent = (e: KeyboardEvent) => {
      // 1. Context Check (Accessibility & Focus Guard)
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      const { isFinished, isFlipped, isSubmitting } = stateRef.current;
      if (isFinished) return;

      const key = e.key;
      const code = e.code;

      // 2. Action Mapping
      
      // -- Flip Actions (Space/Enter)
      if (e.type === "keydown") {
        const isFlipKey = key === " " || code === "Space" || key === "Enter" || code === "Enter";
        if (isFlipKey) {
          e.preventDefault();
          handleFlip();
          return;
        }
      }

      // -- Rating Actions (1-4)
      // Including Alt-bypass for Linux/IME stability
      const ratingMap: Record<string, ReviewDifficulty> = {
        "1": "forgot", "Digit1": "forgot", "!": "forgot", "¹": "forgot",
        "2": "hard", "Digit2": "hard", "@": "hard", "²": "hard",
        "3": "good", "Digit3": "good", "#": "good", "³": "good",
        "4": "easy", "Digit4": "easy", "$": "easy", "⁴": "easy",
      };

      const difficulty = ratingMap[key] || ratingMap[code];
      
      if (difficulty && isFlipped && !isSubmitting) {
        e.preventDefault();
        const displayKey = difficulty === "forgot" ? "1" : 
                          difficulty === "hard" ? "2" : 
                          difficulty === "good" ? "3" : "4";
        
        console.log(`[Flashcard] Key ${e.type}: ${key}/${code} -> Rating: ${difficulty}`);
        handleRate(difficulty, displayKey);
      }
    };

    // Use Capture to win over internal component listeners
    window.addEventListener("keydown", handleKeyEvent, true);
    window.addEventListener("keyup", handleKeyEvent, true);

    return () => {
      window.removeEventListener("keydown", handleKeyEvent, true);
      window.removeEventListener("keyup", handleKeyEvent, true);
    };
  }, [handleFlip, handleRate]);

  if (isFinished || queue.length === 0) {
    const retentionRate = totalCards > 0 ? Math.round((goodCardsCount / totalCards) * 100) : 100;
    return <SessionSummary reviewedCount={totalCards} retentionRate={retentionRate} />;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto space-y-8 py-8 animate-in fade-in duration-300">
      
      {/* Header and Progress */}
      <div className="w-full flex flex-col space-y-2">
        <div className="flex justify-between items-center text-sm text-muted-foreground font-medium">
          <span>{currentIndex + 1} / {totalCards} Thẻ</span>
          <span>{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Main Card */}
      <FlashcardCard 
        card={currentCard} 
        isFlipped={isFlipped} 
        onFlip={handleFlip} 
      />

      {/* Controls Container */}
      <div className="h-24 w-full flex items-center justify-center">
        {isFlipped ? (
          <SRSControls onRate={handleRate} disabled={isSubmitting} activeKey={activeKey} />
        ) : (
          <p className="text-sm text-muted-foreground animate-pulse">Nhấn (Space) hoặc bấm vào thẻ để lật</p>
        )}
      </div>

    </div>
  );
}
