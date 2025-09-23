import { HttpAgent, Actor, type Identity, type ActorSubclass } from "@dfinity/agent"
import type { IDL } from "@dfinity/candid"
import { AuthClient } from "@dfinity/auth-client"
import { idlFactory } from "@/lib/ic/learning-analytics.idl"

// Configuration
export const HOST = "https://icp0.io" // Mainnet IC endpoint

// Canister IDs - Mainnet
export const LEARNING_ANALYTICS_CANISTER_ID = "epua2-tyaaa-aaaam-qdtsa-cai"
export const NOTIFICATIONS_CANISTER_ID = "eivgo-6aaaa-aaaam-qdtsq-cai"
export const RECOMMENDATIONS_CANISTER_ID = "be2us-64aaa-aaaaa-qaabq-cai" // Update this after deployment
export const SESSIONS_CANISTER_ID = "br5f7-7uaaa-aaaaa-qaaca-cai"
export const SOCIAL_CANISTER_ID = "ekhd5-baaaa-aaaac-qaitq-cai"
export const USER_PROFILE_CANISTER_ID = "b77ix-eeaaa-aaaaa-qaada-cai"

// Not needed for mainnet but keeping for reference
export const CANDID_UI_CANISTER_ID = "by6od-j4aaa-aaaaa-qaadq-cai"

// Mainnet canister IDs
export const CANISTER_IDS = {
  LEARNING_ANALYTICS: LEARNING_ANALYTICS_CANISTER_ID,
  NOTIFICATIONS: NOTIFICATIONS_CANISTER_ID,
  RECOMMENDATIONS: RECOMMENDATIONS_CANISTER_ID,
  SESSIONS: SESSIONS_CANISTER_ID,
  SOCIAL: SOCIAL_CANISTER_ID,
  USER_PROFILE: USER_PROFILE_CANISTER_ID
  // CANDID_UI is not needed for mainnet
}

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

// Custom fetch for direct IC mainnet communication
export const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  // Create URL object from input
  const requestUrl = new URL(input.toString());
  
  // Create new headers object from init headers or empty object
  const headers = new Headers(init?.headers);
  
  // Set required headers for IC mainnet
  headers.set('Content-Type', 'application/cbor');
  headers.set('Accept', 'application/cbor');

  // Configure request init for mainnet
  const requestInit: RequestInit = {
    ...init,
    headers,
    mode: 'cors',
    credentials: 'omit',
    cache: 'no-store'
  };

  console.log('Making request to IC mainnet:', requestUrl.toString());

  try {
    // Make the fetch request directly to IC mainnet
    const response = await fetch(requestUrl.toString(), requestInit);
    
    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`IC mainnet error! status: ${response.status}, message: ${errorText}`);
    }
    
    return response;
  } catch (error) {
    console.error('IC mainnet fetch error:', error);
    throw error;
  }
};

// Initialize AuthClient
export const initAuthClient = async (): Promise<AuthClient> => {
  if (!authClientInstance) {
    authClientInstance = await AuthClient.create({
      idleOptions: AUTH_CONFIG.idleOptions,
    });
  }
  return authClientInstance;
};

// Get or create an agent
export const getAgent = async (identity?: Identity): Promise<HttpAgent> => {
  if (sharedAgent && !identity) {
    return sharedAgent;
  }

  // Create a new agent
  const agent = new HttpAgent({
    host: HOST,
    fetch: customFetch,
  });

  // In production, we don't fetch the root key as we're connecting to mainnet
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Running in development mode. For mainnet, ensure NODE_ENV is set to production');
    // We still fetch root key in development for local development with dfx
    try {
      await agent.fetchRootKey();
    } catch (error) {
      console.warn('Running in mainnet mode. Root key fetch not needed.');
    }
  }

  if (identity) {
    agent.replaceIdentity(identity);
  }

  if (!identity) {
    sharedAgent = agent;
  }

  return agent;
};

// Clear the cached agent and identity
export const clearAgentCache = () => {
  sharedAgent = null;
  currentIdentity = null;
  authClientInstance = null;
};

// Create an actor with the given identity
export const createActor = async <T>({
  canisterId,
  idlFactory,
  identity,
}: {
  canisterId: string
  idlFactory: IDL.InterfaceFactory
  identity?: Identity
}): Promise<ActorSubclass<T>> => {
  const agent = await getAgent(identity);
  
  return Actor.createActor(idlFactory, {
    agent,
    canisterId,
  });
};

// Create an authenticated actor for the learning analytics canister
export const createLearningAnalyticsActor = async (identity?: Identity) => {
  return createActor({
    canisterId: LEARNING_ANALYTICS_CANISTER_ID,
    idlFactory: idlFactory,
    identity,
  });
};

// Helper to handle API calls with timeout
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeout = API_TIMEOUT
): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${timeout}ms`));
    }, timeout);
  });

  return Promise.race([promise, timeoutPromise]);
};

// Check if the user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const authClient = await initAuthClient();
  return await authClient.isAuthenticated();
};

// Get the current identity
export const getIdentity = async (): Promise<Identity | null> => {
  const authClient = await initAuthClient();
  
  if (currentIdentity) {
    return currentIdentity;
  }
  
  if (await authClient.isAuthenticated()) {
    currentIdentity = authClient.getIdentity();
    return currentIdentity;
  }
  
  return null;
};

// Login function
export const login = async (): Promise<Identity | null> => {
  const authClient = await initAuthClient();
  
  return new Promise((resolve) => {
    authClient.login({
      ...AUTH_CONFIG,
      onSuccess: () => {
        const identity = authClient.getIdentity();
        currentIdentity = identity;
        resolve(identity);
      },
      onError: (error) => {
        console.error('Login error:', error);
        resolve(null);
      },
    });
  });
};

// Logout function
export const logout = async () => {
  const authClient = await initAuthClient();
  await authClient.logout();
  clearAgentCache();
};

// Default export for backward compatibility
export default {
  getAgent,
  createActor,
  createLearningAnalyticsActor,
  withTimeout,
  isAuthenticated,
  getIdentity,
  login,
  logout,
  clearAgentCache,
  HOST,
  CANISTER_IDS,
};
