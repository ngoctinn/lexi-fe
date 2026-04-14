import { notFound } from "next/navigation";
import { type Metadata, type ResolvingMetadata } from "next";
import { getSession } from "@/features/session/actions/get-session";
import { ConversationScreen } from "@/features/session/components/conversation/conversation-screen";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(
  { params }: SessionPageProps,
  parent: ResolvingMetadata
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

  // Fallback for UI until backend is fully integrated
  const sessionData = session ?? { 
    session_id: id, 
    turns: [],
    scenario_name: "Luyện nói tự do",
    ai_name: "Alex"
  } as any;

  // ID token is mocked. In production, this should come from server-side cookies/auth session.
  const idToken = "mock-token";

  return (
    <ConversationScreen 
      sessionId={sessionData.session_id} 
      idToken={idToken} 
      initialTurns={sessionData.turns ?? []}
      scenarioName={sessionData.scenario_name}
      aiName={sessionData.ai_name}
    />
  );
}
