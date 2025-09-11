"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react"
import { AuthClient } from "@dfinity/auth-client"
import { Identity } from "@dfinity/agent"
import { SessionClient } from "./session-client"

declare module "./session-client" {
  interface SessionClient {
    setIdentity: (identity: Identity | null) => void;
  }
}

interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  xp?: number
  reputation?: number
  principal?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
  loading: boolean
  authClient: AuthClient | null
  sessionClient: SessionClient | null
  identity: Identity | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Identity Provider URLs
const II_PROD_URL = "https://identity.ic0.app"
const II_LOCAL_URL = "https://identity.ic0.app"

const EIGHT_HOURS_NS = BigInt(8 * 60 * 60) * BigInt(1_000_000_000)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const authClientRef = useRef<AuthClient | null>(null)
  const sessionClient = useMemo(() => SessionClient.getInstance(), [])

  // Define the identity provider URL based on the environment
  const identityProvider = useMemo(() => {
    if (typeof window === "undefined") return II_PROD_URL
    const host = window.location.hostname
    const isLocalhost = host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost") || host.endsWith(".local")
    return isLocalhost ? II_LOCAL_URL : II_PROD_URL
  }, [])

  // Update session client identity when auth state changes
  useEffect(() => {
    const updateSessionClientIdentity = async () => {
      if (user?.principal && authClientRef.current) {
        console.log('[AuthContext] Updating session client identity');
        try {
          const identity = authClientRef.current.getIdentity();
          if (identity) {
            console.log('[AuthContext] Setting identity on session client');
            sessionClient.setIdentity(identity);
            
            // Verify the identity was set correctly
            try {
              await sessionClient.getActor(true);
              console.log('[AuthContext] Successfully initialized actor with identity');
            } catch (e) {
              console.error('[AuthContext] Failed to initialize actor with identity:', e);
            }
          }
        } catch (error) {
          console.error('[AuthContext] Error updating session client identity:', error);
        }
      } else {
        // Clear identity when user logs out
        sessionClient.setIdentity(null);
      }
    };
    
    updateSessionClientIdentity();
  }, [user, sessionClient]);

  // Initialize auth client
  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const client = await AuthClient.create()
        if (!mounted) return
        authClientRef.current = client

        const isAuthenticated = await client.isAuthenticated()
        if (isAuthenticated) {
          const identity = client.getIdentity()
          const principal = identity.getPrincipal().toString()
          setUser({
            id: principal,
            name: `User ${principal.slice(0, 5)}...`,
            principal,
            email: '',
            avatar: "/generic-user-avatar.png",
            xp: 1250,
            reputation: 4.8
          })
          
          sessionClient.setIdentity(identity)
        }
      } catch (error) {
        console.error('Failed to initialize auth client:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    init()
    return () => {
      mounted = false
    }
  }, [sessionClient, identityProvider])

  const login = async () => {
    if (!authClientRef.current) {
      console.error('Auth client not initialized')
      return
    }

    try {
      setLoading(true)
      console.log('Starting login flow with identity provider:', identityProvider)
      
      await new Promise<void>((resolve, reject) => {
        authClientRef.current?.login({
          identityProvider,
          maxTimeToLive: EIGHT_HOURS_NS,
          onSuccess: async () => {
            try {
              const identity = authClientRef.current?.getIdentity()
              if (!identity) {
                throw new Error('No identity after successful login')
              }
              
              const principal = identity.getPrincipal().toString()
              console.log('Login successful, principal:', principal)
              
              // Set the identity on the session client
              sessionClient.setIdentity(identity)
              
              // Verify the session client can create an actor
              try {
                await sessionClient.getActor(true)
                console.log('Successfully initialized session client with identity')
              } catch (e) {
                console.error('Failed to initialize session client:', e)
                throw e
              }
              
              setUser({
                id: principal,
                name: `User ${principal.slice(0, 5)}...`,
                principal,
                email: '',
                avatar: "/generic-user-avatar.png",
                xp: 1250,
                reputation: 4.8
              })
              
              resolve()
            } catch (error) {
              console.error('Error in login success handler:', error)
              reject(error)
            }
          },
          onError: (error) => {
            console.error('Login error:', error)
            reject(error)
          }
        })
      })
      
      console.log('Login flow completed successfully')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      const client = authClientRef.current
      if (client) {
        await client.logout()
      }
      setUser(null)
      authClientRef.current = null
      
      // Clear session client identity
      sessionClient.setIdentity(null)
      
      // Clear user-specific cached data
      try {
        localStorage.removeItem("peerverse_vault_items")
        localStorage.removeItem("peerverse_user")
      } catch (error) {
        console.error('Error clearing local storage:', error)
      }
    } catch (error) {
      console.error("Logout failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      loading,
      authClient: authClientRef.current,
      sessionClient,
      identity: authClientRef.current?.getIdentity() || null,
    }),
    [user, loading, login, logout, sessionClient],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
