import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TESTIMONIALS } from "../data";

export function LandingTestimonials() {
  return (
    <section className="py-24 md:py-32" id="testimonials">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-4 text-center mb-16">
          <Badge variant="secondary">Đánh giá từ học viên</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Học viên nói gì về Lexi?</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, content, rating }) => (
            <Card key={name} className="border-border/60">
              <CardHeader className="pb-3">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="text-primary fill-primary" style={{ width: 16, height: 16 }} />
                  ))}
                </div>
                <CardDescription className="text-base text-foreground/80 leading-relaxed">&ldquo;{content}&rdquo;</CardDescription>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">{name.charAt(0)}</span>
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
  );
}
