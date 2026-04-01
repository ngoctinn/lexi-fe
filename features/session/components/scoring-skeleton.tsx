"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function ScoringSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 animate-in fade-in duration-700">
      <div className="relative flex items-center justify-center mb-10">
        <div className="absolute inset-0 size-32 animate-ping rounded-full bg-primary/20 z-0" style={{ animationDuration: '3s' }} />
        <div className="flex size-32 flex-col items-center justify-center rounded-full bg-primary/5 border-4 border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.2)] backdrop-blur z-10">
          <Loader2 className="size-10 text-primary animate-spin" />
        </div>
      </div>
      
      <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3 text-center">
        AI đang phân tích buổi học...
      </h2>
      <p className="text-muted-foreground text-center mb-10 max-w-sm">
        Hệ thống đang chấm điểm lưu loát, phát âm, từ vựng và ngữ pháp của bạn dựa trên từng lượt phản hồi. Vui lòng đợi trong giây lát.
      </p>

      <div className="w-full max-w-2xl grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
           <div key={i} className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
             <div className="flex justify-between items-center">
               <Skeleton className="h-4 w-20" />
               <Skeleton className="size-10 rounded-full" />
             </div>
             <div className="space-y-1 mt-2">
               <Skeleton className="h-2 w-full" />
               <Skeleton className="h-2 w-2/3" />
             </div>
           </div>
        ))}
      </div>
      
       <div className="w-full max-w-2xl mt-4 rounded-xl border bg-muted/20 p-4">
          <div className="flex items-center gap-3">
             <Skeleton className="h-8 w-8 rounded-md" />
             <div className="space-y-2 flex-1">
                <Skeleton className="h-2.5 w-full" />
                <Skeleton className="h-2.5 w-[80%]" />
             </div>
          </div>
       </div>
    </div>
  );
}
