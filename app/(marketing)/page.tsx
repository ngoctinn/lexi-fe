import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  BookOpen,
  Mic,
  Trophy,
  Zap,
  BarChart3,
  Users,
  CheckCircle,
  Star,
  GraduationCap,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: BookOpen,
    // icon stays at its natural size, placed inside a colored circle
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Flashcards Thông Minh",
    description:
      "Hệ thống lặp lại ngắt quãng (SRS) tối ưu hóa thời điểm ôn tập, giúp từ vựng đi vào trí nhớ dài hạn một cách tự nhiên.",
  },
  {
    icon: Mic,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Luyện Nói Cùng AI",
    description:
      "Mô phỏng hội thoại thực tế với AI bản ngữ. Nhận phản hồi phát âm tức thì và xây dựng phản xạ tiếng Anh tự nhiên.",
  },
  {
    icon: BarChart3,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Lộ Trình Cá Nhân Hóa",
    description:
      "AI phân tích điểm yếu và tự động điều chỉnh nội dung học phù hợp trình độ và mục tiêu của từng học viên.",
  },
  {
    icon: Trophy,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Gamification",
    description:
      "Bảng xếp hạng, huy hiệu thành tích và chuỗi ngày học liên tiếp giữ động lực học tập luôn ở mức cao nhất.",
  },
  {
    icon: Zap,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Học Mọi Lúc Mọi Nơi",
    description:
      "Giao diện tối ưu cho mobile. Học 10 phút mỗi ngày trên xe buýt hay trước khi ngủ — đủ để tạo nên khác biệt.",
  },
  {
    icon: Users,
    bg: "bg-primary/10",
    color: "text-primary",
    title: "Cộng Đồng Học Viên",
    description:
      "Kết nối với hơn 1,000 học viên cùng chí hướng. Thảo luận, chia sẻ kinh nghiệm và cùng nhau tiến bộ mỗi ngày.",
  },
];

const steps = [
  {
    step: "01",
    title: "Làm bài kiểm tra đầu vào",
    description:
      "AI đánh giá trình độ hiện tại và xác định chính xác những điểm cần cải thiện của bạn.",
  },
  {
    step: "02",
    title: "Nhận lộ trình cá nhân",
    description:
      "Hệ thống tạo ra kế hoạch học tập tối ưu, sắp xếp nội dung từ dễ đến khó theo đúng tốc độ của bạn.",
  },
  {
    step: "03",
    title: "Học & luyện tập mỗi ngày",
    description:
      "Chỉ 15–20 phút mỗi ngày với Flashcards, luyện nói AI và các bài tập tương tác để đạt tiến bộ vượt bậc.",
  },
];

