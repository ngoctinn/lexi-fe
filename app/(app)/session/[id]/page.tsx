import { type Metadata } from "next";
import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/features/session/actions/get-session";
import { getScenarios } from "@/features/session/actions/get-scenarios";
import { ConversationScreen } from "@/features/session/components/conversation/conversation-screen";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

async function getSessionToken() {
  return runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: async (contextSpec) => {
      const session = await fetchAuthSession(contextSpec);

      return (
        session.tokens?.idToken?.toString() ??
        session.tokens?.accessToken?.toString() ??
        null
      );
    },
  });
}

export async function generateMetadata({
  params,
}: SessionPageProps): Promise<Metadata> {
  const { id } = await params;
  const [sessionResult, scenarios] = await Promise.all([
    getSession(id),
    getScenarios(),
  ]);

  const session = sessionResult.session;
  const scenario = scenarios.find(
    (item) => item.scenario_id === session?.scenario_id,
  );
  const scenarioTitle = scenario?.scenario_title ?? "Phiên luyện nói";
  const aiCharacter = scenario?.ai_character ?? "AI Assistant";

  return {
    title: `${scenarioTitle} với ${aiCharacter} | Lexi`,
    description: `Tham gia buổi hội thoại tiếng Anh cá nhân hóa về chủ đề ${scenarioTitle}.`,
    openGraph: {
      title: `${scenarioTitle} - Luyện nói cùng Lexi`,
      description: `Cải thiện giao tiếp tiếng Anh với ${aiCharacter}.`,
    },
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;

  const [{ success, session }, scenarios, idToken] = await Promise.all([
    getSession(id),
    getScenarios(),
    getSessionToken(),
  ]);
  if (!success || !session) {
    notFound();
  }

  if (!idToken) {
    redirect("/login");
  }

  const scenario = scenarios.find(
    (item) => item.scenario_id === session.scenario_id,
  );

  return (
    <ConversationScreen
      sessionId={session.session_id}
      idToken={idToken}
      initialTurns={session.turns ?? []}
      scenarioTitle={scenario?.scenario_title ?? "Phiên luyện nói"}
      aiCharacter={scenario?.ai_character ?? "AI Assistant"}
      scenarioGoals={scenario?.goals ?? []}
      myRole={scenario?.my_character}
      partnerRole={scenario?.ai_character}
    />
  );
}
