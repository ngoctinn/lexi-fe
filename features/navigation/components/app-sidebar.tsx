"use client";

import * as React from "react";
import Image from "next/image";
import {
  Map,
  Trophy,
  Store,
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

import type { ProfileData } from "@/features/profile/api/profile.actions";
import { SidebarAccountMenu } from "./sidebar-account-menu";

const mainNavItems = [
  {
    title: "Tổng quan",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Lộ trình học",
    url: "/learn",
    icon: Map,
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
  {
    title: "Cửa hàng",
    url: "/shop",
    icon: Store,
  },
];

const communityNavItems = [
  {
    title: "Bảng xếp hạng",
    url: "/leaderboard",
    icon: Trophy,
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
              tooltip="LexiLearn"
              className="hover:bg-transparent hover:shadow-none active:translate-y-0 active:shadow-none data-active:bg-transparent data-active:shadow-none"
            >
              <Link href="/">
                <Image
                  src="/logo.svg"
                  alt="Lexi"
                  width={40}
                  height={40}
                  priority
                  className="size-10 shrink-0 object-contain"
                />
                <span className="font-extrabold tracking-tight text-2xl text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                  LexiLearn
                </span>
              </Link>
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

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Cộng đồng
          </SidebarGroupLabel>
          <SidebarMenu>
            {communityNavItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={item.url === pathname}
                  tooltip={item.title}
                  size="lg"
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
