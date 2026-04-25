"use client";

import * as React from "react";
import Link from "next/link";
import {
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SessionScoreSummary } from "@/features/session/types/session.types";

interface ConversationSidebarProps {
  currentHint: string | null;
  onGetHint?: () => void;
  isAiStreaming?: boolean;
  disabled?: boolean;
  className?: string;
  sessionSummary?: SessionScoreSummary | null;
  isSessionCompleted?: boolean;
}

function getProgressColor(score: number) {
  if (score >= 85) return "bg-success-500";
  if (score >= 60) return "bg-warning-500";
  return "bg-destructive-500";
}

function SessionCompletionSummary({
  summary,
}: {
  summary: SessionScoreSummary | null;
}) {
  if (!summary) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
        Phiên đã nộp. Hệ thống đang tổng kết điểm, vui lòng thử tải lại sau ít
        giây.
      </div>
    );
  }

  const skills = [
    { label: "Lưu loát", value: summary.scoring.fluency_score || summary.scoring.fluency || 0 },
    { label: "Phát âm", value: summary.scoring.pronunciation_score || summary.scoring.pronunciation || 0 },
    { label: "Ngữ pháp", value: summary.scoring.grammar_score || summary.scoring.grammar || 0 },
    { label: "Từ vựng", value: summary.scoring.vocabulary_score || summary.scoring.vocabulary || 0 },
  ];

  return (
    <div className="space-y-3">
      <Card size="sm" className="border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold tracking-tight">
            Điểm tổng kết
          </CardTitle>
          <CardDescription>
            Kết quả sau khi kết thúc phiên hội thoại.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2">
            <span className="text-sm font-semibold text-muted-foreground">
              Tổng điểm
            </span>
            <span className="text-2xl font-black tracking-tight text-primary">
              {Math.round(summary.scoring.overall_score || summary.scoring.overall || 0)}
            </span>
          </div>

          <div className="space-y-3">
            {skills.map((skill) => (
              <div key={skill.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>{skill.label}</span>
                  <span>{Math.round(skill.value)}</span>
                </div>
                <Progress
                  value={skill.value}
                  className="h-1.5"
                  indicatorClassName={getProgressColor(skill.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Lượt nói: {summary.totalTurns}</Badge>
            <Badge variant="outline">Gợi ý: {summary.hintUsedCount}</Badge>
          </div>

          {summary.scoring.feedback && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {summary.scoring.feedback}
            </p>
          )}
        </CardContent>
      </Card>

      <Button asChild variant="outline" size="sm" className="w-full">
        <Link href="/session/new">Bắt đầu phiên mới</Link>
      </Button>
    </div>
  );
}

export function ConversationSidebar({
  currentHint,
  onGetHint,
  isAiStreaming,
  disabled,
  className,
  sessionSummary = null,
  isSessionCompleted = false,
}: ConversationSidebarProps) {
  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-accent/5 px-6 py-6 gap-6",
        className,
      )}
    >
      <div className="flex-1 flex flex-col gap-5 overflow-hidden">
        {isSessionCompleted ? (
          <>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-success-100 text-success-600">
                <CheckCircle2 className="size-4.5" />
              </div>
              <h3 className="text-sm font-bold tracking-tight">
                Tổng kết phiên
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
              <SessionCompletionSummary summary={sessionSummary} />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
                  <Lightbulb className="size-4.5" />
                </div>
                <h3 className="text-sm font-bold tracking-tight">
                  Phân tích & Gợi ý
                </h3>
              </div>
              <Button
                variant="soft-warning"
                size="sm"
                onClick={onGetHint}
                disabled={disabled || isAiStreaming}
                className="text-sm"
              >
                {currentHint ? "Gợi ý mới" : "Lấy gợi ý"}
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
              {isAiStreaming && !currentHint ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 animate-in fade-in duration-500">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-amber-200/50 animate-ping" />
                    <div className="relative size-12 rounded-full bg-amber-100 flex items-center justify-center">
                      <Lightbulb className="size-6 text-amber-600 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    AI đang phân tích...
                  </p>
                </div>
              ) : currentHint ? (
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-base/relaxed font-medium text-foreground tracking-tight">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => (
                          <span className="block mb-4 last:mb-0 leading-relaxed">
                            {children}
                          </span>
                        ),
                        code: ({ children }) => (
                          <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-sm font-bold text-foreground border border-border/50">
                            {children}
                          </code>
                        ),
                        pre: ({ children }) => (
                          <pre className="p-4 rounded-2xl bg-muted/50 border border-border/70 my-4 last:mb-0 whitespace-pre-wrap wrap-break-word text-foreground font-mono text-sm leading-relaxed">
                            {children}
                          </pre>
                        ),
                      }}
                    >
                      {currentHint}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center animate-in fade-in duration-700">
                  <p className="text-xs text-muted-foreground/40 font-medium tracking-tight">
                    AI đang chờ để phân tích...
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
