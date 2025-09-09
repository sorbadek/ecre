import { Actor, type Identity, type ActorSubclass, type ActorMethod, HttpAgent } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import { Principal } from "@dfinity/principal"
import type { IDL } from "@dfinity/candid"

// Import from the local agent file
import { HOST, USER_PROFILE_CANISTER_ID } from "./ic/agent"

// Import IDL factory
import { idlFactory } from "./ic/user-profile.idl"

// Define types based on the IDL
interface UserSettings {
  notifications: boolean;
  privacy: string;
  theme: string;
  language: string;
  emailNotifications: boolean;
  profileVisibility: string;
}

export interface UserFile {
  id: string;
  filename: string;
  contentType: string;
  size: bigint;
  url: string;
  category: string;
  uploadedAt: bigint;
  tags: string[];
}

export interface UserProfile {
  id: Principal;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  xpBalance: bigint;
  reputation: bigint;
  interests: string[];
  socialLinks: [string, string][];
  settings: UserSettings;
  files: UserFile[];
  createdAt: bigint;
  updatedAt: bigint;
}

// Extended interface for the frontend
interface UserProfileExtended extends Omit<UserProfile, 'xpBalance' | 'reputation' | 'createdAt' | 'updatedAt'> {
  xpBalance: number;
  reputation: number;
  createdAt: Date;
  updatedAt: Date;
  // Add any additional frontend-specific fields here
}

// Service interface for the canister
interface UserProfileService {
  createProfile: ActorMethod<[string, string], { ok: UserProfile } | { err: string }>;
  getMyProfile: ActorMethod<[], UserProfile | null>;
  updateProfile: ActorMethod<[Partial<UserProfile>], { ok: UserProfile } | { err: string }>;
  updateAvatar: ActorMethod<[string], { ok: UserProfile } | { err: string }>;
  updateCover: ActorMethod<[string], { ok: UserProfile } | { err: string }>;
  uploadFile: ActorMethod<[
    string, // filename
    string, // contentType
    bigint, // size
    string, // url
    string, // description
    string[] // tags
  ], { ok: UserFile } | { err: string }>;
  getMyFiles: ActorMethod<[], UserFile[]>;
  addSocialLink: ActorMethod<[string, string], { ok: UserProfile } | { err: string }>;
  removeSocialLink: ActorMethod<[string], { ok: UserProfile } | { err: string }>;
  getXPBalance: ActorMethod<[], bigint>;
  addXP: ActorMethod<[bigint, string, string, string], { ok: bigint } | { err: string }>;
}

// Mock file upload function - replace with actual implementation
const uploadToAssetCanister = async (file: File, objectKey: string): Promise<string> => {
  // Implement actual file upload logic here
  return `https://example.com/${objectKey}`
}

// Helper function to create an actor
const getActor = async (): Promise<ActorSubclass<UserProfileService>> => {
  const authClient = await AuthClient.create();
  const identity = authClient.getIdentity();
  
  if (!identity) {
    throw new Error("Not authenticated");
  }
  
  const agent = new HttpAgent({
    host: HOST,
    identity,
  });
  
  // Only fetch the root key when not in production
  if (process.env.NODE_ENV !== "production") {
    await agent.fetchRootKey();
  }
  
  return Actor.createActor<UserProfileService>(idlFactory, {
    agent,
    canisterId: USER_PROFILE_CANISTER_ID,
  });
};
/**
 * Normalizes a profile from the canister format to the frontend format
 */
const normalizeProfileFromCanister = (profile: UserProfile): UserProfileExtended => {
  return {
    ...profile,
    xpBalance: Number(profile.xpBalance || 0n),
    reputation: Number(profile.reputation || 0n),
    createdAt: new Date(Number(profile.createdAt || 0n) / 1000000),
    updatedAt: new Date(Number(profile.updatedAt || 0n) / 1000000),
    coverUrl: profile.coverUrl || profile.coverImageUrl || '',
    socialLinks: Object.fromEntries(profile.socialLinks || [])
  };
};

/**
 * Gets the current user's profile
 */
