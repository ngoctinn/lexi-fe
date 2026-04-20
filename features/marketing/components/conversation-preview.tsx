import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircleMore,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function LandingConversationPreview() {
  return (
    <section
      className="relative overflow-hidden py-24 md:py-32 bg-muted/25"
      id="preview"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-0 size-96 rounded-full bg-primary-100 blur-3xl"
      />
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center">
          <div className="flex flex-col gap-6">
            <Badge variant="default" shape="pill">
              Trải nghiệm thật
            </Badge>

            <div className="flex flex-col gap-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.08] tracking-tight">
                <span className="text-primary">Học bằng hội thoại</span>{" "}
                <span className="text-primary-800">
                  không chỉ bằng danh sách tính năng.
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Lexi dẫn bạn qua một luồng học ngắn gọn: vào tình huống, trả
                lời, nhận phản hồi và tiếp tục ngay trong cùng một nhịp.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                "Ngữ cảnh rõ ràng, dễ bắt nhịp ngay từ đầu",
                "Phản hồi tức thì sau mỗi lượt nói",
                "Tiến độ được lưu lại để học tiếp không bị đứt mạch",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm"
                >
                  <CheckCircle2 className="size-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild>
                <Link href="/learn">
                  Dùng thử luồng học <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how-it-works">Xem quy trình</a>
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border-border/70 shadow-xl shadow-primary-50">
            <CardHeader className="border-b bg-muted/40 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <CardTitle className="text-base">Mẫu hội thoại AI</CardTitle>
                <Badge
                  variant="secondary"
                  shape="pill"
                >
                  <Sparkles className="size-3.5" />
                  Phản hồi tức thì
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="grid gap-5 p-5 md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                  Bạn
                </div>
                <div className="max-w-[80%] rounded-3xl rounded-tl-md bg-muted px-4 py-3 text-sm leading-relaxed text-foreground shadow-sm">
                  Mình sắp đi công tác ở Hà Nội, có thể giúp mình luyện cách hỏi
                  đường và đặt phòng khách sạn không?
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[82%] rounded-3xl rounded-tr-md bg-primary-500 px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-lg shadow-primary-200">
                  Được chứ. Mình sẽ đưa bạn vào tình huống thực tế, gợi ý câu
                  trả lời tự nhiên và sửa ngay sau mỗi lượt nói.
                </div>
              </div>

              <div className="rounded-3xl border bg-background px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <MessageCircleMore className="size-4 text-primary" />
                  Phản hồi sau lượt nói
                </div>
                <Separator className="my-3" />
                <div className="grid gap-3 sm:grid-cols-3">
                  {["Pronunciation", "Grammar", "Vocabulary"].map((label) => (
                    <div
                      key={label}
                      className="rounded-2xl bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
