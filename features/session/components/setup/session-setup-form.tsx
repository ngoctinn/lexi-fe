"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LevelPicker } from "./level-picker";
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
      `Level: ${formData.level}`,
    ].join("\n");
  }, [
    formData.ai_gender,
    formData.level,
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
      className={cn("flex flex-col flex-1 min-h-0", className)}
      {...props}
    >
      <div className="grid h-full min-h-0 grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        {/* ── Cột trái: Lộ trình học ──────────────────────────────────── */}
        <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pb-10 pr-2 lg:col-span-7 custom-scrollbar">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold tracking-tight">Chọn tình huống luyện tập</h2>
            <p className="text-sm text-muted-foreground">
              Chọn tình huống phù hợp với cấp độ của bạn để bắt đầu luyện nói.
            </p>
          </div>

          <LearningPath
            scenarios={scenarios}
            value={formData.scenario_id}
            onSelect={(id) => set("scenario_id", id)}
          />
        </div>

        {/* ── Cột phải: Chi tiết + cấu hình ──────────────────────────── */}
        <div className="flex h-full min-h-0 flex-col lg:col-span-5">
          {selectedScenario ? (
            <div className="flex h-full flex-col rounded-3xl border bg-card p-6 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1.5">
                  <h2 className="text-2xl font-bold tracking-tight line-clamp-1">
                    {selectedScenario.scenario_title}
                  </h2>
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {selectedScenario.my_character} nói chuyện với{" "}
                    {selectedScenario.ai_character}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  size="sm"
                  className="shrink-0 rounded-full"
                >
                  {getContextLabel(selectedScenario.context)}
                </Badge>
              </div>

              {/* Cấu hình */}
              <div className="mt-6 space-y-5">
                {/* Mục tiêu */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Mục tiêu
                    </p>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Chọn nhiều mục tiêu
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-3 w-full justify-between rounded-xl px-4 font-medium"
                      >
                        <span className="truncate">
                          {selectedGoals.length === selectedScenario.goals.length
                            ? "Tất cả mục tiêu"
                            : `${selectedGoals.length} mục tiêu đã chọn`}
                        </span>
                        <ChevronDown className="size-4 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-72">
                      <DropdownMenuLabel>Mục tiêu</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {selectedScenario.goals.map((goal) => {
                        const isSelected = selectedGoals.includes(goal);

                        return (
                          <DropdownMenuCheckboxItem
                            key={goal}
                            checked={isSelected}
                            onSelect={(event) => event.preventDefault()}
                            onCheckedChange={(checked) => {
                              setSelectedGoals((current) => {
                                const next = checked
                                  ? Array.from(new Set([...current, goal]))
                                  : current.filter((item) => item !== goal);

                                return next.length > 0 ? next : current;
                              });
                            }}
                          >
                            {goal}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Đã chọn{" "}
                    {selectedGoals.length || selectedScenario.goals.length}/
                    {selectedScenario.goals.length} mục tiêu.
                  </p>
                </div>

                {/* Roles */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="user-role">Vai trò của bạn</FieldLabel>
                    <Select
                      value={selectedUserRole}
                      onValueChange={setSelectedUserRole}
                      disabled={!selectedScenario.user_roles.length}
                    >
                      <SelectTrigger id="user-role">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedScenario.user_roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="ai-role">Vai trò AI</FieldLabel>
                    <Select
                      value={selectedAiRole}
                      onValueChange={setSelectedAiRole}
                      disabled={!selectedScenario.ai_roles.length}
                    >
                      <SelectTrigger id="ai-role">
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedScenario.ai_roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                {/* Level & Gender */}
                <FieldGroup className="gap-5">
                  <Field>
                    <FieldLabel htmlFor="ai-gender">Giọng AI</FieldLabel>
                    <Select
                      value={formData.ai_gender}
                      onValueChange={(v) =>
                        set("ai_gender", v as "male" | "female")
                      }
                    >
                      <SelectTrigger id="ai-gender">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Nữ (Female)</SelectItem>
                        <SelectItem value="male">Nam (Male)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field className="gap-4">
                    <FieldLabel className="font-semibold">
                      Trình độ luyện tập
                    </FieldLabel>
                    <LevelPicker
                      value={formData.level}
                      onChange={(v) =>
                        set("level", v as CreateSessionDto["level"])
                      }
                    />
                  </Field>
                </FieldGroup>
              </div>

              {/* Submit */}
              <div className="mt-auto pt-6">
                <Button
                  type="submit"
                  size="xl"
                  className="w-full text-base h-14"
                  disabled={isPending || !selectedScenario}
                >
                  {isPending && (
                    <Loader2
                      className="animate-spin"
                      data-icon="inline-start"
                    />
                  )}
                  {isPending ? "Đang khởi tạo..." : "Bắt đầu hội thoại"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              Chưa có kịch bản nào. Vui lòng thử lại sau.
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
