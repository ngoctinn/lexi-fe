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
  Coffee,
  HeartHandshake,
  Phone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Scenario } from "@/features/session/types/session.types";
import { cn } from "@/lib/utils";
import {
  LEVEL_CONFIG,
  NODE_SIZE,
  ROW_HEIGHT,
  CONTAINER_WIDTH,
  CENTER_X,
  RIGHT_X,
  LEFT_X,
  getPathD,
} from "./learning-path-utils";

const ICON_MAP: Record<string, React.ElementType> = {
  work: Briefcase,
  daily_life: ShoppingCart,
  travel: Plane,
  social: MessageCircle,
  world: Globe2,
  food: Utensils,
  coffee: Coffee,
  health: HeartHandshake,
  phone: Phone,
};

const UNLOCKED_IDS = new Set(["s1", "s2", "s3", "s4"]);
const COMPLETED_IDS = new Set(["s1"]);

type NodeStatus = "completed" | "unlocked" | "locked";
type PathType = Parameters<typeof getPathD>[0];
type LevelConfig = (typeof LEVEL_CONFIG)[keyof typeof LEVEL_CONFIG];

interface RenderNode {
  type: "node";
  scenario: Scenario;
  config: LevelConfig;
  x: number;
  y: number;
  localIdx: number;
}

interface RenderHeader {
  type: "header";
  config: LevelConfig;
  y: number;
}

function getNodeStatus(scenarioId: string): NodeStatus {
  if (COMPLETED_IDS.has(scenarioId)) return "completed";
  if (UNLOCKED_IDS.has(scenarioId)) return "unlocked";
  return "locked";
}

interface LearningPathProps {
  scenarios: Scenario[];
  value: string;
  onSelect: (scenarioId: string) => void;
}