export async function getMyProfile(): Promise<UserProfileExtended> {
  try {
    const actor = await getActor();
    const result = await actor.getMyProfile();
    
    if (!result) {
      throw new Error('Profile not found');
    }
    
    return normalizeProfileFromCanister(result);
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
}
  settings: Record<string, any>; // Made required
  createdAt?: bigint;
  updatedAt?: bigint;
  [key: string]: any; // Allow additional properties
}

export interface UserFile {
  id: string;
  filename: string;
  contentType: string;
  size: bigint;
  url: string;
  category: string;
  tags: string[];
  uploadedAt: bigint;
}

export interface XPTransaction {
  id: string;
  amount: bigint;
  reason: string;
  source: string;
  metadata: string;
  timestamp: bigint;
}

export interface CanisterStats {
  totalUsers: bigint;
  totalXPDistributed: bigint;
  activeUsers: bigint;
  storageUsed: bigint;
}

// Define a type for the actor methods
type UserProfileActorMethods = {
  // Profile Management
  createProfile: ActorMethod<[string, string], { ok: UserProfile } | { err: string }>;
  updateProfile: ActorMethod<[any], { ok: UserProfile } | { err: string }>;
  updateAvatar: ActorMethod<[string], { ok: UserProfile } | { err: string }>;
  updateCover: ActorMethod<[string], { ok: UserProfile } | { err: string }>;
  getMyProfile: ActorMethod<[], [] | [UserProfile]>;
  getProfile: ActorMethod<[Principal], [] | [UserProfile]>;
  getAllPublicProfiles: ActorMethod<[], UserProfile[]>;
  searchProfiles: ActorMethod<[string], UserProfile[]>;
  
  // File Management
  uploadFile: ActorMethod<[string, string, bigint, string, string, string[]], { ok: UserFile } | { err: string }>;
  linkFileToProfile: ActorMethod<[string, string], { ok: UserFile[] } | { err: string }>;
  getMyFiles: ActorMethod<[], UserFile[]>;
  getFilesByCategory: ActorMethod<[string], UserFile[]>;
  deleteFile: ActorMethod<[string], { ok: boolean } | { err: string }>;
  
  // Social Links
  addSocialLink: ActorMethod<[string, string], { ok: UserProfile } | { err: string }>;
  removeSocialLink: ActorMethod<[string], { ok: UserProfile } | { err: string }>;
  
  // XP System
  addXP: ActorMethod<[bigint, string, string, string], { ok: bigint } | { err: string }>;
  spendXP: ActorMethod<[bigint, string, string], { ok: bigint } | { err: string }>;
  getXPBalance: ActorMethod<[], bigint>;
  getXPTransactions: ActorMethod<[], XPTransaction[]>;
  
  // Analytics
  getTotalUsers: ActorMethod<[], bigint>;
  getTotalXPDistributed: ActorMethod<[], bigint>;
  getTopUsersByXP: ActorMethod<[bigint], UserProfile[]>;
  getCanisterStats: ActorMethod<[], CanisterStats>;
  
  // Admin
  resetUserXP: ActorMethod<[Principal], { ok: boolean } | { err: string }>;
};

// Define the service interface with ActorMethod types
export interface UserProfileService extends ActorSubclass<UserProfileActorMethods> {
  // Profile Management
  createProfile: ActorMethod<[string, string], { ok: UserProfile } | { err: string }>;
  updateProfile: ActorMethod<[any], { ok: UserProfile } | { err: string }>;
  updateAvatar: ActorMethod<[string], { ok: UserProfile } | { err: string }>;
  updateCover: ActorMethod<[string], { ok: UserProfile } | { err: string }>;
  getMyProfile: ActorMethod<[], [] | [UserProfile]>;
  getProfile: ActorMethod<[Principal], [] | [UserProfile]>;
  getAllPublicProfiles: ActorMethod<[], UserProfile[]>;
  searchProfiles: ActorMethod<[string], UserProfile[]>;
  
  // File Management
  uploadFile: ActorMethod<
    [string, string, bigint, string, string, string[]],
    { ok: UserFile } | { err: string }
  >;
  linkFileToProfile: ActorMethod<
    [string, string],
    { ok: UserFile[] } | { err: string }
  >;
  getMyFiles: ActorMethod<[], UserFile[]>;
  getFilesByCategory: ActorMethod<[string], UserFile[]>;
  deleteFile: ActorMethod<[string], { ok: boolean } | { err: string }>;

