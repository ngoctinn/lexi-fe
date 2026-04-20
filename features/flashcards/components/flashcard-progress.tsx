import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Repeat } from "lucide-react";

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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {currentIndex + 1} / {totalCards}
        </span>
        {isRelearning ? (
          <Badge
            variant="warning"
            data-icon="inline-start"
          >
            <Repeat className="size-3" aria-hidden />
            Ôn lại
          </Badge>
        ) : null}
      </div>

      <Progress value={progressValue} />
    </div>
  );
}
