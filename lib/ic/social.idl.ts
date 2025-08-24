export const idlFactory = ({ IDL }: any) => {
  const OnlineStatus = IDL.Variant({
    online: IDL.Null,
    away: IDL.Null,
    offline: IDL.Null,
  })

  const PartnerProfile = IDL.Record({
    principal: IDL.Principal,
    name: IDL.Text,
    role: IDL.Text,
    xp: IDL.Nat,
    onlineStatus: OnlineStatus,
    avatarColor: IDL.Text,
    initials: IDL.Text,
    joinedAt: IDL.Int,
    lastActive: IDL.Int,
  })

  const PartnerRequest = IDL.Record({
    id: IDL.Text,
    from: IDL.Principal,
    to: IDL.Principal,
    message: IDL.Opt(IDL.Text),
    timestamp: IDL.Int,
    status: IDL.Variant({
      pending: IDL.Null,
      accepted: IDL.Null,
      declined: IDL.Null,
    }),
  })

  const StudyGroup = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
    description: IDL.Text,
    creator: IDL.Principal,
    members: IDL.Vec(IDL.Principal),
    maxMembers: IDL.Nat,
    isPublic: IDL.Bool,
    createdAt: IDL.Int,
    tags: IDL.Vec(IDL.Text),
  })

  const Result = IDL.Variant({ ok: IDL.Text, err: IDL.Text })
  const Result_1 = IDL.Variant({ ok: PartnerRequest, err: IDL.Text })
  const Result_2 = IDL.Variant({ ok: StudyGroup, err: IDL.Text })

  return IDL.Service({
    sendPartnerRequest: IDL.Func([IDL.Principal, IDL.Opt(IDL.Text)], [Result], []),
    acceptPartnerRequest: IDL.Func([IDL.Text], [Result_1], []),
    declinePartnerRequest: IDL.Func([IDL.Text], [Result_1], []),
    getMyPartners: IDL.Func([], [IDL.Vec(PartnerProfile)], []),
    getMyPartnersQuery: IDL.Func([], [IDL.Vec(PartnerProfile)], ["query"]),
    getPartnerRequests: IDL.Func([], [IDL.Vec(PartnerRequest)], ["query"]),
    createStudyGroup: IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Bool, IDL.Vec(IDL.Text)], [Result_2], []),
    joinStudyGroup: IDL.Func([IDL.Text], [Result], []),
    leaveStudyGroup: IDL.Func([IDL.Text], [Result], []),
    getMyStudyGroups: IDL.Func([], [IDL.Vec(StudyGroup)], ["query"]),
    getPublicStudyGroups: IDL.Func([], [IDL.Vec(StudyGroup)], ["query"]),
    generateSamplePartners: IDL.Func([], [Result], []),
    updateOnlineStatus: IDL.Func([OnlineStatus], [Result], []),
  })
}

export const init = ({ IDL }: any) => {
  return []
}
