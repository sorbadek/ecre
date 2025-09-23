export const idlFactory = ({ IDL }) => {

  const OnlineStatus = IDL.Variant({
    online: IDL.Null,
    away: IDL.Null,
    offline: IDL.Null
  });

  const PartnerProfile = IDL.Record({
    principal: IDL.Principal,
    name: IDL.Text,
    role: IDL.Text,
    xp: IDL.Nat,
    initials: IDL.Text,
    avatarColor: IDL.Text,
    onlineStatus: OnlineStatus,
    lastActive: IDL.Int,
    studyStreak: IDL.Nat,
    completedCourses: IDL.Nat
  });

  const PartnerRequest = IDL.Record({
    id: IDL.Text,
    fromPrincipal: IDL.Principal,
    toPrincipal: IDL.Principal,
    fromName: IDL.Text,
    message: IDL.Opt(IDL.Text),
    timestamp: IDL.Int,
    status: IDL.Variant({
      pending: IDL.Null,
      accepted: IDL.Null,
      declined: IDL.Null
    })
  });

  const StudyGroup = IDL.Record({
    id: IDL.Text,
    name: IDL.Text,
    description: IDL.Text,
    createdBy: IDL.Principal,
    members: IDL.Vec(IDL.Principal),
    maxMembers: IDL.Nat,
    isPublic: IDL.Bool,
    tags: IDL.Vec(IDL.Text),
    createdAt: IDL.Int,
    lastActivity: IDL.Int
  });

  const SocialStats = IDL.Record({
    totalPartners: IDL.Nat,
    activePartners: IDL.Nat,
    studyGroups: IDL.Nat,
    totalInteractions: IDL.Nat,
    weeklyInteractions: IDL.Nat
  });

  const ResultPartnerProfile = IDL.Variant({ ok: PartnerProfile, err: IDL.Text });
  const ResultPartnerRequest = IDL.Variant({ ok: PartnerRequest, err: IDL.Text });
  const ResultStudyGroup = IDL.Variant({ ok: StudyGroup, err: IDL.Text });
  const ResultText = IDL.Variant({ ok: IDL.Text, err: IDL.Text });

  return IDL.Service({
    'updateProfile': IDL.Func([IDL.Text, IDL.Text], [ResultPartnerProfile], []),
    'getMyProfile': IDL.Func([], [IDL.Opt(PartnerProfile)], ['query']),
    'getMyPartners': IDL.Func([], [IDL.Vec(PartnerProfile)], []),
    'getMyPartnersQuery': IDL.Func([], [IDL.Vec(PartnerProfile)], ['query']),
    'sendPartnerRequest': IDL.Func([IDL.Principal, IDL.Opt(IDL.Text)], [ResultPartnerRequest], []),
    'acceptPartnerRequest': IDL.Func([IDL.Text], [ResultPartnerRequest], []),
    'declinePartnerRequest': IDL.Func([IDL.Text], [ResultPartnerRequest], []),
    'getPendingRequests': IDL.Func([], [IDL.Vec(PartnerRequest)], []),
    'createStudyGroup': IDL.Func([IDL.Text, IDL.Text, IDL.Bool, IDL.Vec(IDL.Text), IDL.Nat], [ResultStudyGroup], []),
    'joinStudyGroup': IDL.Func([IDL.Text], [ResultStudyGroup], []),
    'getMyStudyGroups': IDL.Func([], [IDL.Vec(StudyGroup)], []),
    'updateOnlineStatus': IDL.Func([OnlineStatus], [ResultPartnerProfile], []),
    'recordInteraction': IDL.Func([IDL.Principal, IDL.Text], [ResultText], []),
    'removePartner': IDL.Func([IDL.Principal], [ResultText], []),
    'getSocialStats': IDL.Func([], [SocialStats], []),
    'generateSamplePartners': IDL.Func([], [ResultText], [])
  });
}

export const init = ({ IDL }: any) => {
  return []
}
