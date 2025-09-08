import { Actor, HttpAgent, Identity, ActorSubclass } from "@dfinity/agent"
import { Principal } from "@dfinity/principal"
import { AuthClient } from "@dfinity/auth-client"
import { idlFactory } from "./ic/sessions.idl"
import { _SERVICE } from "./ic/sessions"

// Session canister ID - using the provided canister ID
const SESSIONS_CANISTER_ID = "br5f7-7uaaa-aaaaa-qaaca-cai";

// Host configuration
const isLocal = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// Use the provided host URL for local development
const HOST = isLocal 
  ? "http://127.0.0.1:4943/api/v2" 
  : "https://ic0.app";

console.log('Session client initialized with host:', HOST);

// Add fetch root key for local development
const fetchRootKey = async (agent: HttpAgent) => {
  if (isLocal) {
    try {
      await agent.fetchRootKey();
      console.log('Successfully fetched root key for local development');
    } catch (err) {
      console.warn('Failed to fetch root key. This is expected in production.', err);
    }
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
  price?: number; // Make price optional since it's not in all usages
  hostName: string;
  hostAvatar: string;
  tags: string[];
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
  host: string; // Principal as string
  hostName: string;
  hostAvatar: string;
  status: SessionStatus;
  attendees: string[]; // Array of Principal strings
  createdAt: bigint;
  updatedAt: bigint;
  recordingUrl?: string | null;
  meetingUrl?: string | null;
  tags: string[];
  err?: any;
}

export class SessionClient {
  private actor: any = null;
  private authClient: AuthClient | null = null;
  private currentIdentity: Identity | null = null;

  private async getAuthClient(): Promise<AuthClient> {
    if (!this.authClient) {
      this.authClient = await AuthClient.create({
        idleOptions: { disableIdle: true },
      });
    }
    return this.authClient;
  }

  // Set identity for the client
  setIdentity(identity: Identity | null): void {
    this.currentIdentity = identity;
    this.actor = null; // Reset actor to force recreation with new identity
  }

  async getActor(requireAuth = true): Promise<ActorSubclass<_SERVICE>> {
    console.log(`[SessionClient] getActor called (requireAuth: ${requireAuth})`);
    
    try {
      const isLocal = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DFX_NETWORK === 'local';
      const HOST = isLocal ? 'http://localhost:4943' : 'https://ic0.app';
      
      console.log(`[SessionClient] Initializing agent (environment: ${isLocal ? 'local' : 'production'})`);
      
      const agent = new HttpAgent({ 
        host: HOST,
        // Disable verification for local development
        verifyQuerySignatures: !isLocal,
      });
      
      // Configure API version for local development
      if (isLocal) {
        console.log('[SessionClient] Configuring for local development');
        (agent as any)._host = HOST.replace('/api/v2', '/api/v2');
      }
  
      // Fetch root key for local development
      if (isLocal) {
        try {
          console.log('[SessionClient] Fetching root key...');
          await agent.fetchRootKey();
          console.log('[SessionClient] Successfully fetched root key');
        } catch (error) {
          console.warn('[SessionClient] Could not fetch root key (expected in production):', error);
        }
      }
  
      // Handle authentication
      if (requireAuth) {
        if (this.currentIdentity) {
          const principal = this.currentIdentity.getPrincipal();
          console.log(`[SessionClient] Using authenticated identity: ${principal.toString()}`);
          agent.replaceIdentity(this.currentIdentity);
        } else {
          console.warn('[SessionClient] Authentication required but no identity available');
          throw new Error('Authentication required but no identity available');
        }
      } else {
        console.log('[SessionClient] Using anonymous identity');
      }

      // Create the actor
      console.log(`[SessionClient] Creating actor for canister: ${SESSIONS_CANISTER_ID}`);
      this.actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: SESSIONS_CANISTER_ID,
      });
      
      console.log('[SessionClient] Actor created successfully');
      return this.actor;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[SessionClient] Error in getActor:', errorMessage, error);
      
      // Provide more specific error messages
      if (errorMessage.includes('No device found')) {
        throw new Error('No Internet Identity found. Please make sure you have an Internet Identity anchor set up.');
      } else if (errorMessage.includes('rejected')) {
        throw new Error('Authentication was rejected. Please try again.');
      } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        throw new Error('Network error: Unable to connect to the Internet Computer network');
      }
      
      this.actor = null; // Clear actor on error
      throw error;
    }
  }

  async createSession(input: CreateSessionInput): Promise<Session> {
    try {
      console.log('Creating session with input:', JSON.stringify(input, (_, v) => 
        typeof v === 'bigint' ? v.toString() : v
      ));
      
      const actor = await this.getActor();
      console.log('Actor created successfully');
      
      // Prepare the input according to the canister's expected format
      const sessionInput = {
        title: input.title,
        description: input.description,
        sessionType: input.sessionType,
        scheduledTime: Number(input.scheduledTime), // Convert BigInt to number
        duration: BigInt(input.duration),
        maxAttendees: BigInt(input.maxAttendees),
        hostName: input.hostName,
        hostAvatar: input.hostAvatar || '',
        tags: input.tags || [],
        ...(input.price !== undefined && { price: BigInt(input.price) })
      };
      
      console.log('Calling createSession with:', sessionInput);
      console.log('Canister ID:', SESSIONS_CANISTER_ID);
      
      const result = await (actor as any).createSession(sessionInput) as { ok?: Session; err?: any };
      console.log('Raw session creation result:', result);
      
      if (result && 'ok' in result && result.ok) {
        const session = result.ok;
        // Convert the session to match our frontend's Session type
        return {
          ...session,
          scheduledTime: BigInt(session.scheduledTime),
          duration: Number(session.duration),
          maxAttendees: Number(session.maxAttendees),
          price: session.price ? Number(session.price) : undefined,
          createdAt: BigInt(session.createdAt),
          updatedAt: BigInt(session.updatedAt || 0),
          attendees: session.attendees || [],
          tags: session.tags || [],
        };
      } else {
        const errorMsg = result?.err ? 
          (typeof result.err === 'object' ? JSON.stringify(result.err, null, 2) : String(result.err)) :
          'Unknown error occurred';
        console.error('Failed to create session:', errorMsg);
        throw new Error(`Failed to create session: ${errorMsg}`);
      }
    } catch (error: unknown) {
      console.error('Error in createSession:', error);
      
      let errorMessage = 'Unknown error';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Provide more helpful error messages
      if (errorMessage.includes('403')) {
        throw new Error('Authentication failed. Please try logging out and back in.');
      } else if (errorMessage.includes('timed out')) {
        throw new Error('Request timed out. Please check your internet connection and try again.');
      }
      
      throw new Error(`Failed to create session: ${errorMessage}`);
    }
  }

  async getAllSessions(): Promise<Session[]> {
    try {
      // Allow unauthenticated access to fetch all sessions
      const actor = await this.getActor(false);
      console.log('Fetching all sessions...');
      const result = await actor.getAllSessions();
      
      if (!Array.isArray(result)) {
        console.error('Unexpected response format from getAllSessions:', result);
        throw new Error('Invalid response format from canister');
      }
      
      // Convert the sessions to match our frontend's Session type
      return result.map((session: any) => ({
        ...session,
        scheduledTime: BigInt(session.scheduledTime || 0),
        duration: Number(session.duration || 0),
        maxAttendees: Number(session.maxAttendees || 0),
        price: session.price !== undefined ? Number(session.price) : undefined,
        createdAt: BigInt(session.createdAt || 0),
        updatedAt: BigInt(session.updatedAt || 0),
        attendees: Array.isArray(session.attendees) ? session.attendees : [],
        tags: Array.isArray(session.tags) ? session.tags : [],
        hostName: session.hostName || 'Unknown Host',
        hostAvatar: session.hostAvatar || '',
        recordingUrl: session.recordingUrl || undefined,
        meetingUrl: session.meetingUrl || undefined,
      }));
    } catch (error) {
      console.error('Error in getAllSessions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to fetch sessions: ${errorMessage}`);
    }
  }

  async getMySessions(): Promise<Session[]> {
    try {
      const actor = await this.getActor();
      console.log('Fetching my sessions...');
      const result = await actor.getMySessions();
      
      if (!Array.isArray(result)) {
        console.error('Unexpected response format from getMySessions:', result);
        throw new Error('Invalid response format from canister');
      }
      
      // Convert the session to match our frontend's Session type
      return result.map((session: any) => ({
        ...session,
        scheduledTime: BigInt(session.scheduledTime || 0),
        duration: Number(session.duration || 0),
        maxAttendees: Number(session.maxAttendees || 0),
        price: session.price !== undefined ? Number(session.price) : undefined,
        createdAt: BigInt(session.createdAt || 0),
        updatedAt: BigInt(session.updatedAt || 0),
        attendees: Array.isArray(session.attendees) ? session.attendees : [],
        tags: Array.isArray(session.tags) ? session.tags : [],
        hostName: session.hostName || 'Unknown Host',
        hostAvatar: session.hostAvatar || '',
        recordingUrl: session.recordingUrl || undefined,
        meetingUrl: session.meetingUrl || undefined,
      }));
    } catch (error) {
      console.error('Error in getMySessions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to fetch your sessions: ${errorMessage}`);
    }
  }

  async getSession(id: string): Promise<Session | null> {
    if (!id) {
      console.error('[SessionClient] No session ID provided');
      throw new Error('Session ID is required');
    }

    try {
      const actor = await this.getActor(false);
      const result = await (actor as any).getSession(id) as { ok?: any; err?: any } | null;
      
      if (!result || 'err' in result) {
        console.error('Error fetching session:', result?.err || 'Unknown error');
        return null;
      }

      if (!result.ok) {
        return null;
      }

      const session = result.ok;
      if (!session) return null;
      
      // Convert the session to match our frontend's Session type
      return {
        id: String(session.id || ''),
        title: String(session.title || ''),
        description: String(session.description || ''),
        sessionType: session.sessionType || { video: null },
        scheduledTime: BigInt(session.scheduledTime || 0),
        duration: Number(session.duration || 0),
        maxAttendees: Number(session.maxAttendees || 0),
        host: String(session.host || ''),
        hostName: String(session.hostName || ''),
        hostAvatar: String(session.hostAvatar || ''),
        status: session.status || { scheduled: null },
        attendees: Array.isArray(session.attendees) ? session.attendees.map(String) : [],
        createdAt: BigInt(session.createdAt || 0),
        updatedAt: BigInt(session.updatedAt || 0),
        recordingUrl: session.recordingUrl || null,
        meetingUrl: session.meetingUrl || null,
        tags: Array.isArray(session.tags) ? session.tags.map(String) : [],
        price: session.price !== undefined ? Number(session.price) : undefined,
      };
    } catch (error) {
      console.error('Error in getSession:', error);
      return null;
    }
  }

  async joinSession(id: string): Promise<Session> {
    console.log(`[SessionClient] joinSession called with ID: ${id}`);
    
    if (!id) {
      const error = 'Session ID is required';
      console.error(`[SessionClient] ${error}`);
      throw new Error(error);
    }
    
    if (!this.currentIdentity) {
      const error = 'Authentication required to join a session. Please log in first.';
      console.error(`[SessionClient] ${error}`);
      throw new Error(error);
    }
    
    try {
      console.log('[SessionClient] Getting actor with authentication...');
      const actor = await this.getActor(true);
      
      if (!actor) {
        throw new Error('Failed to initialize actor with authenticated identity');
      }
      
      console.log('[SessionClient] Using authenticated actor');
      return await this.attemptJoinSession(actor, id);
    } catch (error) {
      console.error('[SessionClient] Error in joinSession:', error);
      
      let errorMessage = 'Failed to join session';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      throw new Error(errorMessage);
    }
  }

  private async attemptJoinSession(actor: ActorSubclass<_SERVICE>, id: string): Promise<Session> {
    console.log('[SessionClient] Attempting to join session with actor');
    
    if (!this.currentIdentity) {
      const error = 'No authenticated identity available';
      console.error(`[SessionClient] ${error}`);
      throw new Error(error);
    }
    
    const result = await (actor as any).joinSession(id) as { ok?: any; err?: any };
    console.log('[SessionClient] Received response from canister:', result);
    
    if (!result) {
      throw new Error('No response received from canister');
    }
    
    if ('ok' in result && result.ok) {
      const session = result.ok;
      console.log('[SessionClient] Successfully joined session:', session.id);
      
      // Process meeting URL to ensure it has authentication parameters
      let meetingUrl = session.meetingUrl;
      if (meetingUrl) {
        try {
          const url = new URL(meetingUrl);
          
          // Add authentication parameters if we have an identity
          if (this.currentIdentity) {
            const principal = this.currentIdentity.getPrincipal().toString();
            
            // Add JWT-like token with user information
            const userInfo = {
              sub: principal,
              name: '', // Will be set by the frontend
              email: '', // Will be set by the frontend
              exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
              iat: Math.floor(Date.now() / 1000)
            };
            
            const authToken = btoa(JSON.stringify(userInfo));
            url.searchParams.append('jwt', authToken);
            
            // Add security parameters
            const params = {
              'config.prejoinPageEnabled': 'false',
              'interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS': 'true',
              'config.startWithAudioMuted': 'false',
              'config.startWithVideoMuted': 'false',
              'config.disableRemoteMute': 'true',
              'config.requireDisplayName': 'true',
              'config.enableNoisyMicDetection': 'false',
              'config.enableClosePage': 'true',
              'config.disableInviteFunctions': 'true',
              'config.enableWelcomePage': 'false',
              'config.enableUserRolesBasedOnToken': 'true'
            };
            
            // Add all parameters to URL
            Object.entries(params).forEach(([key, value]) => {
              if (!url.searchParams.has(key)) {
                url.searchParams.append(key, value);
              }
            });
            
            meetingUrl = url.toString();
            console.log('[SessionClient] Updated meeting URL with auth parameters');
          }
        } catch (error) {
          console.warn('[SessionClient] Failed to process meeting URL:', error);
        }
      }
      
      // Convert the session to match our frontend's Session type
      return {
        id: String(session.id || ''),
        title: String(session.title || ''),
        description: String(session.description || ''),
        sessionType: session.sessionType || { video: null },
        scheduledTime: BigInt(session.scheduledTime || 0),
        duration: Number(session.duration || 0),
        maxAttendees: Number(session.maxAttendees || 0),
        price: session.price !== undefined ? Number(session.price) : undefined,
        host: String(session.host?.toString() || ''),
        hostName: String(session.hostName || ''),
        hostAvatar: String(session.hostAvatar || ''),
        status: session.status || { scheduled: null },
        attendees: Array.isArray(session.attendees) 
          ? session.attendees.map((p: any) => typeof p === 'object' && 'toString' in p ? p.toString() : String(p))
          : [],
        createdAt: BigInt(session.createdAt || 0),
        updatedAt: BigInt(session.updatedAt || 0),
        recordingUrl: session.recordingUrl || null,
        meetingUrl: meetingUrl || session.meetingUrl || null,
        tags: Array.isArray(session.tags) ? session.tags.map(String) : []
      };
    } else {
      const errorMessage = result?.err ? 
        (typeof result.err === 'object' ? JSON.stringify(result.err) : String(result.err)) :
        'Unknown error occurred while joining session';
      
      console.error('[SessionClient] Error joining session:', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async updateSessionStatus(id: string, status: Session["status"]): Promise<Session> {
    const actor = await this.getActor()
    const updateInput = {
      id,
      title: [],
      description: [],
      scheduledTime: [],
      duration: [],
      maxAttendees: [],
      status: [status],
      recordingUrl: [],
      meetingUrl: [],
    }
    const result = await (actor as any).updateSession(updateInput) as { ok?: Session; err?: any }
    
    if (result && 'ok' in result) {
      return result.ok as Session;
    } else {
      const errorMessage = result?.err?.toString() || 'Failed to update session status';
      throw new Error(errorMessage);
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    const actor = await this.getActor()
    const result = await (actor as any).deleteSession(id) as { ok?: boolean; err?: any }
    
    if (result && 'ok' in result) {
      return result.ok as boolean;
    } else {
      const errorMessage = result?.err?.toString() || 'Failed to delete session';
      throw new Error(errorMessage);
    }
  }

  async searchSessions(query: string): Promise<Session[]> {
    try {
      const actor = await this.getActor();
      const result = await (actor as any).searchSessions(query) as Session[] | { err?: any };
      
      if (Array.isArray(result)) {
        return result;
      } else if (result && 'err' in result) {
        throw new Error(result.err?.toString() || 'Failed to search sessions');
      }
      return [];
    } catch (error) {
      console.error('Error in searchSessions:', error);
      throw error;
    }
  }

  async getCompletedSessions(): Promise<Session[]> {
    try {
      const actor = await this.getActor();
      const result = await (actor as any).getSessionsByStatus({ completed: null }) as Session[] | { err?: any };
      
      if (Array.isArray(result)) {
        return result;
      } else if (result && 'err' in result) {
        throw new Error(result.err?.toString() || 'Failed to get completed sessions');
      }
      return [];
    } catch (error) {
      console.error('Error in getCompletedSessions:', error);
      throw error;
    }
  }

}

export const sessionClient = new SessionClient();

// Test method to verify canister connectivity
export async function testCanisterConnection(): Promise<boolean> {
  try {
    console.log('Testing canister connection...');
    const actor = await sessionClient.getActor(false);
    console.log('Successfully created actor');
    
    // Try to call a simple method
    const actorAny = actor as any;
    if (typeof actorAny.canister_id === 'function') {
      try {
        const canisterId = await actorAny.canister_id();
        console.log('Canister ID from actor:', canisterId);
        return true;
      } catch (error) {
        console.warn('Could not call canister_id method, trying another approach...');
      }
    }
    
    // If canister_id doesn't exist, try another method
    if (typeof actorAny.status === 'function') {
      try {
        const status = await actorAny.status();
        console.log('Canister status:', status);
        return true;
      } catch (statusError) {
        console.error('Failed to get canister status:', statusError);
      }
    }
    
    // If we get here, no methods worked
    console.warn('No standard canister methods available for testing connection');
    return false;
  } catch (error) {
    console.error('Failed to create actor:', error);
    return false;
  }
}

// Test the connection when this module is loaded
if (typeof window !== 'undefined') {
  testCanisterConnection().then(success => {
    console.log(`Canister connection test ${success ? 'succeeded' : 'failed'}`);
  });
}
