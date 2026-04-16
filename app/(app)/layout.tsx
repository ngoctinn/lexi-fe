import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/navigation";
import { Logo } from "@/components/shared/logo";
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
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 md:hidden">
          <SidebarTrigger className="-ml-2" />
          <Logo textClassName="text-lg text-sidebar-foreground" />
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
