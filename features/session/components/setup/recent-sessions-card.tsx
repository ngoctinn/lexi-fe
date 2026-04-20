"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Scenario, Session } from "../../types/session.types";

function formatSessionDate(createdAt?: string) {
  if (!createdAt) return "Vừa xong";
  return format(new Date(createdAt), "dd/MM/yyyy HH:mm", { locale: vi });
}

interface RecentSessionsCardProps {
  sessions: Session[];
  scenarioMap: Map<string, Scenario>;
}

export function RecentSessionsCard({
  sessions,
  scenarioMap,
}: RecentSessionsCardProps) {
  const recentSessions = React.useMemo(
    () =>
      [...sessions]
        .sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime(),
        )
        .slice(0, 4),
    [sessions],
  );

  return (
    <Card size="sm" className="flex h-full min-h-0 flex-col">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="text-base font-semibold tracking-tight">
          Lịch sử gần đây
        </CardTitle>
        <CardDescription>
          Mở lại phiên gần nhất ngay trong lộ trình luyện nói này.
        </CardDescription>
        <CardAction>
          <Badge
            variant="secondary"
            shape="pill"
            size="sm"
          >
            {sessions.length} phiên
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
        {recentSessions.length > 0 ? (
          recentSessions.map((session) => {
            const isCompleted = Boolean(session.scoring);
            const scenario = scenarioMap.get(session.scenario_id);
            const scenarioTitle = scenario?.scenario_title ?? session.scenario_id;
            const href = isCompleted
              ? `/session/${session.session_id}/results`
              : `/session/${session.session_id}`;

            return (
              <Link
                key={session.session_id}
                href={href}
                className="group flex items-start justify-between gap-4 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <div className="min-w-0 space-y-1">
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
                    {formatSessionDate(session.created_at)} · Level {session.level}
                  </p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
            Chưa có lịch sử hội thoại. Bắt đầu một phiên mới để phần này xuất hiện.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
