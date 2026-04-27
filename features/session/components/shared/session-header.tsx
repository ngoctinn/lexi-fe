"use client";

import * as React from "react";
import { Square, ArrowLeft, User, Bot } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { endSession } from "@/features/session/actions/end-session";
import { getSession } from "@/features/session/actions/get-session";
import { toast } from "sonner";
import type { SessionScoreSummary } from "@/features/session/types/session.types";

interface SessionHeaderProps {
  sessionId: string;
  scenarioTitle: string;
  aiCharacter: string;
  className?: string;
  onEnd?: (summary: SessionScoreSummary | null) => void;
  isCompleted?: boolean;
  myRole?: string;
  partnerRole?: string;
  scenarioGoals?: string[];
}

export function SessionHeader({
  sessionId,
  scenarioTitle,
  aiCharacter,
  className,
  onEnd,
  isCompleted = false,
  myRole,
  partnerRole,
  scenarioGoals = [],
}: SessionHeaderProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const handleEnd = async () => {
    if (isCompleted) {
      return;
    }

    setIsPending(true);
    const res = await endSession(sessionId);

    if (res.success) {
      const sessionResult = await getSession(sessionId);
      const summary =
        sessionResult.success && sessionResult.session?.scoring
          ? {
              scoring: sessionResult.session.scoring,
              totalTurns:
                sessionResult.session.total_turns ||
                sessionResult.session.turns?.length ||
                0,
              hintUsedCount: sessionResult.session.hint_used_count || 0,
            }
          : null;

      toast.success(
        summary
          ? "Đã nộp bài. Kết quả đã hiển thị ở sidebar."
          : "Đã nộp bài. Hệ thống đang tổng kết điểm.",
      );
      onEnd?.(summary);
    } else {
      toast.error(res.error ?? "Không thể nộp bài.");
    }

    setIsPending(false);
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between px-4 h-16",
        className,
      )}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={() => router.back()}
        >
          <ArrowLeft data-icon="inline-start" />
        </Button>

        <div className="flex items-center gap-4 min-w-0 flex-1 flex-wrap">
          {/* Title */}
          <h1 className="text-lg font-bold leading-tight text-foreground truncate">
            {scenarioTitle || "Phiên luyện nói"}
          </h1>
          
          {/* Role Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* User Role Badge */}
            <Badge 
              variant="secondary" 
              className="gap-1.5"
            >
              <User className="size-3.5" />
              <span className="font-semibold">Bạn:</span>
              <span>{myRole || "Học viên"}</span>
            </Badge>
            
            {/* AI Role Badge */}
            <Badge 
              variant="secondary"
              className="gap-1.5"
            >
              <Bot className="size-3.5" />
              <span className="font-semibold">{aiCharacter}:</span>
              <span>{partnerRole || "AI Assistant"}</span>
            </Badge>
          </div>
          
          {/* Goal - Desktop only */}
          {scenarioGoals && scenarioGoals.length > 0 && (
            <div className="hidden xl:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">Mục tiêu:</span>
              <span>{scenarioGoals.join(" • ")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isCompleted ? (
          <Button variant="secondary" size="sm" disabled>
            <Square
              data-icon="inline-start"
              className="size-3.5 fill-current"
            />
            <span className="hidden sm:inline">Đã nộp bài</span>
          </Button>
        ) : (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default" size="sm" disabled={isPending}>
                <Square
                  data-icon="inline-start"
                  className="size-3.5 fill-current"
                />
                <span className="hidden sm:inline">Nộp &amp; chấm điểm</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Nộp bài và chấm điểm?</AlertDialogTitle>
                <AlertDialogDescription>
                  Nút micro chỉ dừng lượt ghi âm hiện tại. Nút này sẽ chốt phiên
                  luyện nói, ngừng ghi âm và bắt đầu chấm điểm phần thực hành
                  của bạn.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction onClick={handleEnd}>
                  Nộp &amp; chấm điểm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
