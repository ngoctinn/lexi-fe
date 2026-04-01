"use client";

import * as React from "react";
import { BookOpen, Briefcase, ShoppingCart, Plane, HeartPulse, GraduationCap, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Scenario } from "@/features/session/types/session.types";

// Map scenario names to icons — fallback to MessageCircle
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
  name: "Tự do",
  description: "Hội thoại không theo chủ đề cụ thể",
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
        const Icon = ICON_MAP[scenario.name] ?? BookOpen;

        return (
          <button
            key={scenario.scenario_id}
            type="button"
            onClick={() => onChange(scenario.scenario_id)}
            aria-pressed={isSelected}
            className={cn(
              "group flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isSelected
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-control-border-subtle bg-control-bg-subtle/50 hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            <div className={cn(
              "flex size-9 items-center justify-center rounded-lg transition-colors",
              isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              <Icon className="size-4" aria-hidden />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={cn("text-sm font-semibold", isSelected && "text-primary")}>
                {scenario.name}
              </span>
              <span className="text-xs text-muted-foreground line-clamp-2">
                {scenario.description}
              </span>
            </div>
            {scenario.usage_count > 0 && (
              <Badge variant="secondary" className="text-xs">
                {scenario.usage_count} lượt
              </Badge>
            )}
          </button>
        );
      })}
    </div>
  );
}
