import { Actor, HttpAgent, Identity, ActorSubclass, ActorMethod } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
import { idlFactory } from "./ic/sessions.idl";
import { _SERVICE, Session as ISession, CreateSessionInput as ICreateSessionInput, SessionStatus as ISessionStatus, JitsiConfig } from "./ic/sessions";

// Extend the _SERVICE interface to match our needs
type SessionService = _SERVICE & {
  createSession: ActorMethod<[ICreateSessionInput], { ok: ISession } | { err: string }>;
  updateSession: ActorMethod<[string, Partial<ICreateSessionInput>], { ok: ISession } | { err: string }>;
  joinSession: ActorMethod<[string], { ok: { session: ISession; isModerator: boolean } } | { err: string }>;
  getSession: ActorMethod<[string], ISession | null>;
  getAllSessions: ActorMethod<[], ISession[]>;
  getMySessions: ActorMethod<[], ISession[]>;
  updateSessionStatus: ActorMethod<[string, ISessionStatus], { ok: ISession } | { err: string }>;
  deleteSession: ActorMethod<[string], boolean>;
  searchSessions: ActorMethod<[string], ISession[]>;
  getCompletedSessions: ActorMethod<[], ISession[]>;
  getSessionsByStatus: ActorMethod<[SessionStatus], ISession[]>;
  whoami: ActorMethod<[], Principal>;
}

// Constants
// Get canister ID from environment variable or use default
const DEFAULT_SESSIONS_CANISTER_ID = "emnyw-syaaa-aaaaa-qajoq-cai";
const SESSIONS_CANISTER_ID = process.env.NEXT_PUBLIC_SESSIONS_CANISTER_ID || DEFAULT_SESSIONS_CANISTER_ID;

// Use the IC replica directly

const PRODUCTION_HOST = "https://a4gq6-oaaaa-aaaab-qaa4q-cai.icp0.io";


console.log('[SessionClient] Using canister ID:', SESSIONS_CANISTER_ID);

// CORS configuration for local development
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Force production mode to use the IC network
const isLocal = false;

// Configure host based on environment
const HOST = PRODUCTION_HOST;

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

// Import the SessionType and other types from the IDL
export type { SessionType, SessionStatus as IDLSessionStatus } from './ic/sessions';

// Re-export the SessionType for backward compatibility
export type SessionType = { video: null } | { voice: null } | { screen_share: null } | { webinar: null };

// Helper function to create session types
export const createSessionType = (type: 'video' | 'voice' | 'screen_share' | 'webinar'): SessionType => {
  // This is a type-safe way to create a SessionType
  switch (type) {
    case 'video':
      return { video: null };
    case 'voice':
      return { voice: null };
    case 'screen_share':
      return { screen_share: null };
    case 'webinar':
      return { webinar: null };
    default:
      return { video: null }; // Default to video
  }
};

// Session status type that matches the IDL
export type SessionStatus = 
  | { scheduled: null } 
  | { live: null } 
  | { completed: null } 
  | { cancelled: null } 
  | { recording: null };

