import { Dashboard } from "@/features/dashboard";
import { PageHeader } from "@/components/shared/page-header";
import { House } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={House} title="Trang chủ" />

      <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <Dashboard />
      </main>
    </div>
  );
}
