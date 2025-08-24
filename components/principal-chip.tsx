"use client"

import * as React from "react"
import { Copy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

function truncatePrincipal(text: string, left = 6, right = 6) {
  if (!text) return ""
  if (text.length <= left + right + 3) return text
  return `${text.slice(0, left)}…${text.slice(-right)}`
}

export default function PrincipalChip() {
  const { user } = useAuth()
  const displayName = user?.name || "User"
  const principal = user?.principal || "Not Connected"
  const [copied, setCopied] = React.useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(principal)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white">
      <Avatar className="h-8 w-8 ring-1 ring-white/10">
        <AvatarImage src={user?.avatar || "/placeholder.svg?height=40&width=40&query=user-avatar"} />
        <AvatarFallback>{displayName?.charAt(0) || "U"}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <div className="truncate font-medium">{displayName}</div>
        <div className="truncate text-xs text-white/70">{truncatePrincipal(principal)}</div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={copy}
        title="Copy principal"
        className="ml-1 h-8 w-8 text-white/80 hover:text-white"
      >
        <Copy className="h-4 w-4" />
        <span className="sr-only">Copy principal</span>
      </Button>
      {copied && <span className="text-xs text-emerald-300">Copied!</span>}
    </div>
  )
}
