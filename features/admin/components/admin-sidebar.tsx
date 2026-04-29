"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  LayoutGrid,
  ShieldCheck,
  SlidersHorizontal,
  Users2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { ProfileData } from "@/features/profile/api/profile.actions";
import { SidebarAccountMenu } from "@/features/navigation/components/sidebar-account-menu";
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
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const sidebarIconClassName =
  "text-sidebar-icon group-data-[active=true]/menu-button:text-primary-400";

const navigationItems = [
  {
    title: "Tổng quan",
    href: "/admin",
    icon: LayoutGrid,
  },
  {
    title: "Người dùng",
    href: "/admin/users",
    icon: Users2,
  },
  {
    title: "Kịch bản",
    href: "/admin/scenarios",
    icon: SlidersHorizontal,
  },
];

const quickLinks = [
  {
    title: "Giao diện học viên",
    href: "/dashboard",
    icon: ArrowLeftRight,
  },
];

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  profile?: ProfileData | null;
}

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export function AdminSidebar({
  profile,
  className,
  ...props
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className={cn("border-none bg-transparent", className)}
      {...props}
    >
      <SidebarHeader className="pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Lexi Admin"
              className="hover:bg-transparent hover:shadow-none active:translate-y-0 active:shadow-none data-active:bg-transparent data-active:shadow-none"
            >
              <Link href="/admin">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary ring-1 ring-primary-100">
                  <ShieldCheck className="size-5" />
                </div>
                <span className="font-extrabold tracking-tight text-2xl text-primary group-data-[collapsible=icon]:hidden">
                  Lexi Admin
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Quản lý
          </SidebarGroupLabel>
          <SidebarMenu>
            {navigationItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActivePath(pathname, item.href)}
                  tooltip={item.title}
                  size="lg"
                >
                  <Link href={item.href}>
                    <item.icon
                      className={sidebarIconClassName}
                      strokeWidth={2.15}
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
            Chuyển nhanh
          </SidebarGroupLabel>
          <SidebarMenu>
            {quickLinks.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={isActivePath(pathname, item.href)}
                  tooltip={item.title}
                  size="lg"
                >
                  <Link href={item.href}>
                    <item.icon
                      className={sidebarIconClassName}
                      strokeWidth={2.15}
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
