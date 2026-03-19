import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FEATURES } from "../data";

export function LandingFeatures() {
  return (
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
          {FEATURES.map(({ icon: Icon, bg, color, title, description }) => (
            <Card key={title} className="group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 border-border/60">
              <CardHeader className="pb-3">
                <div className={`size-11 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={color} style={{ width: 20, height: 20 }} />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
