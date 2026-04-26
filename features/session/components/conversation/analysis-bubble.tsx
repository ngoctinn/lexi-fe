"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AnalysisBubbleProps {
  analysis: {
    turnIndex: number;
    markdown: {
      vi: string;
      en: string;
    };
  };
  onClose?: () => void;
  language?: "vi" | "en";
  onLanguageChange?: (language: "vi" | "en") => void;
}

export function AnalysisBubble({
  analysis,
  onClose,
  language = "vi",
  onLanguageChange,
}: AnalysisBubbleProps) {
  const content = language === "vi" ? analysis.markdown.vi : analysis.markdown.en;

  return (
    <div className="flex w-full items-start gap-3 px-4 py-2 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className={cn(
        "flex-1 rounded-2xl rounded-tl-sm px-4 py-3 text-base leading-relaxed shadow-sm",
        "bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/50"
      )}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
              Phân tích Turn #{analysis.turnIndex}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-action"
              onClick={() => onLanguageChange?.(language === "vi" ? "en" : "vi")}
              title={language === "vi" ? "Chuyển sang English" : "Chuyển sang Tiếng Việt"}
              className="text-xs font-semibold h-6 w-6"
            >
              <Globe className="h-3 w-3 mr-0.5" />
              {language.toUpperCase()}
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="icon-action"
                onClick={onClose}
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none text-amber-900 dark:text-amber-100 font-medium">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <span className="block mb-3 last:mb-0 leading-relaxed">
                  {children}
                </span>
              ),
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 rounded-md bg-amber-100/50 dark:bg-amber-900/50 font-mono text-sm font-bold border border-amber-200/50 dark:border-amber-700/50">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="p-3 rounded-lg bg-amber-100/30 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50 my-3 last:mb-0 whitespace-pre-wrap break-words text-amber-900 dark:text-amber-100 font-mono text-sm leading-relaxed">
                  {children}
                </pre>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 mb-3 last:mb-0">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 mb-3 last:mb-0">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-amber-900 dark:text-amber-100">
                  {children}
                </li>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
