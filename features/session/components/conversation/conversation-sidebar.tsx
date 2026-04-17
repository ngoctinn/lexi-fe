"use client";

import * as React from "react";
import { Lightbulb, Copy, Check, Target, Info, UserCircle, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia
} from "@/components/ui/empty";

interface ConversationSidebarProps {
  currentHint: string | null;
  onGetHint?: () => void;
  onSelectHint?: (hint: string) => void;
  isAiStreaming?: boolean;
  disabled?: boolean;
  className?: string;
  scenarioGoals?: string[];
  context?: string;
  myRole?: string;
  partnerRole?: string;
}

export function ConversationSidebar({
  currentHint,
  onGetHint,
  onSelectHint,
  isAiStreaming,
  disabled,
  className,
  scenarioGoals = [],
  context,
  myRole,
  partnerRole,
}: ConversationSidebarProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (currentHint) {
      // Intelligent copy: if there's exactly one code block, copy just its content
      const codeBlockMatch = currentHint.match(/```(?:[a-z]*)\n?([\s\S]*?)\n?```/);
      const textToCopy = codeBlockMatch ? codeBlockMatch[1].trim() : currentHint;

      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(codeBlockMatch ? "Đã chép nội dung code" : "Đã sao chép gợi ý");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <aside className={cn("flex flex-col h-full bg-accent/5 px-6 py-6 gap-6", className)}>

      {/* Session Context Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
            <Info className="size-4.5" />
          </div>
          <h3 className="text-sm font-bold tracking-tight">Bối cảnh & Vai trò</h3>
        </div>

        <div className="flex flex-col gap-3 px-1">
          <div className="flex flex-wrap items-center gap-2 px-1">
            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50 pr-3 py-1 gap-1.5 shadow-none">
              <UserCircle className="size-3.5 opacity-70" />
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Bạn:</span>
              <span className="text-[12px] font-bold">{myRole || "Học viên"}</span>
            </Badge>

            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-50 pr-3 py-1 gap-1.5 shadow-none">
              <Bot className="size-3.5 opacity-70" />
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Đối phương:</span>
              <span className="text-[12px] font-bold">{partnerRole || "AI Assistant"}</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="h-px bg-border/40" />

      {/* Practice Goals Section */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
            <Target className="size-4.5" />
          </div>
          <h3 className="text-sm font-bold tracking-tight">Mục tiêu bài luyện</h3>
        </div>

        <div className="flex flex-wrap gap-2 px-1">
          {scenarioGoals.length > 0 ? (
            scenarioGoals.map((goal, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="bg-primary-50 text-primary border-primary-100 hover:bg-primary-100 font-bold text-[11px] px-2.5 py-1.5 shadow-none"
              >
                {goal}
              </Badge>
            ))
          ) : (
            <p className="text-[11px] text-muted-foreground italic col-span-2">Cùng bắt đầu hội thoại nào!</p>
          )}
        </div>
      </div>

      <div className="h-px bg-border/40" />

      {/* Hint Section */}
      <div className="flex-1 flex flex-col gap-5 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <Lightbulb className="size-4.5" />
            </div>
            <h3 className="text-sm font-bold tracking-tight">Phân tích & Gợi ý</h3>
          </div>
          <Button
            variant="soft-warning"
            size="sm"
            onClick={onGetHint}
            disabled={disabled || isAiStreaming || !!currentHint}
            className="h-8 text-[11px] font-bold"
          >
            Lấy gợi ý
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 -mx-1 px-1">
          {currentHint ? (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex flex-col gap-4">
                <div className="prose prose-sm dark:prose-invert max-w-none text-[16px]/relaxed font-medium text-foreground tracking-tight">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <span className="block mb-4 last:mb-0 leading-relaxed">{children}</span>,
                      code: ({ children }) => (
                        <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-[13px] font-bold text-foreground border border-border/50">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="p-4 rounded-2xl bg-muted/50 border border-border/70 my-4 last:mb-0 whitespace-pre-wrap break-words text-foreground font-mono text-[14px] leading-relaxed">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {currentHint}
                  </ReactMarkdown>
                </div>

                <div className="flex items-center pt-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="h-7 text-[10px] font-bold text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors"
                    onClick={handleCopy}
                  >
                    {copied ? "Đã sao chép" : "Sao chép gợi ý"}
                  </Button>
                </div>
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
      </div>
    </aside>
  );
}
