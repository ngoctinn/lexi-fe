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
    value: "Giao tiếp xã hội",
    label: "Giao tiếp xã hội",
    icon: MessageCircle,
  },
  {
    value: "Tại quán cà phê",
    label: "Tại quán cà phê",
    icon: Coffee,
  },
  {
    value: "Đi lại & Hỏi đường",
    label: "Đi lại & Hỏi đường",
    icon: MapPinned,
  },
  {
    value: "Sức khỏe & Y tế",
    label: "Sức khỏe & Y tế",
    icon: HeartHandshake,
  },
  {
    value: "Du lịch & Khách sạn",
    label: "Du lịch & Khách sạn",
    icon: Plane,
  },
  {
    value: "Đời sống hàng ngày",
    label: "Đời sống hàng ngày",
    icon: ShoppingCart,
  },
  {
    value: "Tài chính & Ngân hàng",
    label: "Tài chính & Ngân hàng",
    icon: Landmark,
  },
  {
    value: "Mua sắm",
    label: "Mua sắm",
    icon: ShoppingCart,
  },
  {
    value: "Ẩm thực & Nhà hàng",
    label: "Ẩm thực & Nhà hàng",
    icon: Utensils,
  },
  {
    value: "Du lịch & Hàng không",
    label: "Du lịch & Hàng không",
    icon: Plane,
  },
  {
    value: "Công việc & Sự nghiệp",
    label: "Công việc & Sự nghiệp",
    icon: Briefcase,
  },
  {
    value: "Công sở & Hội họp",
    label: "Công sở & Hội họp",
    icon: Users2,
  },
  {
    value: "Kinh doanh & Thuyết trình",
    label: "Kinh doanh & Thuyết trình",
    icon: BarChart3,
  },
  {
    value: "Xã hội & Thế giới",
    label: "Xã hội & Thế giới",
    icon: Globe2,
  },
];

export const DEFAULT_SCENARIO_CONTEXT =
  SCENARIO_CONTEXT_OPTIONS[0]?.value ?? "Giao tiếp xã hội";

export const SCENARIO_CONTEXT_ICON_MAP = SCENARIO_CONTEXT_OPTIONS.reduce(
  (accumulator, option) => {
    accumulator[option.value] = option.icon;
    return accumulator;
  },
  {} as Record<string, LucideIcon>,
);
