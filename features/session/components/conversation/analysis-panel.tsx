"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import { X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface AnalysisPanelProps {
  analysis: {
    turnIndex: number;
    markdown: {
      vi: string;
      en: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  language?: "vi" | "en";
  onLanguageChange?: (language: "vi" | "en") => void;
}

export function AnalysisPanel({
  analysis,
  isOpen,
  onClose,
  language = "vi",
  onLanguageChange,
}: AnalysisPanelProps) {
  if (!isOpen || !analysis) {
    return null;
  }

  const content = language === "vi" ? analysis.markdown.vi : analysis.markdown.en;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            Phân tích Turn #{analysis.turnIndex}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-action"
              onClick={() => onLanguageChange?.(language === "vi" ? "en" : "vi")}
              title={language === "vi" ? "Chuyển sang English" : "Chuyển sang Tiếng Việt"}
              className="text-xs font-semibold"
            >
              <Globe className="h-3.5 w-3.5 mr-1" />
              {language.toUpperCase()}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </ScrollArea>

        {/* Footer */}
        <Separator />
        <div className="p-4 flex justify-end">
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
}
