import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getScenarios } from "@/features/session/actions/get-scenarios";
import { getSessions } from "@/features/session/actions/get-sessions";
import type { Scenario, Session } from "@/features/session/types/session.types";

import { DashboardMetricCard } from "./dashboard-metric-card";
import { DashboardTile } from "./dashboard-tile";

function formatSessionDate(createdAt?: string) {
  if (!createdAt) {
    return "Vừa xong";
  }

  return format(new Date(createdAt), "dd/MM/yyyy HH:mm", {
    locale: vi,
  });
}

function RecentSessionsCard({
  sessions,
  scenarioMap,
}: {
  sessions: Session[];
  scenarioMap: Map<string, Scenario>;
}) {
  const recentSessions = [...sessions]
    .sort(
      (a, b) =>
        new Date(b.created_at ?? 0).getTime() -
        new Date(a.created_at ?? 0).getTime(),
    )
    .slice(0, 3);
  const hasSessions = recentSessions.length > 0;

  return (
    <Card size="sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold tracking-tight">
          Lịch sử gần đây
        </CardTitle>
        <CardDescription>Ba phiên hội thoại gần nhất của bạn.</CardDescription>
        <CardAction>
          <Badge variant="outline">{sessions.length} phiên</Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-3">
        {hasSessions ? (
          recentSessions.map((session) => {
            const isCompleted = Boolean(session.scoring);
            const scenario = scenarioMap.get(session.scenario_id);
            const scenarioTitle =
              scenario?.scenario_title ?? session.scenario_id;
            const href = `/session/${session.session_id}`;

            return (
              <Link
                key={session.session_id}
                href={href}
                className="group block rounded-2xl border border-border/60 bg-muted/20 p-3 transition-colors hover:bg-muted/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={isCompleted ? "success" : "default"}
                        className="shrink-0"
                      >
                        {isCompleted ? "Hoàn thành" : "Đang học"}
                      </Badge>
                      <span className="truncate text-sm font-semibold text-foreground">
                        {scenarioTitle}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatSessionDate(session.created_at)} · Level{" "}
                      {session.level}
                    </p>
                  </div>

                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm leading-6 text-muted-foreground">
            Chưa có lịch sử hội thoại. Bắt đầu một phiên mới để card này xuất
            hiện.
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {hasSessions
            ? "Mở lại bất kỳ cuộc trò chuyện nào từ danh sách phía trên."
            : "Lịch sử sẽ được hiển thị sau phiên hội thoại đầu tiên."}
        </span>
        <Button asChild variant="outline" size="sm">
          <Link href="/session/new">Bắt đầu phiên mới</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export async function Dashboard() {
  const [sessions, scenarios] = await Promise.all([
    getSessions(),
    getScenarios(),
  ]);

  const scenarioMap = new Map(
    scenarios.map((scenario) => [scenario.scenario_id, scenario]),
  );

  const overviewCards = [
    {
      title: "Flashcard",
      value: "1,248",
      suffix: "thẻ",
      description: "Số thẻ đã học và đang được theo dõi trong hệ thống.",
      progress: 62,
      progressLabel: "Mục tiêu 2,000 thẻ",
      footerLabel: "Thẻ cần ôn hôm nay",
      footerValue: "38 thẻ",
    },
    {
      title: "Luyện nói",
      value: "64",
      suffix: "phiên",
      description: "Tổng số phiên hội thoại đã hoàn thành cùng AI.",
      progress: 78,
      progressLabel: "Mục tiêu tuần",
      footerLabel: "Tổng thời gian",
      footerValue: "12h 25m",
    },
  ];

  const tiles = [
    {
      title: "Ôn flashcard",
      description: "Vào lại phiên flashcard để giữ nhịp nhớ.",
      href: "/flashcards",
      label: "38 thẻ",
    },
    {
      title: "Bắt đầu luyện nói",
      description: "Mở nhanh một phiên nói mới theo ngữ cảnh phù hợp.",
      href: "/session/new",
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

      <RecentSessionsCard sessions={sessions} scenarioMap={scenarioMap} />
    </div>
  );
}
