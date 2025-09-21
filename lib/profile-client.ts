import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './ic/user-profile.idl';
import { 
  UserProfile as BackendUserProfile, 
  UserFile as BackendUserFile, 
  ProfileUpdate as BackendProfileUpdate, 
  XPTransaction 
} from './ic/user-profile.idl';

// BackendUserSettings is defined in the IDL file
import { Principal } from '@dfinity/principal';

// Define the service interface based on the canister's interface
type Service = {
  getProfile: (arg: { user: Principal }) => Promise<BackendUserProfile | null>;
  getMyProfile: () => Promise<BackendUserProfile | null>;
  createProfile: (name: string, email: string) => Promise<{ ok: BackendUserProfile } | { err: string }>;
  updateProfile: (update: BackendProfileUpdate) => Promise<{ ok: BackendUserProfile } | { err: string }>;
  uploadAvatar: (file: Uint8Array | number[]) => Promise<{ ok: string } | { err: string }>;
  uploadCover: (file: Uint8Array | number[]) => Promise<{ ok: string } | { err: string }>;
  addSocialLink: (platform: string, url: string) => Promise<{ ok: boolean } | { err: string }>;
  removeSocialLink: (platform: string) => Promise<{ ok: boolean } | { err: string }>;
  uploadFile: (filename: string, contentType: string, size: bigint, category: string, url: string, tags: Array<[string, string]>) => Promise<{ ok: UserFile } | { err: string }>;
  addXP: (amount: bigint, reason: string, metadata: string) => Promise<{ ok: bigint } | { err: string }>;
  spendXP: (amount: bigint, reason: string, metadata: string) => Promise<{ ok: bigint } | { err: string }>;
  getMyXPTransactions: () => Promise<XPTransaction[]>;
};
import { AuthClient } from '@dfinity/auth-client';

// UserSettings represents the normalized settings for the frontend
interface UserSettings {
  // Core settings
  theme: string;
  notifications: boolean;
  emailNotifications: boolean;
  privacy: string;
  language: string;
  profileVisibility: string;
  
  // Social links in frontend format
  socialLinks?: Array<{ platform: string; url: string }>;
  
  // Allow additional settings
  [key: string]: any;
}

export interface UserFile {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  url: string;
  category: string;
  uploadedAt: number;
  tags: string[];
}

export interface UserProfile {
  // Core user information
  id?: string;
  name?: string;
  email?: string;
  
  // Profile details
  bio?: string;
  location?: string;
  jobTitle?: string;
  company?: string;
  education?: string;
  phone?: string;
  
  // Media
  avatarUrl?: string;
  coverUrl?: string;
  files?: UserFile[];
  
  // Skills and interests
  skills?: string[];
  interests?: string[];
  
  // Social and connections
  socialLinks?: Array<{ platform: string; url: string }>;
  
  // Stats and metrics
  xpBalance?: number;
  reputation?: number;
  
  // Settings and metadata
  settings?: UserSettings;
  createdAt?: number;
  updatedAt?: number;
}

// ProfileUpdate interface that matches the backend's expected format
export interface ProfileUpdate {
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
  jobTitle?: string;
  company?: string;
  education?: string;
  phone?: string;
  avatarUrl?: string;
  coverUrl?: string;
  interests?: string[];
  skills?: string[];
  socialLinks?: Array<[string, string]>;
  settings?: UserSettings;
  xpBalance?: number;
  reputation?: number;
  files?: UserFile[];
  createdAt?: number;
  updatedAt?: number;
}

const CANISTER_ID = process.env.NEXT_PUBLIC_USER_PROFILE_CANISTER_ID;
const HOST = process.env.NEXT_PUBLIC_IC_HOST || 'https://ic0.app';

if (!CANISTER_ID) {
  throw new Error('NEXT_PUBLIC_USER_PROFILE_CANISTER_ID environment variable is not set');
}

