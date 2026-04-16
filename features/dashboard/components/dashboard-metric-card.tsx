import { type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DashboardMetricCardProps {
  title: string;
  value: string;
  suffix?: string;
  description: string;
  icon: LucideIcon;
  progress: number;
  progressLabel: string;
  footerLabel: string;
  footerValue: string;
}

export function DashboardMetricCard({
  title,
  value,
  suffix,
  description,
  icon: Icon,
  progress,
  progressLabel,
  footerLabel,
  footerValue,
}: DashboardMetricCardProps) {
  return (
    <Card className="border-b-0 bg-primary/8 shadow-none ring-1 ring-primary/20">
      <CardContent className="p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-muted-foreground/80">
            {title}
          </span>

          <div className="flex size-9 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <Icon className="size-4" strokeWidth={2.15} />
          </div>
        </div>

        <div className="flex items-end gap-2">
          <span className="text-3xl font-black tracking-tight text-foreground">
            {value}
          </span>
          {suffix ? (
            <span className="pb-1 text-sm font-semibold text-muted-foreground">
              {suffix}
            </span>
          ) : null}
        </div>

        <p className="text-sm leading-5 text-muted-foreground">{description}</p>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70">
            <span>{progressLabel}</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-primary/15" />
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-background/70 px-3 py-2 text-sm">
          <span className="text-muted-foreground">{footerLabel}</span>
          <span className="font-semibold text-foreground">{footerValue}</span>
        </div>
      </CardContent>
    </Card>
  );
}
