"use client"

import type { ReactNode } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "@/components/app-sidebar"
import styles from "@/components/no-scrollbar.module.css"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Fixed sidebar */}
        <AppSidebar />

        {/* Main content area */}
        <main className="flex-1 flex flex-col min-h-0 bg-sky-50">
          <div className={`flex-1 overflow-y-auto ${styles.noScrollbar}`}>
            <div className="h-full w-full p-4 md:p-6">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
