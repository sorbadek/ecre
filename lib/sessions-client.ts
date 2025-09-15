import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

// Types matching the backend canister
export type SessionType = 
  | { video: null }
  | { voice: null }
  | { screen_share: null }
  | { webinar: null };

export type SessionStatus = 
  | { scheduled: null }
  | { live: null }
  | { completed: null }
  | { cancelled: null }
  | { recording: null };

export type RecordingStatus = 
  | { not_started: null }
  | { recording: null }
  | { processing: null }
  | { completed: null }
  | { failed: null };

export interface RecordingInfo {
  id: string;
  sessionId: string;
  startTime: bigint;
  endTime: bigint | null;
  duration: bigint | null;
  status: RecordingStatus;
  jibrilRecordingId: string | null;
  recordingUrl: string | null;
  thumbnailUrl: string | null;
  fileSize: bigint | null;
  format: string;
  quality: string;
}

export interface JitsiConfig {
  roomName: string;
  displayName: string;
  email: [] | [string];
  avatarUrl: [] | [string];
  moderator: boolean;
  startWithAudioMuted: boolean;
  startWithVideoMuted: boolean;
  enableRecording: boolean;
  enableScreenSharing: boolean;
  enableChat: boolean;
  maxParticipants: [] | [bigint];
}

export interface Session {
  id: string;
  title: string;
  description: string;
  sessionType: SessionType;
  scheduledTime: bigint;
  duration: bigint;
  maxAttendees: bigint;
  host: Principal;
  hostName: string;
  hostAvatar: string;
  status: SessionStatus;
  attendees: Principal[];
  createdAt: bigint;
  updatedAt: bigint;
  recordingInfo: RecordingInfo | null;
  meetingUrl: string | null;
  jitsiRoomName: string;
  jitsiConfig: JitsiConfig;
  tags: string[];
  isRecordingEnabled: boolean;
  actualStartTime: bigint | null;
  actualEndTime: bigint | null;
  participantCount: bigint;
}

export interface CreateSessionInput {
  title: string;
  description: string;
  sessionType: SessionType;
  scheduledTime: bigint;
  duration: bigint;
  maxAttendees: bigint;
  hostName: string;
  hostAvatar: string;
  tags: string[];
  isRecordingEnabled: boolean;
  jitsiConfig: [] | [JitsiConfig];
  recordSession: boolean;
}

export interface UpdateSessionInput {
  id: string;
  title: string | null;
  description: string | null;
  scheduledTime: bigint | null;
  duration: bigint | null;
  maxAttendees: bigint | null;
  status: SessionStatus | null;
  recordingInfo: RecordingInfo | null;
  meetingUrl: string | null;
  isRecordingEnabled: boolean | null;
  actualStartTime: bigint | null;
  actualEndTime: bigint | null;
}

export interface StartRecordingInput {
  sessionId: string;
  jibrilConfig: {
    quality: string;
    format: string;
    includeAudio: boolean;
    includeVideo: boolean;
    includeScreenShare: boolean;
  };
}

export type Result<T, E> = { ok: T } | { err: E };

