import Link from "next/link";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

export default function LearnPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-8">
      <PageHeader icon={Map} title="Lộ trình học" />

      <div className="flex flex-1 items-center justify-center">
        <Empty>
          <EmptyMedia>
            <Map className="size-12 text-primary/50" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>Lộ trình học đang được xây dựng</EmptyTitle>
            <EmptyDescription>
              Vui lòng quay lại sau hoặc bắt đầu từ trang chủ.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild>
            <Link href="/dashboard">Trở về trang chủ</Link>
          </Button>
        </Empty>
      </div>
    </div>
  );
}