export function LearningPath({
  scenarios,
  value,
  onSelect,
}: LearningPathProps) {
  const layout = React.useMemo(() => {
    const orderLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
    const nodesToRender: RenderNode[] = [];
    const headersToRender: RenderHeader[] = [];
    let accumulatedY = 0;

    orderLevels.forEach((level) => {
      const groupScenarios = scenarios
        .filter((s) => s.difficulty_level === level)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      if (groupScenarios.length === 0) return;
      const config = LEVEL_CONFIG[level];

      if (nodesToRender.length > 0) accumulatedY += 40;
      headersToRender.push({ type: "header", config, y: accumulatedY });
      accumulatedY += 80;

      let localMaxRow = 0;
      groupScenarios.forEach((scenario, nodeIdx) => {
        const chunkIdx = Math.floor(nodeIdx / 3);
        const posInChunk = nodeIdx % 3;
        let x = CENTER_X;
        let localRow = chunkIdx * 2;

        if (posInChunk === 1) {
          x = RIGHT_X;
          localRow += 1;
        } else if (posInChunk === 2) {
          x = LEFT_X;
          localRow += 1;
        }

        const nodeY = accumulatedY + localRow * ROW_HEIGHT + NODE_SIZE / 2;
        localMaxRow = Math.max(localMaxRow, localRow);

        nodesToRender.push({
          type: "node",
          scenario,
          config,
          x,
          y: nodeY,
          localIdx: nodeIdx,
        });
      });

      accumulatedY += localMaxRow * ROW_HEIGHT + NODE_SIZE + 40;
    });

    return { nodesToRender, headersToRender, totalHeight: accumulatedY + 40 };
  }, [scenarios]);

  const { nodesToRender, headersToRender, totalHeight } = layout;

  return (
    <div className="w-full overflow-x-auto custom-scrollbar flex">
      <div
        className="relative pb-16 mx-auto shrink-0"
        style={{ width: CONTAINER_WIDTH, height: totalHeight }}
      >
        <svg
          className="absolute inset-0 pointer-events-none"
          width={CONTAINER_WIDTH}
          height={totalHeight}
          style={{ overflow: "visible" }}
          aria-hidden
        >
          {nodesToRender.map((fromNode, idx) => {
            const toNode = nodesToRender[idx + 1];
            if (!toNode || fromNode.config !== toNode.config) return null;

            const fromPos = fromNode.localIdx % 3;
            const toPos = toNode.localIdx % 3;
            let pathType: PathType = "right-to-left";

            if (fromPos === 0 && toPos === 1) pathType = "center-to-right";
            else if (fromPos === 1 && toPos === 2) pathType = "right-to-left";
            else if (fromPos === 2 && toPos === 0) pathType = "left-to-center";
            else if (fromPos === 0 && toPos === 0) pathType = "right-to-center";
            else if (fromPos === 1 && toPos === 0) pathType = "right-to-center";

            const d = getPathD(
              pathType,
              fromNode.x,
              fromNode.y,
              toNode.x,
              toNode.y,
            );
            const isLocked =
              getNodeStatus(toNode.scenario.scenario_id) === "locked";

            return (
              <path
                key={`line-${idx}`}
                d={d}
                fill="none"
                stroke={isLocked ? "var(--color-border)" : "var(--color-muted)"}
                strokeWidth={12}
                strokeLinecap="round"
                opacity={0.6}
              />
            );
          })}
        </svg>

        {headersToRender.map((header, idx) => (
          <div
            key={`header-${idx}`}
            className="absolute left-0 right-0 flex items-center justify-center gap-5 px-6 pointer-events-none"
            style={{ top: header.y }}
          >
            <div
              className="h-0.5 w-full grow opacity-25"
              style={{ backgroundColor: header.config.pathColor }}
            />
            <span
              className="text-xs font-extrabold uppercase tracking-[0.2em] shrink-0"
              style={{ color: header.config.pathColor }}
            >
              {header.config.label}
            </span>
            <div
              className="h-0.5 w-full grow opacity-25"
              style={{ backgroundColor: header.config.pathColor }}
            />
          </div>
        ))}

        {nodesToRender.map((node) => {
          const { scenario, config, x, y } = node;
          const status = getNodeStatus(scenario.scenario_id);
          const isSelected = scenario.scenario_id === value;
          const isLocked = status === "locked";
          const isCompleted = status === "completed";
          const Icon = ICON_MAP[scenario.context] ?? BookOpen;

          return (
            <div
              key={scenario.scenario_id}
              className="absolute left-0 top-0 flex flex-col items-center gap-3 transition-transform duration-300"
              style={{
                left: x - NODE_SIZE / 2,
                top: y - NODE_SIZE / 2,
                width: NODE_SIZE,
              }}
            >
              <div
                className={cn(
                  "rounded-full transition-all duration-300",
                  isSelected && !isLocked ? "-translate-y-1" : "",
                )}
                style={{
                  boxShadow:
                    isSelected && !isLocked
                      ? `0 0 0 6px var(--color-level-ring)`
                      : `0 0 0 4px var(--color-muted)`,
                  borderColor:
                    isSelected && !isLocked ? config.ringColor : undefined,
                  backgroundColor: config.pathColor,
                }}
              >
                <Button
                  type="button"
                  variant="default"
                  size="icon-2xl"
                  className={config.buttonClassName}
                  disabled={isLocked}
                  onClick={() => onSelect(scenario.scenario_id)}
                  aria-pressed={isSelected}
                  aria-label={scenario.scenario_title}
                >
                  {isLocked ? (
                    <Lock aria-hidden />
                  ) : isCompleted ? (
                    <CheckCircle2 aria-hidden />
                  ) : (
                    <Icon aria-hidden />
                  )}
                </Button>
              </div>

              <p
                className={cn(
                  "mt-2 w-44 text-center text-sm font-bold leading-tight line-clamp-2",
                  isSelected && !isLocked
                    ? "text-foreground"
                    : "text-muted-foreground/80",
                )}
                style={{ opacity: isLocked ? 0.45 : 1 }}
              >
                {scenario.scenario_title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
