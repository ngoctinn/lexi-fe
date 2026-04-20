"use client";

import { ArrowLeftRight, Bot, UserCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RoleSwapCardProps {
  userRole: string;
  aiRole: string;
  onSwap: () => void;
  className?: string;
}

export function RoleSwapCard({
  userRole,
  aiRole,
  onSwap,
  className,
}: RoleSwapCardProps) {
  return (
    <div className={cn("relative w-full overflow-visible", className)}>
      <div className="flex flex-col gap-1.5">
        <div className="rounded-[1.5rem] border border-control-border-subtle bg-background px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive-50 text-destructive-600 shadow-[inset_0_-2px_0_0_var(--color-destructive-shadow-tint)]">
              <UserCircle className="size-4.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60 leading-none">
                Bạn là
              </span>
              <span className="mt-1 block truncate text-[14px] font-bold leading-tight text-foreground">
                {userRole}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-control-border-subtle bg-background px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-info-50 text-info-600 shadow-[inset_0_-2px_0_0_var(--color-info-shadow-tint)]">
              <Bot className="size-4.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60 leading-none">
                AI là
              </span>
              <span className="mt-1 block truncate text-[14px] font-bold leading-tight text-foreground">
                {aiRole}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onSwap}
          aria-label="Tráo vai"
          className="size-14 rounded-full border-8 border-background bg-background text-foreground shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition-none hover:bg-background hover:text-foreground active:translate-y-0! active:shadow-[0_1px_4px_rgba(15,23,42,0.08)]"
        >
          <ArrowLeftRight className="size-5" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
