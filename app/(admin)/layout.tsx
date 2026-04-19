import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { getProfile } from "@/features/profile/api/profile.actions";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getProfile();

  return (
    <SidebarProvider className="h-full overflow-hidden bg-muted/50">
      <AdminSidebar profile={profile} />
      <SidebarInset className="overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}