import { Actor, HttpAgent, Identity, ActorSubclass, ActorMethod } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
import { idlFactory } from "./ic/sessions.idl";
import { _SERVICE, Session as ISession, CreateSessionInput as ICreateSessionInput, SessionStatus as ISessionStatus } from "./ic/sessions";

// Extend the _SERVICE interface to match our needs
type SessionService = _SERVICE & {
  createSession: ActorMethod<[ICreateSessionInput], { ok: ISession } | { err: string }>;
  updateSession: ActorMethod<[string, Partial<ICreateSessionInput>], { ok: ISession } | { err: string }>;
  joinSession: ActorMethod<[string], { ok: ISession } | { err: string }>;
  getSession: ActorMethod<[string], ISession | null>;
  getAllSessions: ActorMethod<[], ISession[]>;
  getMySessions: ActorMethod<[], ISession[]>;
  updateSessionStatus: ActorMethod<[string, ISessionStatus], { ok: ISession } | { err: string }>;
  deleteSession: ActorMethod<[string], boolean>;
  searchSessions: ActorMethod<[string], ISession[]>;
  getCompletedSessions: ActorMethod<[], ISession[]>;
  getSessionsByStatus: ActorMethod<[ISessionStatus], ISession[]>;
  whoami: ActorMethod<[], Principal>;
}

// Constants
// Get canister ID from environment variable or use default
const DEFAULT_SESSIONS_CANISTER_ID = "br5f7-7uaaa-aaaaa-qaaca-cai";
const SESSIONS_CANISTER_ID = process.env.NEXT_PUBLIC_SESSIONS_CANISTER_ID || DEFAULT_SESSIONS_CANISTER_ID;

// Use the IC replica directly
const LOCAL_HOST = 'http://127.0.0.1:4943';
const CANDID_INTERFACE = "by6od-j4aaa-aaaaa-qaadq-cai";
const PRODUCTION_HOST = "https://ic0.app";

// API proxy endpoint
const API_PROXY_ENDPOINT = "/api/ic-proxy";

console.log('[SessionClient] Using canister ID:', SESSIONS_CANISTER_ID);

// CORS configuration for local development
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Determine if we're in local development
const isLocal = process.env.NODE_ENV !== 'production' || 
  (typeof window !== 'undefined' && 
   (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));

// Configure host based on environment
const HOST = isLocal ? LOCAL_HOST : PRODUCTION_HOST;

// Log environment info
console.log(`[SessionClient] Initialized in ${isLocal ? 'local' : 'production'} mode`);
console.log(`[SessionClient] Using host: ${HOST}`);

// Format error messages consistently
const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (typeof error === 'object' && error !== null) {
    return JSON.stringify(error);
  }
  return 'Unknown error';
};

// Helper to fetch root key for local development
const fetchRootKey = async (agent: HttpAgent): Promise<boolean> => {
  if (!isLocal) return false;
  
  try {
    console.log('[SessionClient] Fetching root key for local development...');
    await agent.fetchRootKey();
    console.log('[SessionClient] Successfully fetched root key');
    return true;
  } catch (error) {
    console.warn('[SessionClient] Could not fetch root key, continuing without it:', error);
    return false;
  }
};

export type SessionType = { video: null } | { voice: null };

export type SessionStatus = 
  | { scheduled: null }
  | { live: null }
  | { completed: null }
  | { cancelled: null };

export interface CreateSessionInput {
  title: string;
  description: string;
  sessionType: SessionType;
  scheduledTime: bigint;
  duration: number;
  maxAttendees: number;
  price?: number;
  hostName: string;
  hostAvatar: string;
  tags: string[];
  recordSession: boolean;
  recordingUrl?: string | null;
}

export interface Session {
  id: string;
  title: string;
  description: string;
  sessionType: SessionType;
  scheduledTime: bigint;
  duration: number;
  maxAttendees: number;
  price?: number;
  host: string;
  hostName: string;
  hostAvatar: string;
  status: SessionStatus;
  attendees: string[];
  createdAt: bigint;
  updatedAt: bigint;
  recordingUrl?: string | null;
  meetingUrl?: string | null;
  tags: string[];
  recordSession: boolean;
  err?: any;
}

