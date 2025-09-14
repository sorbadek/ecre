import type { Principal } from '@dfinity/principal';

export type SessionType = { video: null } | { voice: null };
export type SessionStatus = { scheduled: null } | { live: null } | { completed: null } | { cancelled: null } | { recording: null };

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
  maxParticipants: [] | [number];
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
}

export interface Session {
  id: string;
  title: string;
  description: string;
  sessionType: SessionType;
  scheduledTime: bigint;
  duration: number;
  maxAttendees: number;
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
  jitsiConfig: [] | [JitsiConfig];
}

export interface _SERVICE {
  createSession: (input: CreateSessionInput) => Promise<Session>;
  getAllSessions: () => Promise<Session[]>;
  getMySessions: () => Promise<Session[]>;
  getSession: (id: string) => Promise<Session | null>;
  joinSession: (id: string) => Promise<Session>;
  updateSessionStatus: (id: string, status: SessionStatus) => Promise<Session>;
  deleteSession: (id: string) => Promise<boolean>;
  searchSessions: (query: string) => Promise<Session[]>;
  getCompletedSessions: () => Promise<Session[]>;
  getSessionsByStatus: (status: SessionStatus) => Promise<Session[]>;
  whoami: () => Promise<Principal>;
}
