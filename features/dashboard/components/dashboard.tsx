import { BrainCircuit, Mic, Sparkles } from "lucide-react";

import { DashboardMetricCard } from "./dashboard-metric-card";
import { DashboardTile } from "./dashboard-tile";
import { StreakCard } from "./streak-card";

export function Dashboard() {
  const overviewCards = [
    {
      title: "Từ vựng",
      value: "1,248",
      suffix: "từ",
      description: "Số từ đã học và đang được ghi nhớ trong hệ thống.",
      icon: BrainCircuit,
      progress: 62,
      progressLabel: "Mục tiêu 2,000 từ",
      footerLabel: "Từ cần ôn hôm nay",
      footerValue: "38 từ",
    },
    {
      title: "Luyện nói",
      value: "64",
      suffix: "phiên",
      description: "Tổng số phiên hội thoại đã hoàn thành cùng AI.",
      icon: Mic,
      progress: 78,
      progressLabel: "Mục tiêu tuần",
      footerLabel: "Tổng thời gian",
      footerValue: "12h 25m",
    },
  ];

  const tiles = [
    {
      title: "Ôn từ ngay",
      description: "Vào lại bộ từ đang cần ôn để giữ nhịp nhớ.",
      href: "/vocabulary",
      icon: BrainCircuit,
      label: "38 từ",
    },
    {
      title: "Bắt đầu luyện nói",
      description: "Mở nhanh một phiên nói mới theo ngữ cảnh phù hợp.",
      href: "/session/new",
      icon: Sparkles,
      label: "Live",
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)] animate-in fade-in duration-700">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {overviewCards.map((card) => (
            <DashboardMetricCard key={card.title} {...card} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {tiles.map((tile) => (
            <DashboardTile key={tile.title} {...tile} />
          ))}
        </div>
      </div>

      <StreakCard
        currentStreak={14}
        bestStreak={21}
        weeklyProgress={71}
        activeDaysThisWeek={5}
      />
    </div>
  );
}
