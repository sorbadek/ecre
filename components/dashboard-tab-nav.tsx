"use client"

import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { label: "Overview", href: "/dashboard", segment: null as string | null },
  { label: "Learn", href: "/dashboard/learn", segment: "learn" },
  { label: "Marketplace", href: "/dashboard/marketplace", segment: "marketplace" },
  { label: "Sessions", href: "/dashboard/tutor-hub", segment: "tutor-hub" },
  { label: "Mentorship", href: "/dashboard/mentorship", segment: "mentorship" },
  { label: "Community", href: "/dashboard/community", segment: "community" },
  { label: "Forum", href: "/dashboard/forum", segment: "forum" },
  { label: "Stats", href: "/dashboard/leaderboard", segment: "leaderboard" },
  { label: "Vault", href: "/dashboard/vault", segment: "vault" },
  { label: "Profile", href: "/dashboard/profile", segment: "profile" },
  { label: "Settings", href: "/dashboard/settings", segment: "settings" },
]

export default function DashboardTabNav() {
  const active = useSelectedLayoutSegment()

  return (
    <nav
      aria-label="Dashboard Tabs"
      className="sticky top-0 z-10 mb-4 flex w-full flex-wrap gap-1 border-b border-white/10 bg-transparent/30 backdrop-blur"
    >
      {tabs.map((t) => {
        const isActive = active === t.segment || (!active && t.segment === null)
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "rounded-t-md px-3 py-2 text-sm transition-colors",
              "text-white/75 hover:text-white",
              isActive ? "bg-white/10 font-medium text-white" : "bg-transparent hover:bg-white/5",
            )}
          >
            {t.label}
          </Link>
        )
      })}
    </nav>
  )
}
