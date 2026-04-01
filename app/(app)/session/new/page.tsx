import { getScenarios } from "@/features/session/actions/get-scenarios";
import { SessionSetupForm } from "@/features/session/components/session-setup-form";

export const metadata = {
  title: "Bắt đầu luyện nói",
};

export default async function NewSessionPage() {
  const scenarios = await getScenarios();

  return (
    <div className="container max-w-2xl py-8">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Thiết lập cuộc trò chuyện</h1>
        <p className="text-muted-foreground">
          Chọn kịch bản và diễn vai để AI có thể hỗ trợ bạn tốt nhất trong buổi luyện nói.
        </p>
      </div>
      <SessionSetupForm scenarios={scenarios} />
    </div>
  );
}
