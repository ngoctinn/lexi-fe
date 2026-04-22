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

  const updateFormData = React.useCallback(
    <K extends keyof CreateSessionDto>(key: K, value: CreateSessionDto[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Helper để lấy danh sách vai từ kịch bản
  const getRoles = React.useCallback((scenario: Scenario) => {
    return Array.from(new Set(scenario.roles.map((role) => role.trim())))
      .filter(Boolean)
      .slice(0, 2);
  }, []);

  // Khởi tạo và đồng bộ vai/mục tiêu khi kịch bản thay đổi
  React.useEffect(() => {
    if (!selectedScenario) return;

    const allRoles = getRoles(selectedScenario);
    const defaultUserRole = allRoles[0] ?? "";
    const defaultAiRole = allRoles[1] ?? defaultUserRole;

    setSelectedUserRole((prev) =>
      allRoles.includes(prev) && prev !== "" ? prev : defaultUserRole,
    );
    setSelectedAiRole((prev) =>
      allRoles.includes(prev) && prev !== "" ? prev : defaultAiRole,
    );

    setSelectedGoals((prev) => {
      const validCurrent = prev.filter((g) =>
        selectedScenario.goals.includes(g),
      );
      return validCurrent.length > 0 ? validCurrent : selectedScenario.goals;
    });
  }, [selectedScenario, getRoles]);

  // Tự động đổi vai AI nếu trùng vai User (khi danh sách có > 1 vai)
  React.useEffect(() => {
    if (!selectedScenario || !selectedUserRole) return;
    const allRoles = getRoles(selectedScenario);

    if (selectedUserRole === selectedAiRole && allRoles.length > 1) {
      const nextAiRole = allRoles.find((r) => r !== selectedUserRole);
      if (nextAiRole) setSelectedAiRole(nextAiRole);
    }
  }, [selectedUserRole, selectedScenario, selectedAiRole, getRoles]);

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
      const goals =
        selectedGoals.length > 0 ? selectedGoals : selectedScenario.goals;

      // Tạo snapshot cho prompt
      const promptSnapshot = [
        `Scenario: ${selectedScenario.scenario_title}`,
        `Learner role: ${selectedUserRole}`,
        `AI role: ${selectedAiRole}`,
        `Goals: ${goals.join(" | ")}`,
        `AI gender: ${formData.ai_gender}`,
        `Level: ${formData.level}`,
      ].join("\n");

      const result = await createSession({
        ...formData,
        learner_role_id: selectedUserRole,
        ai_role_id: selectedAiRole,
        selected_goals: goals,
        prompt_snapshot: promptSnapshot,
      });

      if (result.success && result.session_id) {
        router.push(`/session/${result.session_id}?new=1`);
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
