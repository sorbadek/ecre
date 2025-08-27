"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ForumTopLevelRedirectNotice() {
  const router = useRouter()

  useEffect(() => {
    // This component can be used to handle any redirects or notices
    // For now, we'll keep it empty as the main functionality is in the forum page
  }, [router])

  return null
}
