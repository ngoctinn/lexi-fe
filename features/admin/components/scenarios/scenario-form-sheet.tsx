"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import type { AdminScenario } from "@/features/admin/types";
import {
  DEFAULT_SCENARIO_CONTEXT,
  SCENARIO_CONTEXT_OPTIONS,
} from "@/features/session/constants/scenario-contexts";

/**
 * UI representation of scenario with roles as object for easier form handling
 */
interface ScenarioDraft extends Omit<AdminScenario, "roles"> {
  roles: {
    user_role: string;
    ai_role: string;
  };
}

const LEVEL_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

interface ScenarioFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: ScenarioDraft;
  isSaving: boolean;
  onUpdateDraft: <K extends keyof ScenarioDraft>(key: K, value: ScenarioDraft[K]) => void;
  onSave: (event: React.FormEvent) => void;
}

export function ScenarioFormSheet({
  open,
  onOpenChange,
  draft,
  isSaving,
  onUpdateDraft,
  onSave,
}: ScenarioFormSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full lg:w-[40vw] lg:max-w-none">
        <SheetHeader>
          <SheetTitle>
            {draft.scenario_id ? "Chỉnh sửa kịch bản" : "Thêm kịch bản"}
          </SheetTitle>
          <SheetDescription>Cập nhật nhanh kịch bản.</SheetDescription>
        </SheetHeader>

        <form className="space-y-6 mt-6" onSubmit={onSave}>
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="scenario-title">Tiêu đề kịch bản</FieldLabel>
              <FieldContent>
                <Input
                  id="scenario-title"
                  value={draft.scenario_title}
                  onChange={(e) => onUpdateDraft("scenario_title", e.target.value)}
                  placeholder="Ví dụ: Mua vé xem phim"
                />
              </FieldContent>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="scenario-context">Context</FieldLabel>
              <FieldContent>
                <Select
                  value={draft.context || DEFAULT_SCENARIO_CONTEXT}
                  onValueChange={(value) => onUpdateDraft("context", value)}
                >
                  <SelectTrigger id="scenario-context" className="w-full">
                    <SelectValue placeholder="Select context" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCENARIO_CONTEXT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
              <FieldDescription>
                Chủ đề này quyết định icon trên lộ trình học.
              </FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="scenario-level">Level</FieldLabel>
              <FieldContent>
                <Select
                  value={draft.difficulty_level ?? "A2"}
                  onValueChange={(value) =>
                    onUpdateDraft("difficulty_level", value as ScenarioDraft["difficulty_level"])
                  }
                >
                  <SelectTrigger id="scenario-level" className="w-full">
                    <SelectValue placeholder="Chọn level" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVEL_OPTIONS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="scenario-order">Thứ tự hiển thị</FieldLabel>
              <FieldContent>
                <Input
                  id="scenario-order"
                  type="number"
                  min={1}
                  value={draft.order ?? ""}
                  onChange={(e) =>
                    onUpdateDraft(
                      "order",
                      Number.isNaN(e.target.valueAsNumber) ? 0 : e.target.valueAsNumber,
                    )
                  }
                />
              </FieldContent>
            </Field>

            <Field>
              <FieldLabel htmlFor="scenario-active">Trạng thái</FieldLabel>
              <FieldContent>
                <Select
                  value={draft.is_active ? "active" : "inactive"}
                  onValueChange={(value) => onUpdateDraft("is_active", value === "active")}
                >
                  <SelectTrigger id="scenario-active" className="w-full">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Đang mở</SelectItem>
                    <SelectItem value="inactive">Đã ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          </FieldGroup>

          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <Field className="md:col-span-2">
              <FieldLabel htmlFor="scenario-goals">Mục tiêu luyện tập</FieldLabel>
              <FieldContent>
                <Textarea
                  id="scenario-goals"
                  value={draft.goals.join("\n")}
                  onChange={(e) => onUpdateDraft("goals", splitLines(e.target.value))}
                  placeholder="Mỗi dòng là một mục tiêu"
                  className="min-h-32"
                />
              </FieldContent>
              <FieldDescription>Mỗi dòng là một mục tiêu.</FieldDescription>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="scenario-role-1">Vai trò 1</FieldLabel>
              <FieldContent>
                <Input
                  id="scenario-role-1"
                  value={draft.roles.user_role}
                  onChange={(e) =>
                    onUpdateDraft("roles", {
                      ...draft.roles,
                      user_role: e.target.value,
                    })
                  }
                  placeholder="Ví dụ: Khách hàng"
                />
              </FieldContent>
              <FieldDescription>Người học có thể chọn vai trò này hoặc vai trò 2.</FieldDescription>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="scenario-role-2">Vai trò 2</FieldLabel>
              <FieldContent>
                <Input
                  id="scenario-role-2"
                  value={draft.roles.ai_role}
                  onChange={(e) =>
                    onUpdateDraft("roles", {
                      ...draft.roles,
                      ai_role: e.target.value,
                    })
                  }
                  placeholder="Ví dụ: Nhân viên bán hàng"
                />
              </FieldContent>
              <FieldDescription>AI sẽ đóng vai trò còn lại mà người học không chọn.</FieldDescription>
            </Field>

            <Field className="md:col-span-2">
              <FieldLabel htmlFor="scenario-notes">Ghi chú nội bộ</FieldLabel>
              <FieldContent>
                <Textarea
                  id="scenario-notes"
                  value={draft.notes}
                  onChange={(e) => onUpdateDraft("notes", e.target.value)}
                  placeholder="Ví dụ: ưu tiên dùng cho học viên A2 và B1..."
                  className="min-h-28"
                />
              </FieldContent>
            </Field>
          </FieldGroup>

          <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-4">
            <SheetClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </SheetClose>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              Lưu kịch bản
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
