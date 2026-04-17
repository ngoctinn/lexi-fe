import Link from "next/link";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

export default function ShopPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={Store} title="Cửa hàng Lexi" />

      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <Empty>
          <EmptyMedia>
            <Store className="size-12 text-primary-300" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Cửa hàng Lexi</EmptyTitle>
            <EmptyDescription>
              Tính năng sắp ra mắt, hãy tiếp tục tích lũy XP nhé.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href="/dashboard">Tiếp tục kiếm XP</Link>
          </Button>
        </Empty>
      </div>
    </div>
  );
}
