import { useState, useEffect, useCallback } from 'react';
import { UserProfile, getMyProfile, updateProfile, uploadAvatar, uploadCover, addSocialLink, removeSocialLink, addXP } from '../lib/profile-client';
import { useAuth } from '@/lib/auth-context';

export function useUserProfile() {
  const { isAuthenticated, identity } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userProfile = await getMyProfile();
      setProfile(userProfile);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    
    try {
      const updatedProfile = await updateProfile(updates);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  const updateProfilePicture = async (file: File) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    
    try {
      const avatarUrl = await uploadAvatar(file);
      const updatedProfile = await updateProfile({ avatarUrl });
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Failed to update profile picture:', err);
      throw err;
    }
  };

  const updateCoverPhoto = async (file: File) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    
    try {
      const coverUrl = await uploadCover(file);
      const updatedProfile = await updateProfile({ coverUrl });
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Failed to update cover photo:', err);
      throw err;
    }
  };

  const addSocialMediaLink = async (platform: string, url: string) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    
    try {
      const success = await addSocialLink(platform, url);
      if (success) {
        await fetchProfile(); // Refresh profile to get updated social links
      }
      return success;
    } catch (err) {
      console.error('Failed to add social link:', err);
      throw err;
    }
  };

  const removeSocialMediaLink = async (platform: string) => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    
    try {
      const success = await removeSocialLink(platform);
      if (success) {
        await fetchProfile(); // Refresh profile to get updated social links
      }
      return success;
    } catch (err) {
      console.error('Failed to remove social link:', err);
      throw err;
    }
  };

  const awardXP = async (amount: number, reason: string, metadata: string = '') => {
    if (!isAuthenticated) throw new Error('Not authenticated');
    
    try {
      const newBalance = await addXP(amount, reason, metadata);
      // Refresh profile to get updated XP balance
      await fetchProfile();
      return newBalance;
    } catch (err) {
      console.error('Failed to award XP:', err);
      throw err;
    }
  };

  return {
    profile,
    isLoading,
    error,
    refresh: fetchProfile,
    updateProfile: updateUserProfile,
    updateProfilePicture,
    updateCoverPhoto,
    addSocialMediaLink,
    removeSocialMediaLink,
    awardXP,
  };
}
