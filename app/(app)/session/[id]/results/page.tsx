import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/features/session/actions/get-session";
import { getScenarios } from "@/features/session/actions/get-scenarios";
import { ScoringResult } from "@/features/session/components/scoring/scoring-result";
import { ScoringSkeleton } from "@/features/session/components/scoring/scoring-skeleton";
import { TurnBubble } from "@/features/session/components/conversation/turn-bubble";
import type { Session, Turn } from "@/features/session/types/session.types";
import { PageHeader } from "@/components/shared/page-header";
import { BadgeCheck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    return <ScoringSkeleton />;
  }

  return (
    <div className="container flex flex-col gap-6 py-8">
      <PageHeader
        icon={BadgeCheck}
        title="Kết quả luyện nói"
        actions={
          <Button asChild>
            <Link href="/session/new">
              <Plus data-icon="inline-start" />
              Luyện bài khác
            </Link>
          </Button>
        }
      />

      <ScoringResult session={session as Session} />

      {session.turns && session.turns.length > 0 && (
        <div className="mt-16 w-full max-w-3xl mx-auto flex flex-col">
          <h3 className="text-2xl font-bold tracking-tight mb-8 pl-4">
            Lịch sử hội thoại
          </h3>
          <div className="flex flex-col gap-6">
            {session.turns.map((turn: Turn, idx: number) => (
              <TurnBubble
                key={`${turn.turn_index}-${idx}`}
                turn={turn}
                aiName={scenario?.ai_character ?? "AI"}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
