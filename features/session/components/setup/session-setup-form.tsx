"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Sheet } from "@/components/ui/sheet";
import { LearningPath } from "./learning-path";
import { RecentSessionsCard } from "./recent-sessions-card";
import { SessionSettingsSheet } from "./session-settings-sheet";
import { useSessionSetup } from "../../hooks/use-session-setup";
import type { Scenario, Session } from "../../types/session.types";

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
  const { state, actions } = useSessionSetup({ scenarios });

  return (
    <form
      onSubmit={actions.handleSubmit}
      className={cn("flex h-full w-full", className)}
      {...props}
    >
      <Sheet open={state.isSettingsOpen} onOpenChange={actions.setIsSettingsOpen}>
        <div className="grid h-full w-full gap-6 pb-28 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)] lg:pb-0">
          <section className="flex min-h-0 flex-col overflow-y-auto pr-2 custom-scrollbar">
            <div className="flex flex-col items-center justify-start py-6">
              <div className="mb-8 flex w-full flex-col gap-4 text-left">
                <div className="max-w-xs">
                  <h2 className="text-lg font-bold tracking-tight">Lộ trình luyện nói</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Chọn tình huống phù hợp để bắt đầu
                  </p>
                </div>
              </div>

              <LearningPath
                scenarios={scenarios}
                value={state.formData.scenario_id}
                onSelect={(id) => {
                  actions.updateFormData("scenario_id", id);
                  actions.setIsSettingsOpen(true);
                }}
              />

              <div className="mt-6 w-full lg:hidden">
                <RecentSessionsCard
                  sessions={sessions}
                  scenarioMap={state.scenarioMap}
                />
              </div>
            </div>
          </section>

          <aside className="hidden min-h-0 flex-1 flex-col gap-4 lg:flex">
            <RecentSessionsCard
              sessions={sessions}
              scenarioMap={state.scenarioMap}
            />
          </aside>
        </div>

        {state.selectedScenario && (
          <SessionSettingsSheet
            selectedScenario={state.selectedScenario}
            selectedUserRole={state.selectedUserRole}
            selectedAiRole={state.selectedAiRole}
            selectedGoals={state.selectedGoals}
            formData={state.formData}
            onUserRoleChange={actions.setSelectedUserRole}
            onGoalsToggle={actions.toggleGoal}
            onAiGenderChange={(value) => actions.updateFormData("ai_gender", value)}
            isPending={state.isPending}
          />
        )}
      </Sheet>
    </form>
  );
}
