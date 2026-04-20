import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardTileProps {
  title: string;
  description: string;
  href: string;
  label?: string;
  featured?: boolean;
}

export function DashboardTile({
  title,
  description,
  href,
  label,
  featured = false,
}: DashboardTileProps) {
  return (
    <Card
      size="sm"
      className={cn(
        "group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        featured && "md:col-span-2",
      )}
    >
      <Link
        href={href}
        className={cn(
          "flex h-full min-h-36 flex-col gap-4 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-300",
          featured && "min-h-44 md:min-h-48",
        )}
      >
        <div className="flex items-start justify-between gap-3 pt-1 px-4">
          <Badge variant="secondary" className="font-medium">
            {label ?? "Mở nhanh"}
          </Badge>

          <span className="text-sm font-bold text-muted-foreground transition-transform group-hover:translate-x-0.5">
            →
          </span>
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
