import { notFound } from "next/navigation";
import { getSession } from "@/features/session/actions/get-session";
import { ConversationScreen } from "@/features/session/components/conversation/conversation-screen";

export const metadata = {
  title: "Luyện nói chuyên sâu",
};

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;
  
  // NOTE: This throws during build/dev if auth is missing and it's a real API call.
  // Until backend is ready, we let it fail or mock the check.
  const { success, session } = await getSession(id);

  // If we really couldn't fetch the session (API 404), return notFound.
  // Uncomment below when backend API endpoints are stable.
  // if (!success || !session) return notFound();

  // Temporary dummy session prop for UI until backend is connected
  const dummySession = session ?? { session_id: id, turns: [] } as any;

  // ID token is mocked as empty until Cognito auth is fully plugged into cookies
  const idToken = "";

  return (
    <ConversationScreen 
      sessionId={dummySession.session_id} 
      idToken={idToken} 
      initialTurns={dummySession.turns ?? []}
    />
  );
}
