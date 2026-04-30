import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/navigation";
import { getProfile } from "@/features/profile/api/profile.actions";
import { ProfileRoleProvider } from "@/features/profile/components/profile-role-provider";
import { AdminModeProvider } from "@/components/admin/admin-mode-provider";

/**
 * Layout chính của ứng dụng (Authenticated Section)
 * Đảm nhận vai trò Onboarding Guard ở Server-side
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();

  // If profile fetch fails, user is not authenticated
  if (!profile) {
    redirect("/login");
  }

  // If user is new, redirect to onboarding
  if (profile.is_new_user === true) {
    redirect("/onboarding");
  }

  const isAdmin = profile.role === "ADMIN";

  return (
    <ProfileRoleProvider role={profile.role}>
      <SidebarProvider className="h-full overflow-hidden bg-muted/50">
        <AppSidebar profile={profile} />
        <SidebarInset className="overflow-hidden flex flex-col">
          <AdminModeProvider isAdmin={isAdmin} />
          <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </ProfileRoleProvider>
  );
}
