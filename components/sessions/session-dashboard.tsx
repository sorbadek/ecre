"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Video,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Play,
  Settings,
  FileVideo,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Trash2,
  Edit,
  MoreVertical,
} from 'lucide-react';
import { Session, SessionStatus, SessionType } from '@/lib/session-client';
import { useApiClients } from '@/lib/use-api-clients';
import CreateSessionForm from './create-session-form';
import JitsiMeet from './jitsi-meet';
import SessionRecordings from './session-recordings';

interface SessionDashboardProps {
  className?: string;
}

interface CreateSessionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface JitsiMeetProps {
  session: Session;
  onLeave?: () => Promise<void>;
}

const SessionDashboard: React.FC<SessionDashboardProps> = ({ className }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all-sessions');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJitsiMeet, setShowJitsiMeet] = useState(false);
  
  const { sessionClient, isAuthenticated, loading: authLoading, user } = useApiClients();

  useEffect(() => {
    if (!authLoading && isAuthenticated && sessionClient) {
      loadSessions();
    }
  }, [isAuthenticated, authLoading, sessionClient]);

  useEffect(() => {
    filterSessions();
  }, [sessions, activeTab, statusFilter, searchTerm]);

  const loadSessions = async () => {
    if (!isAuthenticated || !sessionClient) return;

    setLoading(true);
    try {
      const allSessions = await sessionClient.getMySessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = sessions;

    // Filter by tab
    if (activeTab === 'live-sessions') {
      filtered = filtered.filter(session => {
        const status = getSessionStatusKey(session.status);
        return status === 'live';
      });
    } else if (activeTab === 'scheduled-sessions') {
      filtered = filtered.filter(session => {
        const status = getSessionStatusKey(session.status);
        return status === 'scheduled';
      });
    } else if (activeTab === 'my-sessions') {
      // Already filtered by user in getMySessions
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(session => {
        const status = getSessionStatusKey(session.status);
        return status === statusFilter;
      });
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(session => {
        const type = getSessionTypeKey(session.sessionType);
        return type === typeFilter;
      });
    }

    setFilteredSessions(filtered);
  };

  const getSessionStatusKey = (status: SessionStatus): string => {
    if ('scheduled' in status) return 'scheduled';
    if ('live' in status) return 'live';
    if ('completed' in status) return 'completed';
    if ('cancelled' in status) return 'cancelled';
    if ('recording' in status) return 'recording';
    return 'unknown';
  };

  const getSessionTypeKey = (type: SessionType): string => {
    if ('video' in type) return 'video';
    if ('voice' in type) return 'voice';
    if ('screen_share' in type) return 'screen_share';
    if ('webinar' in type) return 'webinar';
    return 'unknown';
  };

  const getStatusBadgeVariant = (status: SessionStatus) => {
    const statusKey = getSessionStatusKey(status);
    switch (statusKey) {
      case 'live': return 'destructive';
      case 'recording': return 'destructive';
      case 'scheduled': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: SessionStatus): string => {
    if (!sessionClient) return 'Unknown';
    return sessionClient.getSessionStatusLabel(status);
  };

  const getTypeIcon = (type: SessionType) => {
    const typeKey = getSessionTypeKey(type);
    switch (typeKey) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'voice': return <Mic className="h-4 w-4" />;
      case 'screen_share': return <Monitor className="h-4 w-4" />;
      case 'webinar': return <Globe className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: SessionType): string => {
    if (!sessionClient) return 'Unknown';
    return sessionClient.getSessionTypeLabel(type);
  };

  const handleJoinSession = async (session: Session) => {
    console.log('handleJoinSession called with session:', {
      sessionId: session?.id,
      sessionTitle: session?.title,
      hasClient: !!sessionClient
    });

    if (!sessionClient) {
      const errorMsg = 'Session client is not available';
      console.error(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!session?.id) {
      const errorMsg = `Cannot join session: Invalid session ID. Session object: ${JSON.stringify(session)}`;
      console.error(errorMsg);
      toast.error('Cannot join session: Invalid session data');
      return;
    }
    
    try {
      console.log('Attempting to join session with ID:', session.id);
      const result = await sessionClient.joinSession(session.id);
      console.log('Successfully joined session:', {
        sessionId: result.session.id,
        isModerator: result.isModerator
      });
      
      setSelectedSession(session);
      setShowJitsiMeet(true);
      toast.success('Joined session successfully');
      loadSessions(); // Refresh to update participant count
    } catch (error) {
      const errorDetails = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : String(error);
      
      console.error('Error joining session:', {
        error: errorDetails,
        sessionId: session?.id,
        timestamp: new Date().toISOString()
      });
      
      const errorMessage = error instanceof Error 
        ? `Failed to join session: ${error.message}` 
        : 'An unknown error occurred while joining the session';
      
      toast.error(errorMessage);
      
      // Always refresh the sessions list on error as the session data might be stale
      console.log('Refreshing sessions list due to error...');
      loadSessions();
    }
  };

  const handleLeaveSession = async (sessionId: string) => {
    if (!sessionClient) return;
    
    try {
      await sessionClient.leaveSession(sessionId);
      setShowJitsiMeet(false);
      setSelectedSession(null);
      toast.success('Left session successfully');
      loadSessions(); // Refresh to update participant count
    } catch (error) {
      console.error('Error leaving session:', error);
      toast.error('Failed to leave session');
    }
  };

  const isSessionOwner = (session: Session): boolean => {
    if (!user?.principal) {
      console.log('No user principal available');
      return false;
    }
    try {
      // Convert both to strings for comparison
      const hostPrincipal = typeof session.host === 'string' 
        ? session.host 
        : session.host.toString();
      const userPrincipal = user.principal.toString();
      
      const isOwner = hostPrincipal === userPrincipal;
      
      console.log('Session owner check:', {
        sessionId: session.id,
        host: hostPrincipal,
        currentUser: userPrincipal,
        isOwner
      });
      
      return isOwner;
    } catch (error) {
      console.error('Error checking session owner:', error);
      return false;
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!sessionClient) return;
    
    try {
      const confirmed = window.confirm('Are you sure you want to delete this session? This action cannot be undone.');
      if (!confirmed) return;
      
      await sessionClient.deleteSession(sessionId);
      toast.success('Session deleted successfully');
      loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const handleCopyMeetingUrl = async (meetingUrl: string) => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      toast.success('Meeting URL copied to clipboard');
    } catch (error) {
      console.error('Error copying URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  const handleUpdateSession = async (sessionId: string, updates: Partial<Session>) => {
    if (!sessionClient) return;
    
    try {
      // Convert the updates to match CreateSessionInput format
      const updateInput: any = {};
      
      if (updates.title !== undefined) updateInput.title = updates.title;
      if (updates.description !== undefined) updateInput.description = updates.description;
      if (updates.scheduledTime !== undefined) updateInput.scheduledTime = updates.scheduledTime;
      if (updates.duration !== undefined) updateInput.duration = updates.duration;
      if (updates.maxAttendees !== undefined) updateInput.maxAttendees = updates.maxAttendees;
      if (updates.tags !== undefined) updateInput.tags = updates.tags;
      if (updates.recordSession !== undefined) updateInput.recordSession = updates.recordSession;
      
      await sessionClient.updateSession(sessionId, updateInput);
      toast.success('Session updated successfully');
      loadSessions();
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update session');
    }
  };

  const handleCopySessionUrl = (session: Session) => {
    const url = `${window.location.origin}/sessions/${session.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Session URL copied to clipboard');
  };

  const handleStartRecording = async (sessionId: string) => {
    if (!sessionClient) return;
    
    try {
      await sessionClient.startRecording(sessionId);
      toast.success('Recording started');
      loadSessions();
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const handleStopRecording = async (sessionId: string) => {
    if (!sessionClient) return;
    
    try {
      await sessionClient.stopRecording(sessionId);
      toast.success('Recording stopped');
      loadSessions();
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to stop recording');
    }
  };

  const formatDate = (timestamp: bigint): string => {
    try {
      // Convert nanoseconds to milliseconds for JavaScript Date
      const milliseconds = Number(timestamp) / 1_000_000;
      const date = new Date(milliseconds);
      
      // Format the date and time in a user-friendly way
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatDuration = (startTime: bigint, endTime?: bigint): string => {
    if (!endTime) return 'Ongoing';
    
    try {
      // Convert nanoseconds to seconds
      const durationNs = endTime - startTime;
      const durationSecs = Number(durationNs) / 1_000_000_000;
      
      const hours = Math.floor(durationSecs / 3600);
      const minutes = Math.floor((durationSecs % 3600) / 60);
      const seconds = Math.floor(durationSecs % 60);

      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    } catch (error) {
      console.error('Error formatting duration:', error);
      return 'Unknown';
    }
  };

  const canJoinSession = (session: Session): boolean => {
    const status = getSessionStatusKey(session.status);
    return status === 'live' || status === 'scheduled';
  };


  // Show loading state while auth is loading or sessionClient is not ready
  if (authLoading || !sessionClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-sky-600/70">Initializing session client...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-sky-600/70 mb-4">Please sign in to access sessions</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className={className}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Sessions</h2>
            <p className="text-gray-600">Manage your video sessions and recordings</p>
          </div>
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Session
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
              </DialogHeader>
              <CreateSessionForm
                onSuccess={() => {
                  setShowCreateForm(false);
                  loadSessions();
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all-sessions">All Sessions</TabsTrigger>
            <TabsTrigger value="live-sessions">Live Sessions</TabsTrigger>
            <TabsTrigger value="scheduled-sessions">Scheduled</TabsTrigger>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
          </TabsList>

          <TabsContent value="all-sessions" className="space-y-6">
            <SessionsContent
              sessions={filteredSessions}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              onJoinSession={handleJoinSession}
              onDeleteSession={handleDeleteSession}
              onCopyMeetingUrl={handleCopyMeetingUrl}
              getStatusBadgeVariant={getStatusBadgeVariant}
              getStatusLabel={getStatusLabel}
              getTypeIcon={getTypeIcon}
              getTypeLabel={getTypeLabel}
              formatDate={formatDate}
              formatDuration={formatDuration}
              canJoinSession={canJoinSession}
              isSessionOwner={isSessionOwner}
            />
          </TabsContent>

          <TabsContent value="live-sessions" className="space-y-6">
            <SessionsContent
              sessions={filteredSessions}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              onJoinSession={handleJoinSession}
              onDeleteSession={handleDeleteSession}
              onCopyMeetingUrl={handleCopyMeetingUrl}
              getStatusBadgeVariant={getStatusBadgeVariant}
              getStatusLabel={getStatusLabel}
              getTypeIcon={getTypeIcon}
              getTypeLabel={getTypeLabel}
              formatDate={formatDate}
              formatDuration={formatDuration}
              canJoinSession={canJoinSession}
              isSessionOwner={isSessionOwner}
            />
          </TabsContent>

          <TabsContent value="scheduled-sessions" className="space-y-6">
            <SessionsContent
              sessions={filteredSessions}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              onJoinSession={handleJoinSession}
              onDeleteSession={handleDeleteSession}
              onCopyMeetingUrl={handleCopyMeetingUrl}
              getStatusBadgeVariant={getStatusBadgeVariant}
              getStatusLabel={getStatusLabel}
              getTypeIcon={getTypeIcon}
              getTypeLabel={getTypeLabel}
              formatDate={formatDate}
              formatDuration={formatDuration}
              canJoinSession={canJoinSession}
              isSessionOwner={isSessionOwner}
            />
          </TabsContent>

          <TabsContent value="recordings" className="space-y-6">
            <SessionRecordings showAllRecordings={true} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Jitsi Meet Modal */}
      {showJitsiMeet && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50">
          <JitsiMeet
            session={selectedSession}
            onLeave={() => handleLeaveSession(selectedSession.id)}
          />
        </div>
      )}
    </>
  );
};

interface SessionsContentProps {
  sessions: Session[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  typeFilter: string;
  setTypeFilter: (filter: string) => void;
  onJoinSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
  onCopyMeetingUrl: (url: string) => void;
  getStatusBadgeVariant: (status: SessionStatus) => any;
  getStatusLabel: (status: SessionStatus) => string;
  getTypeIcon: (type: SessionType) => React.ReactNode;
  getTypeLabel: (type: SessionType) => string;
  formatDate: (timestamp: bigint) => string;
  formatDuration: (startTime: bigint, endTime?: bigint) => string;
  canJoinSession: (session: Session) => boolean;
  isSessionOwner: (session: Session) => boolean;
}

const SessionsContent: React.FC<SessionsContentProps> = ({
  sessions,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  onJoinSession,
  onDeleteSession,
  onCopyMeetingUrl,
  getStatusBadgeVariant,
  getStatusLabel,
  getTypeIcon,
  getTypeLabel,
  formatDate,
  formatDuration,
  canJoinSession,
  isSessionOwner,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        {/* Filters */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="screen_share">Screen Share</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No sessions found</p>
            <p className="text-sm">Create your first session to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Session Type Icon */}
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getTypeIcon(session.sessionType)}
                      </div>

                      {/* Session Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{session.title}</h4>
                          <Badge variant={getStatusBadgeVariant(session.status)}>
                            {getStatusLabel(session.status)}
                          </Badge>
                          <Badge variant="outline">
                            {getTypeLabel(session.sessionType)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{session.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(session.scheduledTime)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>
                              {typeof session.participantCount === 'number' 
                                ? `${session.participantCount} participant${session.participantCount !== 1 ? 's' : ''}`
                                : '0 participants'}
                            </span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(session.scheduledTime, session.actualEndTime || undefined)}</span>
                          </span>
                        </div>
                        {session.tags.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            {session.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Session Actions */}
                    <div className="flex items-center space-x-2">
                      {session.meetingUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onCopyMeetingUrl(session.meetingUrl || '')}
                          className="text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" /> Copy Link
                        </Button>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onJoinSession(session)}
                        disabled={!canJoinSession(session)}
                        className="text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" /> Join
                      </Button>
                      {isSessionOwner(session) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDeleteSession(session.id)}
                          className="text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionDashboard;
