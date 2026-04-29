import { Logo } from "@/components/shared/logo";

export function LandingFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" />

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-foreground transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-foreground transition-colors">Liên hệ</a>
          </div>

          <p className="text-sm text-muted-foreground">© 2025 Lexi. Made with ❤️ in Việt Nam.</p>
        </div>
      </div>
    </footer>
  );
}
