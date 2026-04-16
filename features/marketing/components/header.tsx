import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export function LandingHeader() {
  return (
    <header className="fixed top-4 md:top-6 left-0 right-0 z-50 mx-auto px-4 md:px-6 w-full max-w-4xl">
      <div className="bg-background border-2 border-border shadow-[0_6px_0_0_rgba(0,0,0,0.05)] rounded-full h-16 px-3 flex items-center justify-between transition-all">
        <Logo className="pl-2" />

        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-muted-foreground">
          <a
            href="#features"
            className="hover:text-foreground transition-colors"
          >
            Tính năng
          </a>
          <a
            href="#how-it-works"
            className="hover:text-foreground transition-colors"
          >
            Hệ thống
          </a>
          <a
            href="#testimonials"
            className="hover:text-foreground transition-colors"
          >
            Cộng đồng
          </a>
        </nav>

        <div className="flex items-center gap-2 pr-1">
          <Button variant="ghost" className="hidden sm:flex" asChild>
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button size="2xl" asChild>
            <Link href="/learn">
              Bắt đầu <ArrowRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
