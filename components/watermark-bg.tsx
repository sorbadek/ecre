"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  children: React.ReactNode
}

/**
 * WatermarkBackground
 * - Soft diagonal gradient
 * - Subtle watermark pattern (using CSS masks)
 */
export default function WatermarkBackground({ className, children }: Props) {
  return (
    <div
      className={cn(
        "relative min-h-svh w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950",
        className
      )}
    >
      {/* Gradient glow */}
      <div className="pointer-events-none absolute -left-1/3 -top-1/3 h-[60rem] w-[60rem] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-1/4 top-1/3 h-[50rem] w-[50rem] rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Subtle watermark pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(16px 16px at 16px 16px, rgba(255,255,255,0.14) 25%, rgba(255,255,255,0) 26%), radial-gradient(16px 16px at 0px 0px, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0) 26%)",
          backgroundSize: "48px 48px",
          backgroundPosition: "0 0, 24px 24px",
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  )
}
