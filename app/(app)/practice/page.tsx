import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { PenTool } from "lucide-react";

export default function PracticePage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <Empty>
        <EmptyMedia>
          <PenTool className="size-12 text-primary/50" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Khu vực Luyện tập</EmptyTitle>
          <EmptyDescription>
            Luyện nói, luyện viết, và thực hành ngữ pháp. Hệ thống đang được cập nhật!
          </EmptyDescription>
        </EmptyHeader>
        <Button>Về Dashboard</Button>
      </Empty>
    </div>
  );
}
