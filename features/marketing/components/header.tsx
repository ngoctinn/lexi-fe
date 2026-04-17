import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/logo";

export function LandingHeader() {
  return (
    <header className="fixed top-4 md:top-6 inset-x-0 z-50 px-4 md:px-6">
      <div className="mx-auto grid h-14 w-full max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-border/70 bg-background/90 px-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur supports-backdrop-filter:bg-background/80 md:h-16 md:px-5">
        <Logo size="sm" className="shrink-0" />

        <nav className="hidden justify-self-center md:flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          <a
            href="#features"
            className="rounded-full px-3 py-2 transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            Tính năng
          </a>
          <a
            href="#preview"
            className="rounded-full px-3 py-2 transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            Trải nghiệm
          </a>
          <a
            href="#how-it-works"
            className="rounded-full px-3 py-2 transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            Hệ thống
          </a>
          <a
            href="#faq"
            className="rounded-full px-3 py-2 transition-colors hover:bg-muted/70 hover:text-foreground"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center justify-self-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="hidden sm:inline-flex"
            asChild
          >
            <Link href="/login">Đăng nhập</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/learn">Tham gia miễn phí ngay</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
