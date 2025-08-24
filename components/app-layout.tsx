"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  BookOpen,
  Users,
  MessageSquare,
  Zap,
  Coins,
  Vault,
  Settings,
  LogOut,
  Menu,
  UserIcon,
  Trophy,
  CircleDollarSign,
  GraduationCap,
  Lightbulb,
  UserCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import XPurchaseModal from "@/components/xp-purchase-modal"
import { toast } from "@/hooks/use-toast"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import AppSidebar from "./app-sidebar"

interface NavLinkProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, label, isActive }) => {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
        isActive ? "bg-muted text-primary" : ""
      }`}
    >
      {icon}
      {label}
    </Link>
  )
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const { user, logout, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [isXPPurchaseModalOpen, setIsXPPurchaseModalOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      })
      router.push("/")
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0E13]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Please log in to access the dashboard.</p>
      </div>
    )
  }

  if (!user) {
    router.push("/")
    return null
  }

  const isOn = (href: string) => pathname === href

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="text-sm text-muted-foreground">Dashboard</div>
        </header>
        <div className="flex flex-1 flex-col">
          {/* Desktop Sidebar */}
          <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                  <GraduationCap className="h-6 w-6" />
                  <span className="">Peerverse</span>
                </Link>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <nav className="grid items-start px-4 text-sm font-medium lg:px-6 gap-1">
                  <NavLink
                    href="/dashboard"
                    icon={<Home className="h-4 w-4" />}
                    label="Dashboard"
                    isActive={isOn("/dashboard")}
                  />
                  <NavLink
                    href="/dashboard/learn"
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Learn"
                    isActive={isOn("/dashboard/learn")}
                  />
                  <NavLink
                    href="/dashboard/tutor-hub"
                    icon={<Lightbulb className="h-4 w-4" />}
                    label="Tutor Hub"
                    isActive={isOn("/dashboard/tutor-hub")}
                  />
                  <NavLink
                    href="/dashboard/marketplace"
                    icon={<Coins className="h-4 w-4" />}
                    label="Marketplace"
                    isActive={isOn("/dashboard/marketplace")}
                  />
                  <NavLink
                    href="/dashboard/vault"
                    icon={<Vault className="h-4 w-4" />}
                    label="Vault"
                    isActive={isOn("/dashboard/vault")}
                  />
                  <NavLink
                    href="/dashboard/community"
                    icon={<Users className="h-4 w-4" />}
                    label="Community"
                    isActive={isOn("/dashboard/community")}
                  />
                  <NavLink
                    href="/dashboard/forum"
                    icon={<MessageSquare className="h-4 w-4" />}
                    label="Forum"
                    isActive={isOn("/dashboard/forum")}
                  />
                  <NavLink
                    href="/dashboard/mentorship"
                    icon={<UserCheck className="h-4 w-4" />}
                    label="Mentorship Circles"
                    isActive={isOn("/dashboard/mentorship")}
                  />
                  <NavLink
                    href="/dashboard/leaderboard"
                    icon={<Trophy className="h-4 w-4" />}
                    label="Leaderboard"
                    isActive={isOn("/dashboard/leaderboard")}
                  />
                  <NavLink
                    href="/dashboard/profile"
                    icon={<UserIcon className="h-4 w-4" />}
                    label="Profile"
                    isActive={isOn("/dashboard/profile")}
                  />
                  <NavLink
                    href="/dashboard/settings"
                    icon={<Settings className="h-4 w-4" />}
                    label="Settings"
                    isActive={isOn("/dashboard/settings")}
                  />
                </nav>
              </div>
              <div className="mt-auto p-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">XP: {user?.xp || 0}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-auto bg-transparent"
                    onClick={() => setIsXPPurchaseModalOpen(true)}
                  >
                    <CircleDollarSign className="h-4 w-4 mr-1" /> Buy XP
                  </Button>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start h-auto p-2">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40&query=user-avatar"} />
                        <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">{user?.name || "Guest"}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {user?.principal || "Not Connected"}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-500">
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Mobile Header and Main Content */}
          <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                  <nav className="grid gap-2 text-lg font-medium">
                    <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4">
                      <GraduationCap className="h-6 w-6" />
                      <span>Peerverse</span>
                    </Link>
                    <NavLink
                      href="/dashboard"
                      icon={<Home className="h-5 w-5" />}
                      label="Dashboard"
                      isActive={isOn("/dashboard")}
                    />
                    <NavLink
                      href="/dashboard/learn"
                      icon={<BookOpen className="h-5 w-5" />}
                      label="Learn"
                      isActive={isOn("/dashboard/learn")}
                    />
                    <NavLink
                      href="/dashboard/tutor-hub"
                      icon={<Lightbulb className="h-5 w-5" />}
                      label="Tutor Hub"
                      isActive={isOn("/dashboard/tutor-hub")}
                    />
                    <NavLink
                      href="/dashboard/marketplace"
                      icon={<Coins className="h-5 w-5" />}
                      label="Marketplace"
                      isActive={isOn("/dashboard/marketplace")}
                    />
                    <NavLink
                      href="/dashboard/vault"
                      icon={<Vault className="h-5 w-5" />}
                      label="Vault"
                      isActive={isOn("/dashboard/vault")}
                    />
                    <NavLink
                      href="/dashboard/community"
                      icon={<Users className="h-5 w-5" />}
                      label="Community"
                      isActive={isOn("/dashboard/community")}
                    />
                    <NavLink
                      href="/dashboard/forum"
                      icon={<MessageSquare className="h-5 w-5" />}
                      label="Forum"
                      isActive={isOn("/dashboard/forum")}
                    />
                    <NavLink
                      href="/dashboard/mentorship"
                      icon={<UserCheck className="h-5 w-5" />}
                      label="Mentorship Circles"
                      isActive={isOn("/dashboard/mentorship")}
                    />
                    <NavLink
                      href="/dashboard/leaderboard"
                      icon={<Trophy className="h-5 w-5" />}
                      label="Leaderboard"
                      isActive={isOn("/dashboard/leaderboard")}
                    />
                    <NavLink
                      href="/dashboard/profile"
                      icon={<UserIcon className="h-5 w-5" />}
                      label="Profile"
                      isActive={isOn("/dashboard/profile")}
                    />
                    <NavLink
                      href="/dashboard/settings"
                      icon={<Settings className="h-5 w-5" />}
                      label="Settings"
                      isActive={isOn("/dashboard/settings")}
                    />
                  </nav>
                  <div className="mt-auto pt-4 border-t">
                    <div className="flex items-center gap-2 mb-4">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold">XP: {user?.xp || 0}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-auto bg-transparent"
                        onClick={() => setIsXPPurchaseModalOpen(true)}
                      >
                        <CircleDollarSign className="h-4 w-4 mr-1" /> Buy XP
                      </Button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start h-auto p-2">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src={user?.avatar || "/placeholder.svg?height=40&width=40&query=user-avatar"}
                            />
                            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col items-start">
                            <span className="font-medium text-sm">{user?.name || "Guest"}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {user?.principal || "Not Connected"}
                            </span>
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/profile" className="flex items-center">
                            <UserIcon className="mr-2 h-4 w-4" /> Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/settings" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" /> Settings
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-500">
                          <LogOut className="mr-2 h-4 w-4" /> Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </SheetContent>
              </Sheet>
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <GraduationCap className="h-6 w-6" />
                <span className="">Peerverse</span>
              </Link>
              <div className="ml-auto flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold text-sm">XP: {user?.xp || 0}</span>
                <Button variant="outline" size="sm" onClick={() => setIsXPPurchaseModalOpen(true)}>
                  <CircleDollarSign className="h-4 w-4 mr-1" /> Buy
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40&query=user-avatar"} />
                        <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="sr-only">Toggle user menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
          </div>
        </div>
      </SidebarInset>
      <XPurchaseModal isOpen={isXPPurchaseModalOpen} onClose={() => setIsXPPurchaseModalOpen(false)} />
    </SidebarProvider>
  )
}

export default AppLayout
