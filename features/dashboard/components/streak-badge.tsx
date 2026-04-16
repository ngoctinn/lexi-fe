import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary-700 shadow-sm",
        className,
      )}
    >
      <Flame className="size-4 text-primary" />
      <span>{streak}</span>
      <span className="text-muted-foreground">ngày</span>
    </div>
  );
}