// Helper function to get the canister ID as a Principal
export const getCanisterId = (): Principal => {
  if (!CANISTER_ID) {
    throw new Error('NEXT_PUBLIC_USER_PROFILE_CANISTER_ID environment variable is not set');
  }
  return Principal.fromText(CANISTER_ID);
};

// Get the canister ID as a string
export const getCanisterIdString = (): string => {
  if (!CANISTER_ID) {
    throw new Error('NEXT_PUBLIC_USER_PROFILE_CANISTER_ID environment variable is not set');
  }
  return CANISTER_ID;
};

let userProfileActor: Service | null = null;

async function getActor(): Promise<Service> {
  if (userProfileActor) return userProfileActor;

  const authClient = await AuthClient.create();
  const identity = await authClient.getIdentity();
  const agent = new HttpAgent({ 
    host: HOST
  });
  
  // Set the identity after creating the agent
  if (identity) {
    agent.replaceIdentity(identity);
  }
  
  if (process.env.NODE_ENV !== 'production') {
    await agent.fetchRootKey();
  }

  const canisterId = getCanisterId();
  userProfileActor = Actor.createActor<Service>(idlFactory, {
    agent,
    canisterId,
  });
  
  return userProfileActor;
}

// Helper function to safely convert BigInt to number
const bigIntToNumber = (value: unknown): number => {
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  }
  return 0; // Default value if conversion fails
};

// Helper function to safely log objects that might contain BigInt
const safeStringify = (obj: unknown): string => {
  const bigIntReplacer = (key: string, value: unknown) => {
    return typeof value === 'bigint' ? value.toString() : value;
  };
  return JSON.stringify(obj, bigIntReplacer, 2);
};

// Helper function to convert backend profile to frontend profile
function mapBackendToFrontendProfile(profile: BackendUserProfile): UserProfile {
  // Log the profile in a way that handles BigInt
  console.log('Mapping backend profile:', safeStringify(profile));
  
  // Helper function to safely get a setting value
  const getSetting = <T>(value: T | T[] | undefined, defaultValue: T): T => {
    if (value === undefined || value === null) return defaultValue;
    return Array.isArray(value) ? (value[0] as T) : value;
  };

  // Helper function to safely get a value that might be wrapped in an array
  const unwrapValue = <T>(value: T | T[] | undefined): T | undefined => {
    if (value === undefined || value === null) return undefined;
    return Array.isArray(value) ? value[0] : value;
  };

  // Safely get settings with defaults
  const settings = profile.settings ? (Array.isArray(profile.settings) ? profile.settings[0] : profile.settings) : {};
  
  // Process interests - ensure it's always an array of strings
  const interests: string[] = [];
  if (Array.isArray(profile.interests)) {
    interests.push(...profile.interests.flat().filter((i): i is string => typeof i === 'string'));
  } else if (profile.interests) {
    interests.push(String(profile.interests));
  }
  
  // Process social links - ensure it's an array of { platform, url } objects
  const socialLinks: Array<{ platform: string; url: string }> = [];
  
  // Type guard to check if a value is a valid social link tuple
  const isValidSocialLink = (value: unknown): value is [string, string] => {
    return Array.isArray(value) && 
           value.length === 2 && 
           typeof value[0] === 'string' && 
           typeof value[1] === 'string';
  };
  
  if (profile.socialLinks) {
    // Handle case where socialLinks is an array of arrays
    if (Array.isArray(profile.socialLinks)) {
      for (const item of profile.socialLinks.flat()) {
        if (isValidSocialLink(item)) {
          socialLinks.push({ platform: item[0], url: item[1] });
        } else if (Array.isArray(item)) {
          // Handle nested arrays
          const flatItem = item.flat();
          if (isValidSocialLink(flatItem)) {
            socialLinks.push({ platform: flatItem[0], url: flatItem[1] });
          }
        }
      }
    } 
    // Handle case where socialLinks is a single tuple
    else if (isValidSocialLink(profile.socialLinks)) {
      socialLinks.push({ platform: profile.socialLinks[0], url: profile.socialLinks[1] });
    }
  }
  
  // Process files
  const files: UserFile[] = [];
  if (Array.isArray(profile.files)) {
    for (const file of profile.files) {
      if (file) {
        files.push({
          id: file.id || '',
          filename: file.filename || '',
          contentType: file.contentType || '',
          size: bigIntToNumber(file.size),
          url: file.url || '',
          category: file.category || 'other',
          uploadedAt: bigIntToNumber(file.uploadedAt),
          tags: Array.isArray(file.tags) ? file.tags.filter((t): t is string => typeof t === 'string') : []
        });
      }
    }
  }

  const frontendProfile: UserProfile = {
    id: profile.id,
    name: unwrapValue(profile.name) || '',
    email: unwrapValue(profile.email) || '',
    bio: unwrapValue(profile.bio) || '',
    avatarUrl: unwrapValue(profile.avatarUrl) || '',
    coverUrl: unwrapValue(profile.coverUrl) || '',
    xpBalance: bigIntToNumber(profile.xpBalance),
    reputation: bigIntToNumber(profile.reputation),
    interests,
    socialLinks,
    files,
    createdAt: Number(profile.createdAt || Date.now()),
    updatedAt: Number(profile.updatedAt || Date.now()),
    settings: {
      notifications: getSetting<boolean>(
        settings.notifications !== undefined ? settings.notifications : settings.notifications,
        true
      ),
      emailNotifications: getSetting<boolean>(
        settings.emailNotifications !== undefined ? settings.emailNotifications : settings.emailNotifications,
        true
      ),
      privacy: getSetting<string>(
        settings.privacy !== undefined ? settings.privacy : settings.privacy,
        'public'
      ),
      theme: getSetting<string>(
        settings.theme !== undefined ? settings.theme : settings.theme,
        'light'
      ),
      language: getSetting<string>(
        settings.language !== undefined ? settings.language : settings.language,
        'en'
      ),
      profileVisibility: getSetting<string>(
        settings.profileVisibility !== undefined ? settings.profileVisibility : settings.profileVisibility,
        'public'
      )
    }
  };

  return frontendProfile;
}

