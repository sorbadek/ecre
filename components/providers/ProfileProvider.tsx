import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useUserProfile } from '../../hooks/useUserProfile';
import { UserProfile } from '../../lib/profile-client';
import { useAuth } from '../../lib/auth-context';

type ProfileContextType = {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  updateProfilePicture: (file: File) => Promise<UserProfile>;
  updateCoverPhoto: (file: File) => Promise<UserProfile>;
  addSocialMediaLink: (platform: string, url: string) => Promise<boolean>;
  removeSocialMediaLink: (platform: string) => Promise<boolean>;
  awardXP: (amount: number, reason: string, metadata?: string) => Promise<number>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const {
    profile,
    isLoading,
    error,
    refresh,
    updateProfile,
    updateProfilePicture,
    updateCoverPhoto,
    addSocialMediaLink,
    removeSocialMediaLink,
    awardXP,
  } = useUserProfile();

  // Refresh profile when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    }
  }, [isAuthenticated, refresh]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        refreshProfile: refresh,
        updateProfile,
        updateProfilePicture,
        updateCoverPhoto,
        addSocialMediaLink,
        removeSocialMediaLink,
        awardXP,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
