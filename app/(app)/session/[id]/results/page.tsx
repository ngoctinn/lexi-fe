import { notFound } from "next/navigation";
import { getSession } from "@/features/session/actions/get-session";
import { ScoringResult } from "@/features/session/components/scoring/scoring-result";
import { ScoringSkeleton } from "@/features/session/components/scoring/scoring-skeleton";
import { TurnBubble } from "@/features/session/components/conversation/turn-bubble";
import type { Session, Turn } from "@/features/session/types/session.types";

export const metadata = {
  title: "Kết quả luyện nói",
};

interface SessionResultsPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionResultsPage({ params }: SessionResultsPageProps) {
  const { id } = await params;
  
  const { success, session } = await getSession(id);
  if (!success || !session) {
    notFound();
  }

  if (!session.scoring) {
    return <ScoringSkeleton />;
  }

  return (
    <div className="container py-8">
      <ScoringResult session={session as Session} />
      
      {session.turns && session.turns.length > 0 && (
        <div className="mt-16 w-full max-w-3xl mx-auto flex flex-col">
          <h3 className="text-2xl font-bold tracking-tight mb-8 pl-4">Lịch sử hội thoại</h3>
          <div className="flex flex-col gap-6">
            {session.turns.map((turn: Turn, idx: number) => (
              <TurnBubble
                key={`${turn.turn_index}-${idx}`}
                turn={turn}
                aiName={"AI"}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
