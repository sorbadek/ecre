import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface ProfileUpdate {
  'bio' : [] | [string],
  'interests' : [] | [Array<string>],
  'socialLinks' : [] | [Array<[string, string]>],
  'name' : [] | [string],
  'email' : [] | [string],
  'settings' : [] | [UserSettings],
  'avatarUrl' : [] | [string],
  'coverUrl' : [] | [string],
}
export type Result = { 'ok' : UserFile } |
  { 'err' : string };
export type Result_1 = { 'ok' : UserProfile } |
  { 'err' : string };
export type Result_2 = { 'ok' : bigint } |
  { 'err' : string };
export type Result_3 = { 'ok' : boolean } |
  { 'err' : string };
export type Result_4 = { 'ok' : Array<UserFile> } |
  { 'err' : string };
export interface UserFile {
  'id' : string,
  'url' : string,
  'contentType' : string,
  'size' : bigint,
  'tags' : Array<string>,
  'filename' : string,
  'category' : string,
  'uploadedAt' : bigint,
}
export interface UserProfile {
  'id' : Principal,
  'bio' : string,
  'files' : Array<UserFile>,
  'interests' : Array<string>,
  'socialLinks' : Array<[string, string]>,
  'name' : string,
  'createdAt' : bigint,
  'reputation' : bigint,
  'email' : string,
  'updatedAt' : bigint,
  'settings' : UserSettings,
  'avatarUrl' : string,
  'coverUrl' : string,
  'xpBalance' : bigint,
}
export interface UserSettings {
  'theme' : string,
  'profileVisibility' : string,
  'notifications' : boolean,
  'emailNotifications' : boolean,
  'language' : string,
  'privacy' : string,
}
export interface XPTransaction {
  'id' : string,
  'source' : string,
  'metadata' : string,
  'userId' : Principal,
  'timestamp' : bigint,
  'amount' : bigint,
  'reason' : string,
}
export interface _SERVICE {
  'addSocialLink' : ActorMethod<[string, string], Result_1>,
  'addXP' : ActorMethod<[bigint, string, string, string], Result_2>,
  'createProfile' : ActorMethod<[string, string], Result_1>,
  'deleteFile' : ActorMethod<[string], Result_3>,
  'getAllPublicProfiles' : ActorMethod<[], Array<UserProfile>>,
  'getCanisterStats' : ActorMethod<
    [],
    {
      'totalFiles' : bigint,
      'totalXPDistributed' : bigint,
      'totalUsers' : bigint,
      'totalTransactions' : bigint,
    }
  >,
  'getFilesByCategory' : ActorMethod<[string], Array<UserFile>>,
  'getMyFiles' : ActorMethod<[], Array<UserFile>>,
  'getMyProfile' : ActorMethod<[], [] | [UserProfile]>,
  'getProfile' : ActorMethod<[Principal], [] | [UserProfile]>,
  'getTopUsersByXP' : ActorMethod<[bigint], Array<UserProfile>>,
  'getTotalUsers' : ActorMethod<[], bigint>,
  'getTotalXPDistributed' : ActorMethod<[], bigint>,
  'getXPBalance' : ActorMethod<[], bigint>,
  'getXPTransactions' : ActorMethod<[], Array<XPTransaction>>,
  'linkFileToProfile' : ActorMethod<[string, string], Result_4>,
  'removeSocialLink' : ActorMethod<[string], Result_1>,
  'resetUserXP' : ActorMethod<[Principal], Result_3>,
  'spendXP' : ActorMethod<[bigint, string, string], Result_2>,
  'updateAvatar' : ActorMethod<[string], Result_1>,
  'updateCover' : ActorMethod<[string], Result_1>,
  'updateProfile' : ActorMethod<[ProfileUpdate], Result_1>,
  'uploadFile' : ActorMethod<
    [string, string, bigint, string, string, Array<string>],
    Result
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