export interface CreateSessionInput {
  title: string;
  description: string;
  sessionType: SessionType;
  scheduledTime: bigint;
  duration: bigint;
  maxAttendees: bigint;
  price?: number;
  hostName: string;
  hostAvatar: string;
  tags: string[];
  recordSession: boolean;
  isRecordingEnabled: boolean;
  isPrivate?: boolean;
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
  isRecordingEnabled: boolean;
  jitsiConfig: JitsiConfig | null;
  participantCount: number;
  actualEndTime?: bigint;
  actualStartTime?: bigint;
  maxParticipants?: number;
  isPrivate: boolean;
  // For error handling
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
        host: PRODUCTION_HOST,
        identity: this.currentIdentity || undefined,
      });

      console.log('[SessionClient] Running in production mode');

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
        
        // Test the actor with a simple query in production
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
      
      // Create session input matching exact Motoko field order
      const sessionInput: ICreateSessionInput = {
        title: String(input.title),
        description: String(input.description),
        sessionType: input.sessionType,
        scheduledTime: BigInt(input.scheduledTime),
        duration: BigInt(input.duration), // Use BigInt for Nat type
        maxAttendees: BigInt(input.maxAttendees), // Use BigInt for Nat type
        hostName: String(input.hostName),
        hostAvatar: String(input.hostAvatar),
        tags: input.tags.map(tag => String(tag)),
        isRecordingEnabled: Boolean(input.isRecordingEnabled || false),
        jitsiConfig: [] as [] | [any]
      };
      
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
      console.warn(`[SessionClient] Missing field: ${fieldName}, using empty string as fallback`);
      return '';
    }
    try {
      return String(value);
    } catch (error) {
      console.warn(`[SessionClient] Error converting field ${fieldName} to string:`, error);
      return '';
    }
  }

  private normalizeSession(session: ISession): Session {
    if (!session) {
      throw new Error('Cannot normalize undefined or null session');
    }

    try {
      console.log('[SessionClient] Normalizing session data:', session);
      
      // Helper function to safely get string with fallback
      const safeString = (value: any, fieldName: string, defaultValue: string = ''): string => {
        try {
          return value !== undefined && value !== null ? String(value) : defaultValue;
        } catch (error) {
          console.warn(`[SessionClient] Error processing field ${fieldName}:`, error);
          return defaultValue;
        }
      };
      
      // First, create a normalized session with default values
      const normalized: Partial<Session> = {
        id: session?.id ? String(session.id) : `temp-${Date.now()}`,
        title: safeString(session?.title, 'title', 'Untitled Session'),
        description: safeString(session?.description, 'description', ''),
        sessionType: session?.sessionType ? this.normalizeSessionType(session.sessionType) : { video: null },
        scheduledTime: (() => {
          try {
            const time = session.scheduledTime;
            if (time === undefined || time === null) return BigInt(0);
            if (typeof time === 'bigint') return time;
            if (typeof time === 'number') return BigInt(time);
            if (typeof time === 'string') {
              const parsed = parseInt(time, 10);
              return isNaN(parsed) ? BigInt(0) : BigInt(parsed);
            }
            return BigInt(0);
          } catch (error) {
            console.error('Error parsing scheduledTime:', error);
            return BigInt(0);
          }
        })(),
        duration: typeof session.duration === 'number' ? session.duration : 0,
        maxAttendees: typeof session.maxAttendees === 'number' ? session.maxAttendees : 10,
        host: '', // Will be set below
        hostName: session.hostName ? this.toString(session.hostName, 'hostName') : 'Unknown Host',
        hostAvatar: session.hostAvatar ? this.toString(session.hostAvatar, 'hostAvatar') : '',
        status: this.normalizeSessionStatus(session.status),
        attendees: Array.isArray(session.attendees) 
          ? session.attendees.map(a => a ? this.toString(a, 'attendee') : '').filter(Boolean)
          : [],
        participantCount: Array.isArray(session.attendees) ? session.attendees.length : 0,
        isRecordingEnabled: Boolean(session.isRecordingEnabled),
        jitsiConfig: session.jitsiConfig && Array.isArray(session.jitsiConfig) && session.jitsiConfig.length > 0 
          ? session.jitsiConfig[0] 
          : null,
        isRecordingEnabled: Boolean(session.isRecordingEnabled),
        isPrivate: Boolean(session.isPrivate),
        recordingUrl: session.recordingUrl || null,
        meetingUrl: session.meetingUrl || null,
        tags: Array.isArray(session.tags) ? session.tags.map(t => this.toString(t, 'tag')) : [],
        createdAt: session.createdAt ? BigInt(session.createdAt.toString()) : BigInt(0),
        updatedAt: session.updatedAt ? BigInt(session.updatedAt.toString()) : BigInt(0),
      };

      // Handle host field more robustly
      try {
        if (session.host) {
          normalized.host = this.toString(session.host, 'host');
        } else if (session['hostId']) {
          normalized.host = this.toString(session['hostId'], 'hostId');
        } else if (session['creator']) {
          normalized.host = this.toString(session['creator'], 'creator');
        } else if (session['owner']) {
          normalized.host = this.toString(session['owner'], 'owner');
        } else if (this.currentIdentity) {
          normalized.host = this.currentIdentity.getPrincipal().toString();
        } else {
          normalized.host = `generated-host-${Date.now()}`;
        }
      } catch (hostError) {
        console.warn('Error processing host field, using fallback host ID');
        normalized.host = `fallback-host-${Date.now()}`;
      }

      // Handle optional price field
      if ('price' in session && session.price !== undefined) {
        try {
          (normalized as any).price = Number(session.price);
        } catch (priceError) {
          console.warn('Error processing price field, skipping');
        }
      }

      return normalized as Session;
    } catch (error) {
      console.error('[SessionClient] Error normalizing session:', error, session);
      // Return a minimal valid session object as fallback
      return {
        id: 'error-session-' + Date.now(),
        title: 'Error Loading Session',
        description: 'There was an error loading this session',
        sessionType: { video: null },
        scheduledTime: BigInt(0),
        duration: 0,
        maxAttendees: 0,
        host: 'system',
        hostName: 'System',
        hostAvatar: '',
        status: { scheduled: null },
        attendees: [],
        participantCount: 0,
        recordSession: false,
        isRecordingEnabled: false,
        isPrivate: false,
        recordingUrl: null,
        meetingUrl: null,
        tags: [],
        createdAt: BigInt(0),
        updatedAt: BigInt(0)
      };
    }
  }

  private normalizeSessionStatus(status: any): SessionStatus {
    if (status === null || typeof status !== 'object') {
      return { scheduled: null };
    }
    
    if ('scheduled' in status) return { scheduled: null };
    if ('live' in status) return { live: null };
    if ('completed' in status) return { completed: null };
    if ('cancelled' in status) return { cancelled: null };
    if ('recording' in status) return { recording: null };
    
    return { scheduled: null };
  }

  private normalizeSessionType(type: any): SessionType {
    if (type === null || typeof type !== 'object') {
      return { video: null }; // Default to video session type
    }
    
    if ('video' in type) return { video: null };
    if ('voice' in type) return { voice: null };
    if ('screen_share' in type) return { screen_share: null };
    if ('webinar' in type) return { webinar: null };
    
    return { video: null }; // Default to video type
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
      if (updates.duration !== undefined) updateData.duration = BigInt(updates.duration);
      if (updates.maxAttendees !== undefined) updateData.maxAttendees = BigInt(updates.maxAttendees);
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
      console.log(`[SessionClient] Deleting session ${sessionId}`);
      const actor = await this.getActor(true);
      // The canister returns a boolean directly for delete operations
      const success = await (actor as any).deleteSession(sessionId);
      
      if (success === undefined || success === null) {
        console.error('[SessionClient] No response received from canister when deleting session');
        throw new Error('No response received from canister');
      }
      
      console.log(`[SessionClient] Delete session result:`, success);
      
      if (typeof success !== 'boolean') {
        console.error('[SessionClient] Unexpected response format from deleteSession:', success);
        throw new Error('Unexpected response format from canister');
      }
      
      return success;
    } catch (error) {
      console.error(`[SessionClient] Error deleting session ${sessionId}:`, error);
      throw new Error(`Failed to delete session: ${formatError(error)}`);
    }
  }

  public async joinSession(sessionId: string): Promise<{ session: Session; isModerator: boolean }> {
    console.log('[SessionClient] joinSession called with sessionId:', sessionId);
    
    if (!this.currentIdentity) {
        throw new Error('Must be authenticated to join a session');
    }

    if (!sessionId) {
        throw new Error('Session ID is required to join a session');
    }

    try {
        console.log(`[SessionClient] Getting actor for session ${sessionId}`);
        const actor = await this.getActor();
        
        console.log(`[SessionClient] Calling joinSession on canister for session ${sessionId}`);
        const response = await (actor as any).joinSession(sessionId);
        
        console.log('[SessionClient] Raw response from canister:', response);
        
        // Handle different response formats
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response format from server');
        }
        
        // Handle error response from Motoko's Result type
        if ('err' in response) {
            throw new Error(response.err || 'Unknown error occurred');
        }
        
        // Handle successful response from Motoko's Result type
        if ('ok' in response) {
            const result = response.ok;
            if (!result || typeof result !== 'object') {
                throw new Error('Invalid response format: expected object with session and isModerator');
            }
            
            const { session: sessionData, isModerator } = result;
            
            if (!sessionData) {
                throw new Error('No session data in response');
            }
            
            // Ensure the session has an ID - use the provided sessionId if missing
            const sessionWithId = {
                ...sessionData,
                id: sessionData.id || sessionId
            };
            
            console.log('[SessionClient] Session with ensured ID:', sessionWithId);
            
            // Create a minimal valid session with all required fields
            const safeSession: Session = {
                id: sessionWithId.id,
                title: sessionWithId.title || 'Untitled Session',
                description: sessionWithId.description || '',
                sessionType: sessionWithId.sessionType || { video: null },
                scheduledTime: typeof sessionWithId.scheduledTime === 'bigint' 
                    ? sessionWithId.scheduledTime 
                    : BigInt(sessionWithId.scheduledTime || 0),
                duration: sessionWithId.duration ? Number(sessionWithId.duration) : 60,
                maxAttendees: sessionWithId.maxAttendees ? Number(sessionWithId.maxAttendees) : 10,
                host: sessionWithId.host?.toString() || '',
                hostName: sessionWithId.hostName || 'Host',
                hostAvatar: sessionWithId.hostAvatar || '',
                status: sessionWithId.status || { scheduled: null },
                attendees: Array.isArray(sessionWithId.attendees) 
                    ? sessionWithId.attendees.map((p: any) => p?.toString?.() || '')
                    : [],
                createdAt: typeof sessionWithId.createdAt === 'bigint' 
                    ? sessionWithId.createdAt 
                    : BigInt(sessionWithId.createdAt || 0),
                updatedAt: typeof sessionWithId.updatedAt === 'bigint' 
                    ? sessionWithId.updatedAt 
                    : BigInt(sessionWithId.updatedAt || 0),
                recordingInfo: sessionWithId.recordingInfo || null,
                meetingUrl: sessionWithId.meetingUrl || `https://meet.jit.si/peerverse-${sessionWithId.id}`,
                jitsiRoomName: sessionWithId.jitsiRoomName || `peerverse-${sessionWithId.id}`,
                jitsiConfig: sessionWithId.jitsiConfig || {
                    roomName: `peerverse-${sessionWithId.id}`,
                    displayName: 'User',
                    email: null,
                    avatarUrl: null,
                    moderator: false,
                    startWithAudioMuted: false,
                    startWithVideoMuted: false,
                    enableRecording: true,
                    enableScreenSharing: true,
                    enableChat: true,
                    maxParticipants: null
                },
                tags: Array.isArray(sessionWithId.tags) ? sessionWithId.tags : [],
                isRecordingEnabled: sessionWithId.isRecordingEnabled !== undefined ? sessionWithId.isRecordingEnabled : false,
                actualStartTime: sessionWithId.actualStartTime || null,
                actualEndTime: sessionWithId.actualEndTime || null,
                participantCount: sessionWithId.participantCount !== undefined ? 
                    Number(sessionWithId.participantCount) : 
                    (Array.isArray(sessionWithId.attendees) ? sessionWithId.attendees.length : 0)
            };
            
            console.log('[SessionClient] Safe session created:', safeSession);
            
            return {
                session: safeSession,
                isModerator: !!isModerator
            };
        }
        
        throw new Error('Unexpected response format from server');
    } catch (error: unknown) {
        console.error(`[SessionClient] Error joining session ${sessionId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`Failed to join session: ${errorMessage}`);
    }
}

// ...
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

  public async getMySessions(): Promise<Session[]> {
    return this.getAllSessions();
  }

  public async startRecording(sessionId: string): Promise<{ ok: any } | { err: string }> {
    if (!this.currentIdentity) {
      throw new Error('Must be authenticated to start recording');
    }

    try {
      const actor = await this.getActor(true);
      const result = await (actor as any).startRecording(sessionId);
      return result;
    } catch (error) {
      console.error(`[SessionClient] Error starting recording for session ${sessionId}:`, error);
      return { err: `Failed to start recording: ${formatError(error)}` };
    }
  }

  public async stopRecording(sessionId: string): Promise<{ ok: any } | { err: string }> {
    if (!this.currentIdentity) {
      throw new Error('Must be authenticated to stop recording');
    }

    try {
      const actor = await this.getActor(true);
      const result = await (actor as any).stopRecording(sessionId);
      return result;
    } catch (error) {
      console.error(`[SessionClient] Error stopping recording for session ${sessionId}:`, error);
      return { err: `Failed to stop recording: ${formatError(error)}` };
    }
  }

  public getSessionStatusLabel(status: SessionStatus): string {
    if ('scheduled' in status) return 'Scheduled';
    if ('live' in status) return 'Live';
    if ('completed' in status) return 'Completed';
    if ('cancelled' in status) return 'Cancelled';
    return 'Unknown';
  }

  public getSessionTypeLabel(type: SessionType): string {
    if ('video' in type) return 'Video';
    if ('voice' in type) return 'Voice';
    if ('screen_share' in type) return 'Screen Share';
    if ('webinar' in type) return 'Webinar';
    return 'Unknown';
  }
}

// Create and export a singleton instance
export const sessionClient = SessionClient.getInstance();

// Expose on window for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).sessionClient = sessionClient;
}