  // Social Links
  addSocialLink: ActorMethod<
    [string, string],
    { ok: UserProfile } | { err: string }
  >;
  removeSocialLink: ActorMethod<
    [string],
    { ok: UserProfile } | { err: string }
  >;

  // XP System
  addXP: ActorMethod<
    [bigint, string, string, string],
    { ok: bigint } | { err: string }
  >;
  spendXP: ActorMethod<
    [bigint, string, string],
    { ok: bigint } | { err: string }
  >;
  getXPBalance: ActorMethod<[], bigint>;
  getXPTransactions: ActorMethod<[], XPTransaction[]>;

  // Analytics
  getTotalUsers: ActorMethod<[], bigint>;
  getTotalXPDistributed: ActorMethod<[], bigint>;
  getTopUsersByXP: ActorMethod<[bigint], UserProfile[]>;
  getCanisterStats: ActorMethod<[], CanisterStats>;

  // Admin
  resetUserXP: ActorMethod<[Principal], { ok: boolean } | { err: string }>;
}

export interface UserProfileExtended extends UserProfile {
  interests: string[];
  settings: Record<string, any>;
  [key: string]: any;
}

// Local fallback keys - KEYED BY PRINCIPAL
const LS_PREFIX = "peerverse_profile_"

// Helper function to get actor with proper typing
export async function getActor(identity?: Identity): Promise<UserProfileService> {
  if (!identity) {
    // Get identity from auth client or throw if not authenticated
    const authClient = await AuthClient.create();
    if (!authClient.isAuthenticated()) {
      throw new Error("Not authenticated");
    }
    identity = authClient.getIdentity();
  }
  
  // Create agent with the identity
  const agent = await createAgent(identity);
  
  // Create and return the actor
  const actor = Actor.createActor<UserProfileService>(idlFactory, {
    agent,
    canisterId: USER_PROFILE_CANISTER_ID
  });
  
  return actor;
}

function lsKey(principal: string) {
  return `${LS_PREFIX}${principal}`
}

function readOpt<T>(opt: any): T | undefined | null {
  if (Array.isArray(opt)) return opt.length ? (opt[0] as T) : undefined
  return opt as T
}

function normalizeProfileFromCanister(raw: any): UserProfile {
  // Handle both coverUrl and coverImageUrl for backward compatibility
  const coverImageUrl = raw.coverImageUrl || raw.coverUrl;
  
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    bio: raw.bio,
    avatarUrl: raw.avatarUrl,
    coverImageUrl,
    coverUrl: coverImageUrl, // Keep both for backward compatibility
    xp: BigInt(raw.xp || 0),
    interests: raw.interests || [],
    socialLinks: raw.socialLinks || {},
    files: (raw.files || []).map((file: any) => ({
      id: file.id,
      filename: file.filename,
      contentType: file.contentType,
      size: BigInt(file.size || 0),
      url: file.url,
      category: file.category || 'other',
      uploadedAt: BigInt(file.uploadedAt || 0),
      tags: file.tags || [],
    })),
    jobTitle: raw.jobTitle,
    company: raw.company,
    education: raw.education,
    location: raw.location,
    website: raw.website,
    phone: raw.phone,
    skills: raw.skills || [],
    experience: raw.experience,
    hourlyRate: raw.hourlyRate,
    availability: raw.availability,
    settings: raw.settings || {},
    createdAt: BigInt(raw.createdAt || 0),
    updatedAt: BigInt(raw.updatedAt || 0),
  };
}

