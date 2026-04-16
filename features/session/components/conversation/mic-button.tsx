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
        return "Đang lắng nghe... Nhấn để dừng và gửi";
      case "uploading":
      case "processing":
        return "Đang xử lý âm thanh...";
      case "error":
        return "Đã xảy ra lỗi micro. Vui lòng tải lại trang.";
      default:
        return "Nhấn để bắt đầu nói";
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <Button
        type="button"
        variant={isListening ? "soft" : "default"}
        size="icon-xl"
        disabled={
          disabled || isProcessing || recorderState === "permission-denied"
        }
        onClick={onToggle}
        className="shrink-0"
        aria-label={isListening ? "Stop recording" : "Start recording"}
        title={getTooltipContent()}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin size-5" />
        ) : isListening ? (
          <Square className="fill-current size-5" />
        ) : recorderState === "permission-denied" ? (
          <MicOff className="size-5" />
        ) : (
          <Mic className="size-5" />
        )}
      </Button>
    </div>
  );
}
