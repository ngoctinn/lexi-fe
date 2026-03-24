import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

export default function ShopPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
      <Empty>
        <EmptyMedia>
          <Store className="size-12 text-primary/50" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Cửa hàng Lexi</EmptyTitle>
          <EmptyDescription>
            Sử dụng XP của bạn để đổi lấy các trang bị độc đáo. Tính năng sắp ra mắt!
          </EmptyDescription>
        </EmptyHeader>
        <Button>Tiếp tục kiếm XP</Button>
      </Empty>
    </div>
  );
}