// Profile Management
export async function createProfile(name: string, email: string): Promise<UserProfile> {
  // First, check if profile already exists
  try {
    const existingProfile = await getMyProfile();
    if (existingProfile) {
      console.log('Profile already exists, returning existing profile');
      return existingProfile;
    }
  } catch (error) {
    console.log('No existing profile found, creating new one');
  }

  // If we get here, no existing profile was found
  try {
    const actor = await getActor();
    const result = await actor.createProfile(name, email);
    
    console.log('Create profile result:', JSON.stringify(result, null, 2));
    
    if (result && 'ok' in result) {
      const profile = result.ok as BackendUserProfile;
      return mapBackendToFrontendProfile(profile);
    } else if (result && 'err' in result) {
      // If the error is about the profile already existing, try to get the existing profile
      if (typeof result.err === 'string' && result.err.toLowerCase().includes('already exists')) {
        const existingProfile = await getMyProfile();
        if (existingProfile) {
          return existingProfile;
        }
      }
      throw new Error(typeof result.err === 'string' ? result.err : 'Failed to create profile');
    } else {
      console.warn('Unexpected response format from createProfile, trying to get profile...');
      const existingProfile = await getMyProfile();
      if (existingProfile) {
        return existingProfile;
      }
      throw new Error('Unexpected response format from createProfile');
    }
  } catch (error) {
    console.error('Error in createProfile:', error);
    
    // If there was an error but we might still have a profile, try to get it
    try {
      const existingProfile = await getMyProfile();
      if (existingProfile) {
        return existingProfile;
      }
    } catch (e) {
      console.error('Failed to get profile after create error:', e);
    }
    
    // Re-throw the original error if we couldn't recover
    throw error;
  }
}

