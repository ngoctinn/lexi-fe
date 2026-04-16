import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardTileProps {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  featured?: boolean;
}

export function DashboardTile({
  title,
  description,
  href,
  icon: Icon,
  label,
  featured = false,
}: DashboardTileProps) {
  return (
    <Card
      className={cn(
        "group border-b-0 bg-primary/8 p-0 py-0 shadow-none ring-1 ring-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/12 hover:shadow-md",
        featured && "md:col-span-2",
      )}
    >
      <Link
        href={href}
        className={cn(
          "flex h-full min-h-36 flex-col gap-4 p-4 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/30",
          featured && "min-h-44 md:min-h-48",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-inset ring-primary/20 transition-colors group-hover:bg-primary/20",
              featured && "size-12",
            )}
          >
            <Icon
              className={cn("size-5", featured && "size-6")}
              strokeWidth={2.15}
            />
          </div>

          {label ? (
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700">
              {label}
            </span>
          ) : (
            <ArrowRight className="size-4 text-primary/70 transition-transform group-hover:translate-x-0.5" />
          )}
        </div>

        <div className="space-y-1">
          <h3
            className={cn(
              "font-semibold text-foreground",
              featured ? "text-base" : "text-sm",
            )}
          >
            {title}
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </Link>
    </Card>
  );
}
