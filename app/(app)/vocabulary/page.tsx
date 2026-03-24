import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function VocabularyPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <Empty>
        <EmptyMedia>
          <BookOpen className="size-12 text-primary/50" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Sổ tay từ vựng</EmptyTitle>
          <EmptyDescription>
            Tất cả từ vựng bạn đã học sẽ xuất hiện ở đây. Hãy bắt đầu bài học đầu tiên!
          </EmptyDescription>
        </EmptyHeader>
        <Button>Học từ mới</Button>
      </Empty>
    </div>
  );
}
