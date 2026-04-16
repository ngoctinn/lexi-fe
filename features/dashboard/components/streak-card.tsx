import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const WEEK_DAYS = [
  { label: "T2", active: true },
  { label: "T3", active: true },
  { label: "T4", active: true },
  { label: "T5", active: false },
  { label: "T6", active: true },
  { label: "T7", active: true },
  { label: "CN", active: false },
];

interface StreakCardProps {
  currentStreak: number;
  bestStreak: number;
  activeDaysThisWeek: number;
}

export function StreakCard({
  currentStreak,
  bestStreak,
  activeDaysThisWeek,
}: StreakCardProps) {
  return (
    <Card className="h-full border-b-0 shadow-sm ring-1 ring-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold tracking-tight text-foreground">
              Chuỗi học
            </CardTitle>
            <CardDescription>
              Duy trì nhịp học đều ở từ vựng và luyện nói.
            </CardDescription>
          </div>

          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted/60 text-2xl leading-none ring-1 ring-border/60">
            🔥
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-5xl font-black tracking-tighter text-foreground">
              {currentStreak}
            </div>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              ngày liên tiếp
            </p>
          </div>

          <div className="rounded-full bg-primary/10 px-3 py-1.5 text-right ring-1 ring-primary/15">
            <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
              <span className="text-base leading-none">🏆</span>
              <span>{bestStreak}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl bg-muted/30 p-3 ring-1 ring-border/60">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span>Nhịp tuần này</span>
            <span className="text-foreground">
              {activeDaysThisWeek} / 7 ngày
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {WEEK_DAYS.map((day) => (
              <div
                key={day.label}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-2xl py-2 ring-1 ring-border/60",
                  day.active ? "bg-background" : "bg-muted/60",
                )}
              >
                <span className="text-base leading-none">
                  {day.active ? "🔥" : "⚪"}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {day.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs leading-5 text-muted-foreground">
            Gồm các buổi học từ vựng và luyện nói.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
