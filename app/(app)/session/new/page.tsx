import { getScenarios } from "@/features/session/actions/get-scenarios";
import { SessionSetupForm } from "@/features/session/components/setup/session-setup-form";
import { PageHeader } from "@/components/shared/page-header";
import { Mic } from "lucide-react";

export const metadata = {
  title: "Bắt đầu luyện nói",
};

export default async function NewSessionPage() {
  const scenarios = await getScenarios();

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6 overflow-hidden px-4 py-4 sm:px-6 lg:px-8 md:py-8">
      <PageHeader icon={Mic} title="Thiết lập cuộc trò chuyện" />
      <SessionSetupForm scenarios={scenarios} />
    </div>
  );
}
