import { type Metadata } from "next";
import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/features/session/actions/get-session";
import { getScenarios } from "@/features/session/actions/get-scenarios";
import { ConversationScreen } from "@/features/session/components/conversation/conversation-screen";
import type { SessionScoreSummary } from "@/features/session/types/session.types";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";
import {
  MOCK_AUTH_COOKIE_NAME,
  MOCK_AUTH_COOKIE_VALUE,
  MOCK_SESSION_TOKEN,
} from "@/features/auth/mock-auth";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

async function getSessionToken() {
  const cookieStore = await cookies();

  if (
    cookieStore.get(MOCK_AUTH_COOKIE_NAME)?.value === MOCK_AUTH_COOKIE_VALUE
  ) {
    return MOCK_SESSION_TOKEN;
  }

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
  const aiCharacter = scenario?.roles?.[1] ?? "AI Assistant";

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
  const isDevMockSession =
    process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_WS_URL;
  const callbackUrl = `/session/${id}`;

  const [{ success, session }, scenarios, idToken] = await Promise.all([
    getSession(id),
    getScenarios(),
    getSessionToken(),
  ]);
  if (!success || !session) {
    notFound();
  }

  if (!idToken && !isDevMockSession) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const scenario = scenarios.find(
    (item) => item.scenario_id === session.scenario_id,
  );
  const scenarioRoles = scenario?.roles ?? [];
  const learnerRole = session.learner_role_id ?? scenarioRoles[0] ?? "Học viên";
  const aiRole = session.ai_role_id ?? scenarioRoles[1] ?? "AI Assistant";

  const initialSummary: SessionScoreSummary | null = session.scoring
    ? {
        scoring: session.scoring,
        totalTurns: session.total_turns || session.turns?.length || 0,
        hintUsedCount: session.hint_used_count || 0,
      }
    : null;

  return (
    <ConversationScreen
      sessionId={session.session_id}
      idToken={idToken ?? ""}
      initialTurns={session.turns ?? []}
      initialSummary={initialSummary}
      scenarioTitle={scenario?.scenario_title ?? "Phiên luyện nói"}
      aiCharacter={aiRole}
      scenarioGoals={scenario?.goals ?? []}
      myRole={learnerRole}
      partnerRole={aiRole}
    />
  );
}
