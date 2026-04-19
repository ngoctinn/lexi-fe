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

const LEVEL_CONFIG = {
  A1: {
    label: "A1 — Cơ bản",
    headerClass: "text-emerald-600 dark:text-emerald-400",
    dividerStyle: {
      borderColor: "rgba(16, 185, 129, 0.3)",
    } as React.CSSProperties,
    pathColor: "#10b981",
    ringColor: "#34d399",
    buttonClassName:
      "border-emerald-700 bg-emerald-500 text-white shadow-[inset_0_-4px_0_0_#047857] hover:bg-emerald-600",
  },
  A2: {
    label: "A2 — Sơ cấp",
    headerClass: "text-cyan-600 dark:text-cyan-400",
    dividerStyle: {
      borderColor: "rgba(6, 182, 212, 0.3)",
    } as React.CSSProperties,
    pathColor: "#06b6d4",
    ringColor: "#22d3ee",
    buttonClassName:
      "border-cyan-700 bg-cyan-500 text-white shadow-[inset_0_-4px_0_0_#0e7490] hover:bg-cyan-600",
  },
  B1: {
    label: "B1 — Trung cấp",
    headerClass: "text-blue-600 dark:text-blue-400",
    dividerStyle: {
      borderColor: "rgba(59, 130, 246, 0.3)",
    } as React.CSSProperties,
    pathColor: "#3b82f6",
    ringColor: "#60a5fa",
    buttonClassName:
      "border-blue-700 bg-blue-500 text-white shadow-[inset_0_-4px_0_0_#1d4ed8] hover:bg-blue-600",
  },
  B2: {
    label: "B2 — Thượng cấp",
    headerClass: "text-indigo-600 dark:text-indigo-400",
    dividerStyle: {
      borderColor: "rgba(99, 102, 241, 0.3)",
    } as React.CSSProperties,
    pathColor: "#6366f1",
    ringColor: "#818cf8",
    buttonClassName:
      "border-indigo-700 bg-indigo-500 text-white shadow-[inset_0_-4px_0_0_#4338ca] hover:bg-indigo-600",
  },
  C1: {
    label: "C1 — Cao cấp",
    headerClass: "text-purple-600 dark:text-purple-400",
    dividerStyle: {
      borderColor: "rgba(168, 85, 247, 0.3)",
    } as React.CSSProperties,
    pathColor: "#a855f7",
    ringColor: "#c084fc",
    buttonClassName:
      "border-purple-700 bg-purple-500 text-white shadow-[inset_0_-4px_0_0_#6d28d9] hover:bg-purple-600",
  },
  C2: {
    label: "C2 — Thành thạo",
    headerClass: "text-rose-600 dark:text-rose-400",
    dividerStyle: {
      borderColor: "rgba(244, 63, 94, 0.3)",
    } as React.CSSProperties,
    pathColor: "#f43f5e",
    ringColor: "#fb7185",
    buttonClassName:
      "border-rose-700 bg-rose-500 text-white shadow-[inset_0_-4px_0_0_#be123c] hover:bg-rose-600",
  },
} as const;

// Trạng thái mở khóa/hoàn thành giả lập, sau này lấy từ progress backend
const UNLOCKED_IDS = new Set(["s1", "s2", "s3", "s4"]);
const COMPLETED_IDS = new Set(["s1"]);

type NodeStatus = "completed" | "unlocked" | "locked";

function getNodeStatus(scenarioId: string): NodeStatus {
  if (COMPLETED_IDS.has(scenarioId)) return "completed";
  if (UNLOCKED_IDS.has(scenarioId)) return "unlocked";
  return "locked";
}

const CURVE_STRETCH = 200; // Thu hẹp biên độ văng tỷ lệ thuận với container
const ROUNDING = 90; // Làm cong tối đa để đường cua thành bán nguyệt

