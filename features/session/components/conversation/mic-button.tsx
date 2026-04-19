"use client";

import * as React from "react";
import { Mic, Loader2, MicOff, Square } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { RecorderState } from "@/features/session/types/session.types";

interface MicButtonProps {
  recorderState: RecorderState;
  onToggle: () => void;
  className?: string;
  disabled?: boolean;
}

export function MicButton({
  recorderState,
  onToggle,
  className,
  disabled,
}: MicButtonProps) {
  const isListening = recorderState === "recording";
  const isProcessing =
    recorderState === "uploading" || recorderState === "processing";

  const getTooltipContent = () => {
    switch (recorderState) {
      case "permission-denied":
        return "Quyền truy cập micro bị từ chối. Vui lòng click vào ổ khóa trên thanh địa chỉ để cấp quyền lại.";
      case "recording":
        return "Đang lắng nghe... Nhấn để dừng lượt ghi âm này và gửi";
      case "uploading":
      case "processing":
        return "Đang xử lý âm thanh...";
      case "error":
        return "Đã xảy ra lỗi micro. Vui lòng tải lại trang.";
      default:
        return "Nhấn để bắt đầu ghi âm lượt này";
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {isListening && (
        <div className="absolute inset-0 rounded-full bg-primary-200 animate-ping duration-1000" />
      )}
      <Button
        type="button"
        variant={isListening ? "soft" : "default"}
        size="icon-xl"
        disabled={
          disabled || isProcessing || recorderState === "permission-denied"
        }
        onClick={onToggle}
        className={cn(
          "shrink-0 relative z-10 rounded-full",
          isListening &&
            "ring-4 ring-primary-200 bg-primary shadow-lg shadow-primary-200 hover:bg-primary-600",
        )}
        aria-label={
          isListening ? "Dừng ghi âm lượt này" : "Bắt đầu ghi âm lượt này"
        }
        title={getTooltipContent()}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin size-6" />
        ) : isListening ? (
          <Square className="fill-primary-foreground size-5 text-primary-foreground" />
        ) : recorderState === "permission-denied" ? (
          <MicOff className="size-6" />
        ) : (
          <Mic className="size-6" />
        )}
      </Button>
    </div>
  );
}
