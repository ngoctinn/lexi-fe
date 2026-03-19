"use client"

import * as React from "react"
import {
  Map,
  BookOpen,
  PenTool,
  Trophy,
  Store,
  User,
  Settings,
  LogOut,
  GraduationCap
} from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const mainNavItems = [
  {
    title: "Lộ trình học",
    url: "/learn",
    icon: Map,
    isActive: true, // Mock active state
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
    title: "Bảng xếp hạng",
    url: "/leaderboard",
    icon: Trophy,
  },
  {
    title: "Cửa hàng",
    url: "/shop",
    icon: Store,
  },
]

const footerNavItems = [
  {
    title: "Hồ sơ",
    url: "/profile",
    icon: User,
  },
  {
    title: "Cài đặt",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="sidebar" collapsible="icon" {...props}>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </div>
          <span className="group-data-[collapsible=icon]:hidden">LexiLearn</span>
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={item.isActive} 
                    tooltip={item.title}
                    size="lg" // Slightly larger for easier tapping
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {footerNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    size="lg"
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  tooltip="Đăng xuất"
                  size="lg"
                  className="text-destructive hover:bg-destructive/15 hover:text-destructive! active:bg-destructive/20 active:text-destructive!"
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle log out
                  }}
                >
                  <button>
                    <LogOut />
                    <span>Đăng xuất</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}
