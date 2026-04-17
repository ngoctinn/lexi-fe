import Link from "next/link";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={Trophy} title="Bảng xếp hạng" />

      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <Empty>
          <EmptyMedia>
            <Trophy className="size-12 text-primary-300" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Bảng xếp hạng</EmptyTitle>
            <EmptyDescription>
              Khởi động vòng đua mới khi tính năng hoàn thiện.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href="/dashboard">Xem hạng của tôi</Link>
          </Button>
        </Empty>
      </div>
    </div>
  );
}
