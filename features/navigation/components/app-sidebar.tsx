"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Mic,
  BrainCircuit,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

import type { ProfileData } from "@/features/profile/api/profile.actions";
import { SidebarAccountMenu } from "./sidebar-account-menu";

const mainNavItems = [
  {
    title: "Tổng quan",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Flashcard",
    url: "/flashcards",
    icon: BrainCircuit,
  },
  {
    title: "Luyện nói",
    url: "/session/new",
    icon: Mic,
  },
];

const sidebarIconClassName =
  "text-sidebar-icon group-data-[active=true]/menu-button:text-primary-400";
const sidebarIconStrokeWidth = 2.15;

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  profile?: ProfileData | null;
}

export function AppSidebar({
  profile,
  className,
  ...sidebarProps
}: AppSidebarProps) {
  const pathname = usePathname();
  const isSpeakingFlowPath =
    pathname === "/session/new" || pathname.startsWith("/session/");

  const isMainNavItemActive = (itemUrl: string) =>
    itemUrl === pathname || (itemUrl === "/session/new" && isSpeakingFlowPath);

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      {...sidebarProps}
      className={cn("bg-transparent border-none", className)}
    >
      <SidebarHeader className="pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Lexi"
              className="hover:bg-transparent hover:shadow-none active:translate-y-0 active:shadow-none data-active:bg-transparent data-active:shadow-none"
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <Logo showText={false} href="/" className="shrink-0" />
                <span className="font-extrabold tracking-tight text-2xl text-primary group-data-[collapsible=icon]:hidden">
                  Lexi
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Chính
          </SidebarGroupLabel>
          <SidebarMenu>
            {mainNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isMainNavItemActive(item.url)}
                  tooltip={item.title}
                  size="lg"
                  className="transition-all duration-200"
                >
                  <Link href={item.url}>
                    <item.icon
                      className={sidebarIconClassName}
                      strokeWidth={sidebarIconStrokeWidth}
                    />
                    <span className="group-data-[collapsible=icon]:hidden">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="mx-0" />

      <SidebarFooter className="py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarAccountMenu profile={profile ?? null} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
