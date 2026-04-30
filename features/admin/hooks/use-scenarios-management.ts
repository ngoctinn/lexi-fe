"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  createAdminScenario,
  updateAdminScenario,
} from "@/features/admin/actions/admin.actions";
import type { AdminScenario, CreateAdminScenarioRequest, UpdateAdminScenarioRequest } from "@/features/admin/types";
import { DEFAULT_SCENARIO_CONTEXT } from "@/features/session/constants/scenario-contexts";

/**
 * UI representation of scenario with roles as object for easier form handling
 */
interface ScenarioDraft extends Omit<AdminScenario, "roles"> {
  roles: {
    user_role: string;
    ai_role: string;
  };
}

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function createEmptyScenario(order: number, now?: string): ScenarioDraft {
  const finalNow = now || new Date(0).toISOString();

  return {
    scenario_id: "",
    scenario_title: "",
    context: DEFAULT_SCENARIO_CONTEXT,
    roles: {
      user_role: "",
      ai_role: "",
    },
    goals: [],
    is_active: true,
    usage_count: 0,
    difficulty_level: "A2",
    order,
    created_at: finalNow,
    updated_at: finalNow,
    notes: "",
  };
}

/**
 * Convert API scenario (roles as array) to UI draft (roles as object)
 */
function scenarioToDraft(scenario: AdminScenario): ScenarioDraft {
  return {
    ...scenario,
    roles: {
      user_role: scenario.roles[0] || "",
      ai_role: scenario.roles[1] || "",
    },
  };
}

/**
 * Convert UI draft (roles as object) to API format (roles as array)
 */
function draftToApiPayload(draft: ScenarioDraft): CreateAdminScenarioRequest | UpdateAdminScenarioRequest {
  return {
    scenario_title: draft.scenario_title.trim(),
    context: draft.context.trim(),
    difficulty_level: draft.difficulty_level,
    roles: [draft.roles.user_role.trim(), draft.roles.ai_role.trim()],
    goals: draft.goals.map((goal) => goal.trim()).filter(Boolean),
    order: draft.order,
    notes: draft.notes?.trim() || "",
    is_active: draft.is_active,
  };
}

export function useScenariosManagement(scenarios: AdminScenario[]) {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<ScenarioDraft>(() =>
    createEmptyScenario(1)
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [localUpdates, setLocalUpdates] = React.useState<AdminScenario[]>([]);

  // Merge server data with local updates
  const records = React.useMemo(() => {
    const merged = [...scenarios];
    localUpdates.forEach((updated) => {
      const index = merged.findIndex(
        (s) => s.scenario_id === updated.scenario_id
      );
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
            scenario.roles[0],
            scenario.roles[1],
          ].join(" ")
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
    const totalUsage = records.reduce((sum, s) => sum + (s.usage_count || 0), 0);

    return { active, inactive, totalUsage };
  }, [records]);

  const updateDraft = <K extends keyof ScenarioDraft>(
    key: K,
    value: ScenarioDraft[K]
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
    setDraft(scenarioToDraft({
      ...scenario,
      context: scenario.context || DEFAULT_SCENARIO_CONTEXT,
    }));
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

    if (!draft.roles.user_role.trim() || !draft.roles.ai_role.trim()) {
      toast.error("Vui lòng nhập đầy đủ 2 vai trò (người học có thể swap giữa 2 vai trò này).");
      return;
    }

    setIsSaving(true);

    try {
      const payload = draftToApiPayload(draft);

      const result = draft.scenario_id
        ? await updateAdminScenario(draft.scenario_id, payload)
        : await createAdminScenario(payload as CreateAdminScenarioRequest);

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Không thể lưu kịch bản.");
        return;
      }

      const updatedScenario = result.data;

      setLocalUpdates((current) => {
        const exists = current.some(
          (item) => item.scenario_id === updatedScenario.scenario_id
        );

        if (exists) {
          return current.map((item) =>
            item.scenario_id === updatedScenario.scenario_id
              ? updatedScenario
              : item
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
      const result = await updateAdminScenario(scenario.scenario_id, {
        is_active: !scenario.is_active,
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Không thể cập nhật trạng thái.");
        return;
      }

      const updatedScenario = result.data;

      setLocalUpdates((current) => {
        const exists = current.some(
          (item) => item.scenario_id === updatedScenario.scenario_id
        );

        if (exists) {
          return current.map((item) =>
            item.scenario_id === updatedScenario.scenario_id
              ? updatedScenario
              : item
          );
        }

        return [updatedScenario, ...current];
      });

      toast.success(
        updatedScenario.is_active ? "Đã bật kịch bản." : "Đã ẩn kịch bản."
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
