import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function FlashcardEmptyState() {
  return (
    <Empty
      variant="outline"
      size="full"
      className="mx-auto w-full max-w-2xl px-4 py-10"
    >
      <EmptyMedia variant="circle">
        <Sparkles className="size-6" />
      </EmptyMedia>

      <EmptyHeader>
        <EmptyTitle>Chưa có thẻ đến hạn hôm nay</EmptyTitle>
        <EmptyDescription className="mx-auto max-w-md">
          Bạn có thể quay lại sau khi hệ thống có thẻ đến hạn hoặc đi về tổng
          quan để tiếp tục các hoạt động học khác.
        </EmptyDescription>
      </EmptyHeader>

      <Button asChild size="lg" className="min-w-44">
        <Link href="/dashboard">Về tổng quan</Link>
      </Button>
    </Empty>
  );
}
