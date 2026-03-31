"use client";

import { Brain, Target, Clock, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ProgressOverview() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Mastered Words */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground/80">Từ vựng đã thuộc</span>
            <div className="size-7 rounded-md bg-primary/10 flex items-center justify-center">
              <Brain className="text-primary size-3.5" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-foreground tracking-tight">1,248</span>
            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded text-[11px] font-bold">
              <TrendingUp className="size-3" />
              <span>24</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-muted-foreground/70 uppercase tracking-wider">Mục tiêu 2000</span>
              <span className="text-primary">62%</span>
            </div>
            {/* Monochromatic progress bar */}
            <div className="h-1.5 w-full bg-primary/15 rounded-full overflow-hidden">
               <div className="h-full bg-primary rounded-full transition-all" style={{ width: "62%" }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accuracy */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground/80">Độ chính xác</span>
            <div className="size-7 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <Target className="text-emerald-500 size-3.5" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-2">
             <span className="text-3xl font-black text-foreground tracking-tight">94%</span>
             <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded text-[11px] font-bold">
               <TrendingUp className="size-3" />
               <span>2%</span>
             </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-1">
             <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-muted-foreground/70 uppercase tracking-wider">Hiệu suất</span>
                <span className="text-emerald-600">Tuyệt vời</span>
             </div>
             {/* Monochromatic progress bar */}
             <div className="h-1.5 w-full bg-emerald-500/15 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: "94%" }} />
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Time */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-muted-foreground/80">Thời gian học tập</span>
            <div className="size-7 rounded-md bg-blue-500/10 flex items-center justify-center">
              <Clock className="text-blue-500 size-3.5" />
            </div>
          </div>
          
          <div className="flex items-baseline gap-2">
             <span className="text-3xl font-black text-foreground tracking-tight">12.5 <span className="text-sm font-bold text-muted-foreground/70">giờ</span></span>
             <div className="flex items-center gap-1 bg-rose-500/10 text-rose-700 px-1.5 py-0.5 rounded text-[11px] font-bold">
               <TrendingDown className="size-3" />
               <span>1.2h</span>
             </div>
          </div>

          <div className="flex flex-col gap-1.5 mt-1 justify-end h-full">
             <div className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                Trung bình 45 phút / ngày
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Action */}
      <Card className="bg-primary/5 border-primary/20 shadow-none hover:bg-primary/10 transition-colors cursor-pointer group">
         <CardContent className="p-5 flex flex-col items-center justify-center text-center h-full gap-2">
            <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform">
               <Zap className="text-primary size-5 fill-primary/20" />
            </div>
            <div>
               <h3 className="font-bold text-foreground text-sm">Luyện tập ngay</h3>
               <p className="text-[11px] font-medium text-muted-foreground mt-0.5">20 từ cần ôn tập</p>
            </div>
         </CardContent>
      </Card>
    </div>
  );
}
