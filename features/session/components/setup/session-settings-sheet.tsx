"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
import { RoleSwapCard } from "./role-swap-card";
import type { Scenario, CreateSessionDto } from "../../types/session.types";

interface SessionSettingsSheetProps {
  selectedScenario: Scenario;
  selectedUserRole: string;
  selectedAiRole: string;
  selectedGoals: string[];
  formData: CreateSessionDto;
  onUserRoleChange: (value: string) => void;
  onAiRoleChange: (value: string) => void;
  onGoalsChange: (goals: string[]) => void;
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
  onGoalsChange,
  onAiGenderChange,
  isPending,
}: SessionSettingsSheetProps) {
  return (
    <SheetContent side="right" className="sm:w-xl! sm:max-w-none!">
      <SheetHeader>
        <SheetTitle>{selectedScenario.scenario_title}</SheetTitle>
        <SheetDescription>
          Tùy chỉnh vai, mục tiêu và giọng AI trước khi bắt đầu.
        </SheetDescription>
      </SheetHeader>

      <div className="flex h-full min-h-0 flex-col gap-6 pb-4">
        <div className="min-h-0 flex-1 overflow-y-auto px-2 custom-scrollbar">
          <FieldGroup>
            {/* Vai diễn Section */}
            <Field>
              <FieldLabel className="text-foreground/80">
                Vai diễn hội thoại
              </FieldLabel>

              <RoleSwapCard
                className="mt-2"
                userRole={selectedUserRole}
                aiRole={selectedAiRole}
                onSwap={() => {
                  const prevUser = selectedUserRole;
                  const prevAi = selectedAiRole;
                  onUserRoleChange(prevAi);
                  onAiRoleChange(prevUser);
                }}
              />
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
              <ToggleGroup
                type="multiple"
                value={selectedGoals}
                onValueChange={(value) => {
                  onGoalsChange(
                    value.length > 0 ? value : selectedScenario.goals,
                  );
                }}
                spacing={3}
                className="w-full! flex-wrap justify-start mt-2"
              >
                {selectedScenario.goals.map((goal) => {
                  return (
                    <ToggleGroupItem
                      key={goal}
                      value={goal}
                      variant="soft"
                      size="xl"
                      className="justify-start px-4 text-left"
                    >
                      <span className="min-w-0 truncate">{goal}</span>
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
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
