import type { IDL } from "@dfinity/candid"

export const idlFactory = ({ IDL }: { IDL: IDL }) => {
  const Principal = IDL.Principal

  const UserSettings = IDL.Record({
    notifications: IDL.Bool,
    privacy: IDL.Text,
    theme: IDL.Text,
    language: IDL.Text,
    emailNotifications: IDL.Bool,
    profileVisibility: IDL.Text,
  })

  const UserFile = IDL.Record({
    id: IDL.Text,
    filename: IDL.Text,
    contentType: IDL.Text,
    size: IDL.Nat,
    url: IDL.Text,
    category: IDL.Text,
    uploadedAt: IDL.Int,
    tags: IDL.Vec(IDL.Text),
  })

  const UserProfile = IDL.Record({
    id: Principal,
    name: IDL.Text,
    email: IDL.Text,
    bio: IDL.Text,
    avatarUrl: IDL.Text,
    coverUrl: IDL.Text,
    xpBalance: IDL.Nat,
    reputation: IDL.Nat,
    interests: IDL.Vec(IDL.Text),
    socialLinks: IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    settings: UserSettings,
    files: IDL.Vec(UserFile),
    createdAt: IDL.Int,
    updatedAt: IDL.Int,
  })

  const ProfileUpdate = IDL.Record({
    name: IDL.Opt(IDL.Text),
    email: IDL.Opt(IDL.Text),
    bio: IDL.Opt(IDL.Text),
    avatarUrl: IDL.Opt(IDL.Text),
    coverUrl: IDL.Opt(IDL.Text),
    interests: IDL.Opt(IDL.Vec(IDL.Text)),
    socialLinks: IDL.Opt(IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text))),
    settings: IDL.Opt(UserSettings),
  })

  const XPTransaction = IDL.Record({
    id: IDL.Text,
    userId: Principal,
    amount: IDL.Int,
    reason: IDL.Text,
    source: IDL.Text,
    timestamp: IDL.Int,
    metadata: IDL.Text,
  })

  const Result = (T: any) => IDL.Variant({ ok: T, err: IDL.Text })

  const CanisterStats = IDL.Record({
    totalUsers: IDL.Nat,
    totalTransactions: IDL.Nat,
    totalFiles: IDL.Nat,
    totalXPDistributed: IDL.Int,
  })

  return IDL.Service({
    // Profile Management
    createProfile: IDL.Func([IDL.Text, IDL.Text], [Result(UserProfile)], []),
    updateProfile: IDL.Func([ProfileUpdate], [Result(UserProfile)], []),
    updateAvatar: IDL.Func([IDL.Text], [Result(UserProfile)], []),
    updateCover: IDL.Func([IDL.Text], [Result(UserProfile)], []),
    getMyProfile: IDL.Func([], [IDL.Opt(UserProfile)], ["query"]),
    getProfile: IDL.Func([Principal], [IDL.Opt(UserProfile)], ["query"]),
    getAllPublicProfiles: IDL.Func([], [IDL.Vec(UserProfile)], ["query"]),

    // XP Management
    addXP: IDL.Func([IDL.Nat, IDL.Text, IDL.Text, IDL.Text], [Result(IDL.Nat)], []),
    spendXP: IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [Result(IDL.Nat)], []),
    getXPBalance: IDL.Func([], [IDL.Nat], ["query"]),
    getXPTransactions: IDL.Func([], [IDL.Vec(XPTransaction)], ["query"]),

    // File Management
    uploadFile: IDL.Func([IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Vec(IDL.Text)], [Result(UserFile)], []),
    linkFileToProfile: IDL.Func([IDL.Text, IDL.Text], [Result(IDL.Vec(UserFile))], []),
    getMyFiles: IDL.Func([], [IDL.Vec(UserFile)], ["query"]),
    getFilesByCategory: IDL.Func([IDL.Text], [IDL.Vec(UserFile)], ["query"]),
    deleteFile: IDL.Func([IDL.Text], [Result(IDL.Bool)], []),

    // Social Features
    addSocialLink: IDL.Func([IDL.Text, IDL.Text], [Result(UserProfile)], []),
    removeSocialLink: IDL.Func([IDL.Text], [Result(UserProfile)], []),

    // Analytics
    getTotalUsers: IDL.Func([], [IDL.Nat], ["query"]),
    getTotalXPDistributed: IDL.Func([], [IDL.Int], ["query"]),
    getTopUsersByXP: IDL.Func([IDL.Nat], [IDL.Vec(UserProfile)], ["query"]),
    getCanisterStats: IDL.Func([], [CanisterStats], ["query"]),

    // Admin
    resetUserXP: IDL.Func([Principal], [Result(IDL.Bool)], []),
  })
}

export type UserSettings = {
  notifications: boolean
  privacy: string
  theme: string
  language: string
  emailNotifications: boolean
  profileVisibility: string
}

export type UserFile = {
  id: string
  filename: string
  contentType: string
  size: bigint
  url: string
  category: string
  uploadedAt: bigint
  tags: string[]
}

export type UserProfile = {
  id: string
  name: string
  email: string
  bio: string
  avatarUrl: string
  coverUrl: string
  xpBalance: bigint
  reputation: bigint
  interests: string[]
  socialLinks: [string, string][]
  settings: UserSettings
  files: UserFile[]
  createdAt: bigint
  updatedAt: bigint
}

export type ProfileUpdate = {
  name?: string
  email?: string
  bio?: string
  avatarUrl?: string
  coverUrl?: string
  interests?: string[]
  socialLinks?: [string, string][]
  settings?: UserSettings
}

export type XPTransaction = {
  id: string
  userId: string
  amount: bigint
  reason: string
  source: string
  timestamp: bigint
  metadata: string
}

export type CanisterStats = {
  totalUsers: bigint
  totalTransactions: bigint
  totalFiles: bigint
  totalXPDistributed: bigint
}