// USER-SPECIFIC DATA RETRIEVAL
export async function getMyProfile(): Promise<UserProfileExtended> {
  try {
    const actor = await getActor()
    const result = await actor.getMyProfile()
    
    if (result && result.length > 0) {
      const profile = result[0];
      // Ensure we have a proper UserProfile object
      if (profile && 'id' in profile) {
        return normalizeProfileFromCanister(profile) as UserProfileExtended;
      }
    }
    
    // If no profile exists, return a default one
    const authClient = await AuthClient.create()
    const identity = authClient.getIdentity()
    const principal = identity.getPrincipal()
    
    const defaultProfile: UserProfile = {
      id: principal,
      name: '',
      email: '',
      bio: '',
      socialLinks: {},
      xp: BigInt(0),
      files: [],
      interests: [],
      settings: {},
      createdAt: BigInt(Date.now()),
      updatedAt: BigInt(Date.now())
    };
    
    return defaultProfile as UserProfileExtended;
  } catch (error) {
    console.error('Error fetching profile:', error)
    
    // Fallback to local storage
    try {
      const authClient = await AuthClient.create()
      const identity = authClient.getIdentity()
      const principal = identity.getPrincipal().toText()
      const raw = localStorage.getItem(lsKey(principal))
      if (raw) {
        return JSON.parse(raw)
      }
    } catch (e) {
      console.warn("Failed to load profile from local storage:", e)
    }
    
    throw new Error("Failed to load profile")
  }
}

export async function createProfile(name: string, email: string): Promise<UserProfileExtended> {
  try {
    const actor = await getActor()
    const result = await actor.createProfile(name, email)
    
    if (!result || !('ok' in result) || !result.ok) {
      throw new Error('Failed to create profile')
    }
    
    // Get the principal from the actor's identity
    const authClient = await AuthClient.create()
    const identity = authClient.getIdentity()
    const principal = identity.getPrincipal().toText()
    
    const normalized = normalizeProfileFromCanister(result.ok)
    try {
      localStorage.setItem(lsKey(principal), JSON.stringify(normalized))
    } catch (e) {
      console.warn("Failed to save profile to local storage:", e)
    }
    
    return normalized
  } catch (e) {
    console.warn("createProfile canister call failed:", e)
    throw e
  }
}

export async function updateProfile(update: Partial<UserProfileExtended>): Promise<UserProfileExtended> {
  try {
    const actor = await getActor();
    const result = await actor.updateProfile(update);
    
    if (!result || !('ok' in result) || !result.ok) {
      throw new Error('Failed to update profile');
    }
    
    // Get the principal from the actor's identity
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();
    const principal = identity.getPrincipal().toText();
    
    const normalized = normalizeProfileFromCanister(result.ok);
    try {
      localStorage.setItem(lsKey(principal), JSON.stringify(normalized));
    } catch (e) {
      console.warn("Failed to save profile to local storage:", e);
    }
    
    return normalized as UserProfileExtended;
  } catch (e) {
    console.warn("updateProfile canister call failed, saving to local fallback:", e);
    
    try {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      const principal = identity.getPrincipal().toText();
      const currentRaw = localStorage.getItem(lsKey(principal));
      
      if (!currentRaw) throw new Error("No profile found in local storage");
      
      const current = JSON.parse(currentRaw);
      const updated = { ...current, ...update };
      
      // Handle settings merge if needed
      if (update.settings) {
        updated.settings = { ...(current.settings || {}), ...update.settings };
      }
      
      localStorage.setItem(lsKey(principal), JSON.stringify(updated));
      return updated as UserProfileExtended;
    } catch (storageError) {
      console.error("Failed to update local profile:", storageError);
      throw new Error("Failed to update profile in local storage");
    }
  }
}

export async function updateAvatar(avatarUrl: string): Promise<UserProfileExtended> {
  try {
    const actor = await getActor()
    const result = await actor.updateAvatar(avatarUrl)
    
    if (!result || !('ok' in result) || !result.ok) {
      throw new Error('Failed to update avatar')
    }
    
    // Get the principal from the actor's identity
    const authClient = await AuthClient.create()
    const identity = authClient.getIdentity()
    const principal = identity.getPrincipal().toText()
    
    const normalized = normalizeProfileFromCanister(result.ok)
    try {
      localStorage.setItem(lsKey(principal), JSON.stringify(normalized))
    } catch (e) {
      console.warn("Failed to save profile to local storage:", e)
    }
    
    return normalized
  } catch (e) {
    console.warn("updateAvatar canister call failed:", e)
    throw e
  }
}

