"use client";

import * as React from "react";
import Link from "next/link";
import {
  Lightbulb,
  CheckCircle2,
  Globe,
  X,
  Loader2,
  Sparkles,
  User,
  Bot,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
import { useSessionStore } from "@/features/session/stores/use-session-store";

interface ConversationSidebarProps {
  currentHint: {
    level: string;
    type: string;
    markdown: {
      vi: string;
      en: string;
    };
  } | null;
  hintHistory: Array<{
    timestamp: number;
    markdown: {
      vi: string;
      en: string;
    };
  }>;
  tempAnalysis?: {
    turnIndex: number;
    markdown: {
      vi: string;
      en: string;
    };
  } | null;
  analysisHistory: Array<{
    turnIndex: number;
    timestamp: number;
    markdown: {
      vi: string;
      en: string;
    };
  }>;
  onGetHint?: () => void;
  onLanguageChange?: (language: "vi" | "en") => void;
  isAiStreaming?: boolean;
  isRequestingHint?: boolean;
  isAnalyzing?: boolean;
  disabled?: boolean;
  className?: string;
  sessionSummary?: SessionScoreSummary | null;
  isSessionCompleted?: boolean;
  language?: "vi" | "en";
  myRole?: string;
  partnerRole?: string;
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
  hintHistory,
  tempAnalysis,
  analysisHistory,
  onGetHint,
  onLanguageChange,
  isAiStreaming,
  isRequestingHint = false,
  isAnalyzing = false,
  disabled,
  className,
  sessionSummary = null,
  isSessionCompleted = false,
  language = "vi",
  myRole,
  partnerRole,
}: ConversationSidebarProps) {
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new hint or analysis is added
  React.useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
  }, [hintHistory.length, analysisHistory.length]);

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
                {/* User Role Badge */}
                <Badge variant="default" size="sm" className="gap-1.5 h-8 px-3">
                  <User className="size-3.5" />
                  <span>{myRole || "Học viên"}</span>
                </Badge>
                
                {/* AI Role Badge */}
                <Badge variant="info" size="sm" className="gap-1.5 h-8 px-3">
                  <Bot className="size-3.5" />
                  <span>{partnerRole || "AI Assistant"}</span>
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onLanguageChange?.(language === "vi" ? "en" : "vi")}
                  title={language === "vi" ? "Chuyển sang English" : "Chuyển sang Tiếng Việt"}
                  className="text-xs font-semibold"
                >
                  <Globe className="size-3.5 mr-1" />
                  {language.toUpperCase()}
                </Button>
                <Button
                  variant="soft-warning"
                  size="sm"
                  onClick={onGetHint}
                  disabled={disabled || isAiStreaming}
                  className="text-sm"
                >
                  {isAiStreaming ? (
                    <>
                      <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : currentHint ? (
                    "Gợi ý mới"
                  ) : (
                    "Lấy gợi ý"
                  )}
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1 space-y-3" ref={scrollAreaRef}>
              {/* Skeleton loading for HINT when requesting */}
              {isRequestingHint && hintHistory.length === 0 && (
                <Alert 
                  variant="default"
                  className="bg-amber-50/50 border-amber-200/50 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-20 bg-amber-200/30 rounded animate-pulse" />
                      <Loader2 className="h-3 w-3 text-amber-600 animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-amber-200/30 rounded animate-pulse w-full" />
                      <div className="h-4 bg-amber-200/30 rounded animate-pulse w-5/6" />
                      <div className="h-4 bg-amber-200/30 rounded animate-pulse w-4/6" />
                    </div>
                  </div>
                </Alert>
              )}

              {/* Skeleton loading for ANALYST when analyzing */}
              {isAnalyzing && analysisHistory.length === 0 && (
                <Alert 
                  variant="default"
                  className="bg-sky-50/50 border-sky-200/50 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-24 bg-sky-200/30 rounded animate-pulse" />
                      <Loader2 className="h-3 w-3 text-sky-600 animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-sky-200/30 rounded animate-pulse w-full" />
                      <div className="h-4 bg-sky-200/30 rounded animate-pulse w-5/6" />
                      <div className="h-4 bg-sky-200/30 rounded animate-pulse w-4/6" />
                    </div>
                  </div>
                </Alert>
              )}

              {/* History items (sorted by timestamp, newest first) */}
              {[
                ...analysisHistory.map(a => ({ type: 'analysis' as const, ...a })),
                ...hintHistory.map(h => ({ type: 'hint' as const, ...h })),
              ]
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((item) => {
                  if (item.type === 'analysis') {
                    return (
                      <Alert 
                        key={`analysis-${item.timestamp}`}
                        variant="info"
                        className="bg-sky-50/80 dark:bg-sky-950/30 border-sky-200/50 dark:border-sky-800/50 animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className="bg-sky-200/60 dark:bg-sky-800/60 text-sky-700 dark:text-sky-200 text-xs font-bold">
                                <Sparkles className="h-3 w-3 mr-1" />
                                Analyst
                              </Badge>
                              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                                Turn #{item.turnIndex}
                              </span>
                            </div>
                            <AlertDescription className="flex-1 text-base font-medium text-sky-900 dark:text-sky-100">
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ children }) => (
                                      <span className="block mb-2 last:mb-0 leading-relaxed text-base">
                                        {children}
                                      </span>
                                    ),
                                    code: ({ children }) => (
                                      <code className="px-1.5 py-0.5 rounded-md bg-sky-100/50 dark:bg-sky-900/50 font-mono text-sm font-bold border border-sky-200/50 dark:border-sky-700/50">
                                        {children}
                                      </code>
                                    ),
                                    pre: ({ children }) => (
                                      <pre className="p-2 rounded-lg bg-sky-100/30 dark:bg-sky-900/30 border border-sky-200/50 dark:border-sky-700/50 my-2 last:mb-0 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
                                        {children}
                                      </pre>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc list-inside space-y-1 mb-2 last:mb-0">
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-decimal list-inside space-y-1 mb-2 last:mb-0">
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children }) => (
                                      <li className="text-base">
                                        {children}
                                      </li>
                                    ),
                                  }}
                                >
                                  {language === "vi" ? item.markdown.vi : item.markdown.en}
                                </ReactMarkdown>
                              </div>
                            </AlertDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              useSessionStore.getState().removeAnalysisFromHistory(item.timestamp);
                            }}
                            className="h-6 w-6 p-0 shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </Alert>
                    );
                  } else {
                    return (
                      <Alert 
                        key={`hint-${item.timestamp}`}
                        variant="warning" 
                        className="bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/50 animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="secondary" className="bg-amber-200/60 dark:bg-amber-800/60 text-amber-700 dark:text-amber-200 text-xs font-bold">
                                <Lightbulb className="h-3 w-3 mr-1" />
                                Hint
                              </Badge>
                            </div>
                            <AlertDescription className="text-base font-medium text-amber-900 dark:text-amber-100">
                              <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ children }) => (
                                      <span className="block mb-2 last:mb-0 leading-relaxed text-base">
                                        {children}
                                      </span>
                                    ),
                                    code: ({ children }) => (
                                      <code className="px-1.5 py-0.5 rounded-md bg-amber-100/50 dark:bg-amber-900/50 font-mono text-sm font-bold border border-amber-200/50 dark:border-amber-700/50">
                                        {children}
                                      </code>
                                    ),
                                    pre: ({ children }) => (
                                      <pre className="p-2 rounded-lg bg-amber-100/30 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50 my-2 last:mb-0 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
                                        {children}
                                      </pre>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc list-inside space-y-1 mb-2 last:mb-0">
                                        {children}
                                      </ul>
                                    ),
                                    ol: ({ children }) => (
                                      <ol className="list-decimal list-inside space-y-1 mb-2 last:mb-0">
                                        {children}
                                      </ol>
                                    ),
                                    li: ({ children }) => (
                                      <li className="text-base">
                                        {children}
                                      </li>
                                    ),
                                  }}
                                >
                                  {language === "vi" ? item.markdown.vi : item.markdown.en}
                                </ReactMarkdown>
                              </div>
                            </AlertDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              useSessionStore.getState().removeHintFromHistory(item.timestamp);
                            }}
                            className="h-6 w-6 p-0 shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </Alert>
                    );
                  }
                })}

              {/* Empty state when AI is streaming */}
              {hintHistory.length === 0 && analysisHistory.length === 0 && isAiStreaming && (
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
              )}

              {/* Empty state when idle */}
              {hintHistory.length === 0 && analysisHistory.length === 0 && !isAiStreaming && (
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
