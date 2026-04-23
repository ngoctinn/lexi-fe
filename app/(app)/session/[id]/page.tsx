import { type Metadata } from "next";
import { cookies } from "next/headers";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { Button } from "@/components/ui/button";
import { connection } from "next/server";
import { getSession } from "@/features/session/actions/get-session";
import { getScenarios } from "@/features/session/actions/get-scenarios";
import { ConversationScreen } from "@/features/session/components/conversation/conversation-screen";
import type {
  Scenario,
  Session,
  SessionScoreSummary,
} from "@/features/session/types/session.types";
import { runWithAmplifyServerContext } from "@/lib/amplify-server";

interface SessionPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

type SessionPageData = {
  session: Session | null;
  scenarios: Scenario[];
  sessionError: string | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Không thể tải dữ liệu phiên luyện nói.";
}

function isMissingSessionError(errorMessage: string | null): boolean {
  return Boolean(errorMessage && /không tồn tại|not found/i.test(errorMessage));
}

function isUnauthorizedError(errorMessage: string | null): boolean {
  return Boolean(errorMessage && /unauthorized|401/i.test(errorMessage));
}

const loadSessionPageData = cache(
  async (sessionId: string): Promise<SessionPageData> => {
    const [sessionOutcome, scenariosOutcome] = await Promise.allSettled([
      getSession(sessionId),
      getScenarios(),
    ]);

    let session: Session | null = null;
    let sessionError: string | null = null;

    if (sessionOutcome.status === "fulfilled") {
      if (sessionOutcome.value.success && sessionOutcome.value.session) {
        session = sessionOutcome.value.session;
      } else {
        sessionError = sessionOutcome.value.error ?? "Phiên học không tồn tại.";
      }
    } else {
      sessionError = getErrorMessage(sessionOutcome.reason);
    }

    const scenarios =
      scenariosOutcome.status === "fulfilled" ? scenariosOutcome.value : [];

    return {
      session,
      scenarios,
      sessionError,
    };
  },
);

function SessionUnavailableState({
  callbackUrl,
  message,
}: {
  callbackUrl: string;
  message: string;
}) {
  return (
    <div className="flex min-h-[100svh] items-center justify-center px-6 py-12">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 px-8 py-10 text-slate-50 shadow-2xl shadow-slate-950/30 sm:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.22),transparent_55%)]" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
            Phiên luyện nói tạm thời chưa sẵn sàng
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Không thể mở phiên hội thoại
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            {message}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-emerald-400 text-slate-950 hover:bg-emerald-300">
              <Link href="/session/new">Tạo phiên mới</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="bg-white/10 text-slate-50 hover:bg-white/20"
            >
              <Link href={callbackUrl}>Thử lại</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
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
  const { session, scenarios } = await loadSessionPageData(id);
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

export default async function SessionPage({ params, searchParams }: SessionPageProps) {
  await connection();
  const { id } = await params;
  const { new: newParam } = await searchParams;
  const isNewSession = newParam === "1";
  const isDevMockSession =
    process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_WS_URL;
  const callbackUrl = `/session/${id}`;
  const idToken = await getSessionToken().catch(() => null);

  if (!idToken && !isDevMockSession) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const { session, scenarios, sessionError } = await loadSessionPageData(id);

  if (isUnauthorizedError(sessionError)) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  if (!session) {
    if (!sessionError || isMissingSessionError(sessionError)) {
      notFound();
    }

    return (
      <SessionUnavailableState
        callbackUrl={callbackUrl}
        message={sessionError}
      />
    );
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
      isNewSession={isNewSession}
    />
  );
}
