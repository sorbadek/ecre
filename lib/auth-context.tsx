"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { AuthClient } from "@dfinity/auth-client"

interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  xp?: number
  reputation?: number
  principal?: string // This is the PRIMARY IDENTIFIER
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Identity Provider URLs
const II_PROD_URL = "https://identity.ic0.app"
const II_LOCAL_URL = "https://identity.ic0.app"

const EIGHT_HOURS_NS = BigInt(8 * 60 * 60) * BigInt(1_000_000_000)

function detectIdentityProvider(): string {
  if (typeof window === "undefined") return II_PROD_URL
  const host = window.location.hostname
  const isLocalhost =
    host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost") || host.endsWith(".local")
  return isLocalhost ? II_LOCAL_URL : II_PROD_URL
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const authClientRef = useRef<AuthClient | null>(null)

  const identityProvider = useMemo(detectIdentityProvider, [])

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const client = await AuthClient.create()
        if (!mounted) return
        authClientRef.current = client

        const alreadyAuthenticated = await client.isAuthenticated()
        if (alreadyAuthenticated) {
          const identity = client.getIdentity()
          // THE PRINCIPAL IS THE UNIQUE IDENTIFIER
          const principal = identity.getPrincipal().toText()

          const hydratedUser: User = {
            id: principal, // Principal used as primary ID
            name: `User ${principal.slice(0, 5)}…`,
            avatar: "/generic-user-avatar.png",
            xp: 1250,
            reputation: 4.8,
            principal, // Stored separately for clarity
          }
          setUser(hydratedUser)
        } else {
          setUser(null)
        }
      } catch (e) {
        console.error("Failed to initialize AuthClient:", e)
        setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()
    return () => {
      mounted = false
    }
  }, [identityProvider])

  const login = async () => {
    setLoading(true)
    try {
      const client = authClientRef.current ?? (await AuthClient.create())
      authClientRef.current = client

      if (await client.isAuthenticated()) {
        const identity = client.getIdentity()
        const principal = identity.getPrincipal().toText()
        setUser((prev) => ({
          id: principal,
          name: prev?.name ?? `User ${principal.slice(0, 5)}…`,
          avatar: prev?.avatar ?? "/generic-user-avatar.png",
          xp: prev?.xp ?? 1250,
          reputation: prev?.reputation ?? 4.8,
          principal,
        }))
        setLoading(false)
        return
      }

      await new Promise<void>((resolve, reject) => {
        client.login({
          identityProvider,
          maxTimeToLive: EIGHT_HOURS_NS,
          onSuccess: () => resolve(),
          onError: (err) => reject(err),
        })
      })

      const identity = client.getIdentity()
      const principal = identity.getPrincipal().toText()
      const hydratedUser: User = {
        id: principal,
        name: `User ${principal.slice(0, 5)}…`,
        avatar: "/generic-user-avatar.png",
        xp: 1250,
        reputation: 4.8,
        principal,
      }
      setUser(hydratedUser)
    } catch (error) {
      console.error("Internet Identity login failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const client = authClientRef.current ?? (await AuthClient.create())
      await client.logout()
      setUser(null)
      // Clear user-specific cached data
      try {
        localStorage.removeItem("peerverse_vault_items")
        localStorage.removeItem("peerverse_user")
      } catch {}
    } catch (error) {
      console.error("Logout failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
