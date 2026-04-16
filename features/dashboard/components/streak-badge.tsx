import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/60 px-2.5 py-1 text-sm font-semibold text-foreground shadow-sm",
        className,
      )}
    >
      <span className="text-base leading-none">🔥</span>
      <span>{streak}</span>
    </div>
  );
}