function getPathD(
  type:
    | "center-to-right"
    | "right-to-left"
    | "left-to-center"
    | "center-to-left"
    | "right-to-center",
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): string {
  if (type === "right-to-left") {
    return `M ${fromX} ${fromY} L ${toX} ${toY}`;
  }

  let boundaryX = fromX;
  if (type === "center-to-right" || type === "right-to-center")
    boundaryX = Math.max(fromX, toX) + (CURVE_STRETCH - SIDE_GAP);
  if (type === "center-to-left" || type === "left-to-center")
    boundaryX = Math.min(fromX, toX) - (CURVE_STRETCH - SIDE_GAP);

  // Bán kính cong 90 bằng nửa ROW_HEIGHT 180 để tạo cung tròn hoàn hảo
  const r = ROUNDING;
  const dirX = boundaryX > fromX ? 1 : -1;

  return `M ${fromX} ${fromY}
          L ${boundaryX - r * dirX} ${fromY}
          Q ${boundaryX} ${fromY}, ${boundaryX} ${fromY + r}
          Q ${boundaryX} ${toY}, ${boundaryX - r * dirX} ${toY}
          L ${toX} ${toY}`;
}

// Đơn vị: px — NODE_SIZE khớp với Tailwind size-24 = 96px
const NODE_SIZE = 96;
const ROW_HEIGHT = 180; // Tăng khoảng cách dòng để nút thở tốt hơn
const CONTAINER_WIDTH = 440; // Thu hẹp chiều ngang tổng thể
const CENTER_X = CONTAINER_WIDTH / 2;
const SIDE_GAP = 90; // Thu hẹp khoảng cách các nút lại gần nhau hơn
const RIGHT_X = CENTER_X + SIDE_GAP;
const LEFT_X = CENTER_X - SIDE_GAP;

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
    const orderLevels: Array<keyof typeof LEVEL_CONFIG> = [
      "A1",
      "A2",
      "B1",
      "B2",
      "C1",
      "C2",
    ];

    const nodesToRender: Array<{
      type: "node";
      scenario: Scenario;
      config: (typeof LEVEL_CONFIG)[keyof typeof LEVEL_CONFIG];
      x: number;
      y: number;
      localIdx: number;
    }> = [];

    const headersToRender: Array<{
      type: "header";
      config: (typeof LEVEL_CONFIG)[keyof typeof LEVEL_CONFIG];
      y: number;
    }> = [];

    let accumulatedY = 0;

    orderLevels.forEach((level) => {
      const groupScenarios = scenarios
        .filter((s) => s.difficulty_level === level)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      if (groupScenarios.length === 0) return;

      const config = LEVEL_CONFIG[level];

      if (nodesToRender.length > 0) {
        accumulatedY += 40; // Khoảng cách trước header kế tiếp
      }

      headersToRender.push({
        type: "header",
        config,
        y: accumulatedY,
      });

      accumulatedY += 80; // Chiều cao header + padding

      // Layout các nodes trong group này (reset local row cho mỗi level)
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
        } else if (posInChunk === 0 && nodeIdx > 0) {
          // Trường hợp posInChunk là 0 nhưng không phải node đầu tiên.
          localRow = chunkIdx * 2;
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

      // Tăng Y dựa trên số row đã tiêu thụ.
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

            let pathType: Parameters<typeof getPathD>[0] = "right-to-left";

            if (fromPos === 0 && toPos === 1) pathType = "center-to-right";
            else if (fromPos === 1 && toPos === 2) pathType = "right-to-left";
            else if (fromPos === 2 && toPos === 0) pathType = "left-to-center";
            // Nếu ít phần tử thì xử lý thêm trường hợp đi thẳng.
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
                stroke={isLocked ? "#E5E7EB" : "#F3F4F4"}
                strokeWidth={12}
                strokeLinecap="round"
                opacity={0.6}
                style={{ zIndex: 0 }}
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
              className="h-0.5 w-full grow"
              style={{ backgroundColor: header.config.pathColor + "40" }}
            />
            <span
              className="text-sm font-bold uppercase tracking-widest shrink-0"
              style={{ color: header.config.pathColor }}
            >
              {header.config.label}
            </span>
            <div
              className="h-0.5 w-full grow"
              style={{ backgroundColor: header.config.pathColor + "40" }}
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
          const buttonClassName = config.buttonClassName;

          const haloStyle = isSelected
            ? {
                boxShadow: `0 0 0 6px ${config.ringColor}40`,
                borderColor: config.ringColor,
              }
            : {
                boxShadow: `0 0 0 4px #F3F4F6`,
              };

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
                  ...haloStyle,
                  backgroundColor: config.pathColor,
                }}
              >
                <Button
                  type="button"
                  variant="default"
                  size="icon-2xl"
                  className={buttonClassName}
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
                  "mt-2 w-44 text-center text-[15px] font-extrabold leading-tight line-clamp-2",
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
