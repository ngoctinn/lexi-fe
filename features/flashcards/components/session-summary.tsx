import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface SessionSummaryProps {
  reviewedCount: number;
  retentionRate?: number;
}

export function SessionSummary({
  reviewedCount,
  retentionRate = 100,
}: SessionSummaryProps) {
  return (
    <div className="flex w-full items-center justify-center animate-in fade-in zoom-in duration-500">
      <Empty variant="outline" size="full" className="max-w-2xl">
        <EmptyMedia variant="circle">
          <CheckCircle2 className="size-6" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Hoàn thành phiên hôm nay</EmptyTitle>
          <EmptyDescription className="mx-auto max-w-md">
            Bạn đã ôn xong {reviewedCount} thẻ. Lịch SRS tiếp theo đã được cập
            nhật.
          </EmptyDescription>
        </EmptyHeader>

        <div className="grid w-full gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-4 text-center">
            <span className="text-3xl font-bold text-primary">
              {reviewedCount}
            </span>
            <span className="mt-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Đã ôn
            </span>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <span className="text-3xl font-bold text-primary">
              {retentionRate}%
            </span>
            <span className="mt-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Độ nhớ
            </span>
          </div>
        </div>

        <Button asChild size="lg" className="min-w-50">
          <Link href="/dashboard">Về tổng quan</Link>
        </Button>
      </Empty>
    </div>
  );
}
