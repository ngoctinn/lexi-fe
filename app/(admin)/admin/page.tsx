import Link from "next/link";
import type { ComponentType } from "react";
import {
  CircleCheck,
  ShieldCheck,
  Users2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getAdminScenarios,
  getAdminUsers,
} from "@/features/admin/actions/admin.actions";
import type { AdminUser, AdminScenario } from "@/features/admin/types";

export const dynamic = 'force-dynamic';

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getScenarioStatusMeta(isActive: boolean) {
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
  icon: ComponentType<{ className?: string }>;
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

export default async function AdminPage() {
  let users: AdminUser[] = [];
  let scenarios: AdminScenario[] = [];
  
  try {
    users = await getAdminUsers();
  } catch (error) {
    console.error("[admin-page] Error fetching users:", error);
  }
  
  try {
    scenarios = await getAdminScenarios();
  } catch (error) {
    console.error("[admin-page] Error fetching scenarios:", error);
  }

  const activeUsers = users.filter((user) => user.is_active).length;
  const activeScenarios = scenarios.filter(
    (scenario) => scenario.is_active,
  ).length;

  const recentUsers = [...users]
    .sort(
      (left, right) =>
        new Date(right.joined_at ?? 0).getTime() -
        new Date(left.joined_at ?? 0).getTime(),
    )
    .slice(0, 5);
  
  const recentScenarios = [...scenarios]
    .sort(
      (left, right) =>
        new Date(right.updated_at ?? 0).getTime() -
        new Date(left.updated_at ?? 0).getTime(),
    )
    .slice(0, 5);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        icon={ShieldCheck}
        title="Bảng điều khiển"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" size="sm">
              {activeScenarios}/{scenarios.length} kịch bản mở
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">Người dùng</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/admin/scenarios">Kịch bản</Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-4 md:p-8">
        <div className="flex flex-col gap-6">
          <Card
            size="lg"
            className="border-border/60 bg-linear-to-br from-primary-50 via-background to-muted/30"
          >
            <CardContent className="flex flex-col gap-6 py-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <Badge variant="default" size="sm">
                  Admin Console
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Quản lý học viên và kịch bản
                  </h2>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    Theo dõi nhanh người dùng và kịch bản.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href="/admin/users">Đi đến người dùng</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/admin/scenarios">Đi đến kịch bản</Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-96">
                <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Người dùng active
                  </p>
                  <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                    {activeUsers}
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Kịch bản đang mở
                  </p>
                  <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                    {activeScenarios}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              icon={Users2}
              label="Tổng học viên"
              value={users.length}
              detail="Tất cả tài khoản trong hệ thống"
            />
            <MetricCard
              icon={CircleCheck}
              label="Đang hoạt động"
              value={activeUsers}
              detail="Tài khoản đang active"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card size="lg" className="border-border/60">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>Người dùng gần đây</CardTitle>
                <CardDescription>Cập nhật gần đây.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Cập nhật</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              Không có người dùng nào
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Kiểm tra quyền admin hoặc dữ liệu trong database
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentUsers.map((user) => (
                        <TableRow key={user.user_id}>
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
                            <Badge variant="secondary" size="sm">
                              N/A
                            </Badge>
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
                            {user.joined_at ? formatDateTime(user.joined_at) : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card size="lg" className="border-border/60">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle>Kịch bản gần đây</CardTitle>
                <CardDescription>Cập nhật gần đây.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kịch bản</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Cập nhật</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentScenarios.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              Không có kịch bản nào
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Kiểm tra quyền admin hoặc dữ liệu trong database
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentScenarios.map((scenario) => {
                        const statusMeta = getScenarioStatusMeta(
                          scenario.is_active,
                        );

                        return (
                          <TableRow key={scenario.scenario_id}>
                            <TableCell className="whitespace-normal">
                              <div className="space-y-1">
                                <p className="font-semibold leading-none text-foreground">
                                  {scenario.scenario_title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {scenario.context}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" size="sm">
                                {scenario.difficulty_level ?? "B1"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusMeta.variant} size="sm">
                                {statusMeta.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {scenario.updated_at ? formatDateTime(scenario.updated_at) : "-"}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
