"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

interface SessionSummaryProps {
  reviewedCount: number;
  retentionRate?: number; // Optional visual stat
}

export function SessionSummary({ reviewedCount, retentionRate = 100 }: SessionSummaryProps) {
  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center animate-in fade-in zoom-in duration-500">
      <Empty>
        <EmptyMedia>
          <CheckCircle2 className="size-16 text-green-500" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Hoàn thành xuất sắc!</EmptyTitle>
          <EmptyDescription className="max-w-xs mx-auto">
            Bạn đã ôn tập xong {reviewedCount} thẻ cho ngày hôm nay. Thuật toán SRS đã cập nhật lịch học tiếp theo.
          </EmptyDescription>
        </EmptyHeader>
        
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-4 mb-8">
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card">
            <span className="text-3xl font-bold text-primary">{reviewedCount}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Đã ôn</span>
          </div>
          <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-card">
            <span className="text-3xl font-bold text-primary">{retentionRate}%</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Độ nhớ</span>
          </div>
        </div>

        <Link href="/dashboard" passHref>
          <Button size="lg" className="w-full sm:w-auto min-w-[200px]">
            Về trang chủ
          </Button>
        </Link>
      </Empty>
    </div>
  );
}
