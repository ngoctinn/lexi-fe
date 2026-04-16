import { Flame, CalendarDays, Trophy, Target } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  weeklyProgress: number;
  activeDaysThisWeek: number;
}

export function StreakCard({
  currentStreak,
  bestStreak,
  weeklyProgress,
  activeDaysThisWeek,
}: StreakCardProps) {
  return (
    <Card className="h-full border-primary/15 bg-linear-to-br from-primary/10 via-primary/5 to-background shadow-none ring-1 ring-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold tracking-tight text-primary-700">
              Chuỗi học
            </CardTitle>
            <CardDescription>
              Duy trì nhịp học đều ở từ vựng và luyện nói.
            </CardDescription>
          </div>

          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <Flame className="size-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-5xl font-black tracking-tighter text-primary-700">
              {currentStreak}
            </div>
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              ngày liên tiếp
            </p>
          </div>

          <div className="rounded-2xl bg-background/80 px-4 py-3 text-right shadow-sm ring-1 ring-border/60">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Trophy className="size-3.5 text-primary" />
              Kỷ lục
            </div>
            <div className="mt-1 text-2xl font-black tracking-tight text-foreground">
              {bestStreak}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-background/80 p-3 ring-1 ring-border/60">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <CalendarDays className="size-3.5 text-primary" />
              Tuần này
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {activeDaysThisWeek} / 7 ngày
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Gồm các buổi học từ vựng và luyện nói.
            </p>
          </div>

          <div className="rounded-2xl bg-background/80 p-3 ring-1 ring-border/60">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Target className="size-3.5 text-primary" />
              Mục tiêu
            </div>
            <div className="mt-1 text-lg font-bold text-foreground">
              {weeklyProgress}%
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Còn 2 buổi nữa để chạm mốc tuần này.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
            <span>Nhịp tuần này</span>
            <span className="text-primary">{weeklyProgress}%</span>
          </div>
          <Progress value={weeklyProgress} className="h-2 bg-primary/15" />
          <div className="flex items-center justify-between gap-1 pt-1">
            {WEEK_DAYS.map((day) => (
              <span
                key={day.label}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-[10px] font-bold tracking-wider",
                  day.active
                    ? "bg-primary/15 text-primary-700 ring-1 ring-primary/20"
                    : "bg-muted/50 text-muted-foreground",
                )}
              >
                {day.label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
