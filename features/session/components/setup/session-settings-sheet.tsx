"use client";

import { Check, ArrowLeftRight, UserCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Toggle } from "@/components/ui/toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Scenario, CreateSessionDto } from "../../types/session.types";

interface SessionSettingsSheetProps {
  selectedScenario: Scenario;
  selectedUserRole: string;
  selectedAiRole: string;
  selectedGoals: string[];
  formData: CreateSessionDto;
  onUserRoleChange: (value: string) => void;
  onAiRoleChange: (value: string) => void;
  onGoalsToggle: (goal: string) => void;
  onAiGenderChange: (value: "male" | "female") => void;
  isPending: boolean;
}

export function SessionSettingsSheet({
  selectedScenario,
  selectedUserRole,
  selectedAiRole,
  selectedGoals,
  formData,
  onUserRoleChange,
  onAiRoleChange,
  onGoalsToggle,
  onAiGenderChange,
  isPending,
}: SessionSettingsSheetProps) {
  return (
    <SheetContent side="right" className="sm:w-xl! sm:max-w-none!">
      <SheetHeader>
        <SheetTitle>Thiết lập cuộc hội thoại</SheetTitle>
        <SheetDescription>
          Tùy chỉnh vai, mục tiêu và giọng AI trước khi bắt đầu.
        </SheetDescription>
      </SheetHeader>

      <div className="flex h-full min-h-0 flex-col gap-6 pb-4">
        <div className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3">
          <p className="min-w-0 truncate text-sm font-semibold text-foreground">
            {selectedScenario.scenario_title}
          </p>
          <Badge variant="secondary" shape="pill" className="shrink-0">
            {selectedGoals.length}/{selectedScenario.goals.length} mục tiêu
          </Badge>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <FieldGroup className="gap-8">
            {/* Vai diễn Section */}
            <Field>
              <FieldLabel className="text-foreground/80">
                Vai diễn hội thoại
              </FieldLabel>

              <div className="relative mt-2 flex flex-col gap-1.5 rounded-2xl border border-border/40 bg-muted/10 p-1.5">
                {/* Bạn là */}
                <div className="flex items-center gap-3 rounded-xl bg-background p-3 shadow-xs">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary-50 text-primary shrink-0">
                    <UserCircle className="size-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 leading-none mb-1">
                      Bạn là
                    </span>
                    <span className="text-sm font-bold truncate leading-tight">
                      {selectedUserRole}
                    </span>
                  </div>
                </div>

                {/* Swap Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => {
                    const prevUser = selectedUserRole;
                    const prevAi = selectedAiRole;
                    onUserRoleChange(prevAi);
                    onAiRoleChange(prevUser);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-8 gap-1.5 px-3 active:translate-y-[-30%]!"
                >
                  <ArrowLeftRight className="size-3.5" />
                  <span className="text-xs font-bold">Tráo vai</span>
                </Button>

                {/* AI là */}
                <div className="flex items-center gap-3 rounded-xl bg-background p-3 shadow-xs">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-info-50 text-info-600 shrink-0">
                    <Bot className="size-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 leading-none mb-1">
                      AI là
                    </span>
                    <span className="text-sm font-bold truncate leading-tight">
                      {selectedAiRole}
                    </span>
                  </div>
                </div>
              </div>
            </Field>

            <Field>
              <div className="flex items-center justify-between mb-1">
                <FieldLabel className="text-foreground/80">
                  Mục tiêu luyện tập
                </FieldLabel>
                <span className="text-2xs font-medium text-muted-foreground/50">
                  {selectedGoals.length}/{selectedScenario.goals.length}
                </span>
              </div>
              <div className="flex flex-wrap justify-start gap-3 mt-2">
                {selectedScenario.goals.map((goal) => {
                  const isSelected = selectedGoals.includes(goal);
                  return (
                    <Toggle
                      key={goal}
                      variant="soft"
                      size="xl"
                      pressed={isSelected}
                      onPressedChange={() => onGoalsToggle(goal)}
                      className="relative"
                    >
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-background animate-in zoom-in duration-200">
                          <Check className="size-3.5 stroke-3" />
                        </div>
                      )}
                      {goal}
                    </Toggle>
                  );
                })}
              </div>
            </Field>

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
          <Button type="submit" size="xl" disabled={isPending}>
            {isPending ? "Đang khởi tạo..." : "Bắt đầu hội thoại"}
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}
