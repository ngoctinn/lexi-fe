"use client";

import * as React from "react";
import Image from "next/image";
import {
  Map,
  BookOpen,
  Trophy,
  Store,
  User,
  LogOut,
  LayoutDashboard,
  Mic,
  BrainCircuit,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";

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
    title: "Luyện từ",
    url: "/vocabulary",
    icon: BookOpen,
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
  {
    title: "Hồ sơ",
    url: "/profile",
    icon: User,
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
  "text-sidebar-icon group-data-[active=true]/menu-button:text-primary";
const sidebarIconStrokeWidth = 2.15;

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      {...props}
      className="bg-sidebar border-r-0"
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
                  width={32}
                  height={32}
                  priority
                  className="size-8 shrink-0 object-contain"
                />
                <span className="font-extrabold tracking-tight text-xl text-sidebar-foreground group-data-[collapsible=icon]:hidden">
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
                  isActive={item.url === pathname}
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
            <SidebarMenuButton
              size="lg"
              className="text-sidebar-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group-data-[collapsible=icon]:justify-center"
              onClick={handleLogout}
              tooltip="Đăng xuất"
            >
              <LogOut
                className={sidebarIconClassName}
                strokeWidth={sidebarIconStrokeWidth}
              />
              <span className="group-data-[collapsible=icon]:hidden font-medium">
                Đăng xuất
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
