import { Actor, HttpAgent, Identity } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import { idlFactory } from "./ic/sessions.idl"

// Session canister ID - using the provided canister ID
const SESSIONS_CANISTER_ID = "br5f7-7uaaa-aaaaa-qaaca-cai";

// Host configuration
const isLocal = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// Use the provided host URL for local development
const HOST = isLocal 
  ? "http://127.0.0.1:4943" 
  : "https://ic0.app";

// Candid interface URL for the sessions
const SESSIONS_CANDID_URL = isLocal
  ? `http://127.0.0.1:4943/?canisterId=by6od-j4aaa-aaaaa-qaadq-cai&id=${SESSIONS_CANISTER_ID}`
  : `https://${SESSIONS_CANISTER_ID}.ic0.app`;

console.log('Session client initialized with host:', HOST);

export interface CreateSessionInput {
  title: string
  description: string
  sessionType: { video: null } | { voice: null }
  scheduledTime: bigint
  duration: number
  maxAttendees: number
  price: number
  hostName: string
  hostAvatar: string
  tags: string[]
}

export interface Session {
  id: string
  title: string
  description: string
  sessionType: { video: null } | { voice: null }
  scheduledTime: bigint
  duration: number
  maxAttendees: number
  price: number
  hostName: string
  hostAvatar: string
  tags: string[]
  attendees: string[]
  status: { scheduled: null } | { live: null } | { completed: null } | { cancelled: null }
  createdAt: bigint
  recordingUrl?: string
  meetingUrl?: string
}

class SessionClient {
  private actor: any = null

  private authClient: AuthClient | null = null;
  private actor: any = null;

  private async getAuthClient(): Promise<AuthClient> {
    if (!this.authClient) {
      this.authClient = await AuthClient.create({
        idleOptions: { disableIdle: true },
      });
    }
    return this.authClient;
  }

  private async getActor(requireAuth = true) {
    if (this.actor) return this.actor;

    try {
      let agent: HttpAgent;
      
      if (requireAuth) {
        const authClient = await this.getAuthClient();
        
        // Check authentication state if required
        if (!(await authClient.isAuthenticated())) {
          throw new Error('User not authenticated. Please log in first.');
        }

        const identity = authClient.getIdentity();
        if (!identity) {
          throw new Error('Failed to get identity. Please try logging in again.');
        }

        const principal = identity.getPrincipal().toText();
        console.log('Using authenticated identity principal:', principal);
        
        agent = new HttpAgent({
          identity,
          host: HOST,
          verifyQuerySignatures: false,
        });
      } else {
        // For unauthenticated requests, use an anonymous identity
        console.log('Using anonymous identity for unauthenticated request');
        agent = new HttpAgent({
          host: HOST,
          verifyQuerySignatures: false,
        });
      }

      console.log('Connecting to canister:', SESSIONS_CANISTER_ID);
      console.log('Using host:', HOST);

      // For local development, fetch root key
      if (isLocal) {
        try {
          await agent.fetchRootKey();
          console.log('Successfully fetched root key for local development');
        } catch (error) {
          console.warn('Failed to fetch root key. This is expected in production.');
        }
      } else {
        // In production, verify the SSL certificate
        agent.fetchRootKey().catch(err => {
          console.warn('Unable to fetch root key. Running in production mode.');
        });
      }

      // Create the actor with the correct canister ID
      this.actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: SESSIONS_CANISTER_ID,
      });

      // Test the connection by getting the canister status
      try {
        const status = await agent.status();
        console.log('IC Status:', status);
        
        // Additional debug: Check if canister is reachable
        try {
          const canisterInfo = await agent.getPrincipal();
          console.log('Agent principal:', canisterInfo.toText());
        } catch (error) {
          console.warn('Could not get agent principal, but continuing:', error);
        }
      } catch (error) {
        console.error('IC connection test failed:', error);
        throw new Error(`Failed to connect to canister: ${error.message}`);
      }

      return this.actor
    } catch (error) {
      console.error('Error in getActor:', error)
      this.actor = null // Clear actor on error
      throw error
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
        price: BigInt(input.price),
        hostName: input.hostName,
        hostAvatar: input.hostAvatar || '',
        tags: input.tags || [],
      };
      
      console.log('Calling createSession with:', sessionInput);
      console.log('Canister ID:', SESSIONS_CANISTER_ID);
      
      const result = await actor.createSession(sessionInput);
      console.log('Raw session creation result:', result);
      
      if ('ok' in result) {
        const session = result.ok;
        // Convert the session to match our frontend's Session type
        return {
          ...session,
          scheduledTime: BigInt(session.scheduledTime),
          duration: Number(session.duration),
          maxAttendees: Number(session.maxAttendees),
          price: Number(session.price),
          createdAt: BigInt(session.createdAt),
          updatedAt: BigInt(session.updatedAt || 0),
          attendees: session.attendees || [],
          tags: session.tags || [],
        };
      } else {
        const errorMsg = typeof result.err === 'object' 
          ? JSON.stringify(result.err, null, 2) 
          : String(result.err);
        console.error('Failed to create session:', errorMsg);
        throw new Error(`Failed to create session: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error in createSession:', error)
      
      // Provide more helpful error messages
      if (error.message.includes('403')) {
        throw new Error('Authentication failed. Please try logging out and back in.')
      } else if (error.message.includes('timed out')) {
        throw new Error('Request timed out. Please check your internet connection and try again.')
      }
      
      throw new Error(`Failed to create session: ${error.message}`)
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
      return result.map(session => ({
        ...session,
        scheduledTime: BigInt(session.scheduledTime || 0),
        duration: Number(session.duration || 0),
        maxAttendees: Number(session.maxAttendees || 0),
        price: Number(session.price || 0),
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
      throw new Error(`Failed to fetch sessions: ${error.message}`);
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
      
      // Convert the sessions to match our frontend's Session type
      return result.map(session => ({
        ...session,
        scheduledTime: BigInt(session.scheduledTime || 0),
        duration: Number(session.duration || 0),
        maxAttendees: Number(session.maxAttendees || 0),
        price: Number(session.price || 0),
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
      throw new Error(`Failed to fetch your sessions: ${error.message}`);
    }
  }

  async getSession(id: string): Promise<Session | null> {
    const actor = await this.getActor()
    const result = await actor.getSession(id)
    return result.length > 0 ? result[0] : null
  }

  async joinSession(id: string): Promise<Session> {
    const actor = await this.getActor()
    const result = await actor.joinSession(id)
    if ("ok" in result) {
      return result.ok
    } else {
      throw new Error(result.err)
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
    const result = await actor.updateSession(updateInput)
    if ("ok" in result) {
      return result.ok
    } else {
      throw new Error(result.err)
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    const actor = await this.getActor()
    const result = await actor.deleteSession(id)
    if ("ok" in result) {
      return result.ok
    } else {
      throw new Error(result.err)
    }
  }

  async searchSessions(query: string): Promise<Session[]> {
    const actor = await this.getActor()
    const result = await actor.searchSessions(query)
    return result
  }

  async getCompletedSessions(): Promise<Session[]> {
    const actor = await this.getActor()
    const result = await actor.getSessionsByStatus({ completed: null })
    return result
  }
}

export const sessionClient = new SessionClient()
