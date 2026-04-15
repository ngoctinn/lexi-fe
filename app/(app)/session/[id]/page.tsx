import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { getSession } from "@/features/session/actions/get-session";
import { ConversationScreen } from "@/features/session/components/conversation/conversation-screen";
import { SessionStatus } from "@/features/session/types/session.types";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: SessionPageProps
): Promise<Metadata> {
  const { id } = await params;
  const { session } = await getSession(id);
  
  const scenarioName = session?.scenario_name || "Luyện nói chuyên sâu";
  const aiName = session?.ai_name || "Alex";

  return {
    title: `${scenarioName} với ${aiName} | Lexi`,
    description: `Tham gia buổi hội thoại tiếng Anh cá nhân hóa về chủ đề ${scenarioName}.`,
    openGraph: {
      title: `${scenarioName} - Luyện nói cùng Lexi`,
      description: `Cải thiện giao tiếp tiếng Anh với AI Alex.`,
    }
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;
  
  const { success, session } = await getSession(id);
  if (!success || !session) {
    notFound();
  }

  return (
    <ConversationScreen 
      sessionId={session.session_id} 
      idToken="mock-token" 
      initialTurns={session.turns ?? []}
      scenarioName={session.scenario_name ?? "Luyện nói tự do"}
      aiName={session.ai_name ?? "Alex"}
      status={session.status ?? SessionStatus.ACTIVE}
    />
  );
}
