import { Showcase } from "@/features/showcase";
import { PageHeader } from "@/components/shared/page-header";
import { LayoutGrid } from "lucide-react";

export const metadata = {
  title: "UI Components Showcase - Lexi",
};

export default function ShowcasePage() {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader icon={LayoutGrid} title="Showcase" />

      <div className="flex-1 p-4 md:p-8">
        <Showcase />
      </div>
    </div>
  );
}
