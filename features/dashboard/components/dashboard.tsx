"use client";

import { DashboardHero } from "./dashboard-hero";
import { ProgressOverview } from "./progress-overview";
import { RecentActivity } from "./recent-activity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// Mock user data for now
const user = {
  name: "Ngọc Tín",
  email: "ngoctin@example.com",
  avatar: "/avatars/user.jpg",
  streak: 14,
  points: 1250,
};

export function Dashboard() {
  return (
    <div className="flex-1 flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-700 overflow-y-auto">
      <DashboardHero user={user} />

      <div className="flex flex-col gap-2 mt-4">
        <h2 className="text-xl font-bold tracking-tight">Tổng quan học tập</h2>
        <p className="text-sm text-muted-foreground">Theo dõi tiến độ và mục tiêu của bạn.</p>
      </div>

      <ProgressOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <RecentActivity />

        {/* Weekly Goal Side Card */}
        <div className="col-span-1">
          <Card className="h-full bg-gradient-to-br from-card to-muted/20 border-border">
            <CardHeader>
              <CardTitle>Mục tiêu tuần</CardTitle>
              <CardDescription>Hoàn thành 50 từ vựng và 3 bài học ngữ pháp.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center gap-6 pt-4 pb-8">
               <div className="relative size-32">
                 {/* Decorative background circle */}
                 <svg className="size-full -rotate-90 transform" viewBox="0 0 100 100">
                   <circle
                     className="text-muted/30 stroke-current"
                     strokeWidth="8"
                     cx="50"
                     cy="50"
                     r="40"
                     fill="transparent"
                   />
                   {/* Progress circle */}
                   <circle
                     className="text-primary stroke-current"
                     strokeWidth="8"
                     strokeLinecap="round"
                     cx="50"
                     cy="50"
                     r="40"
                     fill="transparent"
                     strokeDasharray="251.2"
                     strokeDashoffset={251.2 - (251.2 * 75) / 100} // 75% complete
                   />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <span className="text-3xl font-black text-primary">75%</span>
                 </div>
               </div>

               <div className="flex flex-col gap-1 w-full text-left">
                  <div className="flex justify-between text-sm font-medium">
                     <span>Từ vựng: 40/50</span>
                     <span className="text-primary">80%</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                     <span>Ngữ pháp: 2/3</span>
                     <span className="text-primary">66%</span>
                  </div>
               </div>

               <Button className="w-full mt-2 rounded-xl group" variant="default">
                 Tiếp tục học <ArrowRight data-icon="inline-end" className="group-hover:translate-x-1 transition-transform" />
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
