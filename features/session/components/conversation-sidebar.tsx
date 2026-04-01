"use client";

import * as React from "react";
import { Lightbulb, FastForward, Square, History, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Alert, 
  AlertTitle, 
  AlertDescription 
} from "@/components/ui/alert";
import { 
  Empty, 
  EmptyHeader, 
  EmptyTitle, 
  EmptyDescription, 
  EmptyMedia 
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationSidebarProps {
  currentHint: string | null;
  onSkip?: () => void;
  onEnd?: () => void;
  onGetHint?: () => void;
  isAiStreaming?: boolean;
  disabled?: boolean;
  className?: string;
}

export function ConversationSidebar({
  currentHint,
  onSkip,
  onEnd,
  onGetHint,
  isAiStreaming,
  disabled,
  className,
}: ConversationSidebarProps) {
  return (
    <aside className={cn("flex flex-col gap-4 w-[320px] max-w-full border-l bg-muted/20 px-6 py-8", className)}>
      
      {/* Hint Section */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-semibold text-sm">
            <Lightbulb />
            <span>Gợi ý trả lời</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onGetHint} 
            disabled={disabled || isAiStreaming || !!currentHint}
            className="text-[10px] uppercase font-bold tracking-widest h-6"
          >
            Lấy gợi ý
          </Button>
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
          {currentHint ? (
            <Alert variant="info" className="animate-in zoom-in-95 fade-in duration-300">
               <AlertTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                  <Lightbulb className="size-4" />
                  Gợi ý
               </AlertTitle>
               <AlertDescription className="text-sm/relaxed font-medium italic">
                 "{currentHint}"
               </AlertDescription>
               <div className="mt-4 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                 Bạn có thể gõ hoặc nói theo cấu trúc này.
               </div>
            </Alert>
          ) : (
            <Empty className="py-12 border-dashed border-2">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Lightbulb />
                </EmptyMedia>
                <EmptyTitle>Chưa có gợi ý</EmptyTitle>
                <EmptyDescription>
                  Bấm "Lấy gợi ý" nếu bạn gặp khó khăn trong việc phản hồi.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </ScrollArea>
      </div>

      <Separator />

      {/* Actions Section */}
      <div className="flex flex-col gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={onSkip}
          disabled={disabled || isAiStreaming}
          className="w-full justify-start rounded-xl font-medium"
        >
          <FastForward data-icon="inline-start" />
          Bỏ qua lượt này
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="secondary"
              size="lg"
              disabled={disabled || isAiStreaming}
              className="w-full justify-start rounded-xl font-medium"
            >
              <Square data-icon="inline-start" className="fill-current text-destructive/80" />
              Kết thúc phiên học
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kết thúc phiên học?</AlertDialogTitle>
              <AlertDialogDescription>
                Hệ thống sẽ ngừng hội thoại và bắt đầu chấm điểm dựa trên những gì bạn đã thực hành.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Tiếp tục học</AlertDialogCancel>
              <AlertDialogAction onClick={onEnd} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Xác nhận & Chấm điểm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* Help Note */}
      <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
         <div className="flex items-start gap-3">
            <History className="text-primary mt-0.5" />
            <p className="text-[11px]/relaxed text-muted-foreground font-medium">
              Sử dụng tổ hợp phím <kbd className="font-mono text-primary/80">Enter</kbd> để gửi tin nhắn văn bản.
            </p>
         </div>
      </div>
    </aside>
  );
}
