import { HttpAgent, Actor, type Identity, type ActorSubclass } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import type { IDL } from "@dfinity/candid"
import { idlFactory as userProfileIdl } from "./user-profile.idl"

export const USER_PROFILE_CANISTER_ID = "lc6ij-px777-77777-aaadq-cai" // Local user_profile canister
export const LEARNING_ANALYTICS_CANISTER_ID = "lz3um-vp777-77777-aaaba-cai" // Local learning_analytics canister
export const NOTIFICATIONS_CANISTER_ID = "l62sy-yx777-77777-aaabq-cai" // Local notifications canister
export const RECOMMENDATIONS_CANISTER_ID = "ll5dv-z7777-77777-aaaca-cai" // Local recommendations canister
export const SESSIONS_CANISTER_ID = "lm4fb-uh777-77777-aaacq-cai" // Local sessions canister
export const SOCIAL_CANISTER_ID = "lf7o5-cp777-77777-aaada-cai" // Local social canister
export const ASSET_CANISTER_ID = "lqy7q-dh777-77777-aaaaq-cai" // Local UI/asset canister

export function detectIcHost(): string {
  // Always use port 4943 to match the IC replica's expected port
  const host = "http://127.0.0.1:4943"
  
  if (typeof window !== "undefined") {
    console.log("Using IC replica at:", host, "| Hostname:", window.location.hostname)
  } else {
    console.log("Using IC replica at:", host, "| Server-side")
  }

  return host
}

export async function getIdentity(): Promise<Identity | null> {
  const client = await AuthClient.create({
    idleOptions: {
      idleTimeout: 1000 * 60 * 30, // 30 minutes
      disableDefaultIdleCallback: true,
    },
  })
  const ok = await client.isAuthenticated()
  return ok ? client.getIdentity() : null
}

export async function getAgent(identity?: Identity): Promise<HttpAgent> {
  try {
    const host = detectIcHost()
    const isLocal = host.includes("127.0.0.1") || host.includes("localhost")
    
    console.log("Creating IC agent with host:", host, "| Identity:", !!identity, "| Local:", isLocal)

    // Get or create identity if not provided
    const effectiveIdentity = identity || (await getIdentity())
    
    if (!effectiveIdentity) {
      console.warn('No identity provided and no authenticated user found')
    }

    // Create agent with proper configuration
    const agent = new HttpAgent({ 
      host,
      identity: effectiveIdentity || undefined
    });
    
    // Configure agent options
    // @ts-ignore - The verifyQuerySignatures option exists but isn't in the type definitions
    if (agent._options) {
      // @ts-ignore
      agent._options.verifyQuerySignatures = false;
    }

    // Only fetch the root key in development
    if (isLocal) {
      try {
        await agent.fetchRootKey()
        console.log('Fetched root key for local development')
      } catch (error) {
        console.warn('Could not fetch root key for local development', error)
        // Don't throw here, as we might still be able to proceed
      }
    } else {
      // In production, we need to fetch the root key
      console.log("Fetching root key for production environment")
      try {
        await agent.fetchRootKey()
        console.log("Root key fetched successfully")
      } catch (error) {
        console.error("Failed to fetch root key:", error)
        throw error
      }
    }
    
    // Create a custom fetch wrapper for better error handling
    const originalFetch = (agent as any)._fetch as typeof fetch;
    (agent as any)._fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
      const isLocalRequest = url.includes('127.0.0.1') || url.includes('localhost')
      
      // Prepare headers
      const headers = new Headers(init?.headers)
      headers.set('Content-Type', 'application/cbor')
      
      // Add CORS headers for local development
      if (isLocalRequest) {
        headers.set('Access-Control-Allow-Origin', '*')
        headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        headers.set('Access-Control-Allow-Credentials', 'true')
      }

      const requestInit: RequestInit = {
        ...init,
        headers: Object.fromEntries(headers.entries()),
        mode: isLocalRequest ? 'cors' : 'same-origin',
        credentials: isLocalRequest ? 'omit' : 'include',
        cache: 'no-store'
      }

      try {
        const response = await originalFetch(url, requestInit)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('Request failed:', {
            url,
            status: response.status,
            statusText: response.statusText,
            error: errorText
          })
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }
        
        return response
      } catch (error) {
        console.error('Fetch error:', {
          url,
          error: error instanceof Error ? error.message : String(error)
        })
        throw error
      }
    }
    
    return agent;
  } catch (error) {
    console.error('Failed to initialize agent:', error);
    throw new Error(`Failed to initialize agent: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function createActor<T>(
  canisterId: string, 
  idlFactory: IDL.InterfaceFactory, 
  identity?: Identity
): Promise<ActorSubclass<T>> {
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
    
    // Log additional debug information
    if (error instanceof Error && error.stack) {
      console.error("Error stack:", error.stack)
    }
    
    // Check for specific error conditions
    if (errorMessage.includes("forbidden") || errorMessage.includes("403")) {
      console.error("Authentication error: Make sure you're properly authenticated and the canister ID is correct")
      console.error("Canister ID being used:", canisterId)
      
      if (identity) {
        const principal = identity.getPrincipal()
        console.error("Authenticated principal:", principal.toText())
      } else {
        console.error("No identity provided - using anonymous principal")
      }
    }
    
    // Re-throw with a more descriptive error
    throw new Error(`Failed to create actor for canister ${canisterId}: ${errorMessage}`)
  }
}

// Convenience creator for the User Profile canister
export async function userProfileActor<T = any>(identity?: Identity): Promise<ActorSubclass<T>> {
  try {
    console.log("Creating user profile actor with canister ID:", USER_PROFILE_CANISTER_ID)
    
    // Verify the canister ID is set
    if (!USER_PROFILE_CANISTER_ID) {
      throw new Error("USER_PROFILE_CANISTER_ID is not set in environment variables")
    }
    
    // Import the IDL factory for the user profile canister
    const { idlFactory } = await import("./user-profile.idl")
    
    // Create and return the actor
    return createActor<T>(USER_PROFILE_CANISTER_ID, idlFactory, identity)
  } catch (error) {
    console.error("Failed to create user profile actor:", error)
    throw error
  }
}
