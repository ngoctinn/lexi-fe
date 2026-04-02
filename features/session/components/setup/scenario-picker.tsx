"use client";

import * as React from "react";
import { BookOpen, Briefcase, ShoppingCart, Plane, HeartPulse, GraduationCap, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Scenario } from "@/features/session/types/session.types";

const ICON_MAP: Record<string, React.ElementType> = {
  "Job Interview": Briefcase,
  "Shopping": ShoppingCart,
  "Travel": Plane,
  "Health": HeartPulse,
  "Education": GraduationCap,
  "Small Talk": MessageCircle,
};

const FREE_SCENARIO: Scenario = {
  scenario_id: "free",
  name: "Hội thoại tự do",
  description: "Bắt đầu nói chuyện mà không cần thiết lập kịch bản",
  is_active: true,
  usage_count: 0,
};

interface ScenarioPickerProps {
  scenarios: Scenario[];
  value: string;
  onChange: (scenarioId: string) => void;
}

export function ScenarioPicker({ scenarios, value, onChange }: ScenarioPickerProps) {
  const all = [FREE_SCENARIO, ...scenarios];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {all.map((scenario) => {
        const isSelected = scenario.scenario_id === value;
        let Icon = ICON_MAP[scenario.name] ?? BookOpen;
        if (scenario.scenario_id === "free") Icon = MessageCircle;

        return (
          <button
            key={scenario.scenario_id}
            type="button"
            onClick={() => onChange(scenario.scenario_id)}
            aria-pressed={isSelected}
            className={cn(
              "group flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            <div className={cn(
              "flex size-8 items-center justify-center rounded-lg transition-colors",
              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              <Icon className="size-4" aria-hidden />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={cn("text-xs font-bold", isSelected && "text-primary")}>
                {scenario.name}
              </span>
              <span className="text-[10px] text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed">
                {scenario.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
