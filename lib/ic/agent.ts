import { HttpAgent, Actor, type Identity, type ActorSubclass } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import type { IDL } from "@dfinity/candid"
import { idlFactory as userProfileIdl } from "./user-profile.idl"

export const USER_PROFILE_CANISTER_ID = "b77ix-eeaaa-aaaaa-qaada-cai" // Local user_profile canister
export const LEARNING_ANALYTICS_CANISTER_ID = "bkyz2-fmaaa-aaaaa-qaaaq-cai" // Local learning_analytics canister
export const NOTIFICATIONS_CANISTER_ID = "bd3sg-teaaa-aaaaa-qaaba-cai" // Local notifications canister
export const RECOMMENDATIONS_CANISTER_ID = "be2us-64aaa-aaaaa-qaabq-cai" // Local recommendations canister
export const SESSIONS_CANISTER_ID = "br5f7-7uaaa-aaaaa-qaaca-cai" // Local sessions canister
export const SOCIAL_CANISTER_ID = "bw4dl-smaaa-aaaaa-qaacq-cai" // Local social canister
export const ASSET_CANISTER_ID = "by6od-j4aaa-aaaaa-qaadq-cai" // Local UI/asset canister

export function detectIcHost(): string {
  // Always use local replica for development
  const host = "http://127.0.0.1:4943"
  
  if (typeof window !== "undefined") {
    console.log(
      "Using local replica at:",
      host,
      "| Hostname:", window.location.hostname
    )
  } else {
    console.log("Using local replica at:", host, "| Server-side")
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

export async function getAgent(identity?: Identity) {
  const host = detectIcHost()
  const isLocal = host.includes("127.0.0.1")

  console.log("Creating IC agent with host:", host, "| Identity:", !!identity, "| Local:", isLocal)

  // Create a custom fetch function that handles CORS and credentials
  const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    
    if (url && url.toString().includes(host)) {
      const requestUrl = new URL(url.toString())
      const isStatusEndpoint = requestUrl.pathname.endsWith('/api/v2/status')
      const isQueryEndpoint = requestUrl.pathname.includes('/query')
      
      // Check if this is a preflight request
      const isPreflight = init?.method === 'OPTIONS' || 
                         (init?.headers && 'access-control-request-method' in init.headers)
      
      // Create request headers
      const headers = new Headers(init?.headers)
      
      // For non-preflight requests, set the content type
      if (!isPreflight) {
        headers.set('Content-Type', 'application/cbor')
      }
      
      // Configure request based on type
      const requestInit: RequestInit = {
        ...init,
        headers,
        // Important: For CORS with credentials, we must set a specific origin
        // Never send credentials with preflight or status endpoint
        credentials: (isPreflight || isStatusEndpoint) ? 'omit' : 'include',
        mode: 'cors',
        cache: 'no-store',
        // For preflight, we need to ensure we don't send a body
        ...(isPreflight ? { 
          method: 'OPTIONS', 
          body: undefined,
          // Add CORS headers that the server should respond to
          headers: {
            ...Object.fromEntries(headers.entries()),
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type',
            'Origin': 'http://localhost:3000'
          }
        } : {})
      }
      
      // For non-preflight requests, ensure we have the right headers
      if (!isPreflight) {
        headers.set('X-Requested-With', 'XMLHttpRequest')
      }

      try {
        // Make the actual request
        const response = await fetch(input.toString(), requestInit)
        
        // Log CORS headers for debugging
        if (isLocal) {
          const corsHeaders = {
            'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
            'access-control-allow-credentials': response.headers.get('access-control-allow-credentials'),
            'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
            'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
            'vary': response.headers.get('vary')
          }
          console.log('Response Headers for', requestUrl.pathname, ':', corsHeaders)
          
          // If we get a CORS error, log more details
          if (!response.ok) {
            console.error('Request failed with status:', response.status, response.statusText)
            try {
              const errorText = await response.text()
              console.error('Error response:', errorText)
            } catch (e) {
              console.error('Could not read error response body:', e)
            }
          }
        }
        
        return response
      } catch (error) {
        console.error('Fetch error:', error)
        console.error('Request URL:', url)
        console.error('Request Init:', {
          ...requestInit,
          // Don't log the actual body as it might be large
          body: requestInit.body ? '[body]' : undefined
        })
        throw error
      }
    }

    // For non-IC requests, use the default fetch
    return fetch(input, init)
  }

  const agent = new HttpAgent({
    host,
    identity,
    fetch: customFetch,
    // For local development, disable verification and set appropriate options
    verifyQuerySignatures: !isLocal,
    // Disable fetch root key in local development as we're not verifying signatures
    // The replica will handle the root key automatically
    ...(isLocal ? { verifyQuerySignatures: false } : {})
  })

  if (isLocal) {
    console.log("Running in local development mode - skipping root key fetch")
    // In local development, we don't need to fetch the root key
    // as we're not verifying signatures
    try {
      // This is a no-op in local development
      await Promise.resolve()
    } catch (error) {
      console.error("Error in local development setup:", error)
      throw error
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

  return agent
}

export async function createActor<T>(
  canisterId: string, 
  idlFactory: IDL.InterfaceFactory, 
  identity?: Identity
): Promise<ActorSubclass<T>> {
  console.log("Creating actor for canister:", canisterId)

  try {
    console.log("Getting agent...")
    const agent = await getAgent(identity)
    
    if (!agent) {
      throw new Error("Failed to initialize IC agent: Agent is null")
    }

    console.log("Agent created successfully")
    
    // Verify the agent is properly authenticated if an identity was provided
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
    
    console.log("Creating actor with canister ID:", canisterId)
    
    const actor = Actor.createActor<T>(idlFactory, {
      agent,
      canisterId,
    }) as ActorSubclass<T>
    
    console.log("Actor created successfully for canister:", canisterId)
    return actor
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
      throw new Error("USER_PROFILE_CANISTER_ID is not set. Please check your environment configuration.")
    }
    
    // Verify the IDL factory is available
    if (!userProfileIdl) {
      throw new Error("userProfileIdl is not available. Make sure the IDL file is properly imported.")
    }
    
    const actor = await createActor<T>(
      USER_PROFILE_CANISTER_ID, 
      userProfileIdl as unknown as IDL.InterfaceFactory, 
      identity
    )
    
    console.log("User profile actor created successfully")
    return actor
  } catch (error) {
    console.error("Failed to create user profile actor:", error)
    
    // Provide more specific error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes("IDL error")) {
        throw new Error("IDL mismatch. Make sure the canister's interface matches the expected IDL.")
      }
      
      if (error.message.includes("not found")) {
        throw new Error("Canister not found. Make sure the canister is deployed and the ID is correct.")
      }
    }
    
    throw error
  }
}