export async function updateCover(coverUrl: string): Promise<UserProfileExtended> {
  try {
    const actor = await getActor()
    const result = await actor.updateCover(coverUrl)
    
    if (!result || !('ok' in result) || !result.ok) {
      throw new Error('Failed to update cover')
    }
    
    // Get the principal from the actor's identity
    const authClient = await AuthClient.create()
    const identity = authClient.getIdentity()
    const principal = identity.getPrincipal().toText()
    
    const normalized = normalizeProfileFromCanister(result.ok)
    try {
      localStorage.setItem(lsKey(principal), JSON.stringify(normalized))
    } catch (e) {
      console.warn("Failed to save profile to local storage:", e)
    }
    
    return normalized
  } catch (e) {
    console.warn("updateCover canister call failed:", e)
    throw e
  }
}

export async function uploadFile(
  file: File,
  category: string = 'other',
  tags: string[] = []
): Promise<{ url: string; file: UserFile }> {
  try {
    // Get the authenticated actor
    const actor = await getActor();
    
    // Upload the file to the asset canister first (mock implementation)
    const objectKey = `${Date.now()}-${file.name}`;
    const fileUrl = await uploadToAssetCanister(file, objectKey);
    
    // Get file size in bytes and content type
    const fileSize = BigInt(file.size);
    const contentType = file.type || 'application/octet-stream';
    
    // Call the canister's uploadFile method with timeout
    const uploadPromise = actor.uploadFile(
      file.name,
      contentType,
      fileSize,
      fileUrl,
      `Uploaded file: ${file.name}`,
      tags
    );
    
    // Add a timeout to the upload operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('File upload timed out after 30 seconds'));
      }, 30000); // 30 seconds timeout
    });
    
    // Race the upload against the timeout
    const result = await Promise.race([uploadPromise, timeoutPromise]);
    
    if ('err' in result) {
      console.error('Error from canister when uploading file:', result.err);
      throw new Error(`Failed to upload file: ${result.err}`);
    }
    
    return {
      url: fileUrl,
      file: result.ok
    };
  } catch (error) {
    console.error('Error in uploadFile:', error);
    // Rethrow with a more user-friendly message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while uploading the file');
  }
}

export async function getMyFiles(): Promise<UserFile[]> {
  try {
    // Get the authenticated actor
    const actor = await getActor();
    
    // Call the canister's getMyFiles method with timeout
    const filesPromise = actor.getMyFiles();
    
    // Add a timeout to the operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timed out after 30 seconds'));
      }, 30000);
    });
    
    // Race the operation against the timeout
    const result = await Promise.race([filesPromise, timeoutPromise]);
    
    // Define a type guard for the Result type
    type ResultType = { ok: UserFile[] } | { err: string };
    
    // Cache the files in local storage for offline use
    try {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      if (identity) {
        localStorage.setItem(
          `user_files_${identity.getPrincipal().toText()}`,
          JSON.stringify(result)
        );
      }
    } catch (e) {
      console.warn("Failed to cache files in localStorage", e);
    }
    
    // Handle case where result is an array directly
    if (Array.isArray(result)) {
      return result.map(file => ({
        ...file,
        size: BigInt(file.size || 0),
        uploadedAt: BigInt(file.uploadedAt || 0),
        tags: Array.isArray(file.tags) ? file.tags : [],
        category: file.category || 'other'
      } as UserFile));
    }
    
    // Handle case where result is a Result type (for backward compatibility)
    const typedResult = result as unknown as ResultType;
    if (typedResult && 'ok' in typedResult && Array.isArray(typedResult.ok)) {
      return typedResult.ok.map(file => ({
        ...file,
        size: BigInt(file.size || 0),
        uploadedAt: BigInt(file.uploadedAt || 0),
        tags: Array.isArray(file.tags) ? file.tags : [],
        category: file.category || 'other'
      } as UserFile));
    }
    
    throw new Error('Unexpected response format from getMyFiles');
  } catch (error) {
    console.warn('getMyFiles failed:', error);
    
    // Try to return cached files if available
    try {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      if (identity) {
        const cached = localStorage.getItem(`user_files_${identity.getPrincipal().toText()}`);
        if (cached) {
          console.warn("Returning cached files due to error", error);
          return JSON.parse(cached);
        }
      }
    } catch (e) {
      console.error("Error getting cached files:", e);
    }
    
    // If we have a specific error, rethrow it
    if (error instanceof Error) {
      throw error;
    }
    
    // Otherwise, return an empty array as a fallback
    return [];
  }
}

