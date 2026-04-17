"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// Removed DropdownMenu imports as we moved to inline soft checkboxes
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LearningPath } from "./learning-path";
import { createSession } from "@/features/session/actions/create-session";
import type {
  Scenario,
  CreateSessionDto,
} from "@/features/session/types/session.types";
import { toast } from "sonner";

const CONTEXT_LABELS: Record<string, string> = {
  work: "Công việc",
  daily_life: "Đời sống",
  travel: "Du lịch",
  social: "Giao tiếp",
  world: "Khám phá",
  food: "Ẩm thực",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  A1: "Cơ bản",
  A2: "Căn bản",
  B1: "Trung cấp",
  B2: "Trung cấp khá",
  C1: "Cao cấp",
  C2: "Thành thạo",
};

function getContextLabel(context: string) {
  return CONTEXT_LABELS[context] ?? context;
}

interface SessionSetupFormProps extends React.ComponentProps<"form"> {
  scenarios: Scenario[];
}

export function SessionSetupForm({
  scenarios,
  className,
  ...props
}: SessionSetupFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [selectedUserRole, setSelectedUserRole] = React.useState("");
  const [selectedAiRole, setSelectedAiRole] = React.useState("");
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);

  const [formData, setFormData] = React.useState<CreateSessionDto>({
    scenario_id: scenarios[0]?.scenario_id ?? "",
    ai_gender: "female",
    level: "B1",
    prompt_snapshot: "",
  });

  const set = <K extends keyof CreateSessionDto>(
    key: K,
    value: CreateSessionDto[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Scenario đang được chọn
  const selectedScenario = React.useMemo(
    () => scenarios.find((s) => s.scenario_id === formData.scenario_id),
    [scenarios, formData.scenario_id],
  );

  // Cập nhật roles và goals khi scenario thay đổi
  React.useEffect(() => {
    if (!selectedScenario) return;

    setSelectedUserRole((current) =>
      selectedScenario.user_roles.includes(current)
        ? current
        : (selectedScenario.user_roles[0] ?? ""),
    );
    setSelectedAiRole((current) =>
      selectedScenario.ai_roles.includes(current)
        ? current
        : (selectedScenario.ai_roles[0] ?? ""),
    );
    setSelectedGoals((current) => {
      const visible = selectedScenario.goals.filter((g) => current.includes(g));
      return visible.length > 0 ? visible : selectedScenario.goals;
    });
  }, [selectedScenario]);

  const buildPromptSnapshot = React.useCallback(() => {
    if (!selectedScenario) return "";

    const userRole = selectedUserRole || selectedScenario.user_roles[0] || "";
    const aiRole = selectedAiRole || selectedScenario.ai_roles[0] || "";
    const goals = selectedGoals.length > 0 ? selectedGoals : selectedScenario.goals;

    return [
      `Scenario: ${selectedScenario.scenario_title}`,
      `Context: ${selectedScenario.context}`,
      `User role: ${userRole}`,
      `AI role: ${aiRole}`,
      `My character: ${selectedScenario.my_character}`,
      `AI character: ${selectedScenario.ai_character}`,
      `Goals: ${goals.join(" | ")}`,
      `AI gender: ${formData.ai_gender}`,
    ].join("\n");
  }, [
    formData.ai_gender,
    selectedAiRole,
    selectedScenario,
    selectedUserRole,
    selectedGoals,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedScenario) {
      toast.error("Vui lòng chọn một kịch bản hợp lệ.");
      return;
    }

    setIsPending(true);

    const finalDto: CreateSessionDto = {
      ...formData,
      prompt_snapshot: buildPromptSnapshot(),
    };

    try {
      const result = await createSession(finalDto);

      if (result.success && result.session_id) {
        router.push(`/session/${result.session_id}`);
        return;
      }

      toast.error(result.error ?? "Không thể tạo phiên học. Vui lòng thử lại.");
      setIsPending(false);
    } catch {
      toast.error("Không thể tạo phiên học. Vui lòng thử lại.");
      setIsPending(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex h-full w-full", className)}
      {...props}
    >
      {/* ── Cột trái: Lộ trình học (scroll độc lập) ─────────────────────── */}
      <div className="flex w-full lg:w-3/5 flex-col overflow-y-auto pr-2 custom-scrollbar">
        <div className="flex flex-col items-center justify-start py-6">
          {/* Title */}
          <div className="mb-8 w-full max-w-xs text-center">
            <h2 className="text-lg font-bold tracking-tight">Lộ trình luyện nói</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Chọn tình huống phù hợp để bắt đầu
            </p>
          </div>

          <LearningPath
            scenarios={scenarios}
            value={formData.scenario_id}
            onSelect={(id) => set("scenario_id", id)}
          />
        </div>
      </div>

      {/* ── Cột phải: Chi tiết + cấu hình (cố định, không scroll) ──────── */}
      <div className="hidden shrink-0 lg:flex lg:w-2/5 flex-col pl-8 border-l border-border/60">
        {selectedScenario ? (
          <div className="flex h-full flex-col gap-6">
            {/* Scenario header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold tracking-tight leading-snug line-clamp-2">
                  {selectedScenario.scenario_title}
                </h2>
                <Badge variant="default" className="rounded-full text-[10px] font-bold px-2.5 py-0.5 shrink-0">
                  {getContextLabel(selectedScenario.context)} • {selectedScenario.difficulty_level}
                </Badge>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/60" />

            {/* Cấu hình */}
            {/* Cấu hình */}
            <FieldGroup className="flex-1 overflow-y-auto pr-1 custom-scrollbar gap-8">
              {/* Mục tiêu */}
              <Field>
                <div className="flex items-center justify-between mb-1">
                  <FieldLabel className="text-foreground/80">
                    Mục tiêu luyện tập
                  </FieldLabel>
                  <span className="text-[10px] font-medium text-muted-foreground/50">
                    {selectedGoals.length}/{selectedScenario.goals.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {selectedScenario.goals.map((goal) => {
                    const isSelected = selectedGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => {
                          setSelectedGoals((current) => {
                            const next = isSelected
                              ? current.filter((item) => item !== goal)
                              : Array.from(new Set([...current, goal]));
                            return next.length > 0 ? next : current;
                          });
                        }}
                        className={cn(
                          "relative flex h-12 items-center justify-center rounded-xl border px-6 text-sm font-bold transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary-50 text-primary shadow-sm"
                            : "border-border/40 bg-muted/30 text-muted-foreground hover:border-primary-300 hover:bg-primary-50 hover:text-primary",
                        )}
                      >
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-background animate-in zoom-in duration-200">
                            <Check className="size-3.5 stroke-[3]" />
                          </div>
                        )}
                        {goal}
                      </button>
                    );
                  })}
                </div>
                {/* Removed FieldDescription per user request */}
              </Field>

              {/* Roles */}
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="user-role" className="text-foreground/80 mb-1">
                    Vai của bạn
                  </FieldLabel>
                  <Select
                    value={selectedUserRole}
                    onValueChange={setSelectedUserRole}
                    disabled={!selectedScenario.user_roles.length}
                  >
                    <SelectTrigger id="user-role" size="xl" className="rounded-xl border-border/40">
                      <SelectValue placeholder="Chọn vai" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {selectedScenario.user_roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="ai-role" className="text-foreground/80 mb-1">
                    Vai AI
                  </FieldLabel>
                  <Select
                    value={selectedAiRole}
                    onValueChange={setSelectedAiRole}
                    disabled={!selectedScenario.ai_roles.length}
                  >
                    <SelectTrigger id="ai-role" size="xl" className="rounded-xl border-border/40">
                      <SelectValue placeholder="Chọn vai" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {selectedScenario.ai_roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* Giọng AI */}
              <Field>
                <FieldLabel htmlFor="ai-gender" className="text-foreground/80 mb-1">
                  Giọng nói AI
                </FieldLabel>
                <Select
                  value={formData.ai_gender}
                  onValueChange={(v) =>
                    set("ai_gender", v as "male" | "female")
                  }
                >
                  <SelectTrigger id="ai-gender" size="xl" className="rounded-xl border-border/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="female">Nữ (Giọng chuẩn)</SelectItem>
                    <SelectItem value="male">Nam (Giọng chuẩn)</SelectItem>
                  </SelectContent>
                </Select>
                {/* Removed FieldDescription per user request */}
              </Field>
            </FieldGroup>

            {/* Submit — push to bottom */}
            <div className="mt-auto pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base font-semibold rounded-2xl gap-2"
                disabled={isPending || !selectedScenario}
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Đang khởi tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-5" />
                    Bắt đầu hội thoại
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
            Chưa có kịch bản nào. Vui lòng thử lại sau.
          </div>
        )}
      </div>

      {/* ── Mobile: Bottom sheet CTA ─────────────────────────────────────── */}
      {selectedScenario && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 p-4 backdrop-blur-sm lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {selectedScenario.scenario_title}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {getContextLabel(selectedScenario.context)} • {selectedScenario.difficulty_level}
                </p>
              </div>
            <Button
              type="submit"
              size="sm"
              className="shrink-0 gap-1.5 rounded-xl"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Bắt đầu
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