// IDL interface for the sessions canister
const sessionsIdl = ({ IDL }: any) => {
  const SessionType = IDL.Variant({
    video: IDL.Null,
    voice: IDL.Null,
    screen_share: IDL.Null,
    webinar: IDL.Null,
  });

  const SessionStatus = IDL.Variant({
    scheduled: IDL.Null,
    live: IDL.Null,
    completed: IDL.Null,
    cancelled: IDL.Null,
    recording: IDL.Null,
  });

  const RecordingStatus = IDL.Variant({
    not_started: IDL.Null,
    recording: IDL.Null,
    processing: IDL.Null,
    completed: IDL.Null,
    failed: IDL.Null,
  });

  const RecordingInfo = IDL.Record({
    id: IDL.Text,
    sessionId: IDL.Text,
    startTime: IDL.Int,
    endTime: IDL.Opt(IDL.Int),
    duration: IDL.Opt(IDL.Nat),
    status: RecordingStatus,
    jibrilRecordingId: IDL.Opt(IDL.Text),
    recordingUrl: IDL.Opt(IDL.Text),
    thumbnailUrl: IDL.Opt(IDL.Text),
    fileSize: IDL.Opt(IDL.Nat),
    format: IDL.Text,
    quality: IDL.Text,
  });

  const JitsiConfig = IDL.Record({
    roomName: IDL.Text,
    displayName: IDL.Text,
    email: IDL.Opt(IDL.Text),
    avatarUrl: IDL.Opt(IDL.Text),
    moderator: IDL.Bool,
    startWithAudioMuted: IDL.Bool,
    startWithVideoMuted: IDL.Bool,
    enableRecording: IDL.Bool,
    enableScreenSharing: IDL.Bool,
    enableChat: IDL.Bool,
    maxParticipants: IDL.Opt(IDL.Nat),
  });

  const Session = IDL.Record({
    id: IDL.Text,
    title: IDL.Text,
    description: IDL.Text,
    sessionType: SessionType,
    scheduledTime: IDL.Int,
    duration: IDL.Nat,
    maxAttendees: IDL.Nat,
    host: IDL.Principal,
    hostName: IDL.Text,
    hostAvatar: IDL.Text,
    status: SessionStatus,
    attendees: IDL.Vec(IDL.Principal),
    createdAt: IDL.Int,
    updatedAt: IDL.Int,
    recordingInfo: IDL.Opt(RecordingInfo),
    meetingUrl: IDL.Opt(IDL.Text),
    jitsiRoomName: IDL.Text,
    jitsiConfig: JitsiConfig,
    tags: IDL.Vec(IDL.Text),
    isRecordingEnabled: IDL.Bool,
    actualStartTime: IDL.Opt(IDL.Int),
    actualEndTime: IDL.Opt(IDL.Int),
    participantCount: IDL.Nat,
  });

  const CreateSessionInput = IDL.Record({
    title: IDL.Text,
    description: IDL.Text,
    sessionType: SessionType,
    scheduledTime: IDL.Int,
    duration: IDL.Nat,
    maxAttendees: IDL.Nat,
    hostName: IDL.Text,
    hostAvatar: IDL.Text,
    tags: IDL.Vec(IDL.Text),
    isRecordingEnabled: IDL.Bool,
    jitsiConfig: IDL.Opt(JitsiConfig),
  });

  const UpdateSessionInput = IDL.Record({
    id: IDL.Text,
    title: IDL.Opt(IDL.Text),
    description: IDL.Opt(IDL.Text),
    scheduledTime: IDL.Opt(IDL.Int),
    duration: IDL.Opt(IDL.Nat),
    maxAttendees: IDL.Opt(IDL.Nat),
    status: IDL.Opt(SessionStatus),
    recordingInfo: IDL.Opt(RecordingInfo),
    meetingUrl: IDL.Opt(IDL.Text),
    isRecordingEnabled: IDL.Opt(IDL.Bool),
    actualStartTime: IDL.Opt(IDL.Int),
    actualEndTime: IDL.Opt(IDL.Int),
  });

  const StartRecordingInput = IDL.Record({
    sessionId: IDL.Text,
    jibrilConfig: IDL.Record({
      quality: IDL.Text,
      format: IDL.Text,
      includeAudio: IDL.Bool,
      includeVideo: IDL.Bool,
      includeScreenShare: IDL.Bool,
    }),
  });

  const Result = (T: any, E: any) => IDL.Variant({ ok: T, err: E });

  return IDL.Service({
    createSession: IDL.Func([CreateSessionInput], [Result(Session, IDL.Text)], []),
    getAllSessions: IDL.Func([], [IDL.Vec(Session)], ['query']),
    getSession: IDL.Func([IDL.Text], [IDL.Opt(Session)], ['query']),
    getSessionStatus: IDL.Func([IDL.Text], [Result(Session, IDL.Text)], []),
    getMySessions: IDL.Func([], [IDL.Vec(Session)], []),
    joinSession: IDL.Func([IDL.Text], [Result(Session, IDL.Text)], []),
    leaveSession: IDL.Func([IDL.Text], [Result(Session, IDL.Text)], []),
    updateSession: IDL.Func([UpdateSessionInput], [Result(Session, IDL.Text)], []),
    deleteSession: IDL.Func([IDL.Text], [Result(IDL.Bool, IDL.Text)], []),
    startRecording: IDL.Func([StartRecordingInput], [Result(RecordingInfo, IDL.Text)], []),
    stopRecording: IDL.Func([IDL.Text], [Result(RecordingInfo, IDL.Text)], []),
    updateRecordingStatus: IDL.Func([
      IDL.Text, 
      RecordingStatus, 
      IDL.Opt(IDL.Text),
      IDL.Opt(IDL.Text),
      IDL.Opt(IDL.Text),
      IDL.Opt(IDL.Nat)
    ], [Result(RecordingInfo, IDL.Text)], []),
    getSessionRecordings: IDL.Func([IDL.Text], [IDL.Vec(RecordingInfo)], ['query']),
    getRecording: IDL.Func([IDL.Text], [IDL.Opt(RecordingInfo)], ['query']),
    getAllRecordings: IDL.Func([], [IDL.Vec(RecordingInfo)], ['query']),
    getMyRecordings: IDL.Func([], [IDL.Vec(RecordingInfo)], []),
    getSessionsByStatus: IDL.Func([SessionStatus], [IDL.Vec(Session)], ['query']),
    getSessionsByType: IDL.Func([SessionType], [IDL.Vec(Session)], ['query']),
    getUpcomingSessions: IDL.Func([], [IDL.Vec(Session)], ['query']),
    getLiveSessions: IDL.Func([], [IDL.Vec(Session)], ['query']),
  });
};

