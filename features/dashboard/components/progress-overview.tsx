"use client";

import { Brain, Target, Clock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function ProgressOverview() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Mastered Words */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Từ vựng đã thuộc</CardTitle>
          <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="text-primary size-4" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <div className="text-3xl font-black text-foreground">1,248</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-emerald-500 font-medium">+24</span> so với tuần trước
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-muted-foreground">Mục tiêu 2000 từ</span>
              <span className="text-primary">62%</span>
            </div>
            <Progress value={62} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Accuracy */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Độ chính xác</CardTitle>
          <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Target className="text-emerald-500 size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
             <div className="text-3xl font-black text-foreground">94</div>
             <div className="text-lg font-bold text-muted-foreground">%</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="text-emerald-500 font-medium">+2%</span> so với tuần trước
          </p>
          <div className="mt-4 flex items-center gap-2">
             <div className="flex-1 h-2 rounded-full bg-emerald-500/20 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "94%" }} />
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Time */}
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Thời gian học tập</CardTitle>
          <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Clock className="text-blue-500 size-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
             <div className="text-3xl font-black text-foreground">12.5</div>
             <div className="text-sm font-bold text-muted-foreground">giờ</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Trung bình 45 phút / ngày
          </p>
        </CardContent>
      </Card>
      
      {/* Quick Action */}
      <Card className="bg-primary/5 border-primary/20 shadow-none hover:bg-primary/10 transition-colors cursor-pointer flex flex-col items-center justify-center text-center p-6 group">
         <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-active:scale-95 transition-transform">
            <Zap className="text-primary size-6 fill-primary/20" />
         </div>
         <h3 className="font-bold text-lg text-primary">Luyện tập ngay</h3>
         <p className="text-sm text-muted-foreground mt-1">20 từ vựng cần ôn tập</p>
      </Card>
    </div>
  );
}
