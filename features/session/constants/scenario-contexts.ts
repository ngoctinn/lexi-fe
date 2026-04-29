import {
  BarChart3,
  Briefcase,
  Coffee,
  Globe2,
  HeartHandshake,
  Landmark,
  MapPinned,
  MessageCircle,
  Plane,
  ShoppingCart,
  Utensils,
  Users2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ScenarioContextOption {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const SCENARIO_CONTEXT_OPTIONS: ScenarioContextOption[] = [
  {
    value: "Social Communication",
    label: "Social Communication",
    icon: MessageCircle,
  },
  {
    value: "At the Coffee Shop",
    label: "At the Coffee Shop",
    icon: Coffee,
  },
  {
    value: "Transportation & Asking Directions",
    label: "Transportation & Asking Directions",
    icon: MapPinned,
  },
  {
    value: "Health & Medical",
    label: "Health & Medical",
    icon: HeartHandshake,
  },
  {
    value: "Travel & Hotels",
    label: "Travel & Hotels",
    icon: Plane,
  },
  {
    value: "Daily Life",
    label: "Daily Life",
    icon: ShoppingCart,
  },
  {
    value: "Finance & Banking",
    label: "Finance & Banking",
    icon: Landmark,
  },
  {
    value: "Shopping",
    label: "Shopping",
    icon: ShoppingCart,
  },
  {
    value: "Food & Restaurants",
    label: "Food & Restaurants",
    icon: Utensils,
  },
  {
    value: "Travel & Aviation",
    label: "Travel & Aviation",
    icon: Plane,
  },
  {
    value: "Work & Career",
    label: "Work & Career",
    icon: Briefcase,
  },
  {
    value: "Office & Meetings",
    label: "Office & Meetings",
    icon: Users2,
  },
  {
    value: "Business & Presentations",
    label: "Business & Presentations",
    icon: BarChart3,
  },
  {
    value: "Society & World",
    label: "Society & World",
    icon: Globe2,
  },
];

export const DEFAULT_SCENARIO_CONTEXT =
  SCENARIO_CONTEXT_OPTIONS[0]?.value ?? "Social Communication";

export const SCENARIO_CONTEXT_ICON_MAP = SCENARIO_CONTEXT_OPTIONS.reduce(
  (accumulator, option) => {
    accumulator[option.value] = option.icon;
    return accumulator;
  },
  {} as Record<string, LucideIcon>,
);
