import { useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { sessionClient } from '@/lib/session-client';

export const useApiClients = () => {
  const { isAuthenticated, user } = useAuth();

  return useMemo(
    () => ({
      isAuthenticated,
      user,
      sessionClient,
    }),
    [isAuthenticated, user]
  );
};
