'use client'

import { useMemo, useEffect, useState } from 'react'
import { useAuth } from './auth-context'
import { SessionClient } from './session-client'
import { learningAnalyticsClient, LearningAnalyticsClient } from './learning-analytics-client'
import { Identity } from '@dfinity/agent'
import { notificationsClient } from './notifications-client'
import { socialClient } from './social-client'
import { AuthClient } from '@dfinity/auth-client'

interface ApiClients {
  sessionClient: SessionClient | null;
  learningAnalyticsClient: LearningAnalyticsClient | null;
  socialClient: typeof socialClient | null;
  isAuthenticated: boolean;
  loading: boolean;
  clientsInitialized: boolean; // New state to signal readiness
  user: {
    principal?: string;
    id: string;
  } | null;
}

// Create a single instance of SessionClient
const sessionClientInstance = new SessionClient();

export function useApiClients(): ApiClients {
  const { user, isAuthenticated, loading, authClient } = useAuth();
  const [clientsInitialized, setClientsInitialized] = useState(false);

  const identity = useMemo(() => {
    try {
      if (!isAuthenticated || !authClient) {
        console.log('[useApiClients] No auth client or not authenticated');
        return null;
      }
      const id = authClient.getIdentity();
      if (!id) {
        console.warn('[useApiClients] No identity available from auth client');
        return null;
      }
      const principal = id.getPrincipal();
      if (!principal) {
        console.warn('[useApiClients] Could not get principal from identity');
        return null;
      }
      console.log('[useApiClients] User authenticated with principal:', principal.toString());
      return id;
    } catch (error) {
      console.error('[useApiClients] Error getting identity:', error);
      return null;
    }
  }, [isAuthenticated, authClient]);

  useEffect(() => {
    if (loading) {
      setClientsInitialized(false);
      return;
    }

    const initializeClients = async () => {
      try {
        if (!identity) {
          console.warn('[useApiClients] No identity available, cannot initialize clients');
          setClientsInitialized(true);
          return;
        }

        const principal = identity.getPrincipal();
        if (!principal) {
          console.warn('[useApiClients] No principal available from identity');
          setClientsInitialized(true);
          return;
        }

        console.log('[useApiClients] Initializing clients with principal:', principal.toString());
        
        // Set identity for all clients
        try {
          sessionClientInstance.setIdentity(identity);
          notificationsClient.setIdentity(identity);
          socialClient.setIdentity(identity);
          learningAnalyticsClient.setIdentity(identity);
          
          // Verify session client is working
          try {
            console.log('[useApiClients] Testing session client...');
            const sessions = await sessionClientInstance.getAllSessions();
            console.log(`[useApiClients] Session client ready, found ${sessions?.length || 0} sessions`);
          } catch (error) {
            console.error('[useApiClients] Session client test failed:', error);
            // Continue anyway - the client might still work for some operations
          }
          
          setClientsInitialized(true);
        } catch (error) {
          console.error('[useApiClients] Error setting up clients:', error);
          setClientsInitialized(false);
        }
      } catch (error) {
        console.error('[useApiClients] Error initializing clients:', error);
        setClientsInitialized(false);
      }
    };
    
    initializeClients();
  }, [identity, loading])

  const clients = useMemo(() => {
    if (!isAuthenticated || !user?.principal || !identity) {
      return {
        sessionClient: null,
        learningAnalyticsClient: null,
        socialClient: null,
        isAuthenticated: false,
        loading,
        clientsInitialized,
        user: null,
      }
    }

    return {
      sessionClient: sessionClientInstance,
      learningAnalyticsClient,
      socialClient: socialClient,
      isAuthenticated,
      loading,
      clientsInitialized,
      user: {
        principal: user.principal,
        id: user.id,
      },
    }
  }, [isAuthenticated, user, loading, identity])

  return clients
}
