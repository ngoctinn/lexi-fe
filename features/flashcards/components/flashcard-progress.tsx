import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Repeat, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardProgressProps {
  currentIndex: number;
  totalCards: number;
  isRelearning?: boolean;
}

export function FlashcardProgress({
  currentIndex,
  totalCards,
  isRelearning = false,
}: FlashcardProgressProps) {
  const progressValue =
    totalCards === 0
      ? 100
      : Math.round(((currentIndex + 1) / totalCards) * 100);

  const isComplete = currentIndex + 1 === totalCards;

  return (
    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {currentIndex + 1} / {totalCards}
          </span>
          <span className="text-xs text-muted-foreground">
            ({progressValue}%)
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {isComplete && (
            <Badge
              variant="success"
              data-icon="inline-start"
              className="animate-in fade-in zoom-in duration-300"
            >
              <CheckCircle2 className="size-3" aria-hidden />
              Hoàn thành
            </Badge>
          )}
          {isRelearning && (
            <Badge
              variant="warning"
              data-icon="inline-start"
              className="animate-in fade-in zoom-in duration-300"
            >
              <Repeat className="size-3" aria-hidden />
              Ôn lại
            </Badge>
          )}
        </div>
      </div>

      <div className="relative">
        <Progress 
          value={progressValue} 
          className={cn(
            "transition-all duration-500",
            isComplete && "bg-success-100"
          )}
        />
        {isComplete && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-success-200/20" />
        )}
      </div>
    </div>
  );
}
