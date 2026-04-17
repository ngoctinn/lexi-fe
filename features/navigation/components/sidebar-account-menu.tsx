"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { ChevronUp, LogOut, Route, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { ProfileData } from "@/features/profile/api/profile.actions";

interface SidebarAccountMenuProps {
  profile: ProfileData | null;
}

function getInitials(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return "LT";
  }

  return normalized
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
}

export function SidebarAccountMenu({ profile }: SidebarAccountMenuProps) {
  const router = useRouter();
  const displayName =
    profile?.display_name?.trim() || profile?.email?.trim() || "Tài khoản";
  const email = profile?.email?.trim() || "Mở menu tài khoản";
  const initials = getInitials(displayName);

  const handleNavigate = React.useCallback(
    (href: string) => {
      router.push(href);
    },
    [router],
  );

  const handleLogout = React.useCallback(async () => {
    try {
      await signOut();
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [router]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type="button"
        className={cn(
          "group flex h-auto min-h-14 w-full items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/30 px-3 py-2.5 text-left text-sidebar-foreground transition-colors hover:bg-sidebar-accent focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2",
        )}
      >
        <Avatar size="sm" className="shrink-0">
          <AvatarImage src={profile?.avatar_url} alt={displayName} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col items-start text-left group-data-[collapsible=icon]:hidden">
          <span className="truncate text-sm font-semibold text-sidebar-foreground">
            {displayName}
          </span>
          <span className="truncate text-xs text-sidebar-foreground/70">
            {email}
          </span>
        </div>

        <ChevronUp className="ml-auto size-4 shrink-0 text-sidebar-foreground/70 transition-transform group-data-[state=open]:rotate-180 group-data-[collapsible=icon]:hidden" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={12}
        className="w-72 border-border/60 bg-popover/95 p-2"
      >
        <DropdownMenuLabel className="px-2 pt-1 pb-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="gap-2.5 px-3 py-2.5 text-muted-foreground hover:text-foreground"
          onSelect={() => handleNavigate("/profile")}
        >
          <UserRound className="size-4 text-muted-foreground" />
          Hồ sơ cá nhân
        </DropdownMenuItem>

        <DropdownMenuItem
          className="gap-2.5 px-3 py-2.5 text-muted-foreground hover:text-foreground"
          onSelect={() => handleNavigate("/onboarding")}
        >
          <Route className="size-4 text-muted-foreground" />
          Thiết lập lộ trình
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="gap-2.5 px-3 py-2.5 text-muted-foreground hover:text-foreground"
          onSelect={(event) => {
            event.preventDefault();
            void handleLogout();
          }}
        >
          <LogOut className="size-4 text-muted-foreground" />
          Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
