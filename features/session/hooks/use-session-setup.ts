"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSession } from "@/features/session/actions/create-session";
import type {
  Scenario,
  CreateSessionDto,
} from "@/features/session/types/session.types";

interface UseSessionSetupProps {
  scenarios: Scenario[];
}

export function useSessionSetup({ scenarios }: UseSessionSetupProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [selectedUserRole, setSelectedUserRole] = React.useState("");
  const [selectedAiRole, setSelectedAiRole] = React.useState("");
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);

  const [formData, setFormData] = React.useState<CreateSessionDto>({
    scenario_id: scenarios[0]?.scenario_id ?? "",
    ai_gender: "female",
    level: "B1",
    prompt_snapshot: "",
  });

  const selectedScenario = React.useMemo(
    () => scenarios.find((s) => s.scenario_id === formData.scenario_id),
    [scenarios, formData.scenario_id],
  );

  const scenarioMap = React.useMemo(
    () => new Map(scenarios.map((s) => [s.scenario_id, s])),
    [scenarios],
  );

  const resolveScenarioRoles = React.useCallback((scenario: Scenario) => {
    return Array.from(new Set(scenario.roles.map((role) => role.trim())))
      .filter(Boolean)
      .slice(0, 2);
  }, []);

  const updateFormData = React.useCallback(
    <K extends keyof CreateSessionDto>(key: K, value: CreateSessionDto[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  React.useEffect(() => {
    if (!selectedScenario) return;

    const allRoles = resolveScenarioRoles(selectedScenario);

    // Khởi tạo vai mặc định nếu chưa có hoặc kịch bản thay đổi
    const defaultUserRole = allRoles[0] ?? "";
    const defaultAiRole =
      allRoles.find((r) => r !== defaultUserRole) ?? defaultUserRole;

    setSelectedUserRole((current) =>
      allRoles.includes(current) && current !== "" ? current : defaultUserRole,
    );
    setSelectedAiRole((current) =>
      allRoles.includes(current) && current !== "" ? current : defaultAiRole,
    );

    setSelectedGoals((current) => {
      const visible = selectedScenario.goals.filter((goal) =>
        current.includes(goal),
      );
      return visible.length > 0 ? visible : selectedScenario.goals;
    });
  }, [selectedScenario, resolveScenarioRoles]);

  // Tự động điều chỉnh vai AI nếu trùng với vai User khi User thay đổi
  // Nhưng không ép buộc nếu danh sách chỉ có 1 vai
  React.useEffect(() => {
    if (!selectedScenario || !selectedUserRole) return;
    const allRoles = resolveScenarioRoles(selectedScenario);

    if (selectedUserRole === selectedAiRole && allRoles.length > 1) {
      const nextAiRole = allRoles.find((r) => r !== selectedUserRole);
      if (nextAiRole) setSelectedAiRole(nextAiRole);
    }
  }, [
    selectedUserRole,
    selectedScenario,
    selectedAiRole,
    resolveScenarioRoles,
  ]);

  const buildPromptSnapshot = React.useCallback(() => {
    if (!selectedScenario) return "";

    const goals =
      selectedGoals.length > 0 ? selectedGoals : selectedScenario.goals;

    return [
      `Scenario: ${selectedScenario.scenario_title}`,
      `Learner role: ${selectedUserRole}`,
      `AI role: ${selectedAiRole}`,
      `Goals: ${goals.join(" | ")}`,
      `AI gender: ${formData.ai_gender}`,
      `Level: ${formData.level}`,
    ].join("\n");
  }, [
    formData,
    selectedAiRole,
    selectedScenario,
    selectedGoals,
    selectedUserRole,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScenario) {
      toast.error("Vui lòng chọn một kịch bản hợp lệ.");
      return;
    }

    if (selectedUserRole === selectedAiRole) {
      toast.error("Vai trò học viên và vai trò AI phải khác nhau.");
      return;
    }

    setIsPending(true);
    try {
      const selectedScenarioGoals =
        selectedGoals.length > 0 ? selectedGoals : selectedScenario.goals;

      const result = await createSession({
        ...formData,
        learner_role_id: selectedUserRole,
        ai_role_id: selectedAiRole,
        selected_goals: selectedScenarioGoals,
        prompt_snapshot: buildPromptSnapshot(),
      });

      if (result.success && result.session_id) {
        router.push(`/session/${result.session_id}`);
        return;
      }
      toast.error(result.error ?? "Không thể tạo phiên học. Vui lòng thử lại.");
    } catch {
      toast.error("Không thể tạo phiên học. Vui lòng thử lại.");
    } finally {
      setIsPending(false);
    }
  };

  return {
    state: {
      isPending,
      isSettingsOpen,
      selectedUserRole,
      selectedAiRole,
      selectedGoals,
      formData,
      selectedScenario,
      scenarioMap,
    },
    actions: {
      setIsSettingsOpen,
      setSelectedUserRole,
      setSelectedAiRole,
      setSelectedGoals,
      updateFormData,
      handleSubmit,
    },
  };
}
