import { redirect } from "next/navigation";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
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
  // 1. Fetch Profile data (Đã được cache bởi Next.js)
  const profile = await getProfile();

  console.log("[AppLayout] Loaded profile:", {
    exists: !!profile,
    is_new_user: profile?.is_new_user,
    type: typeof profile?.is_new_user
  });

  // 2. Onboarding Guard: Nếu là user mới (is_new_user === true)
  // Chuyển hướng sang trang thiết lập hồ sơ
  if (profile?.is_new_user === true) {
    console.log("[AppLayout] User is new, redirecting to /onboarding");
    redirect("/onboarding");
  }

  // 3. Nếu fetch lỗi hoặc unauthorized
  if (!profile) {
    console.log("[AppLayout] Profile not found or unauthorized, staying on protected route (or consider redirect)");
    // redirect("/login");
  }

  return (
    <SidebarProvider className="h-full overflow-hidden">
      <AppSidebar />
      <SidebarInset>
        {/* Mobile-only top bar with sidebar trigger */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 md:hidden">
          <SidebarTrigger className="-ml-2" />
          <Logo textClassName="text-lg" />
        </header>
        
        <div className="flex flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
