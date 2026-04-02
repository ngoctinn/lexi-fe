import { getScenarios } from "@/features/session/actions/get-scenarios";
import { SessionSetupForm } from "@/features/session/components/setup/session-setup-form";

export const metadata = {
  title: "Bắt đầu luyện nói",
};

export default async function NewSessionPage() {
  const scenarios = await getScenarios();

  return (
    <div className="mx-auto w-full max-w-7xl h-full overflow-hidden flex flex-col py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 mb-8 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">Thiết lập cuộc trò chuyện</h1>
        <p className="text-muted-foreground">
          Chọn kịch bản và diễn vai để AI có thể hỗ trợ bạn tốt nhất trong buổi luyện nói.
        </p>
      </div>
      <SessionSetupForm scenarios={scenarios} />
    </div>
  );
}
