"use client";

import * as React from "react";
import { toast } from "sonner";
import { upsertAdminScenario } from "@/features/admin/actions/admin.actions";
import type { AdminScenario } from "@/features/admin/types";
import { DEFAULT_SCENARIO_CONTEXT } from "@/features/session/constants/scenario-contexts";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getScenarioRoles(scenario: AdminScenario) {
  return scenario.roles
    .map((role) => role.trim())
    .filter(Boolean)
    .slice(0, 2);
}

function createEmptyScenario(order: number, now?: string): AdminScenario {
  const finalNow = now || new Date(0).toISOString();

  return {
    scenario_id: "",
    scenario_title: "",
    context: DEFAULT_SCENARIO_CONTEXT,
    roles: [],
    goals: [],
    is_active: true,
    usage_count: 0,
    difficulty_level: "A2",
    order,
    updated_at: finalNow,
    notes: "",
  };
}

export function useScenariosManagement(scenarios: AdminScenario[]) {
  // Use scenarios directly instead of syncing to state
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<AdminScenario>(() =>
    createEmptyScenario(1),
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [localUpdates, setLocalUpdates] = React.useState<AdminScenario[]>([]);

  // Merge server data with local updates
  const records = React.useMemo(() => {
    const merged = [...scenarios];
    localUpdates.forEach(updated => {
      const index = merged.findIndex(s => s.scenario_id === updated.scenario_id);
      if (index >= 0) {
        merged[index] = updated;
      } else {
        merged.unshift(updated);
      }
    });
    return merged;
  }, [scenarios, localUpdates]);

  const visibleScenarios = React.useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return [...records]
      .filter((scenario) => {
        if (statusFilter === "active" && !scenario.is_active) return false;
        if (statusFilter === "inactive" && scenario.is_active) return false;
        if (!normalizedQuery) return true;

        return normalizeSearch(
          [
            scenario.scenario_title,
            scenario.context,
            scenario.notes,
            scenario.goals.join(" "),
            scenario.roles.join(" "),
          ].join(" "),
        ).includes(normalizedQuery);
      })
      .sort((left, right) => {
        const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return left.scenario_title.localeCompare(right.scenario_title, "vi");
      });
  }, [query, records, statusFilter]);

  const summary = React.useMemo(() => {
    const active = records.filter((scenario) => scenario.is_active).length;
    const inactive = records.length - active;
    const totalUsage = records.reduce(
      (sum, scenario) => sum + scenario.usage_count,
      0,
    );

    return { active, inactive, totalUsage };
  }, [records]);

  const updateDraft = <K extends keyof AdminScenario>(
    key: K,
    value: AdminScenario[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleOpenCreate = () => {
    const nextOrder = records.length + 1;
    const now = new Date().toISOString();

    setDraft(createEmptyScenario(nextOrder, now));
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (scenario: AdminScenario) => {
    const roles = getScenarioRoles(scenario);

    setDraft({
      ...scenario,
      context: scenario.context || DEFAULT_SCENARIO_CONTEXT,
      roles,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!draft.scenario_title.trim()) {
      toast.error("Vui lòng nhập tiêu đề cho kịch bản.");
      return;
    }

    if (draft.goals.length === 0) {
      toast.error("Cần ít nhất một mục tiêu luyện tập.");
      return;
    }

    if (!draft.context.trim()) {
      toast.error("Vui lòng chọn chủ đề cho kịch bản.");
      return;
    }

    const roles = getScenarioRoles(draft);

    if (roles.length !== 2) {
      toast.error("Vui lòng nhập đúng 2 vai trò.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await upsertAdminScenario({
        ...draft,
        scenario_title: draft.scenario_title.trim(),
        context: draft.context.trim(),
        roles,
        goals: draft.goals.map((goal) => goal.trim()).filter(Boolean),
        notes: draft.notes.trim(),
      });

      if (!result.success || !result.scenario) {
        toast.error(result.error ?? "Không thể lưu kịch bản.");
        return;
      }

      const updatedScenario = result.scenario;

      setLocalUpdates((current) => {
        const exists = current.some(
          (item) => item.scenario_id === updatedScenario.scenario_id,
        );

        if (exists) {
          return current.map((item) =>
            item.scenario_id === updatedScenario.scenario_id
              ? updatedScenario
              : item,
          );
        }

        return [updatedScenario, ...current];
      });

      setIsDialogOpen(false);
      toast.success("Đã lưu kịch bản.");
    } catch {
      toast.error("Không thể lưu kịch bản. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (scenario: AdminScenario) => {
    setIsSaving(true);

    try {
      const result = await upsertAdminScenario({
        ...scenario,
        is_active: !scenario.is_active,
      });

      if (!result.success || !result.scenario) {
        toast.error(result.error ?? "Không thể cập nhật trạng thái.");
        return;
      }

      const updatedScenario = result.scenario;

      setLocalUpdates((current) => {
        const exists = current.some(
          (item) => item.scenario_id === updatedScenario.scenario_id,
        );

        if (exists) {
          return current.map((item) =>
            item.scenario_id === updatedScenario.scenario_id
              ? updatedScenario
              : item,
          );
        }

        return [updatedScenario, ...current];
      });

      toast.success(
        updatedScenario.is_active ? "Đã bật kịch bản." : "Đã ẩn kịch bản.",
      );
    } catch {
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    records,
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
  };
}
