"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
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
  onGoalsToggle,
  onAiGenderChange,
  isPending,
}: SessionSettingsSheetProps) {
  const allRoles = React.useMemo(() => 
    Array.from(new Set([...selectedScenario.user_roles, ...selectedScenario.ai_roles])),
  [selectedScenario]);

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
          <Badge variant="secondary" shape="pill" className="shrink-0">
            {selectedGoals.length}/{selectedScenario.goals.length} mục tiêu
          </Badge>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <FieldGroup className="gap-8">
            <Field>
              <div className="flex items-center justify-between mb-1">
                <FieldLabel className="text-foreground/80">Mục tiêu luyện tập</FieldLabel>
                <span className="text-2xs font-medium text-muted-foreground/50">
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

            <Field>
              <FieldLabel className="mb-1 text-foreground/80">Vai của bạn</FieldLabel>
              <div className="flex flex-wrap gap-3 mt-2">
                {allRoles.map((role) => {
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

            <Field>
              <FieldLabel htmlFor="ai-gender" className="mb-1 text-foreground/80">Giọng nói AI</FieldLabel>
              <Select
                value={formData.ai_gender}
                onValueChange={(value) => onAiGenderChange(value as "male" | "female")}
              >
                <SelectTrigger id="ai-gender" size="xl" className="rounded-xl border-border/40">
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
