import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { AdminAccessDenied } from "@/features/admin/components/admin-access-denied";
import { getProfile } from "@/features/profile/api/profile.actions";
import { isUserAdmin } from "@/lib/auth/admin";
import { ProfileRoleProvider } from "@/features/profile/components/profile-role-provider";
import { AdminModeProvider } from "@/components/admin/admin-mode-provider";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, isAdmin] = await Promise.all([
    getProfile(),
    isUserAdmin(),
  ]);

  // Block non-admin users from accessing admin area
  if (!isAdmin) {
    return <AdminAccessDenied />;
  }

  return (
    <ProfileRoleProvider role={profile?.role}>
      <SidebarProvider className="h-full overflow-hidden bg-muted/50">
        <AdminSidebar profile={profile} />
        <SidebarInset className="overflow-hidden flex flex-col">
          <AdminModeProvider isAdmin={true} />
          <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ProfileRoleProvider>
  );
}