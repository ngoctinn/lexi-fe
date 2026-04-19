import { Showcase } from "@/features/showcase";
import { PageHeader } from "@/components/shared/page-header";
import { LayoutGrid } from "lucide-react";
import { Dashboard } from "@/features/dashboard";

export const metadata = {
  title: "UI Components Showcase - Lexi",
};

export default async function ShowcasePage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={LayoutGrid} title="Showcase" />

      <div className="flex-1 p-4 md:p-8">
        <Showcase dashboard={<Dashboard />} />
      </div>
    </div>
  );
}
