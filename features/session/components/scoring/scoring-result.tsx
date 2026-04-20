"use client";

import {
  CheckCircle2,
  MessageCircle,
  Lightbulb,
  BookOpen,
  ListChecks,
} from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Session } from "@/features/session/types/session.types";
import { ScoringSkill } from "@/features/session/types/session.types";
import { cn } from "@/lib/utils";

interface ScoringResultProps {
  session: Session;
}

export function ScoringResult({ session }: ScoringResultProps) {
  const scoring = session.scoring;
  if (!scoring) return null;

  const turns = session.turns ?? [];
  const totalTurns = session.total_turns || turns.length;

  const skills = [
    {
      key: ScoringSkill.FLUENCY,
      label: "Độ lưu loát",
      score: scoring[ScoringSkill.FLUENCY],
      icon: MessageCircle,
    },
    {
      key: ScoringSkill.PRONUNCIATION,
      label: "Phát âm",
      score: scoring[ScoringSkill.PRONUNCIATION],
      icon: CheckCircle2,
    },
    {
      key: ScoringSkill.GRAMMAR,
      label: "Ngữ pháp",
      score: scoring[ScoringSkill.GRAMMAR],
      icon: ListChecks,
    },
    {
      key: ScoringSkill.VOCABULARY,
      label: "Từ vựng",
      score: scoring[ScoringSkill.VOCABULARY],
      icon: BookOpen,
    },
  ];

  const getScoreColor = (sc: number) => {
    if (sc >= 85) return "text-success-600";
    if (sc >= 60) return "text-warning-600";
    return "text-destructive-600";
  };

  const getProgressColor = (sc: number) => {
    if (sc >= 85) return "bg-success-500";
    if (sc >= 60) return "bg-warning-500";
    return "bg-destructive-500";
  };

  return (
    <div className="flex w-full flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col items-center justify-center text-center pb-6">
        <Badge variant="soft" className="mb-4 px-3 py-1 text-xs font-bold uppercase">
          Báo cáo phiên học
        </Badge>
        
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 size-44 animate-[spin_12s_linear_infinite] rounded-full border-2 border-dashed border-primary/20 -z-10" />
          <div className="flex size-40 flex-col items-center justify-center rounded-full bg-background border-4 border-primary/10 shadow-2xl">
            <span className="text-2xs font-bold tracking-widest text-muted-foreground uppercase opacity-80 mb-1">
              Tổng điểm
            </span>
            <span className={cn("text-6xl font-black tracking-tighter", getScoreColor(scoring.overall))}>
              {Math.round(scoring.overall)}
            </span>
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold max-w-lg leading-tight">
          Hoàn thành tốt! AI đánh giá bạn đạt {Math.round(scoring.overall)}/100 điểm.
        </h2>
        {scoring.feedback && (
          <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
            {scoring.feedback}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {skills.map((skill) => (
          <Card key={skill.key} className="overflow-hidden border-border/50 hover:border-border/80 transition-all shadow-sm">
            <CardHeader className="p-5 pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-muted/50">
                  <skill.icon className="size-5 text-muted-foreground" />
                </div>
                <span className={cn("text-2xl font-black font-mono tracking-tighter", getScoreColor(skill.score))}>
                  {Math.round(skill.score)}
                </span>
              </div>
              <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                {skill.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Progress
                value={skill.score}
                className="h-2 w-full bg-muted mt-2"
                indicatorClassName={getProgressColor(skill.score)}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col items-center p-6 bg-muted/30 border-none shadow-none">
          <span className="text-4xl font-black text-foreground">{totalTurns}</span>
          <span className="text-xs-plus text-muted-foreground font-bold uppercase tracking-wider mt-1">
            Lượt nói
          </span>
        </Card>

        <Card className="flex flex-col items-center p-6 bg-warning-50/50 border-none shadow-none">
          <span className="text-4xl font-black text-warning-600">
            {session.hint_used_count || 0}
          </span>
          <span className="text-xs-plus text-warning-600/70 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-1">
            <Lightbulb className="size-3.5" />
            Gợi ý
          </span>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:items-center mt-10">
        <Button variant="outline" size="xl" className="w-full sm:w-48 font-bold" asChild>
          <Link href="/dashboard">Về tổng quan</Link>
        </Button>
        <Button size="xl" className="w-full sm:w-48 font-bold" asChild>
          <Link href="/session/new">Luyện bài khác</Link>
        </Button>
      </div>
    </div>
  );
}
