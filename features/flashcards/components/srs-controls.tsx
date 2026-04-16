"use client";

import { ReviewDifficulty } from "../types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SRSControlsProps {
  onRate: (difficulty: ReviewDifficulty) => void;
  disabled?: boolean;
  activeKey: string | null;
}

export function SRSControls({ onRate, disabled, activeKey }: SRSControlsProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
      <Button
        variant="destructive"
        className={cn(
          "h-auto min-h-16 flex-col gap-1 py-3 px-3 transition-all",
          activeKey === "1"
            ? "translate-y-0.5 scale-[0.98] bg-destructive/20 shadow-none"
            : "",
        )}
        onClick={() => onRate("forgot")}
        disabled={disabled}
      >
        <span className="text-xs font-semibold opacity-80">1</span>
        <span className="text-sm font-medium">Quên</span>
      </Button>

      <Button
        variant="soft-warning"
        className={cn(
          "h-auto min-h-16 flex-col gap-1 py-3 px-3 transition-all",
          activeKey === "2"
            ? "translate-y-0.5 scale-[0.98] bg-warning/20 shadow-none"
            : "",
        )}
        onClick={() => onRate("hard")}
        disabled={disabled}
      >
        <span className="text-xs font-semibold opacity-80">2</span>
        <span className="text-sm font-medium">Khó</span>
      </Button>

      <Button
        variant="soft-info"
        className={cn(
          "h-auto min-h-16 flex-col gap-1 py-3 px-3 transition-all",
          activeKey === "3"
            ? "translate-y-0.5 scale-[0.98] bg-info/20 shadow-none"
            : "",
        )}
        onClick={() => onRate("good")}
        disabled={disabled}
      >
        <span className="text-xs font-semibold opacity-80">3</span>
        <span className="text-sm font-medium">Tốt</span>
      </Button>

      <Button
        variant="soft-success"
        className={cn(
          "h-auto min-h-16 flex-col gap-1 py-3 px-3 transition-all",
          activeKey === "4"
            ? "translate-y-0.5 scale-[0.98] bg-success/20 shadow-none"
            : "",
        )}
        onClick={() => onRate("easy")}
        disabled={disabled}
      >
        <span className="text-xs font-semibold opacity-80">4</span>
        <span className="text-sm font-medium">Dễ</span>
      </Button>
    </div>
  );
}
