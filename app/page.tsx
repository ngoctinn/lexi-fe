import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, BookOpen, Star, Trophy, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Lexi</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground transition-colors">
            <a href="#" className="hover:text-blue-600">Courses</a>
            <a href="#" className="hover:text-blue-600">Flashcards</a>
            <a href="#" className="hover:text-blue-600">AI Voice</a>
            <a href="#" className="hover:text-blue-600">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Log in</Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col items-start gap-8">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-3 py-1">
                AI-Powered English Learning
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900">
                Luyện nói & Học từ vựng <span className="text-blue-600">siêu tốc.</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-[500px] leading-relaxed">
                Nền tảng học tiếng Anh cá nhân hóa với Flashcards 3D và Trình đối thoại AI thông minh. Tự tin giao tiếp chỉ sau 30 ngày.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg rounded-full">
                  Bắt đầu ngay <ArrowRight className="ml-2 size-5" />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2">
                  Xem lộ trình
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="size-8 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                </div>
                <span>Tham gia cùng 1,000+ học viên tích cực</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-100/50 rounded-[2rem] blur-2xl -z-10 animate-pulse" />
              <div className="rounded-3xl border shadow-2xl overflow-hidden bg-white aspect-square relative group">
                <Image
                  src="/lexi_hero_banner_1773895126640.png"
                  alt="Lexi AI English Learning"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Floating Widgets */}
              <div className="absolute top-4 -right-8 bg-white p-4 rounded-2xl shadow-xl border animate-bounce duration-[3000ms]">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="text-green-600 size-5 fill-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Mục tiêu ngày</p>
                    <p className="font-bold">20/20 Từ mới</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-8 bg-white p-4 rounded-2xl shadow-xl border animate-bounce duration-[2500ms]">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mic className="text-blue-600 size-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Đang luyện nói</p>
                    <p className="font-bold italic">"How are you today?"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Học hiệu quả hơn với Lexi</h2>
            <p className="text-lg text-slate-600">Mọi thứ bạn cần để làm chủ tiếng Anh</p>
          </div>
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="size-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="text-white size-6" />
                </div>
                <CardTitle className="text-xl">Flashcards Thông Minh</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Sử dụng công nghệ lặp lại ngắt quãng (SRS) giúp bạn nhớ từ vựng mãi mãi.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-1 bg-slate-100 rounded-full relative overflow-hidden mt-4">
                  <div className="absolute inset-0 bg-blue-600 w-3/4" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="size-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Mic className="text-white size-6" />
                </div>
                <CardTitle className="text-xl">Luyện nói cùng AI</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Mô phỏng hội thoại thực tế, sửa lỗi phát âm và phản xạ tự nhiên như người bản xứ.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 items-center mt-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`h-4 w-1 bg-purple-600 rounded-full animate-bounce`} style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="size-12 bg-amber-500 rounded-xl flex items-center justify-center mb-4">
                  <Trophy className="text-white size-6" />
                </div>
                <CardTitle className="text-xl">Gamification</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Hệ thống bảng xếp hạng, huy hiệu và chuỗi ngày học để giữ lửa đam mê.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-4 text-amber-600 font-bold">
                  <Star className="size-5 fill-amber-500" />
                  <span>Cấp độ: Vàng III</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-12">
        <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© 2024 Lexi Team. Built with passion for learners.</p>
        </div>
      </footer>
    </div>
  );
}
