"use client";

import * as React from "react";
import { PencilLine, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminScenario } from "@/features/admin/types";

function formatDateTime(value: string | undefined) {
  // Handle missing or invalid dates (e.g., from public scenarios)
  if (!value) {
    return "N/A";
  }
  
  try {
    const date = new Date(value);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "N/A";
    }
    
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "N/A";
  }
}

function getStatusMeta(isActive: boolean) {
  return isActive
    ? { label: "Đang mở", variant: "success" as const }
    : { label: "Đã ẩn", variant: "secondary" as const };
}

interface ScenarioTableProps {
  scenarios: AdminScenario[];
  onEdit: (scenario: AdminScenario) => void;
  onToggleActive: (scenario: AdminScenario) => void;
  isSaving: boolean;
}

export function ScenarioTable({
  scenarios,
  onEdit,
  onToggleActive,
  isSaving,
}: ScenarioTableProps) {

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kịch bản</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Vai trò & mục tiêu</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Lượt dùng</TableHead>
            <TableHead>Cập nhật</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scenarios.length > 0 ? (
            scenarios.map((scenario) => {
              const statusMeta = getStatusMeta(scenario.is_active);
              const level = scenario.difficulty_level ?? "B1";
              const roles = scenario.roles
                .map((r) => r.trim())
                .filter(Boolean)
                .slice(0, 2);

              return (
                <TableRow key={scenario.scenario_id}>
                  <TableCell className="whitespace-normal">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm">
                        #{scenario.order ?? "-"}
                      </Badge>
                      <p className="font-semibold leading-none text-foreground">
                        {scenario.scenario_title}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" size="sm">
                      {level}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-foreground">
                        {roles.join(" · ")}
                      </p>
                      <p className="text-muted-foreground">
                        {scenario.goals.length} mục tiêu
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusMeta.variant} size="sm">
                      {statusMeta.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-sm">
                      <div className="font-medium text-foreground">
                        {scenario.usage_count ?? 0}
                      </div>
                      <div className="text-2xs text-muted-foreground">lượt dùng</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(scenario.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant={scenario.is_active ? "soft-warning" : "soft-success"}
                        size="sm"
                        onClick={() => onToggleActive(scenario)}
                        disabled={isSaving}
                      >
                        {scenario.is_active ? "Ẩn" : "Kích hoạt"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onEdit(scenario)}>
                        <PencilLine className="size-4" />
                        Sửa
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="py-12 text-center">
                <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                  <SlidersHorizontal className="size-6 text-primary" />
                  <p className="font-medium text-foreground">Không tìm thấy kịch bản phù hợp</p>
                  <p className="text-sm">Thử đổi từ khóa tìm kiếm hoặc xóa bộ lọc hiện tại.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
