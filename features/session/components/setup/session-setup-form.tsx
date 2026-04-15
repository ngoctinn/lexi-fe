"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
import { ScenarioPicker } from "./scenario-picker";
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
  const [searchValue, setSearchValue] = React.useState("");
  const [contextFilter, setContextFilter] = React.useState("all");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [selectedUserRole, setSelectedUserRole] = React.useState("");
  const [selectedAiRole, setSelectedAiRole] = React.useState("");
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);

  const [formData, setFormData] = React.useState<CreateSessionDto>({
    scenario_id: scenarios[0]?.scenario_id ?? "",
    ai_gender: "female",
    level: "B1",
    prompt_snapshot: "",
  });

  const contextOptions = React.useMemo(
    () => Array.from(new Set(scenarios.map((scenario) => scenario.context))),
    [scenarios],
  );

  const roleOptions = React.useMemo(() => {
    const roles = scenarios.flatMap((scenario) => [
      ...scenario.user_roles,
      ...scenario.ai_roles,
    ]);

    return Array.from(new Set(roles));
  }, [scenarios]);

  const filteredScenarios = React.useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return scenarios.filter((scenario) => {
      const matchesContext =
        contextFilter === "all" || scenario.context === contextFilter;
      const matchesRole =
        roleFilter === "all" ||
        scenario.user_roles.includes(roleFilter) ||
        scenario.ai_roles.includes(roleFilter);
      const matchesKeyword =
        keyword.length === 0 ||
        [
          scenario.scenario_title,
          scenario.context,
          scenario.my_character,
          scenario.ai_character,
          ...scenario.goals,
          ...scenario.user_roles,
          ...scenario.ai_roles,
        ].some((value) => value.toLowerCase().includes(keyword));

      return matchesContext && matchesRole && matchesKeyword;
    });
  }, [contextFilter, roleFilter, scenarios, searchValue]);

  const selectedScenario = React.useMemo(
    () =>
      filteredScenarios.find(
        (scenario) => scenario.scenario_id === formData.scenario_id,
      ),
    [filteredScenarios, formData.scenario_id],
  );

  React.useEffect(() => {
    if (!filteredScenarios.length) {
      return;
    }

    const selectedIsVisible = filteredScenarios.some(
      (scenario) => scenario.scenario_id === formData.scenario_id,
    );

    if (!selectedIsVisible) {
      setFormData((prev) => ({
        ...prev,
        scenario_id: filteredScenarios[0].scenario_id,
      }));
    }
  }, [filteredScenarios, formData.scenario_id]);

  React.useEffect(() => {
    if (!selectedScenario) {
      return;
    }

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
      const visibleGoals = selectedScenario.goals.filter((goal) =>
        current.includes(goal),
      );

      return visibleGoals.length > 0 ? visibleGoals : selectedScenario.goals;
    });
  }, [selectedScenario]);

  const set = <K extends keyof CreateSessionDto>(
    key: K,
    value: CreateSessionDto[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const buildPromptSnapshot = React.useCallback(() => {
    if (!selectedScenario) {
      return "";
    }

    const userRole = selectedUserRole || selectedScenario.user_roles[0] || "";
    const aiRole = selectedAiRole || selectedScenario.ai_roles[0] || "";
    const goals =
      selectedGoals.length > 0 ? selectedGoals : selectedScenario.goals;

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

    const result = await createSession(finalDto);

    if (result.success && result.session_id) {
      router.push(`/session/${result.session_id}`);
    } else {
      toast.error(result.error ?? "Không thể tạo phiên học. Vui lòng thử lại.");
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
        <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto pb-10 pr-2 lg:col-span-7 custom-scrollbar">
          <Field className="gap-5">
            <div className="flex flex-col gap-1">
              <FieldLabel className="text-xl font-bold tracking-tight">
                Kịch bản hội thoại
              </FieldLabel>
              <FieldDescription>
                Lọc theo ngữ cảnh và vai trò để chọn bối cảnh phù hợp.
              </FieldDescription>
            </div>

            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="scenario-search">Tìm kiếm</FieldLabel>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="scenario-search"
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Phỏng vấn, du lịch, mua sắm..."
                    className="pl-9"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel>Ngữ cảnh</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={contextFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setContextFilter("all")}
                  >
                    Tất cả
                  </Button>
                  {contextOptions.map((context) => (
                    <Button
                      key={context}
                      type="button"
                      variant={
                        contextFilter === context ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setContextFilter(context)}
                    >
                      {getContextLabel(context)}
                    </Button>
                  ))}
                </div>
              </Field>

              <Field>
                <FieldLabel>Vai trò</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={roleFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRoleFilter("all")}
                  >
                    Tất cả
                  </Button>
                  {roleOptions.map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant={roleFilter === role ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRoleFilter(role)}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </Field>
            </FieldGroup>

            {filteredScenarios.length > 0 ? (
              <ScenarioPicker
                scenarios={filteredScenarios}
                value={formData.scenario_id}
                onChange={(value) => set("scenario_id", value)}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-sm text-muted-foreground">
                Không tìm thấy kịch bản phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </Field>
        </div>

        <div className="flex h-full min-h-0 flex-col lg:col-span-5">
          {selectedScenario ? (
            <div className="flex h-full flex-col rounded-3xl border bg-card p-6 shadow-sm">
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

              <div className="mt-6 space-y-5">
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
                          {selectedGoals.length ===
                          selectedScenario.goals.length
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

              <div className="mt-auto pt-6">
                <Button
                  type="submit"
                  size="2xl"
                  className="w-full text-base h-16"
                  disabled={isPending || !filteredScenarios.length}
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
              Chưa có kịch bản nào phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
