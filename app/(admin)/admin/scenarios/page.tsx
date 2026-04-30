import Link from "next/link";
import { ShieldCheck, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminScenarios } from "@/features/admin/actions/admin.actions";
import { ScenariosManagement } from "@/features/admin/components/scenarios/scenarios-management";

export const dynamic = 'force-dynamic';

export default async function AdminScenariosPage() {
  const scenarios = await getAdminScenarios();

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        icon={SlidersHorizontal}
        title="Kịch bản"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" size="sm">
              {scenarios.filter((scenario) => scenario.is_active).length}/
              {scenarios.length} đang mở
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">
                <ShieldCheck className="size-4" />
                Tổng quan
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-4 md:p-8">
        <ScenariosManagement scenarios={scenarios} />
      </div>
    </div>
  );
}