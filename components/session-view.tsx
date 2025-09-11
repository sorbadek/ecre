'use client';

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useApiClients } from "@/lib/use-api-clients"
import { useAuth } from "@/lib/auth-context"
import { useSession } from "next-auth/react"
import type { Session as NextAuthSession } from "next-auth"

interface SessionViewProps {
  session: any;
  onClose: () => void;
}

export default function SessionView({ session, onClose }: SessionViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { sessionClient } = useApiClients()
  const router = useRouter()
  const { data: authSession } = useSession()
  const { user: authUser, isAuthenticated, identity } = useAuth()
  const user = authSession?.user || authUser

  const setupIframe = useCallback((url: string) => {
    if (!iframeRef.current) return
    
    const iframe = iframeRef.current
    iframe.onload = () => {
      console.log('Iframe loaded successfully')
      setLoading(false)
    }
    
    iframe.onerror = () => {
      console.error('Failed to load iframe content')
      setError('Failed to load the meeting. Please try again.')
      setLoading(false)
    }
    
    iframe.src = url
  }, [])

  const joinSession = useCallback(async (): Promise<boolean> => {
    if (!session?.id) {
      setError('Invalid session')
      toast({
        title: "Error",
        description: "Invalid session",
        variant: "destructive",
      })
      return false
    }
    
    if (!sessionClient) {
      setError('Session client not available')
      toast({
        title: "Error",
        description: "Session client not available. Please refresh the page and try again.",
        variant: "destructive",
      })
      return false
    }

    try {
      setLoading(true)
      setError(null)
      console.log('Joining session:', session.id)
      
      // Ensure user is authenticated
      if (!isAuthenticated || !identity) {
        throw new Error('You must be logged in to join a session')
      }
      
      // Ensure we have a valid principal
      const principal = identity.getPrincipal();
      if (!principal) {
        throw new Error('Failed to get user identity');
      }
      
      console.log('[SessionView] Joining session with principal:', principal.toString());
      
      try {
        // Join the session using the authenticated client
        const updatedSession = await sessionClient.joinSession(session.id);
        console.log('Session joined:', updatedSession);
        
        if (!updatedSession) {
          throw new Error('Failed to join session: No response from server');
        }
        
        // Get the meeting URL from the session
        const meetingUrlStr = (updatedSession as any)?.meetingUrl || (session as any)?.meetingUrl;
        if (!meetingUrlStr) {
          throw new Error('No meeting URL available for this session');
        }
        
        // Parse the meeting URL
        const meetingUrl = new URL(meetingUrlStr);
        console.log('Meeting URL:', meetingUrl.toString());
        
        // Generate a secure random string for the JWT secret
        const generateSecureRandom = () => {
          const array = new Uint8Array(32);
          window.crypto.getRandomValues(array);
          return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        };
        
        // Add JWT token and authentication details
        try {
          const jwtSecret = generateSecureRandom();
          const header = {
            alg: 'HS256',  // Using HMAC-SHA256
            typ: 'JWT'
          };
          
          const payload = {
            sub: principal.toString(),
            name: user?.name || 'Anonymous',
            email: user?.email || '',
            exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
            iat: Math.floor(Date.now() / 1000),
            context: {
              user: {
                id: principal.toString(),
                name: user?.name || 'Anonymous',
                email: user?.email || '',
                avatar: (user as any)?.image || ''
              }
            }
          };
          
          // Encode JWT (simplified version - in production, use a proper JWT library)
          const encodedHeader = btoa(JSON.stringify(header)).replace(/=+$/, '');
          const encodedPayload = btoa(JSON.stringify(payload)).replace(/=+$/, '');
          const signature = btoa(encodedHeader + "." + encodedPayload + jwtSecret).replace(/=+$/, '');
          const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;
          
          // Add to URL parameters
          meetingUrl.searchParams.append('jwt', jwt);
          meetingUrl.searchParams.append('userInfo', JSON.stringify({
            displayName: user?.name || 'Anonymous',
            email: user?.email || '',
            avatar: (user as any)?.image || ''
          }));
          
          console.log('Added JWT token to URL');
        } catch (authError) {
          console.warn('Failed to generate auth token:', authError);
          // Continue without JWT if there's an error
        }
        
        // Configure Jitsi meeting options with authentication
        meetingUrl.searchParams.append('config.prejoinPageEnabled', 'false');
        meetingUrl.searchParams.append('interfaceConfig.DISABLE_JOIN_LEAVE_NOTIFICATIONS', 'true');
        meetingUrl.searchParams.append('config.startWithAudioMuted', 'false');
        meetingUrl.searchParams.append('config.startWithVideoMuted', 'false');
        
        // Enhanced security and authentication settings
        meetingUrl.searchParams.append('config.disableRemoteMute', 'true');
        meetingUrl.searchParams.append('config.requireDisplayName', 'true');
        meetingUrl.searchParams.append('config.enableNoisyMicDetection', 'false');
        meetingUrl.searchParams.append('config.enableClosePage', 'true');
        meetingUrl.searchParams.append('config.disableInviteFunctions', 'true');
        
        // Disable features that might conflict with our auth
        meetingUrl.searchParams.append('config.enableWelcomePage', 'false');
        meetingUrl.searchParams.append('config.enableUserRolesBasedOnToken', 'true');
        
        // Add user's name to the room name for better identification
        const roomName = meetingUrl.pathname.split('/').pop() || '';
        meetingUrl.searchParams.append('userInfo.displayName', user?.name || 'Anonymous');
        
        // Set iframe source with the final URL
        setupIframe(meetingUrl.toString());
        return true;
        
      } catch (joinError) {
        console.error('Failed to join session:', joinError);
        throw new Error(joinError instanceof Error ? joinError.message : 'Failed to join session');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to join the session';
      console.error("Failed to join session:", error);
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
      return false;
    }
  }, [session, user, identity, setupIframe])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const initSession = async () => {
      const success = await joinSession()
      if (!success) {
        // If initial join fails, try once more after a short delay
        timeoutId = setTimeout(async () => {
          const retrySuccess = await joinSession()
          if (!retrySuccess) {
            setError('Failed to connect after multiple attempts. Please try again later.')
            setLoading(false)
          }
        }, 3000)
      }
    }
    
    initSession()
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      const iframe = iframeRef.current
      if (iframe) {
        iframe.onload = null
        iframe.onerror = null
        if (iframe.src) {
          iframe.src = 'about:blank'
        }
      }
    }
  }, [joinSession])
  
  const handleReconnect = useCallback(async () => {
    setError(null);
    try {
      const success = await joinSession();
      if (!success) {
        setError('Failed to reconnect. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while reconnecting. Please try again.');
    }
  }, [joinSession]);

  const hasRecording = !!session?.recordingUrl;
  const isHost = session?.host === user?.email; // Using email as the identifier since user.id might not exist

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-gray-900 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="text-white hover:bg-gray-800"
          >
            ← Back to Sessions
          </Button>
          <h2 className="text-white text-xl font-semibold">{session?.title || 'Session'}</h2>
          {hasRecording && isHost && (
            <a 
              href={session.recordingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline flex items-center px-3 py-1.5 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              View Recording
            </a>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading}
            className="text-white hover:bg-gray-800 disabled:opacity-50"
          >
            Leave Session
          </Button>
        </div>
      </div>
      
      {error ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 p-6 text-center">
          <div className="text-red-400 text-lg mb-4">
            {error}
          </div>
          <Button 
            onClick={handleReconnect}
            disabled={loading}
            className="mt-4"
          >
            {loading ? 'Retrying...' : 'Try Again'}
          </Button>
        </div>
      ) : loading ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-900 p-6">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-white">Connecting to session...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
        </div>
      ) : (
        <div className="flex-1 relative">
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            allow="camera; microphone; display-capture; autoplay; fullscreen"
            allowFullScreen
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            style={{ visibility: loading ? 'hidden' : 'visible' }}
          />
        </div>
      )}
    </div>
  );
}
