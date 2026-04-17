import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, Trophy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function LandingHero() {
  return (
    <section
      className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-36"
      id="hero"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 size-150 rounded-full bg-primary/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-32 size-100 rounded-full bg-primary/5 blur-3xl"
      />

      <div className="container mx-auto px-6 max-w-6xl grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="flex flex-col items-start gap-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.08] tracking-tight">
            <span className="text-primary">Nắm Vững Từng Từ Vựng</span>{" "}
            <span className="text-primary-800">
              Tự Tin Trong Mọi Cuộc Hội Thoại.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-120 leading-relaxed">
            Kết hợp Flashcards thông minh, luyện nói cùng AI và lộ trình cá nhân
            hóa — học đúng cách, đúng lúc, đúng tốc độ của bạn.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="xl" asChild>
              <Link href="/learn">
                Bắt đầu miễn phí <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
            <Button size="xl" variant="outline" asChild>
              <a href="#preview">Xem demo hội thoại</a>
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {["Giao tiếp hằng ngày", "Du lịch", "Phỏng vấn"].map((label) => (
              <Badge
                key={label}
                variant="default"
                className="rounded-full px-3 py-1 text-xs font-semibold"
              >
                {label}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="size-9 rounded-full border-2 border-background bg-muted -ml-2.5 first:ml-0"
                />
              ))}
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="text-primary fill-primary" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                1,000+ học viên tin tưởng
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="absolute size-105 rounded-full bg-primary/15 blur-3xl"
          />
          <div className="relative z-10 animate-float">
            <Image
              src="/hero.png"
              alt="Lexi"
              width={480}
              height={480}
              priority
              className="w-full max-w-md drop-shadow-2xl rounded-2xl"
            />
          </div>

          <div className="absolute top-6 -left-4 z-20 bg-card border shadow-xl rounded-2xl px-4 py-3 animate-float-delayed">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Trophy className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Chuỗi ngày học
                </p>
                <p className="text-sm font-bold">🔥 14 ngày liên tiếp</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 right-0 z-20 bg-card border shadow-xl rounded-2xl px-4 py-3 animate-float-slow">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Hôm nay
                </p>
                <p className="text-sm font-bold">20 từ đã thuộc ✓</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
