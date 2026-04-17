import { getScenarios } from "@/features/session/actions/get-scenarios";
import { SessionSetupForm } from "@/features/session/components/setup/session-setup-form";
import { PageHeader } from "@/components/shared/page-header";
import { Map } from "lucide-react";

export const metadata = {
  title: "Lộ trình luyện nói",
};

export default async function NewSessionPage() {
  const scenarios = await getScenarios();

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={Map} title="Lộ trình luyện nói" />
      
      <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
        <SessionSetupForm scenarios={scenarios} />
      </div>
    </div>
  );
}
