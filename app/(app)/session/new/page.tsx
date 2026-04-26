import { getSessions } from "@/features/session/actions/get-sessions";
import { getScenarios } from "@/features/session/actions/get-scenarios";
import { SessionSetupForm } from "@/features/session/components/setup/session-setup-form";
import { PageHeader } from "@/components/shared/page-header";
import { Map } from "lucide-react";

export const metadata = {
  title: "Lộ trình luyện nói",
};

export const revalidate = 0; // Disable cache - always fresh

export default async function NewSessionPage() {
  const [scenarios, sessions] = await Promise.all([
    getScenarios(),
    getSessions(),
  ]);

  return (
    // flex-col + flex-1 → fill toàn bộ SidebarInset, không scroll page
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader icon={Map} title="Lộ trình luyện nói" />

      {/*
        px/py: padding ngang, không padding dọc để form dùng hết chiều cao.
        flex-1 + overflow-hidden: form tự quản lý scroll bên trong.
      */}
      <div className="flex flex-1 overflow-hidden px-4 sm:px-6 lg:px-8 py-6">
        <SessionSetupForm
          scenarios={scenarios}
          sessions={sessions}
          className="w-full"
        />
      </div>
    </div>
  );
}
