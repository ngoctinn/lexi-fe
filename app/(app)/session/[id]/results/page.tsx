import { notFound } from "next/navigation";
import { getSession } from "@/features/session/actions/get-session";
import { getScenarios } from "@/features/session/actions/get-scenarios";
import { ScoringResult } from "@/features/session/components/scoring/scoring-result";
import { ScoringSkeleton } from "@/features/session/components/scoring/scoring-skeleton";
import { TurnBubble } from "@/features/session/components/conversation/turn-bubble";
import type { Session, Turn } from "@/features/session/types/session.types";
import { PageHeader } from "@/components/shared/page-header";
import { BadgeCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = {
  title: "Kết quả luyện nói",
};

interface SessionResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionResultsPage({
  params,
}: SessionResultsPageProps) {
  const { id } = await params;

  const [{ success, session }, scenarios] = await Promise.all([
    getSession(id),
    getScenarios(),
  ]);
  if (!success || !session) {
    notFound();
  }

  const scenario = scenarios.find(
    (item) => item.scenario_id === session.scenario_id,
  );

  if (!session.scoring) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader icon={BadgeCheck} title="Kết quả luyện nói" />
        <div className="flex flex-1 items-center justify-center px-4 py-8 lg:px-8">
          <ScoringSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={BadgeCheck} title="Kết quả luyện nói" />

      <div className="grid flex-1 gap-6 px-4 py-8 lg:px-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="xl:sticky xl:top-24 self-start">
          <ScoringResult session={session as Session} />
        </div>

        <Card className="h-fit border-border/60 shadow-sm xl:sticky xl:top-24">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold tracking-tight">
              Lịch sử hội thoại
            </CardTitle>
            <CardDescription>
              Toàn bộ lượt trao đổi trong phiên này.
            </CardDescription>
          </CardHeader>

          <CardContent className="max-h-[calc(100vh-14rem)] space-y-4 overflow-y-auto pr-2">
            {session.turns && session.turns.length > 0 ? (
              session.turns.map((turn: Turn, idx: number) => (
                <TurnBubble
                  key={`${turn.turn_index}-${idx}`}
                  turn={turn}
                  aiName={scenario?.ai_character ?? "AI"}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                Phiên này chưa có lượt hội thoại nào để hiển thị.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