export async function getMyProfile(): Promise<UserProfile | null> {
  try {
    const actor = await getActor();
    const result = await actor.getMyProfile();
    
    if (!result) {
      console.warn('Empty response from getMyProfile');
      return null;
    }
    
    // Handle case where result is an array with one element
    if (Array.isArray(result) && result.length > 0) {
      const firstItem = result[0];
      // If the first item is an object with 'ok' or 'err', handle it
      if (firstItem && typeof firstItem === 'object') {
        if ('ok' in firstItem) {
          const profile = firstItem.ok as BackendUserProfile;
          return mapBackendToFrontendProfile(profile);
        } else if ('err' in firstItem) {
          console.error('Error in profile response:', firstItem.err);
          return null;
        }
      }
      // If the first item looks like a profile, try to map it
      if (firstItem && 'id' in firstItem) {
        return mapBackendToFrontendProfile(firstItem as unknown as BackendUserProfile);
      }
    }
    
    // Handle case where result is an object with 'ok' or 'err' property
    if (typeof result === 'object' && result !== null) {
      if ('ok' in result) {
        const profile = result.ok as BackendUserProfile;
        return mapBackendToFrontendProfile(profile);
      } else if ('err' in result) {
        console.error('Error fetching profile:', result.err);
        return null;
      }
    }
    
    // If we get here, the result is in an unexpected format
    console.warn('Unexpected profile response format, attempting to parse anyway:', result);
    
    // Last resort: try to map the result directly if it looks like a profile
    if (result && typeof result === 'object' && 'id' in result) {
      return mapBackendToFrontendProfile(result as unknown as BackendUserProfile);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function getProfile(principal: string | Principal): Promise<UserProfile | null> {
  try {
    const actor = await getActor();
    const principalObj = typeof principal === 'string' 
      ? Principal.fromText(principal)
      : principal;
      
    const result = await actor.getProfile({ user: principalObj });
    
    if (!result) {
      console.warn('Empty response from getProfile');
      return null;
    }
    
    // Handle case where result is an array with one element
    if (Array.isArray(result) && result.length > 0) {
      const firstItem = result[0];
      // If the first item is an object with 'ok' or 'err', handle it
      if (firstItem && typeof firstItem === 'object') {
        if ('ok' in firstItem) {
          const profile = firstItem.ok as BackendUserProfile;
          return mapBackendToFrontendProfile(profile);
        } else if ('err' in firstItem) {
          console.error('Error in profile response:', firstItem.err);
          return null;
        }
      }
      // If the first item looks like a profile, try to map it
      if ('id' in firstItem) {
        return mapBackendToFrontendProfile(firstItem as unknown as BackendUserProfile);
      }
    }
    
    // Handle case where result is an object with 'ok' or 'err' property
    if (typeof result === 'object' && result !== null) {
      if ('ok' in result) {
        const profile = result.ok as BackendUserProfile;
        return mapBackendToFrontendProfile(profile);
      } else if ('err' in result) {
        console.error('Error fetching profile:', result.err);
        return null;
      }
    }
    
    // If we get here, the result is in an unexpected format
    console.warn('Unexpected profile response format, attempting to parse anyway:', result);
    
    // Last resort: try to map the result directly if it looks like a profile
    if (result && typeof result === 'object' && 'id' in result) {
      return mapBackendToFrontendProfile(result as unknown as BackendUserProfile);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

/**
 * Updates the user's profile with the provided updates
 * @param updates Partial UserProfile object with the fields to update
 * @returns The updated UserProfile
 */
export async function updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  try {
    console.log('Sending profile update with data:', JSON.stringify(updates, null, 2));
    
    // Get current profile to ensure we have all required fields
    const currentProfile = await getMyProfile();
    if (!currentProfile) {
      throw new Error('Profile not found');
    }

    // Helper function to safely get optional text fields
    const getOptionalText = (value: any): string => {
      return value !== undefined && value !== null ? String(value) : '';
    };

    // Helper function to safely get social links in the correct format
    const getSocialLinks = (links: any): [string, string][] => {
      if (!Array.isArray(links)) {
        return [];
      }
      
      return links
        .map(link => {
          if (Array.isArray(link) && link.length >= 2) {
            return [String(link[0] || ''), String(link[1] || '')] as [string, string];
          }
          if (link && typeof link === 'object' && 'platform' in link && 'url' in link) {
            return [String(link.platform || ''), String(link.url || '')] as [string, string];
          }
          return null;
        })
        .filter(Boolean) as [string, string][];
    };

    // Prepare the update data with proper fallbacks
    const updateData: ProfileUpdate = {
      // Required fields
      name: updates.name ?? currentProfile.name ?? '',
      email: updates.email ?? currentProfile.email ?? '',
      
      // Optional fields
      bio: getOptionalText(updates.bio ?? currentProfile.bio),
      location: updates.location ?? currentProfile.location ?? '',
      jobTitle: updates.jobTitle ?? currentProfile.jobTitle ?? '',
      company: updates.company ?? currentProfile.company ?? '',
      education: updates.education ?? currentProfile.education ?? '',
      phone: updates.phone ?? currentProfile.phone ?? '',
      avatarUrl: updates.avatarUrl ?? currentProfile.avatarUrl ?? '',
      coverUrl: updates.coverUrl ?? currentProfile.coverUrl ?? '',
      
      // Handle arrays and complex types
      socialLinks: getSocialLinks(updates.socialLinks ?? currentProfile.socialLinks),
      skills: Array.isArray(updates.skills) ? updates.skills : (Array.isArray(currentProfile.skills) ? currentProfile.skills : []),
      interests: Array.isArray(updates.interests) ? updates.interests : (Array.isArray(currentProfile.interests) ? currentProfile.interests : []),
      
      // Other fields with defaults
      xpBalance: updates.xpBalance ?? currentProfile.xpBalance ?? 0,
      reputation: updates.reputation ?? currentProfile.reputation ?? 0,
      settings: {
        theme: 'light',
        notifications: true,
        emailNotifications: true,
        privacy: 'public',
        language: 'en',
        profileVisibility: 'public',
        ...currentProfile.settings,
        ...updates.settings
      },
      files: updates.files ?? currentProfile.files ?? [],
      updatedAt: Date.now()
    };

    console.log('Calling updateProfile with:', JSON.stringify(updateData, null, 2));
    
    try {
      const actor = await getActor();
      const result = await actor.updateProfile(updateData);
      
      if ('ok' in result) {
        const updatedProfile = mapBackendToFrontendProfile(result.ok);
        if (!updatedProfile) {
          throw new Error('Failed to map updated profile');
        }
        return updatedProfile;
      } else {
        const errorMessage = typeof result.err === 'string' ? result.err : 'Failed to update profile';
        console.error('Error updating profile:', errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error in actor.updateProfile:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateProfile call:', error);
    // Re-throw the error with a more descriptive message
    if (error instanceof Error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }
    throw new Error('An unknown error occurred while updating the profile');
  }
}

export async function updateMyProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  return updateProfile(updates);
}

// File Management
export async function uploadFile(file: File, category: string = 'other'): Promise<UserFile> {
  const actor = await getActor();
  
  // Read the file as an array buffer
  const arrayBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);
  
  // Convert tags to the expected format (array of [string, string] tuples)
  const tags: [string, string][] = [];
  
  try {
    console.log('Uploading file:', file.name, 'size:', file.size, 'type:', file.type);
    
    // First upload the file content
    const uploadResult = await actor.uploadFile(
      file.name,
      file.type,
      BigInt(file.size),
      category,
      `data:${file.type};base64,${Buffer.from(fileBytes).toString('base64')}`, // Inline data URL
      tags
    );

    if ('ok' in uploadResult) {
      // Map the backend file to the frontend format
      const backendFile = uploadResult.ok;
      console.log('File uploaded successfully:', backendFile);
      
      // Verify the URL is set correctly
      if (!backendFile.url) {
        console.warn('Uploaded file has no URL, using fallback');
        backendFile.url = `data:${file.type};base64,${Buffer.from(fileBytes).toString('base64')}`;
      }
      
      return {
        id: backendFile.id,
        filename: backendFile.filename,
        contentType: backendFile.contentType,
        size: Number(backendFile.size),
        url: backendFile.url,
        category: backendFile.category || category,
        uploadedAt: Number(backendFile.uploadedAt) || Date.now(),
        tags: backendFile.tags || []
      };
    } else {
      console.error('Error uploading file:', uploadResult.err);
      throw new Error(uploadResult.err);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

export async function uploadAvatar(file: File): Promise<string> {
  try {
    console.log('Starting avatar image upload...');
    const uploadedFile = await uploadFile(file, 'avatar');
    console.log('File uploaded, updating profile with avatar URL:', uploadedFile.url);
    
    // Get current profile to ensure we have all required fields
    const currentProfile = await getMyProfile();
    if (!currentProfile) {
      throw new Error('Failed to load current profile');
    }
    
    // Update profile with all required fields
    await updateProfile({
      ...currentProfile,  // Include all current profile data
      avatarUrl: uploadedFile.url  // Update just the avatar URL
    });
    
    console.log('Profile updated successfully with new avatar image');
    return uploadedFile.url;
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    throw error;
  }
}

export async function uploadCover(file: File): Promise<string> {
  try {
    console.log('Starting cover image upload...');
    
    // Upload the file first
    const uploadedFile = await uploadFile(file, 'cover');
    console.log('File uploaded successfully, URL:', uploadedFile.url);
    
    // Get current profile to ensure we have all required fields
    const currentProfile = await getMyProfile();
    if (!currentProfile) {
      throw new Error('Failed to load current profile');
    }
    
    console.log('Updating profile with new cover URL...');
    
    // Create a clean update object with all required fields
    const updateData: Partial<UserProfile> = {
      // Include the new cover URL
      coverUrl: uploadedFile.url,
      // Include required fields from current profile
      name: currentProfile.name || 'User',
      email: currentProfile.email || '',
      // Ensure bio is always a string
      bio: currentProfile.bio || '',
      // Include other required fields
      settings: currentProfile.settings || {
        notifications: true,
        emailNotifications: true,
        privacy: 'public',
        theme: 'auto',
        language: 'en',
        profileVisibility: 'public'
      },
      // Initialize arrays if they don't exist
      interests: currentProfile.interests || [],
      socialLinks: currentProfile.socialLinks || []
    };
    
    console.log('Updating profile with data:', JSON.stringify(updateData, null, 2));
    
    // Update profile with the new data
    const updatedProfile = await updateProfile(updateData);
    
    console.log('Profile updated successfully with new cover image');
    return uploadedFile.url;
  } catch (error) {
    console.error('Error in uploadCover:', error);
    throw error;
  }
}

// Social Links
export async function addSocialLink(platform: string, url: string): Promise<boolean> {
  const actor = await getActor();
  const result = await actor.addSocialLink(platform, url);
  return 'ok' in result && result.ok;
}

export async function removeSocialLink(platform: string): Promise<boolean> {
  const actor = await getActor();
  const result = await actor.removeSocialLink(platform);
  return 'ok' in result && result.ok;
}

// XP Management
export async function addXP(amount: number, reason: string, metadata: string = ''): Promise<number> {
  const actor = await getActor();
  const result = await actor.addXP(BigInt(amount), reason, metadata);
  
  if ('ok' in result) {
    return Number(result.ok);
  } else {
    throw new Error(result.err);
  }
}

export async function spendXP(amount: number, reason: string, metadata: string = ''): Promise<number> {
  const actor = await getActor();
  const result = await actor.spendXP(BigInt(amount), reason, metadata);
  
  if ('ok' in result) {
    return Number(result.ok);
  } else {
    throw new Error(result.err);
  }
}

export async function getXPTransactions(): Promise<XPTransaction[]> {
  const actor = await getActor();
  return await actor.getMyXPTransactions();
}

export async function uploadAndLinkFile(file: File, category: string, tags: string[]): Promise<UserFile | null> {
  console.warn('Profile client temporarily disabled');
  return null;
}
