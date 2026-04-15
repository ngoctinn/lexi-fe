"use client";

import * as React from "react";
import {
  BookOpen,
  Briefcase,
  Globe2,
  MessageCircle,
  Plane,
  ShoppingCart,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Scenario } from "@/features/session/types/session.types";

const ICON_MAP: Record<string, React.ElementType> = {
  work: Briefcase,
  daily_life: ShoppingCart,
  travel: Plane,
  social: MessageCircle,
  world: Globe2,
};

interface ScenarioPickerProps {
  scenarios: Scenario[];
  value: string;
  onChange: (scenarioId: string) => void;
}

export function ScenarioPicker({
  scenarios,
  value,
  onChange,
}: ScenarioPickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {scenarios.map((scenario) => {
        const isSelected = scenario.scenario_id === value;
        const Icon = ICON_MAP[scenario.context] ?? BookOpen;

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
                : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-primary/5",
            )}
          >
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
              )}
            >
              <Icon className="size-4" aria-hidden />
            </div>
            <div className="flex flex-col gap-0.5">
              <span
                className={cn(
                  "text-xs font-bold",
                  isSelected && "text-primary",
                )}
              >
                {scenario.scenario_title}
              </span>
              <span className="text-[10px] text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed">
                {scenario.my_character} · {scenario.ai_character}
              </span>
              <span className="text-[10px] text-muted-foreground/80 uppercase tracking-wider">
                {scenario.goals.length} mục tiêu
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
