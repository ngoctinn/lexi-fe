"use client";

import * as React from "react";
import {
  CircleCheck,
  Loader2,
  PencilLine,
  Search,
  Users2,
} from "lucide-react";
import { toast } from "sonner";

import { updateAdminUser } from "@/features/admin/actions/admin.actions";
import type { AdminUser } from "@/features/admin/types";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const LEVEL_OPTIONS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatDateTime(value: string | undefined) {
  if (!value) return "N/A";

  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return "N/A";

    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "N/A";
  }
}

function getInitials(value: string) {
  const normalized = value.trim();
  if (!normalized) return "LT";

  return normalized
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
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
  const [isMounted, setIsMounted] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Partial<AdminUser> | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [localUpdates, setLocalUpdates] = React.useState<AdminUser[]>([]);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Merge server data with local updates
  const records = React.useMemo(() => {
    const merged = [...users];
    localUpdates.forEach((updated) => {
      const index = merged.findIndex((u) => u.id === updated.id);
      if (index >= 0) {
        merged[index] = updated;
      }
    });
    return merged;
  }, [users, localUpdates]);

  const visibleUsers = React.useMemo(() => {
    const normalizedQuery = normalizeSearch(query);

    return [...records]
      .filter((user) => {
        if (!normalizedQuery) return true;

        return normalizeSearch(
          [
            user.display_name,
            user.email,
            user.learning_goal_text,
            user.notes,
            user.current_level,
            user.target_level,
          ].join(" ")
        ).includes(normalizedQuery);
      })
      .sort(
        (left, right) =>
          new Date(right.updated_at || "").getTime() -
          new Date(left.updated_at || "").getTime()
      );
  }, [query, records]);

  const summary = React.useMemo(() => {
    const active = records.filter((user) => user.is_active).length;
    return { active, total: records.length };
  }, [records]);

  const updateDraft = <K extends keyof AdminUser>(
    key: K,
    value: AdminUser[K]
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleOpenEdit = (user: AdminUser) => {
    setDraft({ ...user });
    setIsDialogOpen(true);
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!draft || !draft.id) {
      toast.error("Không tìm thấy thông tin người dùng.");
      return;
    }

    if (!draft.display_name?.trim()) {
      toast.error("Vui lòng nhập tên người dùng.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await updateAdminUser(draft.id, {
        display_name: draft.display_name.trim(),
        current_level: draft.current_level,
        target_level: draft.target_level,
        is_active: draft.is_active,
        role: draft.role,
      });

      if (!result.success || !result.data) {
        toast.error(result.error ?? "Không thể lưu người dùng.");
        return;
      }

      const savedUser = result.data;

      setLocalUpdates((current) => {
        const exists = current.some((item) => item.id === savedUser.id);

        if (exists) {
          return current.map((item) =>
            item.id === savedUser.id ? savedUser : item
          );
        }

        return [savedUser, ...current];
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
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          icon={Users2}
          label="Tổng học viên"
          value={summary.total}
          detail="Tất cả tài khoản trong hệ thống"
        />
        <MetricCard
          icon={CircleCheck}
          label="Đang hoạt động"
          value={summary.active}
          detail="Tài khoản đang active"
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
                Tìm nhanh học viên, cập nhật cấp độ và mục tiêu.
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm tên, email, mục tiêu..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Cấp độ</TableHead>
                  <TableHead>Mục tiêu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Hoạt động gần nhất</TableHead>
                  <TableHead>Thống kê</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleUsers.length > 0 ? (
                  visibleUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="whitespace-normal">
                        <div className="min-w-0 space-y-1">
                          <p className="font-semibold leading-none text-foreground">
                            {user.display_name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
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
                            {user.target_level}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.learning_goal_text || "Chưa có mục tiêu"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.is_active ? "success" : "secondary"}
                          size="sm"
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {isMounted ? formatDateTime(user.last_active_at) : "..."}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="font-medium text-foreground">
                            {user.sessions_completed} buổi
                          </div>
                          <div className="text-muted-foreground">
                            {user.total_words_learned} từ
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                        <Users2 className="size-6 text-primary" />
                        <p className="font-medium text-foreground">
                          Không tìm thấy người dùng
                        </p>
                        <p className="text-sm">
                          Thử đổi từ khóa tìm kiếm.
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
            <SheetTitle>Chỉnh sửa người dùng</SheetTitle>
            <SheetDescription>Cập nhật thông tin người dùng.</SheetDescription>
          </SheetHeader>

          <form className="space-y-6 mt-6" onSubmit={handleSave}>
            <FieldGroup className="grid gap-4 md:grid-cols-2">
              <Field className="md:col-span-2">
                <FieldLabel htmlFor="user-display-name">
                  Tên hiển thị
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="user-display-name"
                    value={draft?.display_name || ""}
                    onChange={(event) =>
                      updateDraft("display_name", event.target.value)
                    }
                    placeholder="Ví dụ: Nguyễn Minh Anh"
                  />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="user-level">Cấp độ hiện tại</FieldLabel>
                <FieldContent>
                  <Select
                    value={draft?.current_level || "A2"}
                    onValueChange={(value) =>
                      updateDraft("current_level", value as AdminUser["current_level"])
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
                <FieldLabel htmlFor="user-target-level">
                  Cấp độ mục tiêu
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={draft?.target_level || "B1"}
                    onValueChange={(value) =>
                      updateDraft("target_level", value as AdminUser["target_level"])
                    }
                  >
                    <SelectTrigger id="user-target-level" className="w-full">
                      <SelectValue placeholder="Chọn cấp độ mục tiêu" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVEL_OPTIONS.map((level) => (
                        <SelectItem key={`target-${level}`} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="user-role">Vai trò</FieldLabel>
                <FieldContent>
                  <Select
                    value={draft?.role || "user"}
                    onValueChange={(value) =>
                      updateDraft("role", value as "user" | "admin")
                    }
                  >
                    <SelectTrigger id="user-role" className="w-full">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="user-active">Trạng thái</FieldLabel>
                <FieldContent>
                  <Select
                    value={draft?.is_active ? "active" : "inactive"}
                    onValueChange={(value) =>
                      updateDraft("is_active", value === "active")
                    }
                  >
                    <SelectTrigger id="user-active" className="w-full">
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
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
                Lưu người dùng
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
