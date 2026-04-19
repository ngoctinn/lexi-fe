"use client";

import * as React from "react";
import {
  CircleAlert,
  CircleCheck,
  Loader2,
  PencilLine,
  Plus,
  Search,
  Sparkles,
  Users2,
} from "lucide-react";
import { toast } from "sonner";

import { upsertAdminUser } from "@/features/admin/actions/admin.actions";
import type { AdminUser, AdminUserStatus } from "@/features/admin/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const USER_STATUS_META: Record<
  AdminUserStatus,
  { label: string; variant: "default" | "secondary" | "success" | "warning" }
> = {
  active: { label: "Đang hoạt động", variant: "success" },
  invited: { label: "Mới mời", variant: "default" },
  paused: { label: "Tạm dừng", variant: "secondary" },
  review: { label: "Cần hỗ trợ", variant: "warning" },
};

const USER_FILTER_TABS: Array<{
  value: "all" | AdminUserStatus;
  label: string;
}> = [
  { value: "all", label: "Tất cả" },
  { value: "active", label: "Hoạt động" },
  { value: "invited", label: "Mới mời" },
  { value: "paused", label: "Tạm dừng" },
  { value: "review", label: "Cần hỗ trợ" },
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

function getInitials(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return "LT";
  }

  return normalized
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

function createEmptyUser(): AdminUser {
  const now = new Date().toISOString();

  return {
    id: "",
    display_name: "",
    email: "",
    current_level: "A2",
    learning_goal: "",
    status: "active",
    sessions_completed: 0,
    streak: 0,
    last_active_at: now,
    updated_at: now,
    notes: "",
  };
}

function getStatusMeta(status: AdminUserStatus) {
  return USER_STATUS_META[status];
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

interface UsersManagementProps {
  users: AdminUser[];
}

export function UsersManagement({ users }: UsersManagementProps) {
  const [records, setRecords] = React.useState(users);
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | AdminUserStatus
  >("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<AdminUser>(() => createEmptyUser());
  const [isSaving, setIsSaving] = React.useState(false);

  React.useEffect(() => {
    setRecords(users);
  }, [users]);

  const visibleUsers = React.useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return [...records]
      .filter((user) => {
        if (statusFilter !== "all" && user.status !== statusFilter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        return normalizeSearch(
          [
            user.display_name,
            user.email,
            user.learning_goal,
            user.notes,
            user.current_level,
          ].join(" "),
        ).includes(normalizedQuery);
      })
      .sort(
        (left, right) =>
          new Date(right.updated_at).getTime() -
          new Date(left.updated_at).getTime(),
      );
  }, [query, records, statusFilter]);

  const summary = React.useMemo(() => {
    const active = records.filter((user) => user.status === "active").length;
    const invited = records.filter((user) => user.status === "invited").length;
    const attention = records.filter(
      (user) => user.status === "review" || user.status === "paused",
    ).length;

    return { active, invited, attention };
  }, [records]);

  const updateDraft = <K extends keyof AdminUser>(
    key: K,
    value: AdminUser[K],
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleOpenCreate = () => {
    setDraft(createEmptyUser());
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setDraft({ ...user });
    setIsDialogOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!draft.display_name.trim() || !draft.email.trim()) {
      toast.error("Vui lòng nhập tên và email của người dùng.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await upsertAdminUser({
        ...draft,
        display_name: draft.display_name.trim(),
        email: draft.email.trim(),
        learning_goal: draft.learning_goal.trim(),
        notes: draft.notes.trim(),
      });

      if (!result.success || !result.user) {
        toast.error(result.error ?? "Không thể lưu người dùng.");
        return;
      }

      setRecords((current) => {
        const exists = current.some((item) => item.id === result.user?.id);

        if (exists) {
          return current.map((item) =>
            item.id === result.user?.id ? result.user : item,
          );
        }

        return [result.user, ...current];
      });

      setIsDialogOpen(false);
      toast.success("Đã lưu người dùng.");
    } catch {
      toast.error("Không thể lưu người dùng. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users2}
          label="Tổng học viên"
          value={records.length}
          detail="Tất cả tài khoản trong hệ thống"
        />
        <MetricCard
          icon={CircleCheck}
          label="Đang hoạt động"
          value={summary.active}
          detail="Sẵn sàng tham gia các buổi luyện nói"
        />
        <MetricCard
          icon={Sparkles}
          label="Mới mời"
          value={summary.invited}
          detail="Cần hoàn tất onboarding"
        />
        <MetricCard
          icon={CircleAlert}
          label="Cần hỗ trợ"
          value={summary.attention}
          detail="Cần theo dõi thêm từ admin"
        />
      </div>

      <Card size="lg" className="border-border/60">
        <CardContent className="space-y-5 py-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">
                  Bảng người dùng
                </h2>
                <Badge variant="secondary" size="sm">
                  {visibleUsers.length}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Tìm nhanh học viên, cập nhật cấp độ, mục tiêu và trạng thái học.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto xl:items-center">
              <div className="relative w-full sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tìm tên, email, mục tiêu..."
                  className="pl-9"
                />
              </div>
              <Button onClick={handleOpenCreate} className="shrink-0">
                <Plus className="size-4" />
                Thêm người dùng
              </Button>
            </div>
          </div>

          <Tabs
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as "all" | AdminUserStatus)
            }
            className="w-full"
          >
            <TabsList variant="line" className="w-full flex-wrap justify-start">
              {USER_FILTER_TABS.map((tab) => (
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
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead>Mục tiêu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hoạt động gần nhất</TableHead>
                  <TableHead>Phiên</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleUsers.length > 0 ? (
                  visibleUsers.map((user) => {
                    const statusMeta = getStatusMeta(user.status);

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="whitespace-normal">
                          <div className="flex items-center gap-3">
                            <Avatar size="sm" className="ring-1 ring-border/40">
                              <AvatarImage
                                src={user.avatar_url}
                                alt={user.display_name}
                              />
                              <AvatarFallback>
                                {getInitials(user.display_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 space-y-1">
                              <p className="font-semibold leading-none text-foreground">
                                {user.display_name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" size="sm">
                            {user.current_level}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[18rem] whitespace-normal">
                          <div className="space-y-1">
                            <p className="font-medium leading-snug text-foreground">
                              {user.learning_goal}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {user.notes || "Không có ghi chú bổ sung."}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusMeta.variant} size="sm">
                            {statusMeta.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(user.last_active_at)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-foreground">
                              {user.sessions_completed} buổi
                            </div>
                            <div className="text-muted-foreground">
                              Streak {user.streak} ngày
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(user)}
                          >
                            <PencilLine className="size-4" />
                            Sửa
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                        <Users2 className="size-6 text-primary" />
                        <p className="font-medium text-foreground">
                          Không tìm thấy người dùng phù hợp
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
              {draft.id ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
            </SheetTitle>
            <SheetDescription>Sửa nhanh thông tin.</SheetDescription>
          </SheetHeader>

          <form className="space-y-6" onSubmit={handleSave}>
              <FieldGroup className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="user-display-name">
                    Tên hiển thị
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="user-display-name"
                      value={draft.display_name}
                      onChange={(event) =>
                        updateDraft("display_name", event.target.value)
                      }
                      placeholder="Ví dụ: Nguyễn Minh Anh"
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="user-email">Email</FieldLabel>
                  <FieldContent>
                    <Input
                      id="user-email"
                      type="email"
                      value={draft.email}
                      onChange={(event) =>
                        updateDraft("email", event.target.value)
                      }
                      placeholder="example@lexi.app"
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="user-level">Cấp độ</FieldLabel>
                  <FieldContent>
                    <Select
                      value={draft.current_level}
                      onValueChange={(value) =>
                        updateDraft(
                          "current_level",
                          value as AdminUser["current_level"],
                        )
                      }
                    >
                      <SelectTrigger id="user-level" className="w-full">
                        <SelectValue placeholder="Chọn cấp độ" />
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
                  <FieldLabel htmlFor="user-status">Trạng thái</FieldLabel>
                  <FieldContent>
                    <Select
                      value={draft.status}
                      onValueChange={(value) =>
                        updateDraft("status", value as AdminUserStatus)
                      }
                    >
                      <SelectTrigger id="user-status" className="w-full">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_FILTER_TABS.filter(
                          (tab) => tab.value !== "all",
                        ).map((tab) => (
                          <SelectItem key={tab.value} value={tab.value}>
                            {tab.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              </FieldGroup>


              <FieldGroup className="grid gap-4 md:grid-cols-2">
                <Field className="md:col-span-2">
                  <FieldLabel htmlFor="user-learning-goal">
                    Mục tiêu học tập
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="user-learning-goal"
                      value={draft.learning_goal}
                      onChange={(event) =>
                        updateDraft("learning_goal", event.target.value)
                      }
                      placeholder="Ví dụ: Du lịch tự tin"
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="user-sessions-completed">
                    Số buổi đã học
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id="user-sessions-completed"
                      type="number"
                      min={0}
                      value={draft.sessions_completed}
                      onChange={(event) =>
                        updateDraft(
                          "sessions_completed",
                          Number.isNaN(event.target.valueAsNumber)
                            ? 0
                            : event.target.valueAsNumber,
                        )
                      }
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="user-streak">Streak hiện tại</FieldLabel>
                  <FieldContent>
                    <Input
                      id="user-streak"
                      type="number"
                      min={0}
                      value={draft.streak}
                      onChange={(event) =>
                        updateDraft(
                          "streak",
                          Number.isNaN(event.target.valueAsNumber)
                            ? 0
                            : event.target.valueAsNumber,
                        )
                      }
                    />
                  </FieldContent>
                </Field>
              </FieldGroup>


              <FieldGroup className="grid gap-4">
                <Field>
                  <FieldLabel htmlFor="user-notes">Ghi chú</FieldLabel>
                  <FieldContent>
                    <Textarea
                      id="user-notes"
                      value={draft.notes}
                      onChange={(event) =>
                        updateDraft("notes", event.target.value)
                      }
                      placeholder="Ví dụ: cần thêm bài tập phản xạ, ưu tiên hội thoại ngắn..."
                      className="min-h-28"
                    />
                  </FieldContent>
                  <FieldDescription>Chỉ admin thấy.</FieldDescription>
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
                Lưu người dùng
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
