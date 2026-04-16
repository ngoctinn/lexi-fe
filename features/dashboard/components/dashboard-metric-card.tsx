import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
interface DashboardMetricCardProps {
  title: string;
  value: string;
  suffix?: string;
  description: string;
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
  progress,
  progressLabel,
  footerLabel,
  footerValue,
}: DashboardMetricCardProps) {
  return (
    <Card className="border-b-0 shadow-sm ring-1 ring-border/60 hover:shadow-md">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[13px] font-semibold text-foreground/80">
              {title}
            </span>
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {progressLabel}
            </div>
          </div>

          <span className="rounded-full bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            {progress}%
          </span>
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

        <Progress value={progress} className="h-1.5 bg-muted/60" />

        <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-2 text-sm">
          <span className="text-muted-foreground">{footerLabel}</span>
          <span className="font-semibold text-foreground">{footerValue}</span>
        </div>
      </CardContent>
    </Card>
  );
}
