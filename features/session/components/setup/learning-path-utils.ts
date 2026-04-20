export const NODE_SIZE = 96;
export const ROW_HEIGHT = 180;
export const CONTAINER_WIDTH = 440;
export const CENTER_X = CONTAINER_WIDTH / 2;
export const SIDE_GAP = 90;
export const RIGHT_X = CENTER_X + SIDE_GAP;
export const LEFT_X = CENTER_X - SIDE_GAP;
export const CURVE_STRETCH = 200;
export const ROUNDING = 90;

export function getPathD(
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
  if (type === "right-to-left") return `M ${fromX} ${fromY} L ${toX} ${toY}`;

  let boundaryX = fromX;
  if (type === "center-to-right" || type === "right-to-center")
    boundaryX = Math.max(fromX, toX) + (CURVE_STRETCH - SIDE_GAP);
  if (type === "center-to-left" || type === "left-to-center")
    boundaryX = Math.min(fromX, toX) - (CURVE_STRETCH - SIDE_GAP);

  const r = ROUNDING;
  const dirX = boundaryX > fromX ? 1 : -1;

  return `M ${fromX} ${fromY}
          L ${boundaryX - r * dirX} ${fromY}
          Q ${boundaryX} ${fromY}, ${boundaryX} ${fromY + r}
          Q ${boundaryX} ${toY}, ${boundaryX - r * dirX} ${toY}
          L ${toX} ${toY}`;
}

export const LEVEL_CONFIG = {
  A1: {
    label: "A1 — Cơ bản",
    pathColor: "var(--color-level-a1)",
    ringColor: "var(--color-level-a1)",
    buttonClassName:
      "border-emerald-700 bg-level-a1 text-white shadow-[inset_0_-4px_0_0_oklch(0.45_0.13_155)] hover:bg-emerald-600",
  },
  A2: {
    label: "A2 — Sơ cấp",
    pathColor: "var(--color-level-a2)",
    ringColor: "var(--color-level-a2)",
    buttonClassName:
      "border-cyan-700 bg-level-a2 text-white shadow-[inset_0_-4px_0_0_oklch(0.45_0.15_200)] hover:bg-cyan-600",
  },
  B1: {
    label: "B1 — Trung cấp",
    pathColor: "var(--color-level-b1)",
    ringColor: "var(--color-level-b1)",
    buttonClassName:
      "border-blue-700 bg-level-b1 text-white shadow-[inset_0_-4px_0_0_oklch(0.4_0.15_250)] hover:bg-blue-600",
  },
  B2: {
    label: "B2 — Thượng cấp",
    pathColor: "var(--color-level-b2)",
    ringColor: "var(--color-level-b2)",
    buttonClassName:
      "border-indigo-700 bg-level-b2 text-white shadow-[inset_0_-4px_0_0_oklch(0.38_0.15_265)] hover:bg-indigo-600",
  },
  C1: {
    label: "C1 — Cao cấp",
    pathColor: "var(--color-level-c1)",
    ringColor: "var(--color-level-c1)",
    buttonClassName:
      "border-purple-700 bg-level-c1 text-white shadow-[inset_0_-4px_0_0_oklch(0.4_0.15_300)] hover:bg-purple-600",
  },
  C2: {
    label: "C2 — Thành thạo",
    pathColor: "var(--color-level-c2)",
    ringColor: "var(--color-level-c2)",
    buttonClassName:
      "border-rose-700 bg-level-c2 text-white shadow-[inset_0_-4px_0_0_oklch(0.4_0.16_25)] hover:bg-rose-600",
  },
} as const;
