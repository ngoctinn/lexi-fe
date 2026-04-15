"use client";

import * as React from "react";
import { Square, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { toast } from "sonner";

interface SessionHeaderProps {
  sessionId: string;
  scenarioTitle: string;
  aiCharacter: string;
  className?: string;
  onEnd?: () => void;
}

export function SessionHeader({
  sessionId,
  scenarioTitle,
  aiCharacter,
  className,
  onEnd,
}: SessionHeaderProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  const handleEnd = async () => {
    setIsPending(true);
    const res = await endSession(sessionId);
    setIsPending(false);
    if (res.success) {
      toast.success("Kết thúc phiên học. Đang tính điểm...");
      onEnd?.();
      router.push(`/session/${sessionId}/results`);
    } else {
      toast.error(res.error ?? "Không thể kết thúc phiên học.");
    }
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between px-4 h-16",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={() => router.back()}
        >
          <ArrowLeft data-icon="inline-start" />
        </Button>

        <Avatar className="size-9 rounded-md border">
          <AvatarImage
            src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${aiCharacter}`}
            alt={aiCharacter}
          />
          <AvatarFallback className="rounded-md">AI</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-none">
            {aiCharacter || "AI Assistant"}
          </span>
          <span className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {scenarioTitle || "Phiên luyện nói"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="default" size="sm" disabled={isPending}>
              <Square
                data-icon="inline-start"
                className="size-3.5 fill-current"
              />
              <span className="hidden sm:inline">Kết thúc</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kết thúc phiên học?</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn kết thúc bài luyện nói này không? Hệ thống
                sẽ ngừng ghi âm và bắt đầu chấm điểm phần thực hành của bạn.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction onClick={handleEnd}>
                Xác nhận & Chấm điểm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
