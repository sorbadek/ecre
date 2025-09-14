"use client"

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  MonitorOff,
  MessageSquare,
  Users,
  Settings,
  Maximize,
  Minimize,
  PhoneOff,
  Play,
  Square,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import { Session } from '@/lib/session-client';
import { useApiClients } from '@/lib/use-api-clients';
import { getJibrilRecorder, JibrilRecordingConfig } from '@/lib/jibril-recorder';

// Define RecordingInfo interface locally since it's not exported from session-client
interface RecordingInfo {
  id: string;
  sessionId: string;
  status: 'recording' | 'stopped' | 'processing' | 'ready';
  startTime: bigint;
  endTime?: bigint;
  duration?: number;
  url?: string;
  size?: bigint;
}

// Jitsi Meet API types
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface JitsiMeetProps {
  session: Session;
  onLeave?: () => Promise<void>;
  onSessionEnd?: () => void;
  onRecordingStart?: (recordingInfo: RecordingInfo) => void;
  onRecordingStop?: (recordingInfo: RecordingInfo) => void;
  onParticipantJoined?: (participant: any) => void;
  onParticipantLeft?: (participant: any) => void;
}

interface JitsiParticipant {
  id: string;
  displayName: string;
  email?: string;
  avatarURL?: string;
  role: 'moderator' | 'participant';
}


