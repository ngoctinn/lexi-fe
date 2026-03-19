import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/features/navigation/components/app-sidebar";
import { Logo } from "@/components/logo";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Mobile-only top bar with sidebar trigger */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 md:hidden">
          <SidebarTrigger className="-ml-2" />
          <Logo textClassName="text-lg" />
        </header>
        <div className="flex flex-1 flex-col p-4 md:p-8">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
