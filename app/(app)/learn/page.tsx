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
    <main className="min-h-screen flex flex-col px-4 py-4 md:px-8 md:py-8">
      <PageHeader icon={Map} title="Lộ trình học" />

      <section className="flex flex-1 items-center justify-center">
        <Empty>
          <EmptyMedia>
            <Map className="size-12 text-primary-300" />
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
      </section>
    </main>
  );
}
