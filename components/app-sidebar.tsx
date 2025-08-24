"use client"

import type * as React from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Home,
  BookOpen,
  ShoppingBag,
  Video,
  Users,
  MessageSquare,
  UserCheck,
  BarChart3,
  Shield,
  Wallet,
  Settings,
  Github,
  Twitter,
  Disc,
  Rss,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import styles from "./no-scrollbar.module.css"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

const items = [
  { title: "Overview", href: "/dashboard", icon: Home },
  { title: "Learn", href: "/dashboard/learn", icon: BookOpen },
  { title: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
  { title: "Sessions", href: "/dashboard/tutor-hub", icon: Video },
  { title: "Mentorship", href: "/dashboard/mentorship", icon: UserCheck },
  { title: "Community", href: "/dashboard/community", icon: Users },
  { title: "Forum", href: "/dashboard/forum", icon: MessageSquare },
  { title: "Stats", href: "/dashboard/leaderboard", icon: BarChart3 },
  // Use Shield icon for the Vault section to avoid importing a non-existent "Vault" icon
  { title: "Vault", href: "/dashboard/vault", icon: Shield },
  { title: "Profile", href: "/dashboard/profile", icon: Wallet },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/')
    } catch (error) {
      console.error('Failed to log out:', error)
    }
  }

  return (
    <Sidebar
      collapsible="none"
      className="bg-[linear-gradient(180deg,#0c1220_0%,#0b1020_40%,#0a0f1a_100%)] text-white"
      style={
        {
          "--sidebar-width": "18rem",
          "--sidebar-width-icon": "3.5rem",
        } as React.CSSProperties
      }
    >
      <SidebarHeader className="px-3 pt-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2">
          <img src="/images/n.png" alt="Peerverse logo" width={32} height={32} className="h-8 w-8 rounded-md" />
          <div className="text-sm font-semibold">Peerverse</div>
        </div>
      </SidebarHeader>

      <SidebarContent className={styles.noScrollbar}>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "rounded-full text-white/80 hover:text-white",
                        isActive && "bg-white/10 text-white",
                      )}
                    >
                      <Link href={item.href} className="flex items-center">
                        <Icon />
                        <span>{item.title}</span>
                        {isActive && <ChevronRight className="ml-auto opacity-70" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/60">Quick Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings" className="rounded-full text-white/80 hover:text-white">
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-2 rounded-lg px-3 py-6 text-white/80 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-5" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
