"use client";

import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminModeBannerProps {
  className?: string;
}

/**
 * Banner hiển thị ở top của page area khi user là admin
 * Giúp admin nhận biết đang sử dụng account admin
 * Nằm trong SidebarInset, không lấn sang sidebar
 */
export function AdminModeBanner({ className }: AdminModeBannerProps) {
  return (
    <div
      className={cn(
        "w-full bg-primary-500 border-b border-primary-600 px-4 py-2 shrink-0",
        className
      )}
    >
      <div className="flex items-center justify-center gap-2 text-white">
        <Shield className="size-4" />
        <span className="text-xs font-extrabold uppercase tracking-wider">
          Admin Mode
        </span>
      </div>
    </div>
  );
}
