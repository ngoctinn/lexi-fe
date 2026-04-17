"use client";

import * as React from "react";
import {
  BookOpen,
  Briefcase,
  Globe2,
  Lock,
  MessageCircle,
  Plane,
  ShoppingCart,
  Utensils,
  CheckCircle2,
  Play,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Scenario } from "@/features/session/types/session.types";

// Map context → icon
const ICON_MAP: Record<string, React.ElementType> = {
  work: Briefcase,
  daily_life: ShoppingCart,
  travel: Plane,
  social: MessageCircle,
  world: Globe2,
  food: Utensils,
};

// Thứ tự hiển thị và tên của từng nhóm cấp độ
const LEVEL_CONFIG = {
  beginner: { label: "Người mới bắt đầu", color: "text-emerald-500" },
  intermediate: { label: "Trung cấp", color: "text-blue-500" },
  advanced: { label: "Nâng cao", color: "text-purple-500" },
} as const;

// Hardcode 4 scenario đầu là unlocked — sau này backend tracking progress sẽ thay
const UNLOCKED_IDS = new Set(["s1", "s2", "s3", "s4"]);

type NodeStatus = "completed" | "unlocked" | "locked";

function getNodeStatus(scenarioId: string): NodeStatus {
  // Tạm thời mock: s1 = completed, s2-s4 = unlocked, còn lại = locked
  if (scenarioId === "s1") return "completed";
  if (UNLOCKED_IDS.has(scenarioId)) return "unlocked";
  return "locked";
}

interface LearningPathProps {
  scenarios: Scenario[];
  value: string; // scenario_id đang được chọn
  onSelect: (scenarioId: string) => void;
}

export function LearningPath({ scenarios, value, onSelect }: LearningPathProps) {
  // Nhóm scenarios theo difficulty_level, giữ thứ tự theo order
  const grouped = React.useMemo(() => {
    const order: Array<"beginner" | "intermediate" | "advanced"> = [
      "beginner",
      "intermediate",
      "advanced",
    ];

    return order.map((level) => ({
      level,
      scenarios: scenarios
        .filter((s) => s.difficulty_level === level)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }));
  }, [scenarios]);

  return (
    <div className="flex flex-col gap-10">
      {grouped.map(({ level, scenarios: group }) => {
        if (group.length === 0) return null;
        const config = LEVEL_CONFIG[level];

        return (
          <div key={level} className="flex flex-col gap-4">
            {/* Section header */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border/60" />
              <span
                className={cn(
                  "text-xs font-bold uppercase tracking-widest",
                  config.color,
                )}
              >
                {config.label}
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </div>

            {/* Danh sách node trong nhóm — single column, kết nối bằng connector line */}
            <div className="relative flex flex-col items-center gap-0">
              {group.map((scenario, idx) => {
                const status = getNodeStatus(scenario.scenario_id);
                const isSelected = scenario.scenario_id === value;
                const isLocked = status === "locked";
                const isCompleted = status === "completed";
                const Icon = ICON_MAP[scenario.context] ?? BookOpen;
                const isLast = idx === group.length - 1;

                return (
                  <div key={scenario.scenario_id} className="flex w-full flex-col items-center">
                    {/* Node button */}
                    <button
                      type="button"
                      disabled={isLocked}
                      onClick={() => !isLocked && onSelect(scenario.scenario_id)}
                      aria-pressed={isSelected}
                      className={cn(
                        "group relative flex w-full max-w-sm items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        // Trạng thái selected
                        isSelected && !isLocked
                          ? "border-primary bg-primary/8 shadow-md shadow-primary/10"
                          : "",
                        // Locked
                        isLocked
                          ? "cursor-not-allowed border-border/40 bg-muted/20 opacity-50"
                          : "",
                        // Unlocked / hover
                        !isLocked && !isSelected
                          ? "border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm"
                          : "",
                      )}
                    >
                      {/* Icon circle */}
                      <div
                        className={cn(
                          "flex size-12 shrink-0 items-center justify-center rounded-2xl transition-colors",
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : isSelected
                              ? "bg-primary text-primary-foreground"
                              : isLocked
                                ? "bg-muted text-muted-foreground/40"
                                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                        )}
                      >
                        {isLocked ? (
                          <Lock className="size-5" aria-hidden />
                        ) : isCompleted ? (
                          <CheckCircle2 className="size-5" aria-hidden />
                        ) : (
                          <Icon className="size-5" aria-hidden />
                        )}
                      </div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "font-semibold text-sm leading-tight",
                            isSelected ? "text-primary" : "",
                            isLocked ? "text-muted-foreground/50" : "",
                          )}
                        >
                          {scenario.scenario_title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                          {scenario.my_character} · {scenario.ai_character}
                        </p>
                        <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                          {scenario.goals.length} mục tiêu
                        </p>
                      </div>

                      {/* Play indicator khi được chọn */}
                      {isSelected && !isLocked && (
                        <div className="shrink-0">
                          <Play className="size-4 fill-primary text-primary" aria-hidden />
                        </div>
                      )}
                    </button>

                    {/* Connector line đến node tiếp theo trong cùng nhóm */}
                    {!isLast && (
                      <div className="h-4 w-px bg-border/50" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
