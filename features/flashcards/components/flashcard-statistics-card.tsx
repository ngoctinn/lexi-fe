"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Target, Calendar, Zap } from "lucide-react";
import { useFlashcardStatistics } from "../hooks/use-flashcards";

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: string;
}

function StatItem({ icon, label, value, trend }: StatItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/50">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        {trend && (
          <p className="mt-0.5 text-xs text-muted-foreground">{trend}</p>
        )}
      </div>
    </div>
  );
}

function StatItemSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <Skeleton className="size-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function FlashcardStatisticsCard() {
  const { data: stats, isLoading, error } = useFlashcardStatistics();

  if (error) {
    return null; // Gracefully hide if stats unavailable
  }

  if (isLoading) {
    return (
      <Card size="sm" className="border-border/70 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold tracking-tight text-primary-900">
            Thống kê
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <StatItemSkeleton />
          <StatItemSkeleton />
          <StatItemSkeleton />
          <StatItemSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const maturityPercentage = stats.total_count > 0
    ? Math.round((stats.mature_cards / stats.total_count) * 100)
    : 0;

  return (
    <Card size="sm" className="border-border/70 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold tracking-tight text-primary-900">
          Thống kê
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <StatItem
          icon={<Target className="size-5" />}
          label="Tổng từ vựng"
          value={stats.total_count}
          trend={`${stats.new_cards} từ mới`}
        />
        <StatItem
          icon={<Calendar className="size-5" />}
          label="Đến hạn hôm nay"
          value={stats.due_today}
          trend={stats.due_today > 0 ? "Cần ôn tập" : "Hoàn thành"}
        />
        <StatItem
          icon={<TrendingUp className="size-5" />}
          label="Đang học"
          value={stats.learning_cards}
          trend={`${maturityPercentage}% thành thạo`}
        />
        <StatItem
          icon={<Zap className="size-5" />}
          label="Thành thạo"
          value={stats.mature_cards}
          trend={stats.mature_cards > 0 ? "Giữ vững" : "Chưa có"}
        />
      </CardContent>
    </Card>
  );
}
