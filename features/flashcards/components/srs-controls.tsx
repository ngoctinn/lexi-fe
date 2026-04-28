"use client";

import { ReviewDifficulty } from "../schemas/flashcard.schema";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, Frown, Smile, Sparkles } from "lucide-react";

interface SRSControlsProps {
  onRate: (difficulty: ReviewDifficulty) => void;
  disabled?: boolean;
  activeKey: string | null;
}

const ratingConfig = [
  {
    key: "1",
    difficulty: "again" as ReviewDifficulty,
    label: "Quên",
    variant: "destructive" as const,
    icon: RotateCcw,
    description: "Học lại từ đầu",
  },
  {
    key: "2",
    difficulty: "hard" as ReviewDifficulty,
    label: "Khó",
    variant: "soft-warning" as const,
    icon: Frown,
    description: "Cần ôn nhiều hơn",
  },
  {
    key: "3",
    difficulty: "good" as ReviewDifficulty,
    label: "Tốt",
    variant: "soft-info" as const,
    icon: Smile,
    description: "Nhớ được",
  },
  {
    key: "4",
    difficulty: "easy" as ReviewDifficulty,
    label: "Dễ",
    variant: "soft-success" as const,
    icon: Sparkles,
    description: "Nhớ rất rõ",
  },
];

export function SRSControls({ onRate, disabled, activeKey }: SRSControlsProps) {
  return (
    <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <p className="text-center text-sm text-muted-foreground">
        Đánh giá mức độ nhớ của bạn
      </p>
      
      <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {ratingConfig.map(({ key, difficulty, label, variant, icon: Icon, description }) => (
          <Button
            key={key}
            variant={variant}
            className={cn(
              "group relative h-auto min-h-20 flex-col gap-2 py-4 px-3 transition-all duration-200",
              "hover:scale-105 hover:shadow-lg",
              "active:scale-95",
              activeKey === key && "scale-95 shadow-none ring-2 ring-offset-2",
              disabled && "pointer-events-none opacity-50",
            )}
            onClick={() => onRate(difficulty)}
            disabled={disabled}
          >
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-background/20 text-xs font-bold">
                {key}
              </span>
              <Icon className="size-4 transition-transform group-hover:scale-110" />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-sm font-semibold">{label}</span>
              <span className="text-xs opacity-80">{description}</span>
            </div>
          </Button>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Hoặc nhấn phím <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">1</kbd>
        {" "}<kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">2</kbd>
        {" "}<kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">3</kbd>
        {" "}<kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">4</kbd>
      </p>
    </div>
  );
}
