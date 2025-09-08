import { HttpAgent, Actor, type Identity, type ActorSubclass } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"
import { AuthClient } from "@dfinity/auth-client"
import { idlFactory } from "@/lib/ic/learning-analytics.idl"

// Configuration
export const HOST = "http://127.0.0.1:4943" // Local replica
export const LEARNING_ANALYTICS_CANISTER_ID = "bkyz2-fmaaa-aaaaa-qaaaq-cai"
export const LOCAL_CANDID_UI = `http://127.0.0.1:4943/?canisterId=by6od-j4aaa-aaaaa-qaadq-cai&id=${LEARNING_ANALYTICS_CANISTER_ID}`

// Shared agent instance
let sharedAgent: HttpAgent | null = null
let currentIdentity: Identity | null = null
let authClientInstance: AuthClient | null = null

// Timeout for API calls (in milliseconds)
const API_TIMEOUT = 10000

// Auth configuration
export const AUTH_CONFIG = {
  // 24 hours in nanoseconds
  maxTimeToLive: BigInt(24 * 60 * 60 * 1000 * 1000 * 1000),
  // 5 minutes in nanoseconds
  idleOptions: {
    idleTimeout: 5 * 60 * 1000, // 5 minutes in milliseconds
    disableDefaultIdleCallback: true,
  },
}

// Custom fetch with CBOR and CORS support
const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = new URL(input.toString())
  
  // Ensure we're using the correct API version
  if (url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/v2/')) {
    url.pathname = url.pathname.replace('/api/', '/api/v2/')
  }
  
  // Skip CORS for IC API endpoints as they handle it differently
  const isICApiCall = url.pathname.startsWith('/api/v2/status') || 
                     url.pathname.startsWith('/api/v2/canister/');
  
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/cbor')
  headers.set('Accept', 'application/cbor')
  
  // For local development, add CORS headers
  const isLocal = HOST.includes('localhost') || HOST.includes('127.0.0.1')
  if (isLocal && !isICApiCall) {
    // Get the origin from the request headers or use a default
    const requestOrigin = init?.headers instanceof Headers 
      ? init.headers.get('origin') 
      : (init?.headers as any)?.origin || 'http://localhost:3000'
    
    // Set specific origin instead of wildcard when credentials are included
    headers.set('Access-Control-Allow-Origin', requestOrigin)
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    headers.set('Access-Control-Allow-Credentials', 'true')
    headers.set('Vary', 'Origin')
  }
  
  // Handle preflight requests
  if (init?.method === 'OPTIONS' && !isICApiCall) {
    return new Response(null, {
      status: 204,
      headers: Object.fromEntries(headers.entries())
    })
  }
  
  const fetchOptions: RequestInit = {
    ...init,
    headers,
    mode: isICApiCall ? 'no-cors' : 'cors',
    credentials: isLocal ? 'include' : 'same-origin',
    cache: 'no-store' as const,
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  }
  
  // For local development, handle preflight requests
  if (HOST.includes('localhost') || HOST.includes('127.0.0.1')) {
    try {
      const response = await fetch(url.toString(), {
        ...fetchOptions,
        method: 'OPTIONS',
        headers: {
          ...Object.fromEntries(headers.entries()),
          'Access-Control-Request-Method': init?.method || 'GET',
          'Access-Control-Request-Headers': 'content-type',
        },
        body: undefined
      })
      
      if (!response.ok) {
        console.warn('Preflight request failed:', response.status, response.statusText)
      }
    } catch (error) {
      console.warn('Error during preflight request:', error)
    }
  }
  
  // Make the actual request
  const response = await fetch(url.toString(), fetchOptions)
  
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'No error details')
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      url: url.toString(),
      error: errorText
    })
    throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`)
  }
  
  return response
}

// Initialize AuthClient
export async function initAuthClient(): Promise<AuthClient> {
  if (!authClientInstance) {
    const options = {
      idleOptions: AUTH_CONFIG.idleOptions,
      // Enable dev mode for local development
      ...(HOST.includes('localhost') || HOST.includes('127.0.0.1') ? {
        // This enables the local development environment
        // and skips the authentication for testing
        // In production, remove this or set to false
        dev: true
      } : {})
    }
    
    authClientInstance = await AuthClient.create(options)
  }
  return authClientInstance
}

// Get or create an agent
export async function getAgent(identity?: Identity): Promise<HttpAgent> {
  // If we have a shared agent and either:
  // 1. No specific identity was requested, or
  // 2. The requested identity matches our current identity
  if (sharedAgent && (!identity || (currentIdentity && identity.getPrincipal().toText() === currentIdentity.getPrincipal().toText()))) {
    return sharedAgent
  }

  // Create a new agent with the provided or default identity
  const agent = new HttpAgent({
    identity: identity || undefined,
    host: HOST,
    fetch: customFetch,
    // Disable verification for local development
    verifyQuerySignatures: !(HOST.includes('localhost') || HOST.includes('127.0.0.1'))
  })

  // For local development, fetch the root key
  if (HOST.includes('localhost') || HOST.includes('127.0.0.1')) {
    try {
      console.log('Fetching root key for local development...')
      await agent.fetchRootKey()
      console.log('Successfully fetched root key')
    } catch (error) {
      console.warn('Failed to fetch root key:', error)
      throw new Error('Failed to initialize agent: Could not fetch root key. Make sure the IC is running locally.')
    }
  }

  // Cache the agent and current identity
  sharedAgent = agent
  currentIdentity = identity || null
  
  return agent
}

// Clear the cached agent and identity
export function clearAgentCache() {
  console.log('Clearing agent cache')
  sharedAgent = null
  currentIdentity = null
  authClientInstance = null
}

// Create an actor with the given identity
export async function createActor<T>({
  canisterId,
  idlFactory,
  identity,
}: {
  canisterId: string
  idlFactory: IDL.InterfaceFactory
  identity?: Identity
}): Promise<ActorSubclass<T>> {
  try {
    console.log(`Creating actor for canister: ${canisterId}`)
    const agent = await getAgent(identity)
    
    if (!agent) {
      throw new Error('Failed to initialize agent')
    }
    
    // Log identity information if available
    if (identity) {
      const principal = identity.getPrincipal()
      console.log("Using identity with principal:", principal.toText())
      
      // Verify the identity is authenticated
      if (principal.isAnonymous()) {
        console.warn("Warning: Using anonymous principal. Some calls may be rejected.")
      }
    } else {
      console.log("No identity provided, using anonymous principal")
    }
    
    // Create the actor with the agent
    const actor = Actor.createActor<T>(idlFactory, {
      agent,
      canisterId,
    })
    
    console.log(`Successfully created actor for canister: ${canisterId}`)
    return actor as ActorSubclass<T>
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Failed to create actor for canister:", canisterId, "Error:", errorMessage)
    throw new Error(`Failed to create actor for canister ${canisterId}: ${errorMessage}`)
  }
}

// Create an authenticated actor for the learning analytics canister
export async function createLearningAnalyticsActor(identity?: Identity) {
  return createActor({
    canisterId: LEARNING_ANALYTICS_CANISTER_ID,
    idlFactory,
    identity,
  })
}

// Helper to handle API calls with timeout
export async function withTimeout<T>(
  promise: Promise<T>,
  timeout = API_TIMEOUT
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${timeout}ms`))
    }, timeout)
  })

  return Promise.race([promise, timeoutPromise])
}

