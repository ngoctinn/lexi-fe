"use client";

import * as React from "react";
import { Flame, Star } from "lucide-react";

interface DashboardHeroProps {
  user: {
    name: string;
    streak: number;
    points: number;
  };
}

export function DashboardHero({ user }: DashboardHeroProps) {
  // Use lazy initialization to compute date once
  const [currentDate] = React.useState(() => {
    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());
  });

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-muted-foreground capitalize">{currentDate}</p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Chào mừng trở lại, {user.name}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-orange-500/10">
            <Flame className="size-4 text-orange-500" />
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Chuỗi học</span>
             <span className="text-lg font-bold leading-none">{user.streak}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-yellow-500/10">
            <Star className="size-4 text-yellow-500 fill-yellow-500" />
          </div>
          <div className="flex flex-col">
             <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tổng điểm</span>
             <span className="text-lg font-bold leading-none">{user.points}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
