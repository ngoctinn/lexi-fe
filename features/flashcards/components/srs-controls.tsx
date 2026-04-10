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
    <div className="grid w-full max-w-[600px] grid-cols-4 gap-2 sm:gap-4">
      <Button
        variant="destructive"
        className={cn(
          "h-auto flex-col gap-1 py-3 px-2 transition-all",
          activeKey === "1" ? "translate-y-0.5 shadow-none bg-destructive/20 scale-[0.98]" : ""
        )}
        onClick={() => onRate("forgot")}
        disabled={disabled}
      >
        <span className="text-xs font-semibold opacity-80">1 Ngày</span>
        <span className="text-sm font-medium">Quên (1)</span>
      </Button>

      <Button
        variant="soft-warning"
        className={cn(
          "h-auto flex-col gap-1 py-3 px-2 transition-all",
          activeKey === "2" ? "translate-y-0.5 shadow-none bg-warning/20 scale-[0.98]" : ""
        )}
        onClick={() => onRate("hard")}
        disabled={disabled}
      >
        <span className="text-xs font-semibold opacity-80">2 Ngày</span>
        <span className="text-sm font-medium">Khó (2)</span>
      </Button>

      <Button
        variant="soft-info"
        className={cn(
          "h-auto flex-col gap-1 py-3 px-2 transition-all",
          activeKey === "3" ? "translate-y-0.5 shadow-none bg-info/20 scale-[0.98]" : ""
        )}
        onClick={() => onRate("good")}
        disabled={disabled}
      >
        <span className="text-xs font-semibold opacity-80">1 Tuần</span>
        <span className="text-sm font-medium">Tốt (3)</span>
      </Button>

      <Button
        variant="soft-success"
        className={cn(
          "h-auto flex-col gap-1 py-3 px-2 transition-all",
          activeKey === "4" ? "translate-y-0.5 shadow-none bg-success/20 scale-[0.98]" : ""
        )}
        onClick={() => onRate("easy")}
        disabled={disabled}
      >
        <span className="text-xs font-semibold opacity-80">1 Tháng</span>
        <span className="text-sm font-medium">Dễ (4)</span>
      </Button>
    </div>
  );
}
