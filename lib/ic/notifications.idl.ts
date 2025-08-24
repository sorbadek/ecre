export const idlFactory = ({ IDL }: any) => {
  const ActivityType = IDL.Variant({
    comment: IDL.Null,
    quiz_completed: IDL.Null,
    deadline_approaching: IDL.Null,
    course_available: IDL.Null,
    achievement_earned: IDL.Null,
    session_joined: IDL.Null,
    partner_request: IDL.Null,
    system_update: IDL.Null,
  })

  const Activity = IDL.Record({
    id: IDL.Text,
    userId: IDL.Principal,
    activityType: ActivityType,
    title: IDL.Text,
    description: IDL.Opt(IDL.Text),
    timestamp: IDL.Int,
    isRead: IDL.Bool,
    expiresAt: IDL.Opt(IDL.Int),
  })

  const Result = IDL.Variant({ ok: IDL.Text, err: IDL.Text })
  const Result_1 = IDL.Variant({ ok: Activity, err: IDL.Text })

  return IDL.Service({
    createActivity: IDL.Func([ActivityType, IDL.Text, IDL.Opt(IDL.Text)], [Result], []),
    generateSampleActivities: IDL.Func([], [Result], []),
    getMyActivities: IDL.Func([IDL.Opt(IDL.Nat)], [IDL.Vec(Activity)], []),
    markActivityAsRead: IDL.Func([IDL.Text], [Result_1], []),
    getUnreadCount: IDL.Func([], [IDL.Nat], ["query"]),
    cleanupExpiredActivities: IDL.Func([], [Result], []),
  })
}

export const init = ({ IDL }: any) => {
  return []
}