const testimonials = [
  {
    name: "Nguyễn Minh Anh",
    role: "Sinh viên đại học",
    content:
      "Sau 30 ngày dùng Lexi, điểm IELTS Speaking của mình lên từ 5.5 lên 6.5. AI coaching thực sự hiệu quả!",
    rating: 5,
  },
  {
    name: "Trần Đức Khoa",
    role: "Kỹ sư phần mềm",
    content:
      "Mình bận công việc nên chỉ học 15 phút/ngày. Lexi tối ưu từng phút học, không lãng phí một giây nào.",
    rating: 5,
  },
  {
    name: "Lê Thu Hà",
    role: "Marketing Executive",
    content:
      "Flashcards 3D và hệ thống repeat thông minh giúp mình nhớ 500 từ vựng business trong 3 tuần.",
    rating: 5,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* ── Sticky header ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="text-primary-foreground" style={{ width: 18, height: 18 }} />
            </div>
            <span className="text-lg font-bold tracking-tight">LexiLearn</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Tính năng
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              Cách hoạt động
            </a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">
              Đánh giá
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Đăng nhập</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/learn">
                Dùng miễn phí <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── HERO ────────────────────────────────────────────────────────
            Kỹ thuật: Image bên phải (không phóng to full-bleed để tránh
            mất nét), glow blob phía sau, CTA hierarchy: solid primary > outline.
            Spacing: py-24 md:py-36 (large step system: 96px → 144px).
        ────────────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden py-24 md:py-36" id="hero">
          {/* Subtle background glow — brand color tint */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-32 size-[600px] rounded-full bg-primary/8 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-32 size-[400px] rounded-full bg-primary/5 blur-3xl"
          />

          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            {/* ── Left: copy ── */}
            <div className="flex flex-col items-start gap-8">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm font-medium">
                <Zap className="text-primary" style={{ width: 14, height: 14 }} />
                AI-Powered English Learning
              </Badge>

              {/* h1: large serif-ish weight, consistent brand sizing */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight">
                Nói tiếng Anh tự tin{" "}
                <span className="text-primary">chỉ trong 30 ngày.</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-[480px] leading-relaxed">
                Kết hợp Flashcards thông minh, luyện nói cùng AI và lộ trình
                cá nhân hóa — học đúng cách, đúng lúc, đúng tốc độ của bạn.
              </p>

              {/* CTA buttons — primary hierarchy: solid > outline */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* PRIMARY: solid, high-contrast, eyes go here first */}
                <Button size="lg" className="h-12 px-8 text-base rounded-full" asChild>
                  <Link href="/learn">
                    Bắt đầu miễn phí <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                {/* SECONDARY: outline, visually subordinate */}
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base rounded-full"
                  asChild
                >
                  <a href="#how-it-works">Xem cách hoạt động</a>
                </Button>
              </div>

              {/* Social proof micro-copy */}
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
                      <Star
                        key={i}
                        className="text-primary fill-primary"
                        style={{ width: 14, height: 14 }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    1,000+ học viên tin tưởng
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right: illustration ──
                Kỹ thuật: giữ illustration ở kích thước hợp lý thay vì
                full-bleed. Thêm glow blob phía sau cho chiều sâu.
                Floating badges minh họa tính năng.
            ── */}
            <div className="relative flex items-center justify-center">
              {/* Glow behind illustration */}
              <div
                aria-hidden
                className="absolute size-[420px] rounded-full bg-primary/15 blur-3xl"
              />

              {/* Main illustration — animate-float (gentle up/down) */}
              <div className="relative z-10 animate-float">
                <Image
                  src="/lexi_hero_banner.png"
                  alt="Lexi — minh họa ứng dụng học tiếng Anh với AI"
                  width={480}
                  height={480}
                  priority
                  className="w-full max-w-md drop-shadow-2xl"
                />
              </div>

              {/* Floating badge: streak — animate-float-delayed */}
              <div className="absolute top-6 -left-4 z-20 bg-card border shadow-xl rounded-2xl px-4 py-3 animate-float-delayed">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Trophy className="text-primary" style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Chuỗi ngày học
                    </p>
                    <p className="text-sm font-bold">🔥 14 ngày liên tiếp</p>
                  </div>
                </div>
              </div>

              {/* Floating badge: vocab — animate-float-slow */}
              <div className="absolute -bottom-4 right-0 z-20 bg-card border shadow-xl rounded-2xl px-4 py-3 animate-float-slow">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="text-primary" style={{ width: 18, height: 18 }} />
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

        {/* ── STATS BAR ─────────────────────────────────────────────────── */}
        <div className="border-y bg-muted/30">
          <div className="container mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "1,000+", label: "Học viên tích cực" },
              { value: "50,000+", label: "Từ vựng trong kho" },
              { value: "30 ngày", label: "Đến giao tiếp tự tin" },
              { value: "4.9 ★", label: "Đánh giá trung bình" },
            ].map(({ value, label }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-3xl font-bold tracking-tight">{value}</span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURES ─────────────────────────────────────────────────────
            Kỹ thuật icon: giữ icon ở kích thước tự nhiên (20px), đặt trong
            circle container 44px. KHÔNG phóng to icon lên.
            Spacing: py-24 md:py-32 (large step).
        ────────────────────────────────────────────────────────────────── */}
        <section className="py-24 md:py-32" id="features">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center gap-4 text-center mb-16">
              <Badge variant="secondary">Tính năng</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight max-w-2xl">
                Mọi thứ bạn cần để làm chủ tiếng Anh
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Một nền tảng tích hợp đầy đủ — không cần dùng nhiều app khác nhau.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map(({ icon: Icon, bg, color, title, description }) => (
                <Card
                  key={title}
                  className="group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-border/60"
                >
                  <CardHeader className="pb-3">
                    {/* Icon-in-circle: icon stays at natural 20px, circle fills the space */}
                    <div
                      className={`size-11 rounded-xl ${bg} flex items-center justify-center mb-3`}
                    >
                      <Icon className={color} style={{ width: 20, height: 20 }} />
                    </div>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm leading-relaxed">
                      {description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section className="py-24 md:py-32 bg-muted/30" id="how-it-works">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center gap-4 text-center mb-16">
              <Badge variant="secondary">Cách hoạt động</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                3 bước để bắt đầu
              </h2>
              <p className="text-lg text-muted-foreground max-w-md">
                Đơn giản, nhanh chóng — sẵn sàng học ngay trong 5 phút.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {steps.map(({ step, title, description }, i) => (
                <div key={step} className="relative flex flex-col gap-5">
                  {/* Connector line between steps (hidden on last) */}
                  {i < steps.length - 1 && (
                    <div
                      aria-hidden
                      className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-border"
                    />
                  )}
                  <div className="relative z-10 flex flex-col gap-4 items-center md:items-start text-center md:text-left">
                    {/* Large step number — part of brand personality */}
                    <div className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm tracking-widest">
                      {step}
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xl font-semibold">{title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* ── TESTIMONIALS ─────────────────────────────────────────────── */}
        <section className="py-24 md:py-32" id="testimonials">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center gap-4 text-center mb-16">
              <Badge variant="secondary">Đánh giá từ học viên</Badge>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Học viên nói gì về Lexi?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map(({ name, role, content, rating }) => (
                <Card key={name} className="border-border/60">
                  <CardHeader className="pb-3">
                    {/* Star rating */}
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="text-primary fill-primary"
                          style={{ width: 16, height: 16 }}
                        />
                      ))}
                    </div>
                    <CardDescription className="text-base text-foreground/80 leading-relaxed">
                      &ldquo;{content}&rdquo;
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Separator className="mb-4" />
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-sm">
                          {name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-semibold">{name}</span>
                        <span className="text-xs text-muted-foreground">{role}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ─────────────────────────────────────────────────
            Kỹ thuật: Solid primary background để tối đa hóa chuyển đổi.
            Spacing: py-24 md:py-32.
        ────────────────────────────────────────────────────────────────── */}
        <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
          {/* Decorative bg shape */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary-foreground/5 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-primary-foreground/5 blur-3xl"
          />

          <div className="container mx-auto px-6 relative z-10 flex flex-col items-center gap-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight max-w-2xl">
              Bắt đầu hành trình tiếng Anh của bạn ngay hôm nay
            </h2>
            <p className="text-lg text-primary-foreground/80 max-w-md">
              Miễn phí. Không cần thẻ tín dụng. Sẵn sàng trong 5 phút.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="h-12 px-8 text-base rounded-full font-semibold"
                asChild
              >
                <Link href="/learn">
                  Dùng miễn phí ngay <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base rounded-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <a href="#features">Tìm hiểu thêm</a>
              </Button>
            </div>
            <p className="text-sm text-primary-foreground/60">
              Tham gia cùng 1,000+ học viên đang tiến bộ mỗi ngày
            </p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <Link href="/" className="flex items-center gap-2">
              <div className="size-7 bg-primary rounded-md flex items-center justify-center">
                <GraduationCap className="text-primary-foreground" style={{ width: 15, height: 15 }} />
              </div>
              <span className="font-bold">LexiLearn</span>
            </Link>

            {/* Footer links */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Điều khoản
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Bảo mật
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Liên hệ
              </a>
            </div>

            <p className="text-sm text-muted-foreground">
              © 2025 LexiLearn. Made with ❤️ in Việt Nam.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