// Declare global type for window.sessionClient
declare global {
  interface Window {
    sessionClient?: SessionClient;
  }
}

export class SessionClient {
  private static instance: SessionClient;
  private actor: ActorSubclass<SessionService> | null = null;
  private authClient: AuthClient | null = null;
  private currentIdentity: Identity | null = null;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): SessionClient {
    if (!SessionClient.instance) {
      SessionClient.instance = new SessionClient();
    }
    return SessionClient.instance;
  }

  private async getAuthClient(): Promise<AuthClient> {
    if (!this.authClient) {
      this.authClient = await AuthClient.create({
        idleOptions: { disableIdle: true },
      });
    }
    return this.authClient;
  }

  public setIdentity(identity: Identity | null): void {
    this.currentIdentity = identity;
    this.actor = null; // Reset actor to force recreation with new identity
  }

  public async getActor(requireAuth = true): Promise<ActorSubclass<SessionService>> {
    console.log('[SessionClient] Getting actor, requireAuth:', requireAuth);
    
    if (requireAuth && !this.currentIdentity) {
      console.warn('[SessionClient] Authentication required but no current identity');
      throw new Error('User not authenticated');
    }

    // If we already have an actor and don't need to reinitialize, return it
    if (this.actor && this.isInitialized) {
      console.log('[SessionClient] Returning cached actor');
      return this.actor;
    }

    try {
      console.log(`[SessionClient] Creating new agent for ${isLocal ? 'local' : 'production'} environment`);
      
      const agent = new HttpAgent({
        // For local development, we'll use the proxy instead of setting the host
        host: isLocal ? undefined : PRODUCTION_HOST,
        identity: this.currentIdentity || undefined,
      });

      if (isLocal) {
        console.log('[SessionClient] Setting up proxy for local development');
        
        // Create a custom fetch function that uses our proxy
        const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
          const requestUrl = new URL(input.toString());
          
          // Only proxy requests to the IC replica
          if (requestUrl.hostname === '127.0.0.1' || requestUrl.hostname === 'localhost') {
            // Use the direct IC replica URL instead of proxying
            const directUrl = new URL(requestUrl.toString());
            directUrl.hostname = '127.0.0.1';
            directUrl.port = '4943';
            
            // Prepare headers for the direct request
            const headers = new Headers(init?.headers);
            headers.set('Origin', 'http://127.0.0.1:4943');
            
            console.log(`[SessionClient] Sending direct request to IC replica: ${directUrl.toString()}`);
            
            return fetch(directUrl.toString(), {
              ...init,
              headers,
              mode: 'cors',
              credentials: 'include',
            });
          }
          
          // For non-IC requests, use the regular fetch
          return fetch(input, init);
        };
        
        // @ts-ignore - Override the agent's fetch method
        agent.fetch = customFetch;
        
        // Fetch root key for local development
        console.log('[SessionClient] Fetching root key for local development');
        try {
          await fetchRootKey(agent);
        } catch (error) {
          console.warn('[SessionClient] Could not fetch root key, continuing without it:', error);
        }
      } else {
        console.log('[SessionClient] Running in production mode');
      }

      // Create a new actor with the correct type
      console.log('[SessionClient] Creating actor with canister ID:', SESSIONS_CANISTER_ID);
      const actor = Actor.createActor<SessionService>(idlFactory, {
        agent,
        canisterId: SESSIONS_CANISTER_ID,
      });

      // Test the actor by checking agent status and basic functionality
      try {
        const status = await agent.status();
        console.log('[SessionClient] Agent status:', status);
        
        // Test the actor with a simple query if in local development
        if (isLocal) {
          try {
            // Check if the actor has the whoami method before calling it
            if (typeof actor.whoami === 'function') {
              const whoami = await actor.whoami();
              console.log('[SessionClient] Actor test successful, principal:', whoami.toString());
            } else {
              console.log('[SessionClient] whoami method not available, skipping test');
              // Try a different method that should be available
              const sessions = await actor.getAllSessions().catch(() => []);
              console.log(`[SessionClient] Successfully fetched ${sessions.length} sessions`);
            }
          } catch (testError) {
            console.warn('[SessionClient] Actor test warning:', testError);
            // Continue initialization even if test fails
          }
        }
      } catch (error) {
        console.error('[SessionClient] Error during actor initialization:', error);
        // Don't fail initialization for test errors
      }

      this.actor = actor;
      this.isInitialized = true;
      console.log('[SessionClient] Actor initialized successfully');
      return actor;
    } catch (error) {
      console.error('Failed to create actor:', error);
      this.actor = null;
      this.isInitialized = false;
      throw new Error(`Failed to initialize actor: ${formatError(error)}`);
    }
  }

  public async createSession(input: CreateSessionInput): Promise<Session> {
    console.log('[SessionClient] Creating session with input:', input);

    if (!this.currentIdentity) {
      const error = 'Must be authenticated to create a session';
      console.error('[SessionClient]', error);
      throw new Error(error);
    }

    try {
      console.log('[SessionClient] Getting actor...');
      const actor = await this.getActor(true);
      console.log('[SessionClient] Actor obtained, calling createSession...');
      
      // Convert input to match the expected interface
      const sessionInput: ICreateSessionInput = {
        title: input.title,
        description: input.description,
        sessionType: input.sessionType,
        scheduledTime: BigInt(input.scheduledTime.toString()),
        duration: Number(input.duration),
        maxAttendees: input.maxAttendees,
        price: input.price,
        hostName: input.hostName,
        hostAvatar: input.hostAvatar,
        tags: input.tags
      };
      
      // Add optional fields if they exist
      if (input.recordingUrl) {
        (sessionInput as any).recordingUrl = input.recordingUrl;
      }
      
      console.log('[SessionClient] Calling createSession with:', sessionInput);
      const response = await actor.createSession(sessionInput);
      console.log('[SessionClient] Received response:', response);

      if (!response) {
        throw new Error('No response received from canister');
      }

      if ('err' in response) {
        const error = `Failed to create session: ${JSON.stringify(response.err)}`;
        console.error('[SessionClient]', error);
        throw new Error(error);
      }

      if (!('ok' in response) || !response.ok) {
        throw new Error('Invalid response format from canister');
      }

      console.log('[SessionClient] Session created successfully:', response.ok);
      // Type assertion to ensure response.ok is ISession
      return this.normalizeSession(response.ok as ISession);
    } catch (error) {
      const errorMsg = `Failed to create session: ${formatError(error)}`;
      console.error('[SessionClient]', errorMsg, error);
      throw new Error(errorMsg);
    }
  }

  private toNumber(value: any, fieldName: string): number {
    if (value === undefined || value === null) {
      throw new Error(`Missing required field: ${fieldName}`);
    }
    if (typeof value === 'bigint') {
      return Number(value);
    }
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`Invalid number format for field ${fieldName}: ${value}`);
    }
    return num;
  }
  
  private toString(value: any, fieldName: string): string {
    if (value === undefined || value === null) {
      throw new Error(`Missing required field: ${fieldName}`);
    }
    return String(value);
  }

  private normalizeSession(session: ISession): Session {
    if (!session) {
      throw new Error('Cannot normalize undefined or null session');
    }

    try {
      console.log('[SessionClient] Normalizing session data:', session);
      
      // Normalize the session data
      const normalized: Partial<Session> = {
        id: this.toString(session.id, 'id'),
        title: this.toString(session.title, 'title'),
        description: this.toString(session.description, 'description'),
        sessionType: this.normalizeSessionType(session.sessionType),
        scheduledTime: BigInt(session.scheduledTime.toString()),
        duration: Number(session.duration),
        maxAttendees: Number(session.maxAttendees),
        host: this.toString(session.host, 'host'),
        hostName: this.toString(session.hostName, 'hostName'),
        hostAvatar: this.toString(session.hostAvatar, 'hostAvatar'),
        status: this.normalizeSessionStatus(session.status),
        attendees: Array.isArray(session.attendees) 
          ? session.attendees.map(a => this.toString(a, 'attendee')) 
          : [],
        createdAt: BigInt(session.createdAt.toString()),
        updatedAt: BigInt(session.updatedAt.toString()),
        recordingUrl: session.recordingUrl ? this.toString(session.recordingUrl, 'recordingUrl') : null,
        meetingUrl: session.meetingUrl ? this.toString(session.meetingUrl, 'meetingUrl') : null,
        tags: Array.isArray(session.tags) 
          ? session.tags.map(t => this.toString(t, 'tag')).filter(Boolean)
          : []
      };

      // Add optional price field if it exists
      if ('price' in session) {
        normalized.price = Number(session.price);
      }

      // Add recordSession with a default value
      normalized.recordSession = false;

      // Assert the type to Session since we've ensured all required fields are present
      return normalized as Session;
    } catch (error) {
      console.error('[SessionClient] Error normalizing session:', error, session);
      throw new Error(`Failed to normalize session: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private normalizeSessionStatus(status: any): SessionStatus {
    if (typeof status === 'object' && status !== null) {
      if ('scheduled' in status) return { scheduled: null };
      if ('live' in status) return { live: null };
      if ('completed' in status) return { completed: null };
      if ('cancelled' in status) return { cancelled: null };
    }
    return { scheduled: null };
  }

  private normalizeSessionType(type: any): SessionType {
    if (typeof type === 'object' && type !== null) {
      if ('video' in type) return { video: null };
      if ('voice' in type) return { voice: null };
    }
    return { video: null };
  }

  public async getSession(sessionId: string): Promise<Session | null> {
    try {
      const actor = await this.getActor(false);
      const result = await actor.getSession(sessionId);
      
      if (!result) {
        console.warn(`[SessionClient] No result received for session ${sessionId}`);
        return null;
      }

      return this.normalizeSession(result);
    } catch (error) {
      console.error(`[SessionClient] Error getting session ${sessionId}:`, error);
      return null;
    }
  }

  public async getAllSessions(maxRetries = 3, retryDelay = 1000): Promise<Session[]> {
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[SessionClient] Fetching sessions (attempt ${attempt}/${maxRetries})`);
        const actor = await this.getActor(false);
        const sessions = await actor.getAllSessions();
        
        if (!sessions || !Array.isArray(sessions)) {
          console.warn('[SessionClient] No sessions array received from canister');
          return [];
        }

        return sessions.map(session => this.normalizeSession(session));
      } catch (error) {
        lastError = error;
        console.warn(`[SessionClient] Attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }
    
    console.error('[SessionClient] All attempts to fetch sessions failed');
    throw new Error(`Failed to get sessions after ${maxRetries} attempts: ${formatError(lastError)}`);
  }

  public async updateSession(sessionId: string, updates: Partial<CreateSessionInput>): Promise<Session> {
    if (!this.currentIdentity) {
      throw new Error('Must be authenticated to update a session');
    }

    try {
      const updateData: Partial<ICreateSessionInput> = {};
      
      // Only include defined values in the update
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.sessionType !== undefined) updateData.sessionType = updates.sessionType;
      if (updates.scheduledTime !== undefined) {
        updateData.scheduledTime = BigInt(updates.scheduledTime.toString());
      }
      if (updates.duration !== undefined) updateData.duration = Number(updates.duration);
      if (updates.maxAttendees !== undefined) updateData.maxAttendees = updates.maxAttendees;
      if (updates.price !== undefined) {
        updateData.price = updates.price !== undefined ? updates.price : undefined;
      }
      if (updates.recordingUrl !== undefined) {
        (updateData as any).recordingUrl = updates.recordingUrl;
      }
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      
      const actor = await this.getActor(true);
      const result = await (actor as any).updateSession(sessionId, updateData);

      if (!result) {
        throw new Error('No response received from canister');
      }

      if ('err' in result) {
        throw new Error(`Failed to update session: ${JSON.stringify(result.err)}`);
      }

      if (!('ok' in result)) {
        throw new Error('Invalid response format from canister');
      }

      return this.normalizeSession(result.ok);
    } catch (error) {
      console.error(`[SessionClient] Error updating session ${sessionId}:`, error);
      throw new Error(`Failed to update session: ${formatError(error)}`);
    }
  }

  public async deleteSession(sessionId: string): Promise<boolean> {
    if (!this.currentIdentity) {
      throw new Error('Must be authenticated to delete a session');
    }

    try {
      const actor = await this.getActor(true);
      const result = await (actor as any).deleteSession(sessionId);
      
      if (!result) {
        throw new Error('No response received from canister');
      }
      
      if ('err' in result) {
        throw new Error(`Failed to delete session: ${JSON.stringify(result.err)}`);
      }
      
      return result.ok === true;
    } catch (error) {
      console.error(`[SessionClient] Error deleting session ${sessionId}:`, error);
      throw new Error(`Failed to delete session: ${formatError(error)}`);
    }
  }

  public async joinSession(sessionId: string): Promise<Session> {
    if (!this.currentIdentity) {
      throw new Error('Must be authenticated to join a session');
    }

    try {
      const actor = await this.getActor(true);
      const result = await (actor as any).joinSession(sessionId);
      
      if (!result || !('ok' in result) || !result.ok) {
        throw new Error('Failed to join session');
      }

      return this.normalizeSession(result.ok);
    } catch (error) {
      console.error(`[SessionClient] Error joining session ${sessionId}:`, error);
      throw new Error(`Failed to join session: ${formatError(error)}`);
    }
  }

  public async leaveSession(sessionId: string): Promise<Session> {
    if (!this.currentIdentity) {
      throw new Error('Must be authenticated to leave a session');
    }

    try {
      const actor = await this.getActor(true);
      const result = await (actor as any).leaveSession(sessionId);
      
      if (!result || !('ok' in result) || !result.ok) {
        throw new Error('Failed to leave session');
      }

      return this.normalizeSession(result.ok);
    } catch (error) {
      console.error(`[SessionClient] Error leaving session ${sessionId}:`, error);
      throw new Error(`Failed to leave session: ${formatError(error)}`);
    }
  }

  public async updateSessionStatus(
    sessionId: string, 
    status: SessionStatus
  ): Promise<Session> {
    if (!this.currentIdentity) {
      throw new Error('Must be authenticated to update session status');
    }

    try {
      // Convert the status to a format the canister expects
      let statusUpdate: any;
      if ('scheduled' in status) statusUpdate = { scheduled: null };
      else if ('live' in status) statusUpdate = { live: null };
      else if ('completed' in status) statusUpdate = { completed: null };
      else if ('cancelled' in status) statusUpdate = { cancelled: null };
      else throw new Error('Invalid session status');

      const actor = await this.getActor(true);
      const result = await (actor as any).updateSessionStatus(sessionId, statusUpdate);
      
      if (!result) {
        throw new Error('No response received from canister');
      }
      
      if ('err' in result) {
        throw new Error(`Failed to update session status: ${JSON.stringify(result.err)}`);
      }
      
      if (!('ok' in result) || !result.ok) {
        throw new Error('Invalid response format from canister');
      }

      return this.normalizeSession(result.ok);
    } catch (error) {
      console.error(`[SessionClient] Error updating status for session ${sessionId}:`, error);
      throw new Error(`Failed to update session status: ${formatError(error)}`);
    }
  }
}

// Create and export a singleton instance
export const sessionClient = SessionClient.getInstance();

// Expose on window for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).sessionClient = sessionClient;
}
