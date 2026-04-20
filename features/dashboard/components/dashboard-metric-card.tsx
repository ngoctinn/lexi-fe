import { Badge } from "@/components/ui/badge";
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
    <Card size="sm" className="hover:shadow-md transition-shadow">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="space-y-1">
            <span className="text-sm font-semibold text-foreground/80">
              {title}
            </span>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {progressLabel}
            </div>
          </div>

          <Badge variant="secondary" size="sm" className="font-medium">
            {progress}%
          </Badge>
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

        <div className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2 text-sm">
          <span className="text-muted-foreground">{footerLabel}</span>
          <span className="font-semibold text-foreground">{footerValue}</span>
        </div>
      </CardContent>
    </Card>
  );
}
