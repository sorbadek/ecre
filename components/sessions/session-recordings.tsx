"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Play,
  Pause,
  Download,
  Eye,
  Calendar,
  Clock,
  FileVideo,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Share2,
  Copy,
  ExternalLink,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  RotateCcw,
} from 'lucide-react';
import { RecordingInfo, RecordingStatus, getSessionsClient } from '@/lib/sessions-client';
import { useApiClients } from '@/lib/use-api-clients';

interface SessionRecordingsProps {
  sessionId?: string; // If provided, show recordings for specific session
  showAllRecordings?: boolean; // If true, show all user's recordings
}

interface VideoPlayerProps {
  recording: RecordingInfo;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ recording, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVolume;
    setVolume(newVolume);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!recording.recordingUrl) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">Recording URL not available</p>
            <Button onClick={onClose}>Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div ref={containerRef} className="w-full h-full max-w-6xl max-h-4xl relative">
        {/* Video Element */}
        <video
          ref={videoRef}
          src={recording.recordingUrl}
          className="w-full h-full object-contain"
          poster={recording.thumbnailUrl || undefined}
        />

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-4">
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-white text-sm mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => skip(-10)}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => skip(10)}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>

        {/* Recording Info Overlay */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white p-3 rounded-lg">
          <h3 className="font-semibold">{recording.sessionId}</h3>
          <p className="text-sm opacity-90">
            {recording.quality} • {recording.format.toUpperCase()}
          </p>
          {recording.fileSize && (
            <p className="text-sm opacity-90">
              {(Number(recording.fileSize) / (1024 * 1024)).toFixed(1)} MB
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const SessionRecordings: React.FC<SessionRecordingsProps> = ({
  sessionId,
  showAllRecordings = false,
}) => {
  const [recordings, setRecordings] = useState<RecordingInfo[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<RecordingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecording, setSelectedRecording] = useState<RecordingInfo | null>(null);
  
  const { isAuthenticated } = useApiClients();
  const sessionsClient = getSessionsClient();

  useEffect(() => {
    loadRecordings();
  }, [sessionId, showAllRecordings, isAuthenticated]);

  useEffect(() => {
    filterRecordings();
  }, [recordings, searchTerm, statusFilter]);

  const loadRecordings = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      let recordingsData: RecordingInfo[] = [];

      if (sessionId) {
        recordingsData = await sessionsClient.getSessionRecordings(sessionId);
      } else if (showAllRecordings) {
        recordingsData = await sessionsClient.getMyRecordings();
      }

      setRecordings(recordingsData);
    } catch (error) {
      console.error('Error loading recordings:', error);
      toast.error('Failed to load recordings');
    } finally {
      setLoading(false);
    }
  };

  const filterRecordings = () => {
    let filtered = recordings;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(recording =>
        recording.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recording.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(recording => {
        const status = getRecordingStatusKey(recording.status);
        return status === statusFilter;
      });
    }

    setFilteredRecordings(filtered);
  };

  const getRecordingStatusKey = (status: RecordingStatus): string => {
    if ('not_started' in status) return 'not_started';
    if ('recording' in status) return 'recording';
    if ('processing' in status) return 'processing';
    if ('completed' in status) return 'completed';
    if ('failed' in status) return 'failed';
    return 'unknown';
  };

  const getStatusBadgeVariant = (status: RecordingStatus) => {
    const statusKey = getRecordingStatusKey(status);
    switch (statusKey) {
      case 'completed': return 'default';
      case 'recording': return 'destructive';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: RecordingStatus): string => {
    return sessionsClient.getRecordingStatusLabel(status);
  };

  const handleDownload = async (recording: RecordingInfo) => {
    if (!recording.recordingUrl) {
      toast.error('Recording URL not available');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = recording.recordingUrl;
      link.download = `recording_${recording.id}.${recording.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading recording:', error);
      toast.error('Failed to download recording');
    }
  };

  const handleShare = async (recording: RecordingInfo) => {
    if (!recording.recordingUrl) {
      toast.error('Recording URL not available');
      return;
    }

    try {
      await navigator.clipboard.writeText(recording.recordingUrl);
      toast.success('Recording URL copied to clipboard');
    } catch (error) {
      console.error('Error copying URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  const formatFileSize = (bytes: bigint | null): string => {
    if (!bytes) return 'Unknown';
    const mb = Number(bytes) / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDuration = (seconds: bigint | null): string => {
    if (!seconds) return 'Unknown';
    const totalSeconds = Number(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: bigint): string => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileVideo className="h-5 w-5" />
            <span>
              {sessionId ? 'Session Recordings' : 'My Recordings'}
            </span>
            <Badge variant="outline">{recordings.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search recordings..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="recording">Recording</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recordings List */}
          {filteredRecordings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileVideo className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No recordings found</p>
              <p className="text-sm">
                {recordings.length === 0 
                  ? 'No recordings have been created yet.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecordings.map((recording) => (
                <Card key={recording.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Thumbnail */}
                        <div className="w-20 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {recording.thumbnailUrl ? (
                            <img
                              src={recording.thumbnailUrl}
                              alt="Recording thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileVideo className="h-6 w-6 text-gray-400" />
                          )}
                        </div>

                        {/* Recording Info */}
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{recording.sessionId}</h4>
                            <Badge variant={getStatusBadgeVariant(recording.status)}>
                              {getStatusLabel(recording.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(recording.startTime)}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(recording.duration)}</span>
                            </span>
                            <span>{recording.quality} • {recording.format.toUpperCase()}</span>
                            <span>{formatFileSize(recording.fileSize)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {getRecordingStatusKey(recording.status) === 'completed' && recording.recordingUrl && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRecording(recording)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Play
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(recording)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShare(recording)}
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                          </>
                        )}
                        {getRecordingStatusKey(recording.status) === 'processing' && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            <span>Processing...</span>
                          </div>
                        )}
                        {getRecordingStatusKey(recording.status) === 'failed' && (
                          <Badge variant="destructive">Failed</Badge>
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

      {/* Video Player Modal */}
      {selectedRecording && (
        <VideoPlayer
          recording={selectedRecording}
          onClose={() => setSelectedRecording(null)}
        />
      )}
    </>
  );
};

export default SessionRecordings;
