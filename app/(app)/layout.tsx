import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/navigation";
import { getProfile } from "@/features/profile/api/profile.actions";

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

  if (profile?.is_new_user === true) {
    redirect("/onboarding");
  }

  return (
    <SidebarProvider className="h-full overflow-hidden">
      <AppSidebar profile={profile} />
      <SidebarInset className="overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
