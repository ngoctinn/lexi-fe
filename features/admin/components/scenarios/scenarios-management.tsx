"use client";

import * as React from "react";
import {
  BarChart3,
  CircleAlert,
  CircleCheck,
  Loader2,
  PencilLine,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { upsertAdminScenario } from "@/features/admin/actions/admin.actions";
import type { AdminScenario } from "@/features/admin/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

const LEVEL_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

const SCENARIO_STATUS_TABS: Array<{
  value: "all" | "active" | "inactive";
  label: string;
}> = [
    { value: "all", label: "Tất cả" },
    { value: "active", label: "Đang mở" },
    { value: "inactive", label: "Đã ẩn" },
  ];

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function createEmptyScenario(order: number, now?: string): AdminScenario {
  const finalNow = now || new Date(0).toISOString();

  return {
    scenario_id: "",
    scenario_title: "",
    context: "",
    my_character: "Học viên",
    ai_character: "AI Assistant",
    goals: [],
    user_roles: [],
    ai_roles: [],
    is_active: true,
    usage_count: 0,
    difficulty_level: "A2",
    order,
    updated_at: finalNow,
    notes: "",
  };
}

function getStatusMeta(isActive: boolean) {
  return isActive
    ? { label: "Đang mở", variant: "success" as const }
    : { label: "Đã ẩn", variant: "secondary" as const };
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex items-start justify-between gap-4 py-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </p>
          <p className="text-3xl font-extrabold tracking-tight text-foreground">
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{detail}</p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-50 text-primary ring-1 ring-primary-100">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  );
}

interface ScenariosManagementProps {
  scenarios: AdminScenario[];
}

export function ScenariosManagement({ scenarios }: ScenariosManagementProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [records, setRecords] = React.useState(scenarios);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<AdminScenario>(() =>
    createEmptyScenario(1),
  );
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    setRecords(scenarios);
  }, [scenarios]);

  const visibleScenarios = React.useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return [...records]
      .filter((scenario) => {
        if (statusFilter === "active" && !scenario.is_active) {
          return false;
        }

        if (statusFilter === "inactive" && scenario.is_active) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return normalizeSearch(
          [
            scenario.scenario_title,
            scenario.my_character,
            scenario.ai_character,
            scenario.notes,
            scenario.goals.join(" "),
            scenario.user_roles.join(" "),
            scenario.ai_roles.join(" "),
          ].join(" "),
        ).includes(normalizedQuery);
      })
      .sort((left, right) => {
        const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
        const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;

        if (leftOrder !== rightOrder) {
          return leftOrder - rightOrder;
        }

        return left.scenario_title.localeCompare(right.scenario_title, "vi");
      });
  }, [query, records, statusFilter]);

  const summary = React.useMemo(() => {
    const active = records.filter((scenario) => scenario.is_active).length;
    const inactive = records.length - active;
    const totalUsage = records.reduce(
      (sum, scenario) => sum + scenario.usage_count,
      0,
    );

    return { active, inactive, totalUsage };
  }, [records]);

  const updateDraft = <K extends keyof AdminScenario>(
    key: K,
    value: AdminScenario[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleOpenCreate = () => {
    const nextOrder = records.length + 1;
    const now = new Date().toISOString();

    setDraft(createEmptyScenario(nextOrder, now));
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (scenario: AdminScenario) => {
    setDraft({ ...scenario });
    setIsDialogOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!draft.scenario_title.trim()) {
      toast.error("Vui lòng nhập tiêu đề cho kịch bản.");
      return;
    }

    if (draft.goals.length === 0) {
      toast.error("Cần ít nhất một mục tiêu luyện tập.");
      return;
    }

    setIsSaving(true);

    try {
      const finalRoles = draft.user_roles.map((role) => role.trim()).filter(Boolean);

      const result = await upsertAdminScenario({
        ...draft,
        scenario_title: draft.scenario_title.trim(),
        my_character: finalRoles[0] ?? "Học viên",
        ai_character: finalRoles.length > 1 ? finalRoles[1] : (finalRoles[0] ?? "AI Assistant"),
        goals: draft.goals.map((goal) => goal.trim()).filter(Boolean),
        user_roles: finalRoles,
        ai_roles: finalRoles,
        notes: draft.notes.trim(),
      });

      if (!result.success || !result.scenario) {
        toast.error(result.error ?? "Không thể lưu kịch bản.");
        return;
      }

      const updatedScenario = result.scenario;

      setRecords((current) => {
        const exists = current.some(
          (item) => item.scenario_id === updatedScenario.scenario_id,
        );

        if (exists) {
          return current.map((item) =>
            item.scenario_id === updatedScenario.scenario_id
              ? updatedScenario
              : item,
          );
        }

        return [updatedScenario, ...current];
      });

      setIsDialogOpen(false);
      toast.success("Đã lưu kịch bản.");
    } catch {
      toast.error("Không thể lưu kịch bản. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (scenario: AdminScenario) => {
    setIsSaving(true);

    try {
      const result = await upsertAdminScenario({
        ...scenario,
        is_active: !scenario.is_active,
      });

      if (!result.success || !result.scenario) {
        toast.error(result.error ?? "Không thể cập nhật trạng thái.");
        return;
      }

      const updatedScenario = result.scenario;

      setRecords((current) =>
        current.map((item) =>
          item.scenario_id === updatedScenario.scenario_id
            ? updatedScenario
            : item,
        ),
      );

      toast.success(
        updatedScenario.is_active ? "Đã bật kịch bản." : "Đã ẩn kịch bản.",
      );
    } catch {
      toast.error("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={SlidersHorizontal}
          label="Tổng kịch bản"
          value={records.length}
          detail="Tất cả tình huống đang lưu trữ"
        />
        <MetricCard
          icon={CircleCheck}
          label="Đang mở"
          value={summary.active}
          detail="Có thể chọn cho học viên"
        />
        <MetricCard
          icon={CircleAlert}
          label="Đã ẩn"
          value={summary.inactive}
          detail="Tạm thời không hiển thị trên luồng học"
        />
        <MetricCard
          icon={BarChart3}
          label="Tổng lượt dùng"
          value={summary.totalUsage}
          detail="Tổng lượt mở kịch bản trên hệ thống"
        />
      </div>

      <Card size="lg" className="border-border/60">
        <CardContent className="space-y-5 py-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">
                  Bảng kịch bản
                </h2>
                <Badge variant="secondary" size="sm">
                  {visibleScenarios.length}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Sắp xếp, bật/tắt và cập nhật các tình huống luyện nói cho học
                viên.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:items-center">
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm tiêu đề, context, vai trò..."
                  className="pl-9"
                />
              </div>
              <Button onClick={handleOpenCreate} className="shrink-0">
                <Plus className="size-4" />
                Thêm kịch bản
              </Button>
            </div>
          </div>

          <Tabs
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | "active" | "inactive")
            }
            className="w-full"
          >
            <TabsList variant="line" className="w-full flex-wrap justify-start">
              {SCENARIO_STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kịch bản</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Vai trò & mục tiêu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Lượt dùng</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleScenarios.length > 0 ? (
                  visibleScenarios.map((scenario) => {
                    const statusMeta = getStatusMeta(scenario.is_active);
                    const level = scenario.difficulty_level ?? "B1";

                    return (
                      <TableRow key={scenario.scenario_id}>
                        <TableCell className="whitespace-normal">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" size="sm">
                                #{scenario.order ?? "-"}
                              </Badge>
                              <p className="font-semibold leading-none text-foreground">
                                {scenario.scenario_title}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" size="sm">
                            {level}
                          </Badge>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <div className="space-y-2 text-sm">
                            <p className="font-medium text-foreground">
                              {scenario.goals.length} mục tiêu
                            </p>
                            <p className="text-muted-foreground">
                              {Array.from(new Set([...scenario.user_roles, ...scenario.ai_roles])).length} nhân vật
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusMeta.variant} size="sm">
                            {statusMeta.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-foreground">
                              {scenario.usage_count}
                            </div>
                            <div className="text-muted-foreground">
                              lượt dùng
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {isMounted ? formatDateTime(scenario.updated_at) : "..."}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant={
                                scenario.is_active
                                  ? "soft-warning"
                                  : "soft-success"
                              }
                              size="sm"
                              onClick={() => handleToggleActive(scenario)}
                              disabled={isSaving}
                            >
                              {scenario.is_active ? "Ẩn" : "Kích hoạt"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(scenario)}
                            >
                              <PencilLine className="size-4" />
                              Sửa
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                        <SlidersHorizontal className="size-6 text-primary" />
                        <p className="font-medium text-foreground">
                          Không tìm thấy kịch bản phù hợp
                        </p>
                        <p className="text-sm">
                          Thử đổi từ khóa tìm kiếm hoặc xóa bộ lọc hiện tại.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent className="w-full lg:w-[40vw] lg:max-w-none">
          <SheetHeader>
            <SheetTitle>
              {draft.scenario_id ? "Chỉnh sửa kịch bản" : "Thêm kịch bản"}
            </SheetTitle>
            <SheetDescription>Cập nhật nhanh kịch bản.</SheetDescription>
          </SheetHeader>

          <form className="space-y-6" onSubmit={handleSave}>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="scenario-title">
                  Tiêu đề kịch bản
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="scenario-title"
                    value={draft.scenario_title}
                    onChange={(event) =>
                      updateDraft("scenario_title", event.target.value)
                    }
                    placeholder="Ví dụ: Mua vé xem phim"
                  />
                </FieldContent>
              </Field>


              <Field>
                <FieldLabel htmlFor="scenario-level">Level</FieldLabel>
                <FieldContent>
                  <Select
                    value={draft.difficulty_level ?? "A2"}
                    onValueChange={(value) =>
                      updateDraft(
                        "difficulty_level",
                        value as AdminScenario["difficulty_level"],
                      )
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
                <FieldLabel htmlFor="scenario-order">
                  Thứ tự hiển thị
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="scenario-order"
                    type="number"
                    min={1}
                    value={draft.order ?? ""}
                    onChange={(event) =>
                      updateDraft(
                        "order",
                        Number.isNaN(event.target.valueAsNumber)
                          ? undefined
                          : event.target.valueAsNumber,
                      )
                    }
                  />
                </FieldContent>
                <FieldDescription>Số nhỏ hiển thị trước.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="scenario-active">Trạng thái</FieldLabel>
                <FieldContent>
                  <Select
                    value={draft.is_active ? "active" : "inactive"}
                    onValueChange={(value) =>
                      updateDraft("is_active", value === "active")
                    }
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
                <FieldLabel htmlFor="scenario-goals">
                  Mục tiêu luyện tập
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="scenario-goals"
                    value={draft.goals.join("\n")}
                    onChange={(event) =>
                      updateDraft("goals", splitLines(event.target.value))
                    }
                    placeholder="Mỗi dòng là một mục tiêu"
                    className="min-h-32"
                  />
                </FieldContent>
                <FieldDescription>Mỗi dòng là một mục tiêu.</FieldDescription>
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel htmlFor="scenario-roles">
                  Các vai trò trong kịch bản
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="scenario-roles"
                    value={draft.user_roles.join("\n")}
                    onChange={(event) => {
                      const roles = splitLines(event.target.value);
                      updateDraft("user_roles", roles);
                      updateDraft("ai_roles", roles);
                    }}
                    placeholder="Mỗi dòng là một vai trò (ví dụ: Khách hàng, Nhân viên)"
                    className="min-h-28"
                  />
                </FieldContent>
                <FieldDescription>Hệ thống sẽ tự động phân vai AI dựa trên lựa chọn của học viên.</FieldDescription>
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel htmlFor="scenario-notes">
                  Ghi chú nội bộ
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    id="scenario-notes"
                    value={draft.notes}
                    onChange={(event) =>
                      updateDraft("notes", event.target.value)
                    }
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
    </div>
  );
}
