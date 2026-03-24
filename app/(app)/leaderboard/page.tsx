import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <Empty>
        <EmptyMedia>
          <Trophy className="size-12 text-primary/50" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Bảng xếp hạng</EmptyTitle>
          <EmptyDescription>
            So tài cùng hàng ngàn học viên khác trên toàn cầu. Khởi động vòng đua mới!
          </EmptyDescription>
        </EmptyHeader>
        <Button>Xem hạng của tôi</Button>
      </Empty>
    </div>
  );
}
