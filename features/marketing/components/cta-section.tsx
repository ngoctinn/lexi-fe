import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary-foreground/5 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-primary-foreground/5 blur-3xl" />

      <div className="container mx-auto px-6 max-w-4xl relative z-10 flex flex-col items-center gap-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight max-w-xl">
          Bắt đầu hành trình tiếng Anh của bạn ngay hôm nay
        </h2>
        <p className="text-lg text-primary-foreground/80 max-w-md">Miễn phí. Không cần thẻ tín dụng. Sẵn sàng trong 5 phút.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button size="lg" variant="secondary" className="h-12 px-8 text-base rounded-full font-semibold" asChild>
            <Link href="/learn">
              Dùng miễn phí ngay <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
            <a href="#features">Tìm hiểu thêm</a>
          </Button>
        </div>
        <p className="text-sm text-primary-foreground/60">Tham gia cùng 1,000+ học viên đang tiến bộ mỗi ngày</p>
      </div>
    </section>
  );
}
