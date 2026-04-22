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
  draft: AdminScenario;
  isSaving: boolean;
  onUpdateDraft: <K extends keyof AdminScenario>(key: K, value: AdminScenario[K]) => void;
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
              <FieldLabel htmlFor="scenario-context">Chủ đề</FieldLabel>
              <FieldContent>
                <Select
                  value={draft.context || DEFAULT_SCENARIO_CONTEXT}
                  onValueChange={(value) => onUpdateDraft("context", value)}
                >
                  <SelectTrigger id="scenario-context" className="w-full">
                    <SelectValue placeholder="Chọn chủ đề" />
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
                    onUpdateDraft("difficulty_level", value as AdminScenario["difficulty_level"])
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
                      Number.isNaN(e.target.valueAsNumber) ? undefined : e.target.valueAsNumber,
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
              <FieldLabel htmlFor="scenario-roles">Vai trò</FieldLabel>
              <FieldContent>
                <Textarea
                  id="scenario-roles"
                  value={draft.roles.join("\n")}
                  onChange={(e) => onUpdateDraft("roles", splitLines(e.target.value))}
                  placeholder="Khách hàng\nNhân viên bán hàng"
                  className="min-h-28"
                />
              </FieldContent>
              <FieldDescription>
                Nhập đúng 2 dòng, mỗi dòng là một vai trung tính.
              </FieldDescription>
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
