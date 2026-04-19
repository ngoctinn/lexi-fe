import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  icon: Icon,
  title,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 h-20 border-b border-border/40 bg-background/95 backdrop-blur",
        "flex w-full shrink-0 items-center justify-between px-4 sm:px-6 md:px-8",
        "rounded-t-xl",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary border border-primary-100">
          <Icon className="size-5.5" strokeWidth={2.25} />
        </div>

        <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
