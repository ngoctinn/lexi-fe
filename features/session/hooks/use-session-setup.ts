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
  const [prevScenarioId, setPrevScenarioId] = React.useState<string>("");

  const [formData, setFormData] = React.useState<CreateSessionDto>({
    scenario_id: scenarios[0]?.scenario_id ?? "",
    ai_character: "Sarah",
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

  // Derive roles từ selectedScenario
  const allRoles = React.useMemo(() => {
    if (!selectedScenario) return [];
    return getRoles(selectedScenario);
  }, [selectedScenario, getRoles]);

  // Derive default roles
  const defaultUserRole = React.useMemo(() => allRoles[0] ?? "", [allRoles]);
  const defaultAiRole = React.useMemo(
    () => allRoles[1] ?? defaultUserRole,
    [allRoles, defaultUserRole],
  );

  // Adjust state during render when scenario changes (React best practice)
  // This avoids setState in effect and cascading renders
  if (selectedScenario && selectedScenario.scenario_id !== prevScenarioId) {
    setPrevScenarioId(selectedScenario.scenario_id);
    setSelectedUserRole(defaultUserRole);
    setSelectedAiRole(defaultAiRole);
    setSelectedGoals(selectedScenario.goals);
  }

  // Derive valid roles (auto-switch if same)
  const validUserRole = allRoles.includes(selectedUserRole)
    ? selectedUserRole
    : defaultUserRole;

  const validAiRole = React.useMemo(() => {
    let aiRole = allRoles.includes(selectedAiRole)
      ? selectedAiRole
      : defaultAiRole;

    // Auto-switch nếu trùng user role
    if (aiRole === validUserRole && allRoles.length > 1) {
      aiRole = allRoles.find((r) => r !== validUserRole) ?? aiRole;
    }

    return aiRole;
  }, [selectedAiRole, allRoles, defaultAiRole, validUserRole]);

  // Derive valid goals
  const validGoals = React.useMemo(() => {
    if (!selectedScenario) return [];
    const validCurrent = selectedGoals.filter((g) =>
      selectedScenario.goals.includes(g),
    );
    return validCurrent.length > 0 ? validCurrent : selectedScenario.goals;
  }, [selectedGoals, selectedScenario]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedScenario) {
      toast.error("Vui lòng chọn một kịch bản hợp lệ.");
      return;
    }

    if (validUserRole === validAiRole) {
      toast.error("Vai trò học viên và vai trò AI phải khác nhau.");
      return;
    }

    setIsPending(true);
    try {
      const goals =
        validGoals.length > 0 ? validGoals[0] : selectedScenario.goals[0];

      // Tạo snapshot cho prompt
      const promptSnapshot = [
        `Scenario: ${selectedScenario.scenario_title}`,
        `Learner role: ${validUserRole}`,
        `AI role: ${validAiRole}`,
        `Goal: ${goals}`,
        `AI character: ${formData.ai_character}`,
        `Level: ${formData.level}`,
      ].join("\n");

      const result = await createSession({
        ...formData,
        user_role: validUserRole,
        ai_role: validAiRole,
        selected_goal: goals,
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
      selectedUserRole: validUserRole,
      selectedAiRole: validAiRole,
      selectedGoals: validGoals,
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