const JitsiMeet: React.FC<JitsiMeetProps> = ({
  session,
  onLeave,
  onSessionEnd,
  onRecordingStart,
  onRecordingStop,
  onParticipantJoined,
  onParticipantLeft,
}) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<JitsiParticipant[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentRecording, setCurrentRecording] = useState<RecordingInfo | null>(null);
  
  // Audio/Video controls state
  const [isAudioMuted, setIsAudioMuted] = useState(session.jitsiConfig.startWithAudioMuted);
  const [isVideoMuted, setIsVideoMuted] = useState(session.jitsiConfig.startWithVideoMuted);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const { isAuthenticated, sessionClient } = useApiClients();
  const jibrilRecorder = getJibrilRecorder();

  // Load Jitsi Meet API
  useEffect(() => {
    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        setIsJitsiLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        setIsJitsiLoaded(true);
      };
      script.onerror = () => {
        toast.error('Failed to load Jitsi Meet. Please check your internet connection.');
      };
      document.head.appendChild(script);
    };

    loadJitsiScript();
  }, []);


  // Initialize Jitsi Meet
  useEffect(() => {
    if (!isJitsiLoaded || !jitsiContainerRef.current || !isAuthenticated) {
      console.log('Jitsi not loaded or container not ready:', { isJitsiLoaded, container: jitsiContainerRef.current, isAuthenticated });
      return;
    }

    console.log('Initializing Jitsi Meet with session:', session);

    try {
      const domain = 'meet.jit.si';
      const roomName = session.jitsiRoomName || `peer-${session.id}-${Date.now()}`;
      
      console.log('Creating Jitsi room:', roomName);
      
      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: session.jitsiConfig?.startWithAudioMuted ?? false,
          startWithVideoMuted: session.jitsiConfig?.startWithVideoMuted ?? false,
          disableRemoteMute: false,
          requireDisplayName: true,
          enableNoisyMicDetection: true,
          enableClosePage: true,
          disableInviteFunctions: false,
          enableWelcomePage: false,
          enableUserRolesBasedOnToken: true,
          fileRecordingsEnabled: session.jitsiConfig?.enableRecording ?? false,
          desktopSharingFrameRate: {
            min: 5,
            max: 30
          },
          maxParticipants: session.jitsiConfig?.maxParticipants ? Number(session.jitsiConfig.maxParticipants) : 20,
          startSilent: false,
          enableNoAudioDetection: true,
          resolution: 720,
          constraints: {
            video: {
              height: {
                ideal: 720,
                max: 720,
                min: 240
              }
            }
          },
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
          MOBILE_APP_PROMO: false,
          HIDE_INVITE_MORE_HEADER: false,
          DISABLE_VIDEO_BACKGROUND: false,
          DISABLE_PRESENCE_STATUS: false,
          ENABLE_DIAL_OUT: false,
          ENABLE_DIAL_IN: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'settings', 'raisehand', 'videoquality', 'filmstrip',
            'invite', 'feedback', 'stats', 'shortcuts', 'tileview', 'help'
          ],
        },
        userInfo: {
          displayName: session.jitsiConfig?.displayName || 'Anonymous',
          email: session.jitsiConfig?.email || undefined,
        },
        onload: () => {
          console.log('Jitsi Meet API loaded');
        }
      };

      console.log('Jitsi options:', options);

      const api = new window.JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      // Event listeners
      api.addEventListeners({
        videoConferenceJoined: handleConferenceJoined,
        videoConferenceLeft: handleConferenceLeft,
        participantJoined: handleParticipantJoined,
        participantLeft: handleParticipantLeft,
        audioMuteStatusChanged: handleAudioMuteStatusChanged,
        videoMuteStatusChanged: handleVideoMuteStatusChanged,
        screenSharingStatusChanged: handleScreenSharingStatusChanged,
        recordingStatusChanged: handleRecordingStatusChanged,
        chatUpdated: handleChatUpdated,
        readyToClose: () => {
          console.log('Jitsi is ready to close');
          if (onLeave) {
            onLeave();
          }
        },
        error: (error: any) => {
          console.error('Jitsi error:', error);
          toast.error(`Jitsi error: ${error?.message || 'Unknown error'}`);
        },
        connectionEstablished: () => {
          console.log('Jitsi connection established');
          setIsConnected(true);
        },
        connectionFailed: (error: any) => {
          console.error('Jitsi connection failed:', error);
          toast.error('Failed to connect to Jitsi. Please check your internet connection.');
          setIsConnected(false);
        },
      });

      // Set up recording if enabled
      if (session.jitsiConfig?.enableRecording) {
        console.log('Setting up recording...');
        // Set up recording configuration here
      }

      return () => {
        console.log('Cleaning up Jitsi instance');
        if (api) {
          try {
            api.dispose();
          } catch (e) {
            console.error('Error disposing Jitsi:', e);
          }
        }
      };
    } catch (error) {
      console.error('Error initializing Jitsi:', error);
      toast.error('Failed to initialize Jitsi Meet. Please try again.');
    }
  }, [isJitsiLoaded, isAuthenticated, session]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && currentRecording) {
      interval = setInterval(() => {
        const now = Date.now() * 1_000_000; // Convert to nanoseconds
        const startTime = Number(currentRecording.startTime);
        const duration = Math.floor((now - startTime) / 1_000_000_000); // Convert to seconds
        setRecordingDuration(duration);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording, currentRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
      // Cleanup Jibril recorder
      jibrilRecorder.cleanup();
    };
  }, [jibrilRecorder]);

  // Event handlers
  const handleConferenceJoined = useCallback((event: any) => {
    console.log('Conference joined:', event);
    setIsConnected(true);
    toast.success('Successfully joined the session!');
  }, []);

  const handleConferenceLeft = useCallback((event: any) => {
    console.log('Conference left:', event);
    setIsConnected(false);
    onSessionEnd?.();
  }, [onSessionEnd]);

  const handleParticipantJoined = useCallback((event: any) => {
    console.log('Participant joined:', event);
    const participant: JitsiParticipant = {
      id: event.id,
      displayName: event.displayName || 'Anonymous',
      email: event.email,
      avatarURL: event.avatarURL,
      role: event.role || 'participant',
    };
    
    setParticipants(prev => [...prev, participant]);
    onParticipantJoined?.(participant);
    toast.info(`${participant.displayName} joined the session`);
  }, [onParticipantJoined]);

  const handleParticipantLeft = useCallback((event: any) => {
    console.log('Participant left:', event);
    setParticipants(prev => prev.filter(p => p.id !== event.id));
    onParticipantLeft?.(event);
    toast.info(`${event.displayName || 'Someone'} left the session`);
  }, [onParticipantLeft]);

  const handleAudioMuteStatusChanged = useCallback((event: any) => {
    setIsAudioMuted(event.muted);
  }, []);

  const handleVideoMuteStatusChanged = useCallback((event: any) => {
    setIsVideoMuted(event.muted);
  }, []);

  const handleScreenSharingStatusChanged = useCallback((event: any) => {
    setIsScreenSharing(event.on);
  }, []);

  const handleRecordingStatusChanged = useCallback((event: any) => {
    console.log('Recording status changed:', event);
    // Handle Jitsi's built-in recording status changes
  }, []);

  const handleChatUpdated = useCallback((event: any) => {
    console.log('Chat updated:', event);
  }, []);

  // Control functions
  const toggleAudio = useCallback(() => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleAudio');
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleVideo');
    }
  }, []);

  const toggleScreenShare = useCallback(() => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleShareScreen');
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (jitsiApiRef.current) {
      if (isFullscreen) {
        document.exitFullscreen();
      } else {
        jitsiContainerRef.current?.requestFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  }, [isFullscreen]);

  const toggleChat = useCallback(() => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleChat');
      setIsChatOpen(!isChatOpen);
    }
  }, [isChatOpen]);

  const leaveSession = useCallback(() => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('hangup');
    }
  }, []);

  // Recording functions
  const startRecording = useCallback(async () => {
    if (!session.isRecordingEnabled) {
      toast.error('Recording is not enabled for this session');
      return;
    }

    try {
      const recordingConfig: JibrilRecordingConfig = {
        quality: '1080p',
        format: 'mp4',
        includeAudio: true,
        includeVideo: true,
        includeScreenShare: false,
        bitrate: 2500000, // 2.5 Mbps
        frameRate: 30,
      };

      // Start real Jibril recording
      const jibrilRecordingId = await jibrilRecorder.startRecording({
        ...recordingConfig,
        roomName: session.jitsiRoomName,
      });

      const recordingInfo: RecordingInfo = {
        id: jibrilRecordingId,
        sessionId: session.id,
        status: 'recording',
        startTime: BigInt(Date.now()),
      };

      setCurrentRecording(recordingInfo);
      setIsRecording(true);
      setRecordingDuration(0);
      onRecordingStart?.(recordingInfo);
      toast.success('Recording started successfully!');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording: ' + (error as Error).message);
    }
  }, [session, jibrilRecorder, onRecordingStart]);

  const stopRecording = useCallback(async () => {
    if (!currentRecording) return;

    try {
      // Stop real Jibril recording
      await jibrilRecorder.stopRecording(currentRecording.id);

      // Get recording info from Jibril
      const jibrilInfo = await jibrilRecorder.getRecordingInfo(currentRecording.id);

      const stoppedRecording: RecordingInfo = {
        ...currentRecording,
        status: 'stopped',
        endTime: BigInt(Date.now()),
        duration: jibrilInfo.duration || recordingDuration,
        url: jibrilInfo.url,
        size: jibrilInfo.size ? BigInt(jibrilInfo.size) : undefined,
      };

      setIsRecording(false);
      onRecordingStop?.(stoppedRecording);
      toast.success('Recording stopped successfully!');
      
      // Get recording URL after processing
      setTimeout(async () => {
        try {
          const recordingUrl = await jibrilRecorder.getRecordingUrl(currentRecording.id);
          console.log('Recording available at:', recordingUrl);
          
          // Update recording with final URL
          const finalRecording: RecordingInfo = {
            ...stoppedRecording,
            status: 'ready',
            url: recordingUrl,
          };
          
          setCurrentRecording(finalRecording);
          toast.success('Recording is ready for download!');
        } catch (error) {
          console.error('Error getting recording URL:', error);
          toast.error('Recording completed but URL retrieval failed');
        }
      }, 2000); // Wait 2 seconds for processing
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to stop recording: ' + (error as Error).message);
    }
  }, [currentRecording, recordingDuration, jibrilRecorder, onRecordingStop]);

  const formatRecordingDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isJitsiLoaded) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <CardContent>
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading video conference...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden">
      {/* Session Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-white font-semibold">{session.title}</h3>
            <p className="text-gray-300 text-sm">{session.description}</p>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-gray-300">
            <Users className="h-4 w-4" />
            <span className="text-sm">{participants.length + 1}</span>
          </div>
          
          {isRecording && (
            <div className="flex items-center space-x-2 bg-red-600 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">
                REC {formatRecordingDuration(recordingDuration)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Audio Control */}
          <Button
            variant={isAudioMuted ? "destructive" : "secondary"}
            size="sm"
            onClick={toggleAudio}
            className="p-2"
          >
            {isAudioMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          {/* Video Control */}
          <Button
            variant={isVideoMuted ? "destructive" : "secondary"}
            size="sm"
            onClick={toggleVideo}
            className="p-2"
          >
            {isVideoMuted ? <VideoOff className="h-4 w-4" /> : <VideoIcon className="h-4 w-4" />}
          </Button>

          {/* Screen Share */}
          {session.jitsiConfig.enableScreenSharing && (
            <Button
              variant={isScreenSharing ? "default" : "secondary"}
              size="sm"
              onClick={toggleScreenShare}
              className="p-2"
            >
              {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
            </Button>
          )}

          {/* Chat */}
          {session.jitsiConfig.enableChat && (
            <Button
              variant={isChatOpen ? "default" : "secondary"}
              size="sm"
              onClick={toggleChat}
              className="p-2"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Recording Controls */}
          {session.isRecordingEnabled && (
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="sm"
              onClick={isRecording ? stopRecording : startRecording}
              className="flex items-center space-x-2"
            >
              {isRecording ? (
                <>
                  <Square className="h-4 w-4" />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Start Recording</span>
                </>
              )}
            </Button>
          )}

          {/* Fullscreen */}
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleFullscreen}
            className="p-2"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>

          {/* Leave Session */}
          <Button
            variant="destructive"
            size="sm"
            onClick={leaveSession}
            className="flex items-center space-x-2"
          >
            <PhoneOff className="h-4 w-4" />
            <span>Leave</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JitsiMeet;
