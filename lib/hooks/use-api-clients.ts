import { useMemo, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sessionClient } from '@/lib/session-client';
import { socialClient } from '@/lib/social-client';

export const useApiClients = () => {
  const { isAuthenticated, user, identity } = useAuth();

  // Update social client when authentication state changes
  useEffect(() => {
    if (isAuthenticated && identity) {
      socialClient.setIdentity(identity);
    } else {
      socialClient.setIdentity(null);
    }
  }, [isAuthenticated, identity]);

  return useMemo(
    () => ({
      isAuthenticated,
      user,
      sessionClient,
      socialClient,
      identity
    }),
    [isAuthenticated, user, identity]
  );
};
