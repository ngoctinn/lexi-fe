import { Badge } from "@/components/ui/badge";
import { STEPS } from "../data";

export function LandingHowItWorks() {
  return (
    <section className="py-24 md:py-32 bg-muted/30" id="how-it-works">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center gap-4 text-center mb-16">
          <Badge variant="secondary">Cách hoạt động</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">3 bước để bắt đầu</h2>
          <p className="text-lg text-muted-foreground max-w-md">Đơn giản, nhanh chóng — sẵn sàng học ngay trong 5 phút.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map(({ step, title, description }, i) => (
            <div key={step} className="relative flex flex-col gap-5">
              {i < STEPS.length - 1 && (
                <div aria-hidden className="hidden md:block absolute top-6 left-1/2 w-full h-px bg-border" />
              )}
              <div className="relative z-10 flex flex-col gap-4 items-center md:items-start text-center md:text-left">
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
  );
}
