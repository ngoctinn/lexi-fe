import { Dashboard } from "@/features/dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { House } from "lucide-react";
import { StreakBadge } from "@/features/dashboard/components/streak-badge";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4 md:p-8">
      <PageHeader
        icon={House}
        title="Trang chủ"
        actions={<StreakBadge streak={14} />}
      />

      <Dashboard />
    </div>
  );
}
