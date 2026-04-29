"use client";

import * as React from "react";
import { BarChart3, CircleAlert, CircleCheck, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  detail: string;
}

function MetricCard({ icon: Icon, label, value, detail }: MetricCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-extrabold tracking-tight text-foreground">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-50 text-primary ring-1 ring-primary-100">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

interface ScenarioMetricsProps {
  total: number;
  active: number;
  inactive: number;
}

export function ScenarioMetrics({ total, active, inactive }: ScenarioMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <MetricCard
        icon={SlidersHorizontal}
        label="Tổng kịch bản"
        value={total}
        detail="Tất cả tình huống đang lưu trữ"
      />
      <MetricCard
        icon={CircleCheck}
        label="Đang mở"
        value={active}
        detail="Có thể chọn cho học viên"
      />
      <MetricCard
        icon={CircleAlert}
        label="Đã ẩn"
        value={inactive}
        detail="Tạm thời không hiển thị"
      />
    </div>
  );
}