// Check if the user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const authClient = await initAuthClient()
  return await authClient.isAuthenticated()
}

// Get the current identity
export async function getIdentity(): Promise<Identity | null> {
  if (typeof window === 'undefined') {
    return null // Server-side rendering
  }

  try {
    const authClient = await initAuthClient()
    const isAuthenticated = await authClient.isAuthenticated()
    return isAuthenticated ? authClient.getIdentity() : null
  } catch (error) {
    console.error('Error getting identity:', error)
    return null
  }
}

// Login function
export async function login(): Promise<Identity | null> {
  const authClient = await initAuthClient()

  // Clear any existing agent cache before login
  clearAgentCache()

  return new Promise((resolve, reject) => {
    const identityProvider = HOST.includes("localhost") || HOST.includes("127.0.0.1")
      ? `http://127.0.0.1:4943/authenticate?applicationName=E-CRE`
      : "https://identity.ic0.app"

    authClient.login({
      identityProvider,
      maxTimeToLive: AUTH_CONFIG.maxTimeToLive,
      onSuccess: async () => {
        try {
          const identity = authClient.getIdentity()
          // Initialize a new agent with the authenticated identity
          await getAgent(identity)
          console.log('Login successful, principal:', identity.getPrincipal().toText())
          resolve(identity)
        } catch (error) {
          console.error('Error after successful authentication:', error)
          reject(error)
        }
      },
      onError: (error) => {
        console.error('Login error:', error)
        // Clear any partial state on error
        clearAgentCache()
        reject(error || new Error('Login failed'))
      },
    })
  })
}

// Logout function
export async function logout() {
  try {
    const authClient = await initAuthClient()
    await authClient.logout()
  } catch (error) {
    console.error('Error during logout:', error)
  } finally {
    // Always clear the agent cache, even if logout fails
    clearAgentCache()
    console.log('Logged out successfully')
  }
}

// Default export for backward compatibility
export default {
  getAgent,
  createActor,
  createLearningAnalyticsActor,
  isAuthenticated,
  getIdentity,
  login,
  logout,
  clearAgentCache,
  HOST,
  LEARNING_ANALYTICS_CANISTER_ID,
  LOCAL_CANDID_UI,
}