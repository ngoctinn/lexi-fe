"use client";

import { Flame, Star, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardHeroProps {
  user: {
    name: string;
    streak: number;
    points: number;
  };
}

export function DashboardHero({ user }: DashboardHeroProps) {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-primary px-8 py-12 md:py-16 text-primary-foreground shadow-2xl">
      {/* Decorative background gradients */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-primary-foreground/5 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-primary-foreground/5 blur-3xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 border-none px-3 py-1">
            <Trophy data-icon="inline-start" className="text-yellow-400" />
            Học viên năng nổ
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
            Chào mừng trở lại,<br />
            <span className="text-primary-foreground/90">{user.name}!</span>
          </h1>
          <p className="text-primary-foreground/80 max-w-md text-lg">
            Sẵn sàng để tiếp tục hành trình chinh phục tiếng Anh của bạn hôm nay chưa?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Card className="bg-card text-card-foreground border-none shadow-flashcard px-6 py-4 flex items-center gap-4 rounded-2xl min-w-[200px]">
             <div className="size-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
               <Flame className="text-orange-500" />
             </div>
             <div className="flex flex-col">
               <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Chuỗi ngày</p>
               <p className="text-2xl font-black text-foreground">{user.streak} <span className="text-sm font-medium text-muted-foreground normal-case">ngày</span></p>
             </div>
          </Card>

          <Card className="bg-card text-card-foreground border-none shadow-flashcard px-6 py-4 flex items-center gap-4 rounded-2xl min-w-[200px]">
             <div className="size-12 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
               <Star className="text-yellow-500 fill-yellow-500" />
             </div>
             <div className="flex flex-col">
               <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Tổng điểm</p>
               <p className="text-2xl font-black text-foreground">{user.points} <span className="text-sm font-medium text-muted-foreground normal-case">XP</span></p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
