// Type declarations for the application

// Extend the global Window interface if needed
declare global {
  interface Window {
    // Add any global window properties here if needed
  }

  // Type assertion for the profile client module
declare module '@/lib/profile-client' {
  import { UserProfile as BackendUserProfile } from '@/lib/ic/user-profile.idl';
  
  export function getMyProfile(): Promise<BackendUserProfile | null>;
  export function updateMyProfile(profile: Partial<BackendUserProfile>): Promise<BackendUserProfile>;
  export function uploadAvatar(file: File): Promise<{ url: string }>;
  export function uploadCover(file: File): Promise<{ url: string }>;
}

// Type assertion for the user profile IDL
declare module '@/lib/ic/user-profile.idl' {
  export interface UserProfile {
    id: string;
    name: string;
    email: string;
    bio: string;
    avatarUrl: string;
    coverUrl: string;
    xpBalance: bigint;
    reputation: bigint;
    files: UserFile[];
    socialLinks: [string, string][];
    settings: UserSettings;
    createdAt: bigint;
    updatedAt: bigint;
  }

  export interface UserFile {
    id: string;
    filename: string;
    contentType: string;
    url: string;
    size: bigint;
    category: string;
    tags: string[];
    uploadedAt: bigint;
  }

  export interface UserSettings {
    theme: string;
    notifications: boolean;
    emailNotifications: boolean;
    privacy: string;
    language: string;
    profileVisibility: string;
    socialLinks: [string, string][];
  }
}
}

export {}; 
