"use client";

import { CheckCircle2, MessageCircle, Lightbulb, BookOpen, ListChecks } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Session } from "@/features/session/types/session.types";
import { ScoringSkill, TurnSpeaker } from "@/features/session/types/session.types";
import { cn } from "@/lib/utils";

interface ScoringResultProps {
  session: Session;
}

export function ScoringResult({ session }: ScoringResultProps) {
  const scoring = session.scoring;
  const turns = session.turns ?? [];
  const userTurns = turns.filter((t) => t.speaker === TurnSpeaker.USER);
  const totalTurns = userTurns.length;

  if (!scoring) return null;

  const skills = [
    { key: ScoringSkill.FLUENCY, label: "Độ lưu loát", score: scoring[ScoringSkill.FLUENCY], icon: MessageCircle },
    { key: ScoringSkill.PRONUNCIATION, label: "Phát âm", score: scoring[ScoringSkill.PRONUNCIATION], icon: CheckCircle2 },
    { key: ScoringSkill.GRAMMAR, label: "Ngữ pháp", score: scoring[ScoringSkill.GRAMMAR], icon: ListChecks },
    { key: ScoringSkill.VOCABULARY, label: "Từ vựng", score: scoring[ScoringSkill.VOCABULARY], icon: BookOpen },
  ];

  const getScoreColorClass = (sc: number) => {
    if (sc >= 85) return "text-success-dark";
    if (sc >= 60) return "text-warning-dark";
    return "text-destructive-dark";
  };
  
  const getProgressColorClass = (sc: number) => {
    if (sc >= 85) return "bg-success";
    if (sc >= 60) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="flex flex-col gap-8 mx-auto w-full max-w-4xl px-4 py-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Header Overall */}
      <div className="flex flex-col items-center justify-center text-center pb-6">
        <Badge variant="outline" className="mb-4 text-xs font-semibold py-1">
          BÁO CÁO PHIÊN HỌC
        </Badge>
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 size-40 animate-[spin_10s_linear_infinite] rounded-full border-t-2 border-r-2 border-primary/40 -z-10" />
          <div className="flex size-40 flex-col items-center justify-center rounded-full bg-background border shadow-xl">
             <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase opacity-80 mb-1">
               Tổng kết
             </span>
             <span className={cn("text-6xl font-black tracking-tighter drop-shadow-sm", getScoreColorClass(scoring.overall))}>
               {Math.round(scoring.overall)}
             </span>
          </div>
        </div>
        
        <h2 className="text-xl md:text-3xl font-bold max-w-lg leading-tight">
          Hoàn thành tốt! AI đánh giá bạn đạt {Math.round(scoring.overall)}/100 điểm.
        </h2>
        {scoring.feedback && (
          <p className="mt-4 max-w-xl text-muted-foreground">
            {scoring.feedback}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {skills.map((skill) => (
          <Card key={skill.key} className="flex flex-col border-border/60 hover:border-border transition-colors shadow-sm">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <skill.icon className="text-muted-foreground" />
                <span className={cn("text-xl font-bold font-mono tracking-tighter", getScoreColorClass(skill.score))}>
                  {Math.round(skill.score)}
                </span>
              </div>
              <CardTitle className="text-base font-semibold">{skill.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
               <Progress 
                value={skill.score} 
                className={cn("h-2 w-full bg-muted", `[&>[data-slot=progress-indicator]]:${getProgressColorClass(skill.score)}`)} 
               />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats row using standard components */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center p-4 bg-muted/30">
          <span className="text-3xl font-black">{totalTurns}</span>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Lượt nói</span>
        </Card>
        
        <Card className="flex flex-col items-center p-4 bg-warning/5 border-warning/20">
          <span className="text-3xl font-bold text-warning-dark">{session.hint_used_count || 0}</span>
          <span className="text-xs text-warning-dark/70 font-medium uppercase tracking-wider flex items-center gap-1">
            <Lightbulb />
            Gợi ý
          </span>
        </Card>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
        <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-40" asChild>
          <Link href="/sessions">Lịch sử</Link>
        </Button>
        <Button size="lg" className="w-full sm:w-auto min-w-40" asChild>
          <Link href="/session/new">Luyện bài khác</Link>
        </Button>
      </div>
    </div>
  );
}
