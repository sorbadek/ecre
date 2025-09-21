// Import the backend types
import type { 
  UserSettings as BackendUserSettings, 
  UserFile as BackendUserFile, 
  UserProfile as BackendUserProfile 
} from '@/lib/ic/user-profile.idl';

// Type for social links in the frontend
export type SocialLink = {
  platform: string;
  url: string;
};

// Frontend settings type
export interface UserSettings {
  // Core settings
  theme: string;
  notifications: boolean;
  emailNotifications: boolean;
  privacy: string;
  language: string;
  profileVisibility: string;
  
  // Social links in frontend format
  socialLinks?: SocialLink[];
  
  // Allow additional settings
  [key: string]: any;
}

export interface UserFile extends Omit<BackendUserFile, 'size' | 'uploadedAt'> {
  size: number;
  uploadedAt: number;
}

// Extended user profile with frontend-specific fields
export interface UserProfile {
  // Core profile fields (from backend)
  id: string;
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  xpBalance: number;
  reputation: number;
  files: UserFile[];
  socialLinks: SocialLink[];
  settings: UserSettings;
  createdAt: number;
  updatedAt: number;
  
  // Frontend-specific fields
  location?: string;
  jobTitle?: string;
  company?: string;
  education?: string;
  phone?: string;
  skills?: string[];
  interests?: string[];
  
  // Index signature for additional properties
  [key: string]: any;
}

// Helper type for form data
export type ProfileFormData = {
  name: string;
  bio: string;
  location: string;
  jobTitle: string;
  company: string;
  education: string;
  skills: string[];
  interests: string[];
};

// Convert backend profile to frontend profile
export function convertBackendProfile(backendProfile: any): UserProfile {
  // Helper function to convert social links from [string, string][] to SocialLink[]
  const convertSocialLinks = (links: [string, string][] | undefined): SocialLink[] => {
    if (!Array.isArray(links)) return [];
    return links.map(([platform, url]) => ({
      platform: platform || '',
      url: url || ''
    }));
  };

  // Create base profile with default values
  const profile: UserProfile = {
    // Core fields with type conversions
    id: String(backendProfile.id || ''),
    name: String(backendProfile.name || ''),
    email: String(backendProfile.email || ''),
    bio: String(backendProfile.bio || ''),
    avatarUrl: String(backendProfile.avatarUrl || ''),
    coverUrl: String(backendProfile.coverUrl || ''),
    xpBalance: Number(backendProfile.xpBalance || 0),
    reputation: Number(backendProfile.reputation || 0),
    createdAt: Number(backendProfile.createdAt || 0),
    updatedAt: Number(backendProfile.updatedAt || 0),
    
    // Handle files
    files: Array.isArray(backendProfile.files) 
      ? backendProfile.files.map((file: any) => ({
          ...file,
          size: Number(file.size || 0),
          uploadedAt: Number(file.uploadedAt || 0)
        }))
      : [],
    
    // Handle social links
    socialLinks: convertSocialLinks(backendProfile.socialLinks),
    
    // Handle settings
    settings: {
      theme: String(backendProfile.settings?.theme || 'light'),
      notifications: Boolean(backendProfile.settings?.notifications ?? true),
      emailNotifications: Boolean(backendProfile.settings?.emailNotifications ?? true),
      privacy: String(backendProfile.settings?.privacy || 'public'),
      language: String(backendProfile.settings?.language || 'en'),
      profileVisibility: String(backendProfile.settings?.profileVisibility || 'public'),
      socialLinks: convertSocialLinks(backendProfile.settings?.socialLinks)
    },
    
    // Frontend-specific fields
    location: String(backendProfile.location || ''),
    jobTitle: String(backendProfile.jobTitle || ''),
    company: String(backendProfile.company || ''),
    education: String(backendProfile.education || ''),
    phone: String(backendProfile.phone || ''),
    skills: Array.isArray(backendProfile.skills) 
      ? backendProfile.skills.map(String).filter(Boolean) 
      : [],
    interests: Array.isArray(backendProfile.interests) 
      ? backendProfile.interests.map(String).filter(Boolean) 
      : []
  };

  return profile;
}

// Convert frontend profile to backend profile
export function convertToBackendProfile(profile: Partial<UserProfile>): Partial<BackendUserProfile> {
  // Helper function to convert social links from SocialLink[] to [string, string][]
  const convertToBackendSocialLinks = (links: SocialLink[] | undefined): [string, string][] | undefined => {
    if (!Array.isArray(links)) return undefined;
    return links.map(({ platform, url }) => [platform || '', url || '']);
  };

  // Create a clean object with only the fields we want to send to the backend
  const backendProfile: any = {};
  
  // Core fields
  if (profile.id !== undefined) backendProfile.id = String(profile.id);
  if (profile.name !== undefined) backendProfile.name = String(profile.name);
  if (profile.email !== undefined) backendProfile.email = String(profile.email);
  if (profile.bio !== undefined) backendProfile.bio = String(profile.bio);
  if (profile.avatarUrl !== undefined) backendProfile.avatarUrl = String(profile.avatarUrl);
  if (profile.coverUrl !== undefined) backendProfile.coverUrl = String(profile.coverUrl);
  
  // Convert number fields to BigInt
  if (profile.xpBalance !== undefined) backendProfile.xpBalance = BigInt(Math.floor(profile.xpBalance));
  if (profile.reputation !== undefined) backendProfile.reputation = BigInt(Math.floor(profile.reputation));
  
  // Handle files
  if (Array.isArray(profile.files)) {
    backendProfile.files = profile.files.map(file => ({
      ...file,
      size: BigInt(Math.floor(file.size || 0)),
      uploadedAt: BigInt(Math.floor(file.uploadedAt || 0))
    }));
  }
  
  // Handle dates
  if (profile.createdAt !== undefined) backendProfile.createdAt = BigInt(Math.floor(profile.createdAt));
  if (profile.updatedAt !== undefined) backendProfile.updatedAt = BigInt(Math.floor(profile.updatedAt));
  
  // Handle social links
  if (Array.isArray(profile.socialLinks)) {
    backendProfile.socialLinks = convertToBackendSocialLinks(profile.socialLinks);
  }
  
  // Handle settings
  if (profile.settings) {
    backendProfile.settings = {
      ...profile.settings,
      socialLinks: convertToBackendSocialLinks(profile.settings.socialLinks)
    };
  }
  
  // Add frontend-only fields to the backend profile
  if (profile.location !== undefined) backendProfile.location = String(profile.location);
  if (profile.jobTitle !== undefined) backendProfile.jobTitle = String(profile.jobTitle);
  if (profile.company !== undefined) backendProfile.company = String(profile.company);
  if (profile.education !== undefined) backendProfile.education = String(profile.education);
  if (profile.phone !== undefined) backendProfile.phone = String(profile.phone);
  if (Array.isArray(profile.skills)) backendProfile.skills = [...profile.skills];
  if (Array.isArray(profile.interests)) backendProfile.interests = [...profile.interests];
  
  // Add any additional properties that might be in the profile
  Object.keys(profile).forEach(key => {
    // Skip fields we've already handled
    const handledFields = [
      'id', 'name', 'email', 'bio', 'avatarUrl', 'coverUrl', 'xpBalance', 'reputation',
      'files', 'socialLinks', 'settings', 'createdAt', 'updatedAt', 'location',
      'jobTitle', 'company', 'education', 'phone', 'skills', 'interests'
    ];
    
    if (!handledFields.includes(key) && profile[key] !== undefined) {
      backendProfile[key] = profile[key];
    }
  });

  return backendProfile as Partial<BackendUserProfile>;
}
