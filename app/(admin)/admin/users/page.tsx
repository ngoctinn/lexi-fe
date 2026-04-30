import Link from "next/link";
import { ShieldCheck, Users2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { getAdminUsers } from "@/features/admin/actions/admin.actions";
import { UsersManagement } from "@/features/admin/components/users/users-management";

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        icon={Users2}
        title="Người dùng"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" size="sm">
              {users.length} tài khoản
            </Badge>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">
                <ShieldCheck className="size-4" />
                Tổng quan
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-4 md:p-8">
        <UsersManagement users={users} />
      </div>
    </div>
  );
}