// This duplicate uploadFile function has been removed to avoid conflicts

export async function addSocialLink(platform: string, url: string): Promise<UserProfileExtended> {
  try {
    // Get the authenticated actor
    const actor = await getActor();
    
    // Call the canister's addSocialLink method with timeout
    const addLinkPromise = actor.addSocialLink(platform, url);
    
    // Add a timeout to the operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timed out after 30 seconds'));
      }, 30000);
    });
    
    // Race the operation against the timeout
    const result = await Promise.race([addLinkPromise, timeoutPromise]);
    
    if ('ok' in result) {
      const normalized = normalizeProfileFromCanister(result.ok);
      try {
        // Cache the updated profile in local storage
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        if (identity) {
          const principal = identity.getPrincipal().toText();
          localStorage.setItem(lsKey(principal), JSON.stringify(normalized));
        }
      } catch (e) {
        console.warn("Failed to save to local storage:", e);
      }
      return normalized as UserProfileExtended;
    } else {
      throw new Error(result.err || "Failed to add social link");
    }
  } catch (e) {
    console.warn("addSocialLink failed:", e);
    throw e;
  }
}

export async function removeSocialLink(platform: string): Promise<UserProfileExtended> {
  try {
    // Get the authenticated actor
    const actor = await getActor();
    
    // Call the canister's removeSocialLink method with timeout
    const removeLinkPromise = actor.removeSocialLink(platform);
    
    // Add a timeout to the operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timed out after 30 seconds'));
      }, 30000);
    });
    
    // Race the operation against the timeout
    const result = await Promise.race([removeLinkPromise, timeoutPromise]);
    
    if ('ok' in result) {
      const normalized = normalizeProfileFromCanister(result.ok);
      try {
        // Cache the updated profile in local storage
        const authClient = await AuthClient.create();
        const identity = authClient.getIdentity();
        if (identity) {
          const principal = identity.getPrincipal().toText();
          localStorage.setItem(lsKey(principal), JSON.stringify(normalized));
        }
      } catch (e) {
        console.warn("Failed to save to local storage:", e);
      }
      return normalized as UserProfileExtended;
    } else {
      throw new Error(result.err || "Failed to remove social link");
    }
  } catch (e) {
    console.warn("removeSocialLink failed:", e);
    throw e;
  }
}

export async function getXPBalance(): Promise<number> {
  try {
    // Get the authenticated actor
    const actor = await getActor();
    
    // Call the canister's getXPBalance method with timeout
    const balancePromise = actor.getXPBalance();
    
    // Add a timeout to the operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timed out after 30 seconds'));
      }, 30000);
    });
    
    // Race the operation against the timeout
    const balance = await Promise.race([balancePromise, timeoutPromise]);
    
    // Convert BigInt to number (be careful with very large numbers)
    return Number(balance);
  } catch (e) {
    console.warn('getXPBalance failed:', e);
    // Return 0 as fallback
    return 0;
  }
}

export async function addXP(
  amount: number,
  reason: string,
  source: string,
  metadata: string = ""
): Promise<bigint> {
  try {
    // Get the authenticated actor
    const actor = await getActor();
    
    // Convert amount to bigint as required by the canister
    const amountBigInt = BigInt(amount);
    
    // Call the canister's addXP method with timeout
    const addXPPromise = actor.addXP(amountBigInt, reason, source, metadata);
    
    // Add a timeout to the operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Operation timed out after 30 seconds'));
      }, 30000);
    });
    
    // Race the operation against the timeout
    const result = await Promise.race([addXPPromise, timeoutPromise]);
    
    if ('ok' in result) {
      return result.ok;
    } else {
      throw new Error(result.err || "Failed to add XP");
    }
  } catch (e) {
    console.warn('addXP failed:', e);
    throw e;
  }
}
