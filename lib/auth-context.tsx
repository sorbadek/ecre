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
  principal?: string // This is the PRIMARY IDENTIFIER
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
  const sessionClientRef = useRef<SessionClient | null>(null)

  // Define the identity provider URL based on the environment
  const identityProvider = useMemo(() => {
    if (typeof window === "undefined") return II_PROD_URL
    const host = window.location.hostname
    const isLocalhost = host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost") || host.endsWith(".local")
    return isLocalhost ? II_LOCAL_URL : II_PROD_URL
  }, [])

  // Initialize or update session client when user changes
  useEffect(() => {
    if (user?.principal) {
      console.log('[AuthContext] User principal detected, initializing session client');
      
      // Create a new session client
      const client = new SessionClient();
      sessionClientRef.current = client;
      
      // Set identity if auth client is available
      const setIdentityIfAvailable = async () => {
        try {
          const authClient = authClientRef.current;
          if (authClient) {
            console.log('[AuthContext] Auth client available, getting identity');
            
            // Check if getIdentity exists and is a function before calling it
            if (typeof authClient.getIdentity === 'function') {
              const identity = authClient.getIdentity();
              if (identity) {
                console.log('[AuthContext] Setting identity on session client');
                client.setIdentity(identity);
                
                // Verify the identity was set correctly
                const actor = await client.getActor(true).catch(e => {
                  console.error('[AuthContext] Failed to initialize actor with identity:', e);
                  return null;
                });
                
                if (actor) {
                  console.log('[AuthContext] Successfully initialized actor with identity');
                } else {
                  console.warn('[AuthContext] Failed to initialize actor with identity');
                }
              } else {
                console.warn('[AuthContext] No identity available from auth client');
              }
            } else {
              console.warn('[AuthContext] authClient.getIdentity is not a function');
            }
          } else {
            console.warn('[AuthContext] No auth client available');
          }
        } catch (error) {
          console.error('[AuthContext] Error setting identity on session client:', error);
        }
      };
      
      void setIdentityIfAvailable()
    } else {
      sessionClientRef.current = null
    }
  }, [user?.principal])

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
          const principal = identity.getPrincipal().toText()

          // Initialize session client and set the identity
          const sessionClient = new SessionClient()
          sessionClient.setIdentity(identity)
          sessionClientRef.current = sessionClient

          const hydratedUser: User = {
            id: principal,
            name: `User ${principal.slice(0, 5)}…`,
            avatar: "/generic-user-avatar.png",
            xp: 1250,
            reputation: 4.8,
            principal,
          }
          setUser(hydratedUser)
        } else {
          setUser(null)
          sessionClientRef.current = null
        }
      } catch (e) {
        console.error("Failed to initialize AuthClient:", e)
        setUser(null)
        sessionClientRef.current = null
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
        
        // Initialize or update session client with the new identity
        const sessionClient = new SessionClient()
        sessionClientRef.current = sessionClient
        
        setUser((prev) => ({
          id: principal,
          name: prev?.name ?? `User ${principal.slice(0, 5)}…`,
          avatar: prev?.avatar ?? "/generic-user-avatar.png",
          xp: prev?.xp ?? 1250,
          reputation: prev?.reputation ?? 4.8,
          principal,
        }));
        setLoading(false);
        return;
      }

      await new Promise<void>((resolve, reject) => {
        client.login({
          identityProvider,
          maxTimeToLive: EIGHT_HOURS_NS,
          onSuccess: async () => {
            try {
              // Initialize session client after successful login
              const sessionClient = new SessionClient();
              const identity = client.getIdentity();
              if (identity) {
                sessionClient.setIdentity(identity);
              }
              sessionClientRef.current = sessionClient;
              resolve();
            } catch (error) {
              console.error('Failed to initialize session client:', error);
              reject(error);
            }
          },
          onError: (err) => reject(err),
        });
      });

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
      const client = authClientRef.current
      if (client) {
        await client.logout()
      }
      setUser(null)
      authClientRef.current = null
      // Clear session client on logout
      sessionClientRef.current = null
      // Clear any existing session client
      
      setUser(null);
      
      // Clear user-specific cached data
      try {
        localStorage.removeItem("peerverse_vault_items");
        localStorage.removeItem("peerverse_user");
      } catch (error) {
        console.error('Error clearing local storage:', error);
      }
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
    authClient: authClientRef.current,
    sessionClient: sessionClientRef.current,
    identity: null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  // Get the identity from the authClient if available
  const getIdentity = (): Identity | null => {
    try {
      if (!ctx.authClient) return null
      // Get the identity from the auth client
      const authClient = ctx.authClient as any
      if (authClient.getIdentity) {
        // Call getIdentity without any arguments
        const identity = authClient.getIdentity
          ? authClient.getIdentity()
          : null
        // Set the identity in the session client if it exists
        if (identity && ctx.sessionClient) {
          ctx.sessionClient.setIdentity(identity)
        }
        return identity
      }
      return null
    } catch (error) {
      console.error('Error getting identity:', error)
      return null
    }
  }
  
  return {
    ...ctx,
    identity: getIdentity()
  }
}
