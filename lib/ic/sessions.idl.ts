export const idlFactory = ({ IDL }: any) => {
  const SessionType = IDL.Variant({
    video: IDL.Null,
    voice: IDL.Null,
  })

  const SessionStatus = IDL.Variant({
    scheduled: IDL.Null,
    live: IDL.Null,
    completed: IDL.Null,
    cancelled: IDL.Null,
  })

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
  })

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
  })

  const Session = IDL.Record({
    id: IDL.Text,
    title: IDL.Text,
    description: IDL.Text,
    sessionType: SessionType,
    scheduledTime: IDL.Int,
    duration: IDL.Nat,
    maxAttendees: IDL.Nat,
    hostName: IDL.Text,
    hostAvatar: IDL.Text,
    tags: IDL.Vec(IDL.Text),
    attendees: IDL.Vec(IDL.Principal),
    status: SessionStatus,
    createdAt: IDL.Int,
    recordingUrl: IDL.Opt(IDL.Text),
    meetingUrl: IDL.Opt(IDL.Text),
    isRecordingEnabled: IDL.Bool,
    jitsiConfig: IDL.Opt(JitsiConfig),
  })

  const Result = IDL.Variant({ ok: Session, err: IDL.Text })
  const Result_1 = IDL.Variant({ ok: IDL.Bool, err: IDL.Text })

  const UpdateSessionInput = IDL.Record({
    id: IDL.Text,
    title: IDL.Opt(IDL.Text),
    description: IDL.Opt(IDL.Text),
    scheduledTime: IDL.Opt(IDL.Int),
    duration: IDL.Opt(IDL.Nat),
    maxAttendees: IDL.Opt(IDL.Nat),
    status: IDL.Opt(SessionStatus),
    recordingUrl: IDL.Opt(IDL.Text),
    meetingUrl: IDL.Opt(IDL.Text),
  })

  return IDL.Service({
    createSession: IDL.Func([CreateSessionInput], [Result], []),
    deleteSession: IDL.Func([IDL.Text], [Result_1], []),
    getAllSessions: IDL.Func([], [IDL.Vec(Session)], ["query"]),
    getMySessions: IDL.Func([], [IDL.Vec(Session)], []),
    getSession: IDL.Func([IDL.Text], [IDL.Opt(Session)], ["query"]),
    getSessionsByStatus: IDL.Func([SessionStatus], [IDL.Vec(Session)], ["query"]),
    getSessionsByType: IDL.Func([SessionType], [IDL.Vec(Session)], ["query"]),
    getStats: IDL.Func(
      [],
      [
        IDL.Record({
          totalSessions: IDL.Nat,
          totalUsers: IDL.Nat,
          liveSessions: IDL.Nat,
          completedSessions: IDL.Nat,
        }),
      ],
      ["query"],
    ),
    joinSession: IDL.Func([IDL.Text], [Result], []),
    searchSessions: IDL.Func([IDL.Text], [IDL.Vec(Session)], ["query"]),
    updateSession: IDL.Func([UpdateSessionInput], [Result], []),
  })
}
