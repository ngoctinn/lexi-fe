"use client";

import * as React from "react";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AdminScenario } from "@/features/admin/types";
import { useScenariosManagement } from "../../hooks/use-scenarios-management";
import { ScenarioMetrics } from "./scenario-metrics";
import { ScenarioTable } from "./scenario-table";
import { ScenarioFormSheet } from "./scenario-form-sheet";

const SCENARIO_STATUS_TABS: Array<{
  value: "all" | "active" | "inactive";
  label: string;
}> = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Đang mở" },
  { value: "inactive", label: "Đã ẩn" },
];

interface ScenariosManagementProps {
  scenarios: AdminScenario[];
}

export function ScenariosManagement({ scenarios }: ScenariosManagementProps) {
  const {
    visibleScenarios,
    summary,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    isDialogOpen,
    setIsDialogOpen,
    draft,
    isSaving,
    updateDraft,
    handleOpenCreate,
    handleOpenEdit,
    handleSave,
    handleToggleActive,
  } = useScenariosManagement(scenarios);

  return (
    <div className="flex flex-col gap-6">
      {/* Metrics Section */}
      <ScenarioMetrics
        total={summary.active + summary.inactive}
        active={summary.active}
        inactive={summary.inactive}
        totalUsage={summary.totalUsage}
      />

      {/* Main Content Section */}
      <Card size="lg" className="border-border/60">
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Bảng kịch bản</h2>
                <Badge variant="secondary" size="sm">
                  {visibleScenarios.length}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Sắp xếp, bật/tắt và cập nhật các tình huống luyện nói cho học viên.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:items-center">
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm tiêu đề, context, vai trò..."
                  className="pl-9"
                />
              </div>
              <Button onClick={handleOpenCreate} className="shrink-0">
                <Plus className="size-4" />
                Thêm kịch bản
              </Button>
            </div>
          </div>

          <Tabs
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as any)}
            className="w-fit"
          >
            <TabsList className="flex-wrap justify-start">
              {SCENARIO_STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <ScenarioTable
            scenarios={visibleScenarios}
            onEdit={handleOpenEdit}
            onToggleActive={handleToggleActive}
            isSaving={isSaving}
          />
        </CardContent>
      </Card>

      {/* Form Sheet */}
      <ScenarioFormSheet
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        draft={draft}
        isSaving={isSaving}
        onUpdateDraft={updateDraft}
        onSave={handleSave}
      />
    </div>
  );
}
