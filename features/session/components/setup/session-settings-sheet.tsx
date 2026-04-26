"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RoleSwapCard } from "./role-swap-card";
import type { Scenario, CreateSessionDto, AICharacter } from "../../types/session.types";
import { AI_CHARACTERS } from "../../types/session.types";

interface SessionSettingsSheetProps {
  selectedScenario: Scenario;
  selectedUserRole: string;
  selectedAiRole: string;
  selectedGoals: string[];
  formData: CreateSessionDto;
  onUserRoleChange: (value: string) => void;
  onAiRoleChange: (value: string) => void;
  onGoalsChange: (goals: string[]) => void;
  onAiCharacterChange: (value: AICharacter) => void;
  isPending: boolean;
  formId?: string;
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
  onAiCharacterChange,
  isPending,
  formId,
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
              <FieldLabel className="text-foreground/80 mb-1">
                Mục tiêu luyện tập
              </FieldLabel>
              <ToggleGroup
                type="single"
                value={selectedGoals[0] || ""}
                onValueChange={(value) => {
                  if (value) {
                    onGoalsChange([value]);
                  }
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
              <FieldLabel className="mb-1 text-foreground/80">
                Nhân vật AI
              </FieldLabel>
              <ToggleGroup
                type="single"
                value={formData.ai_character}
                onValueChange={(value) => {
                  if (value) {
                    onAiCharacterChange(value as AICharacter);
                  }
                }}
                spacing={3}
                className="w-full! flex-wrap justify-start mt-2"
              >
                {AI_CHARACTERS.map((char) => (
                  <ToggleGroupItem
                    key={char.name}
                    value={char.name}
                    variant="soft"
                    size="xl"
                    className="justify-start px-4 text-left"
                  >
                    <span className="min-w-0 truncate">
                      {char.name} - {char.description}
                    </span>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Field>
          </FieldGroup>
        </div>

        <SheetFooter className="shrink-0 border-t border-border/60 pt-4">
          <Button type="submit" size="xl" disabled={isPending} form={formId}>
            {isPending ? "Đang khởi tạo..." : "Bắt đầu hội thoại"}
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  );
}
