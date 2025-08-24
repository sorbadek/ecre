export const idlFactory = ({ IDL }) => {
  const UserFile = IDL.Record({
    'id' : IDL.Text,
    'url' : IDL.Text,
    'contentType' : IDL.Text,
    'size' : IDL.Nat,
    'tags' : IDL.Vec(IDL.Text),
    'filename' : IDL.Text,
    'category' : IDL.Text,
    'uploadedAt' : IDL.Int,
  });
  const UserSettings = IDL.Record({
    'theme' : IDL.Text,
    'profileVisibility' : IDL.Text,
    'notifications' : IDL.Bool,
    'emailNotifications' : IDL.Bool,
    'language' : IDL.Text,
    'privacy' : IDL.Text,
  });
  const UserProfile = IDL.Record({
    'id' : IDL.Principal,
    'bio' : IDL.Text,
    'files' : IDL.Vec(UserFile),
    'interests' : IDL.Vec(IDL.Text),
    'socialLinks' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'reputation' : IDL.Nat,
    'email' : IDL.Text,
    'updatedAt' : IDL.Int,
    'settings' : UserSettings,
    'avatarUrl' : IDL.Text,
    'coverUrl' : IDL.Text,
    'xpBalance' : IDL.Nat,
  });
  const Result_1 = IDL.Variant({ 'ok' : UserProfile, 'err' : IDL.Text });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : IDL.Text });
  const Result_3 = IDL.Variant({ 'ok' : IDL.Bool, 'err' : IDL.Text });
  const XPTransaction = IDL.Record({
    'id' : IDL.Text,
    'source' : IDL.Text,
    'metadata' : IDL.Text,
    'userId' : IDL.Principal,
    'timestamp' : IDL.Int,
    'amount' : IDL.Int,
    'reason' : IDL.Text,
  });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Vec(UserFile), 'err' : IDL.Text });
  const ProfileUpdate = IDL.Record({
    'bio' : IDL.Opt(IDL.Text),
    'interests' : IDL.Opt(IDL.Vec(IDL.Text)),
    'socialLinks' : IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
    'name' : IDL.Opt(IDL.Text),
    'email' : IDL.Opt(IDL.Text),
    'settings' : IDL.Opt(UserSettings),
    'avatarUrl' : IDL.Opt(IDL.Text),
    'coverUrl' : IDL.Opt(IDL.Text),
  });
  const Result = IDL.Variant({ 'ok' : UserFile, 'err' : IDL.Text });
  return IDL.Service({
    'addSocialLink' : IDL.Func([IDL.Text, IDL.Text], [Result_1], []),
    'addXP' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Text], [Result_2], []),
    'createProfile' : IDL.Func([IDL.Text, IDL.Text], [Result_1], []),
    'deleteFile' : IDL.Func([IDL.Text], [Result_3], []),
    'getAllPublicProfiles' : IDL.Func([], [IDL.Vec(UserProfile)], ['query']),
    'getCanisterStats' : IDL.Func(
        [],
        [
          IDL.Record({
            'totalFiles' : IDL.Nat,
            'totalXPDistributed' : IDL.Int,
            'totalUsers' : IDL.Nat,
            'totalTransactions' : IDL.Nat,
          }),
        ],
        ['query'],
      ),
    'getFilesByCategory' : IDL.Func([IDL.Text], [IDL.Vec(UserFile)], ['query']),
    'getMyFiles' : IDL.Func([], [IDL.Vec(UserFile)], ['query']),
    'getMyProfile' : IDL.Func([], [IDL.Opt(UserProfile)], ['query']),
    'getProfile' : IDL.Func([IDL.Principal], [IDL.Opt(UserProfile)], ['query']),
    'getTopUsersByXP' : IDL.Func([IDL.Nat], [IDL.Vec(UserProfile)], ['query']),
    'getTotalUsers' : IDL.Func([], [IDL.Nat], ['query']),
    'getTotalXPDistributed' : IDL.Func([], [IDL.Int], ['query']),
    'getXPBalance' : IDL.Func([], [IDL.Nat], ['query']),
    'getXPTransactions' : IDL.Func([], [IDL.Vec(XPTransaction)], ['query']),
    'linkFileToProfile' : IDL.Func([IDL.Text, IDL.Text], [Result_4], []),
    'removeSocialLink' : IDL.Func([IDL.Text], [Result_1], []),
    'resetUserXP' : IDL.Func([IDL.Principal], [Result_3], []),
    'spendXP' : IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [Result_2], []),
    'updateAvatar' : IDL.Func([IDL.Text], [Result_1], []),
    'updateCover' : IDL.Func([IDL.Text], [Result_1], []),
    'updateProfile' : IDL.Func([ProfileUpdate], [Result_1], []),
    'uploadFile' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Vec(IDL.Text)],
        [Result],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
