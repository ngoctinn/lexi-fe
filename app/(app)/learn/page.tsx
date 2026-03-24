import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";

export default function LearnPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <Empty>
        <EmptyMedia>
          <Map className="size-12 text-primary/50" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Lộ trình học đang được xây dựng</EmptyTitle>
          <EmptyDescription>
            Chúng tôi đang chuẩn bị những bài học thú vị nhất cho bạn. Vui lòng quay lại sau!
          </EmptyDescription>
        </EmptyHeader>
        <Button>Trở về trang chủ</Button>
      </Empty>
    </div>
  );
}
