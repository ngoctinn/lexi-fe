import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  actions?: ReactNode;
  className?: string;
}

/**
 * PageHeader Component
 * Đã hạ z-index về 0 để không che mất đường phân cách dọc (vertical separator) 
 * và bóng đổ của Sidebar khi ở chế độ expand.
 */
export function PageHeader({
  icon: Icon,
  title,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-0 h-20 bg-background border-b border-border/40",
        "flex w-full shrink-0 items-center justify-between px-4 sm:px-6 md:px-8",
        "rounded-t-xl", // Bo góc để khớp với SidebarInset card
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {/* Icon wrapper - size-10 khớp với Logo 40px của Sidebar */}
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/10">
          <Icon className="size-5.5" strokeWidth={2.25} />
        </div>

        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