class SessionsClient {
  private actor: any;
  private agent: HttpAgent;

  constructor(canisterId: string, agent?: HttpAgent) {
    this.agent = agent || new HttpAgent({
      host: 'https://a4gq6-oaaaa-aaaab-qaa4q-cai.icp0.io'
    });

    this.actor = Actor.createActor(sessionsIdl, {
      agent: this.agent,
      canisterId,
    });
  }

  async createSession(input: CreateSessionInput): Promise<Result<Session, string>> {
    try {
      const result = await this.actor.createSession(input);
      return result;
    } catch (error) {
      console.error('Error creating session:', error);
      return { err: 'Failed to create session' };
    }
  }

  async getAllSessions(): Promise<Session[]> {
    try {
      return await this.actor.getAllSessions();
    } catch (error) {
      console.error('Error getting all sessions:', error);
      return [];
    }
  }

  async getSession(id: string): Promise<Session | null> {
    try {
      const result = await this.actor.getSession(id);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async getSessionStatus(id: string): Promise<Result<Session, string>> {
    try {
      return await this.actor.getSessionStatus(id);
    } catch (error) {
      console.error('Error getting session status:', error);
      return { err: 'Failed to get session status' };
    }
  }

  async getMySessions(): Promise<Session[]> {
    try {
      return await this.actor.getMySessions();
    } catch (error) {
      console.error('Error getting my sessions:', error);
      return [];
    }
  }

  async joinSession(sessionId: string): Promise<Result<Session, string>> {
    try {
      return await this.actor.joinSession(sessionId);
    } catch (error) {
      console.error('Error joining session:', error);
      return { err: 'Failed to join session' };
    }
  }

  async leaveSession(sessionId: string): Promise<Result<Session, string>> {
    try {
      return await this.actor.leaveSession(sessionId);
    } catch (error) {
      console.error('Error leaving session:', error);
      return { err: 'Failed to leave session' };
    }
  }

  async updateSession(input: UpdateSessionInput): Promise<Result<Session, string>> {
    try {
      return await this.actor.updateSession(input);
    } catch (error) {
      console.error('Error updating session:', error);
      return { err: 'Failed to update session' };
    }
  }

  async deleteSession(sessionId: string): Promise<Result<boolean, string>> {
    try {
      return await this.actor.deleteSession(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
      return { err: 'Failed to delete session' };
    }
  }

  async startRecording(input: StartRecordingInput): Promise<Result<RecordingInfo, string>> {
    try {
      return await this.actor.startRecording(input);
    } catch (error) {
      console.error('Error starting recording:', error);
      return { err: 'Failed to start recording' };
    }
  }

  async stopRecording(sessionId: string): Promise<Result<RecordingInfo, string>> {
    try {
      return await this.actor.stopRecording(sessionId);
    } catch (error) {
      console.error('Error stopping recording:', error);
      return { err: 'Failed to stop recording' };
    }
  }

  async updateRecordingStatus(
    recordingId: string,
    status: RecordingStatus,
    jibrilRecordingId?: string,
    recordingUrl?: string,
    thumbnailUrl?: string,
    fileSize?: bigint
  ): Promise<Result<RecordingInfo, string>> {
    try {
      return await this.actor.updateRecordingStatus(
        recordingId,
        status,
        jibrilRecordingId ? [jibrilRecordingId] : [],
        recordingUrl ? [recordingUrl] : [],
        thumbnailUrl ? [thumbnailUrl] : [],
        fileSize ? [fileSize] : []
      );
    } catch (error) {
      console.error('Error updating recording status:', error);
      return { err: 'Failed to update recording status' };
    }
  }

  async getSessionRecordings(sessionId: string): Promise<RecordingInfo[]> {
    try {
      return await this.actor.getSessionRecordings(sessionId);
    } catch (error) {
      console.error('Error getting session recordings:', error);
      return [];
    }
  }

  async getRecording(recordingId: string): Promise<RecordingInfo | null> {
    try {
      const result = await this.actor.getRecording(recordingId);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Error getting recording:', error);
      return null;
    }
  }

  async getAllRecordings(): Promise<RecordingInfo[]> {
    try {
      return await this.actor.getAllRecordings();
    } catch (error) {
      console.error('Error getting all recordings:', error);
      return [];
    }
  }

  async getMyRecordings(): Promise<RecordingInfo[]> {
    try {
      return await this.actor.getMyRecordings();
    } catch (error) {
      console.error('Error getting my recordings:', error);
      return [];
    }
  }

  async getSessionsByStatus(status: SessionStatus): Promise<Session[]> {
    try {
      return await this.actor.getSessionsByStatus(status);
    } catch (error) {
      console.error('Error getting sessions by status:', error);
      return [];
    }
  }

  async getSessionsByType(sessionType: SessionType): Promise<Session[]> {
    try {
      return await this.actor.getSessionsByType(sessionType);
    } catch (error) {
      console.error('Error getting sessions by type:', error);
      return [];
    }
  }

  async getUpcomingSessions(): Promise<Session[]> {
    try {
      return await this.actor.getUpcomingSessions();
    } catch (error) {
      console.error('Error getting upcoming sessions:', error);
      return [];
    }
  }

  async getLiveSessions(): Promise<Session[]> {
    try {
      return await this.actor.getLiveSessions();
    } catch (error) {
      console.error('Error getting live sessions:', error);
      return [];
    }
  }

  // Utility methods
  getSessionTypeLabel(sessionType: SessionType): string {
    if ('video' in sessionType) return 'Video Call';
    if ('voice' in sessionType) return 'Voice Call';
    if ('screen_share' in sessionType) return 'Screen Share';
    if ('webinar' in sessionType) return 'Webinar';
    return 'Unknown';
  }

  getSessionStatusLabel(status: SessionStatus): string {
    if ('scheduled' in status) return 'Scheduled';
    if ('live' in status) return 'Live';
    if ('completed' in status) return 'Completed';
    if ('cancelled' in status) return 'Cancelled';
    if ('recording' in status) return 'Recording';
    return 'Unknown';
  }

  getRecordingStatusLabel(status: RecordingStatus): string {
    if ('not_started' in status) return 'Not Started';
    if ('recording' in status) return 'Recording';
    if ('processing' in status) return 'Processing';
    if ('completed' in status) return 'Completed';
    if ('failed' in status) return 'Failed';
    return 'Unknown';
  }

  formatDuration(minutes: bigint): string {
    const mins = Number(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMins}m`;
    }
    return `${remainingMins}m`;
  }

  formatDateTime(timestamp: bigint): string {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  }

  isSessionLive(session: Session): boolean {
    return 'live' in session.status || 'recording' in session.status;
  }

  canJoinSession(session: Session): boolean {
    const now = Date.now() * 1_000_000; // Convert to nanoseconds
    const startTime = Number(session.scheduledTime);
    const endTime = startTime + Number(session.duration) * 60 * 1_000_000_000;
    const timeUntilStart = startTime - now;
    const timeUntilEnd = endTime - now;

    // Can join 15 minutes before start and until end time
    return timeUntilStart <= 15 * 60 * 1_000_000_000 && timeUntilEnd > 0;
  }
}

// Create singleton instance
let sessionsClient: SessionsClient | null = null;

export const getSessionsClient = (canisterId?: string): SessionsClient => {
  if (!sessionsClient && canisterId) {
    sessionsClient = new SessionsClient(canisterId);
  }
  if (!sessionsClient) {
    throw new Error('Sessions client not initialized. Please provide canister ID.');
  }
  return sessionsClient;
};

export { SessionsClient };
export default SessionsClient;
