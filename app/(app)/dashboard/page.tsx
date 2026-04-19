import { Dashboard } from "@/features/dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { House } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={House} title="Trang chủ" />

      <div className="flex-1 p-4 md:p-8">
        <div className="flex flex-col gap-6">
          <Dashboard />
        </div>
      </div>
    </div>
  );
}
