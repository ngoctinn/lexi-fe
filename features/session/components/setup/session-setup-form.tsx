"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale/vi";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LearningPath } from "./learning-path";
import { createSession } from "@/features/session/actions/create-session";
import type {
  Scenario,
  CreateSessionDto,
  Session,
} from "@/features/session/types/session.types";
import { toast } from "sonner";

function formatSessionDate(createdAt?: string) {
  if (!createdAt) {
    return "Vừa xong";
  }

  return format(new Date(createdAt), "dd/MM/yyyy HH:mm", {
    locale: vi,
  });
}

function RecentSessionsCard({
  sessions,
  scenarioMap,
}: {
  sessions: Session[];
  scenarioMap: Map<string, Scenario>;
}) {
  const recentSessions = React.useMemo(
    () =>
      [...sessions]
        .sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime(),
        )
        .slice(0, 4),
    [sessions],
  );

  return (
    <Card size="sm" className="flex h-full min-h-0 flex-col">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="text-base font-semibold tracking-tight">
          Lịch sử gần đây
        </CardTitle>
        <CardDescription>
          Mở lại phiên gần nhất ngay trong lộ trình luyện nói này.
        </CardDescription>
        <CardAction>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
          >
            {sessions.length} phiên
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
        {recentSessions.length > 0 ? (
          recentSessions.map((session) => {
            const isCompleted = Boolean(session.scoring);
            const scenario = scenarioMap.get(session.scenario_id);
            const scenarioTitle =
              scenario?.scenario_title ?? session.scenario_id;
            const href = isCompleted
              ? `/session/${session.session_id}/results`
              : `/session/${session.session_id}`;

            return (
              <Link
                key={session.session_id}
                href={href}
                className="group flex items-start justify-between gap-4 rounded-lg border bg-background p-3 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={isCompleted ? "secondary" : "default"}
                      className="shrink-0"
                    >
                      {isCompleted ? "Hoàn thành" : "Đang học"}
                    </Badge>
                    <span className="truncate text-sm font-semibold text-foreground">
                      {scenarioTitle}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatSessionDate(session.created_at)} · Level{" "}
                    {session.level}
                  </p>
                </div>

                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
            Chưa có lịch sử hội thoại. Bắt đầu một phiên mới để phần này xuất
            hiện.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SessionSettingsSheet({
  selectedScenario,
  selectedUserRole,
  selectedAiRole,
  selectedGoals,
  formData,
  onUserRoleChange,
  onGoalsToggle,
  onAiGenderChange,
  isPending,
}: {
  selectedScenario: Scenario;
  selectedUserRole: string;
  selectedAiRole: string;
  selectedGoals: string[];
  formData: CreateSessionDto;
  onUserRoleChange: (value: string) => void;
  onGoalsToggle: (goal: string) => void;
  onAiGenderChange: (value: "male" | "female") => void;
  isPending: boolean;
}) {
  return (
    <SheetContent side="right" className="sm:w-xl! sm:max-w-none!">
      <SheetHeader>
        <SheetTitle>Thiết lập cuộc hội thoại</SheetTitle>
        <SheetDescription>
          Tùy chỉnh nhanh vai, mục tiêu và giọng AI trước khi bắt đầu.
        </SheetDescription>
      </SheetHeader>

      <div className="flex h-full min-h-0 flex-col gap-6 pb-4">
        <div className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3">
          <p className="min-w-0 truncate text-sm font-semibold text-foreground">
            {selectedScenario.scenario_title}
          </p>

          <Badge variant="secondary" className="shrink-0 rounded-full">
            {selectedGoals.length}/{selectedScenario.goals.length} mục tiêu
          </Badge>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <FieldGroup className="gap-8">
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
                      onClick={() => onGoalsToggle(goal)}
                      className={cn(
                        "relative flex h-12 items-center justify-center rounded-xl border px-6 text-sm font-bold transition-all duration-200",
                        isSelected
                          ? "border-primary bg-primary-50 text-primary shadow-sm"
                          : "border-border/40 bg-muted/30 text-muted-foreground hover:border-primary-300 hover:bg-primary-50 hover:text-primary",
                      )}
                    >
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-background animate-in zoom-in duration-200">
                          <Check className="size-3.5 stroke-3" />
                        </div>
                      )}
                      {goal}
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="space-y-4">
              <Field>
                <FieldLabel className="mb-1 text-foreground/80">
                  Vai của bạn
                </FieldLabel>
                <div className="flex flex-wrap gap-3 mt-2">
                  {Array.from(new Set([...selectedScenario.user_roles, ...selectedScenario.ai_roles])).map((role) => {
                    const isSelected = selectedUserRole === role;

                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => onUserRoleChange(role)}
                        className={cn(
                          "relative flex h-12 items-center justify-center rounded-xl border px-6 text-sm font-bold transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary-50 text-primary shadow-sm"
                            : "border-border/40 bg-muted/30 text-muted-foreground hover:border-primary-300 hover:bg-primary-50 hover:text-primary",
                        )}
                      >
                        {isSelected && (
                          <div className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-background animate-in zoom-in duration-200">
                            <Check className="size-3.5 stroke-3" />
                          </div>
                        )}
                        {role}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {selectedAiRole && (
                <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">AI sẽ đóng vai:</span> {selectedAiRole}
                </div>
              )}
            </div>

            <Field>
              <FieldLabel
                htmlFor="ai-gender"
                className="mb-1 text-foreground/80"
              >
                Giọng nói AI
              </FieldLabel>
              <Select
                value={formData.ai_gender}
                onValueChange={(value) =>
                  onAiGenderChange(value as "male" | "female")
                }
              >
                <SelectTrigger
                  id="ai-gender"
                  size="xl"
                  className="rounded-xl border-border/40"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="female">Nữ (Giọng chuẩn)</SelectItem>
                  <SelectItem value="male">Nam (Giọng chuẩn)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </div>

        <SheetFooter className="shrink-0 border-t border-border/60 pt-4">
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-2xl font-semibold"
            disabled={isPending}
          >
            {isPending ? "Đang khởi tạo..." : "Bắt đầu hội thoại"}
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}

interface SessionSetupFormProps extends React.ComponentProps<"form"> {
  scenarios: Scenario[];
  sessions: Session[];
}

export function SessionSetupForm({
  scenarios,
  sessions,
  className,
  ...props
}: SessionSetupFormProps) {
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

  const set = <K extends keyof CreateSessionDto>(
    key: K,
    value: CreateSessionDto[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const selectedScenario = React.useMemo(
    () => scenarios.find((s) => s.scenario_id === formData.scenario_id),
    [scenarios, formData.scenario_id],
  );

  const scenarioMap = React.useMemo(
    () =>
      new Map(scenarios.map((scenario) => [scenario.scenario_id, scenario])),
    [scenarios],
  );

  const recentSessions = React.useMemo(() => sessions, [sessions]);

  const toggleGoal = React.useCallback((goal: string) => {
    setSelectedGoals((current) => {
      const next = current.includes(goal)
        ? current.filter((item) => item !== goal)
        : Array.from(new Set([...current, goal]));

      return next.length > 0 ? next : current;
    });
  }, []);

  React.useEffect(() => {
    if (!selectedScenario) return;

    const allRoles = Array.from(new Set([...selectedScenario.user_roles, ...selectedScenario.ai_roles]));
    const defaultUserRole = allRoles[0] ?? selectedScenario.my_character ?? "";

    setSelectedUserRole((current) =>
      allRoles.includes(current) ? current : defaultUserRole,
    );
    setSelectedGoals((current) => {
      const visible = selectedScenario.goals.filter((goal) =>
        current.includes(goal),
      );
      return visible.length > 0 ? visible : selectedScenario.goals;
    });
  }, [selectedScenario]);

  React.useEffect(() => {
    if (!selectedScenario || !selectedUserRole) return;
    const allRoles = Array.from(new Set([...selectedScenario.user_roles, ...selectedScenario.ai_roles]));
    const nextAiRole = allRoles.find((r) => r !== selectedUserRole) ?? selectedUserRole;
    setSelectedAiRole(nextAiRole);
  }, [selectedUserRole, selectedScenario]);

  const buildPromptSnapshot = React.useCallback(() => {
    if (!selectedScenario) return "";

    const userRole =
      selectedUserRole ||
      selectedScenario.user_roles[0] ||
      selectedScenario.my_character ||
      "";
    const aiRole =
      selectedAiRole ||
      selectedScenario.ai_roles[0] ||
      selectedScenario.ai_character ||
      "";
    const goals =
      selectedGoals.length > 0 ? selectedGoals : selectedScenario.goals;

    return [
      `Scenario: ${selectedScenario.scenario_title}`,
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
    selectedGoals,
    selectedUserRole,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedScenario) {
      toast.error("Vui lòng chọn một kịch bản hợp lệ.");
      return;
    }

    const resolvedUserRole =
      selectedUserRole ||
      selectedScenario.user_roles[0] ||
      selectedScenario.my_character ||
      "";
    const resolvedAiRole =
      selectedAiRole ||
      selectedScenario.ai_roles[0] ||
      selectedScenario.ai_character ||
      "";

    if (
      resolvedUserRole &&
      resolvedAiRole &&
      resolvedUserRole === resolvedAiRole
    ) {
      toast.error("Vai trò học viên và vai trò AI phải khác nhau.");
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
      <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <div className="grid h-full w-full gap-6 pb-28 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)] lg:pb-0">
          <section className="flex min-h-0 flex-col overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col items-center justify-start py-6">
              <div className="mb-8 flex w-full flex-col gap-4 text-left">
                <div className="max-w-xs">
                  <h2 className="text-lg font-bold tracking-tight">
                    Lộ trình luyện nói
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Chọn tình huống phù hợp để bắt đầu
                  </p>
                </div>
              </div>

              <LearningPath
                scenarios={scenarios}
                value={formData.scenario_id}
                onSelect={(id) => {
                  set("scenario_id", id);
                  setIsSettingsOpen(true);
                }}
              />

              <div className="mt-6 w-full lg:hidden">
                <RecentSessionsCard
                  sessions={recentSessions}
                  scenarioMap={scenarioMap}
                />
              </div>
            </div>
          </section>

          <aside className="hidden min-h-0 flex-1 flex-col gap-4 lg:flex">
            <RecentSessionsCard
              sessions={recentSessions}
              scenarioMap={scenarioMap}
            />
          </aside>
        </div>

        {selectedScenario && (
          <SessionSettingsSheet
            selectedScenario={selectedScenario}
            selectedUserRole={selectedUserRole}
            selectedAiRole={selectedAiRole}
            selectedGoals={selectedGoals}
            formData={formData}
            onUserRoleChange={setSelectedUserRole}
            onGoalsToggle={toggleGoal}
            onAiGenderChange={(value) => set("ai_gender", value)}
            isPending={isPending}
          />
        )}
      </Sheet>
    </form>
  );
}
