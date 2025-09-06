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
export const ASSET_CANISTER_ID = "lqy7q-dh777-77777-aaaaq-cai" // Local UI/asset canister (using wallet canister ID as it's the frontend canister)

export function detectIcHost(): string {
  // Always use local replica for development
  const host = "http://127.0.0.1:4943"
  
  if (typeof window !== "undefined") {
    console.log("Using local replica at:", host, "| Hostname:", window.location.hostname)
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

  // Simple fetch function for local development
  const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    
    // Create headers
    const headers = new Headers(init?.headers)
    headers.set('Content-Type', 'application/cbor')
    
    // Configure request
    const requestInit: RequestInit = {
      ...init,
      headers,
      mode: 'cors',
      credentials: 'include',
      cache: 'no-store'
    }

    try {
      // Make the request
      const response = await fetch(input.toString(), requestInit);
      
      // Log response details for debugging
      if (isLocal) {
        console.log('Response status:', response.status, response.statusText);
        console.log('Request URL:', url);
      }
      
      // Handle errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Request failed:', response.status, response.statusText, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      return response;
      
    } catch (error) {
      console.error('Fetch error:', error);
      console.error('Request URL:', url);
      console.error('Request Init:', {
        ...requestInit,
        // Don't log the actual body as it might be large
        body: requestInit.body ? '[body]' : undefined
      });
      throw error;
    }
  }

  // Create and configure the HTTP agent
  const agent = new HttpAgent({
    host,
    identity,
    fetch: customFetch,
    verifyQuerySignatures: false // Disable verification for local development
  });

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
