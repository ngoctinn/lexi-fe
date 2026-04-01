"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const LEVELS = [
  { value: "A1", label: "A1 — Beginner", description: "Mới bắt đầu, biết từ vựng căn bản" },
  { value: "A2", label: "A2 — Elementary", description: "Giao tiếp được trong các tình huống đơn giản" },
  { value: "B1", label: "B1 — Intermediate", description: "Đủ dùng để đi du lịch hoặc làm việc đơn giản" },
  { value: "B2", label: "B2 — Upper-Intermediate", description: "Giao tiếp khá trôi chảy về các chủ đề phổ thông" },
  { value: "C1", label: "C1 — Advanced", description: "Khả năng ngôn ngữ linh hoạt, học thuật cao" },
  { value: "C2", label: "C2 — Proficient", description: "Sử dụng tiếng Anh tự nhiên như người bản xứ" },
] as const;

interface LevelPickerProps {
  value: string;
  onChange: (level: string) => void;
}

export function LevelPicker({ value, onChange }: LevelPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {LEVELS.map((level) => {
        const isSelected = level.value === value;

        return (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            className={cn(
              "flex h-12 min-w-[64px] items-center justify-center rounded-xl border-2 px-4 text-sm font-bold transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/5"
                : "border-control-border-subtle bg-control-bg-subtle/50 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            )}
          >
            {level.value}
          </button>
        );
      })}
    </div>
  );
}
