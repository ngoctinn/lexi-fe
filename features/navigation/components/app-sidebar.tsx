"use client"

import * as React from "react"
import {
  GraduationCap,
  Map,
  BookOpen,
  PenTool,
  Trophy,
  Store,
  User,
  Settings,
  LogOut,
  Flame,
  Star,
  LayoutDashboard,
  Mic,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { signOut } from "aws-amplify/auth"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar"

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
    title: "Luyện nói",
    url: "/session/new",
    icon: Mic,
  },
  {
    title: "Từ vựng",
    url: "/vocabulary",
    icon: BookOpen,
  },
  {
    title: "Luyện tập",
    url: "/practice",
    icon: PenTool,
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
]

const communityNavItems = [
  {
    title: "Bảng xếp hạng",
    url: "/leaderboard",
    icon: Trophy,
  },
]

const user = {
  name: "Ngọc Tín",
  email: "ngoctin@example.com",
  avatar: "/avatars/user.jpg",
  streak: 14,
  points: 1250,
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut();
      router.refresh(); 
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Sidebar variant="inset" collapsible="icon" {...props} className="bg-sidebar border-r-0">
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
                <div className="bg-primary flex shrink-0 size-6 items-center justify-center rounded-md shadow-[0_2px_0_0_var(--color-primary-shadow)]">
                  <GraduationCap className="text-primary-foreground" />
                </div>
                <span className="font-extrabold tracking-tight text-xl text-primary group-data-[collapsible=icon]:hidden">LexiLearn</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Chính</SidebarGroupLabel>
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
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Cộng đồng</SidebarGroupLabel>
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
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
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
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group-data-[collapsible=icon]:justify-center"
              onClick={handleLogout}
              tooltip="Đăng xuất"
            >
              <LogOut className="size-4" />
              <span className="group-data-[collapsible=icon]:hidden font-medium">Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
