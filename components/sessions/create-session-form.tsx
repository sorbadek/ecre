"use client"

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  Users,
  Video,
  Mic,
  Monitor,
  Globe,
  Settings,
  Save,
  X,
  Plus,
  Minus,
  Tag,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { sessionClient } from '@/lib/session-client';
import { useApiClients } from '@/lib/hooks/use-api-clients';
import type { CreateSessionInput, JitsiConfig, SessionType } from '@/lib/session-client';

interface User {
  principal?: string;
  id: string;
  email?: string;
  avatar?: string;
}

const sessionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters'),
  sessionType: z.enum(['video', 'voice', 'screen_share', 'webinar']),
  scheduledDate: z.string().min(1, 'Date is required'),
  scheduledTime: z.string().min(1, 'Time is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(480, 'Duration cannot exceed 8 hours'),
  maxAttendees: z.number().min(2, 'Must allow at least 2 attendees').max(100, 'Cannot exceed 100 attendees'),
  tags: z.array(z.string()).max(10, 'Cannot have more than 10 tags'),
  isRecordingEnabled: z.boolean(),
  // Jitsi configuration
  startWithAudioMuted: z.boolean(),
  startWithVideoMuted: z.boolean(),
  enableScreenSharing: z.boolean(),
  enableChat: z.boolean(),
  requireModerator: z.boolean(),
});

type SessionFormData = z.infer<typeof sessionSchema>;

interface CreateSessionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateSessionForm: React.FC<CreateSessionFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTag, setCurrentTag] = useState('');
  const { isAuthenticated, user, sessionClient } = useApiClients();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      title: '',
      description: '',
      sessionType: 'video',
      scheduledDate: '',
      scheduledTime: '',
      duration: 60,
      maxAttendees: 10,
      tags: [],
      isRecordingEnabled: true,
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableScreenSharing: true,
      enableChat: true,
      requireModerator: false,
    },
  });

  const watchedValues = watch();

  const sessionTypeOptions = [
    { value: 'video', label: 'Video Call', icon: Video, description: 'Full video conference with camera and audio' },
    { value: 'voice', label: 'Voice Call', icon: Mic, description: 'Audio-only conference call' },
    { value: 'screen_share', label: 'Screen Share', icon: Monitor, description: 'Screen sharing session with video/audio' },
    { value: 'webinar', label: 'Webinar', icon: Settings, description: 'Large presentation-style session' },
  ];

  const addTag = () => {
    if (currentTag.trim() && !watchedValues.tags.includes(currentTag.trim())) {
      const newTags = [...watchedValues.tags, currentTag.trim()];
      setValue('tags', newTags);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = watchedValues.tags.filter(tag => tag !== tagToRemove);
    setValue('tags', newTags);
  };

  const onSubmit = async (data: SessionFormData) => {
    if (!isAuthenticated || !user) {
      toast.error('Please authenticate first');
      return;
    }

    setIsSubmitting(true);

    try {
      const scheduledDateTime = new Date(`${data.scheduledDate}T${data.scheduledTime}`);
      // Convert to nanoseconds (1 millisecond = 1,000,000 nanoseconds)
      const scheduledTimeNs = BigInt(scheduledDateTime.getTime()) * 1_000_000n;

      // Create the session input with proper types
      const sessionInput: CreateSessionInput = {
        title: data.title,
        description: data.description || '',
        sessionType: { [data.sessionType]: null } as SessionType,
        scheduledTime: scheduledTimeNs,
        duration: BigInt(data.duration * 60), // Convert minutes to seconds
        maxAttendees: BigInt(data.maxAttendees),
        hostName: user.email || 'Anonymous',
        hostAvatar: user.avatar || '',
        tags: data.tags || [],
        isRecordingEnabled: data.isRecordingEnabled || false,
        recordSession: data.isRecordingEnabled || false,
        jitsiConfig: [{
          roomName: `peer-${Date.now()}`,
          displayName: user.email || 'Anonymous',
          email: user.email ? [user.email] : [],
          avatarUrl: user.avatar ? [user.avatar] : [],
          moderator: true,
          startWithAudioMuted: data.startWithAudioMuted || false,
          startWithVideoMuted: data.startWithVideoMuted || false,
          enableRecording: data.isRecordingEnabled || false,
          enableScreenSharing: data.enableScreenSharing !== false,
          enableChat: data.enableChat !== false,
          maxParticipants: data.maxAttendees ? [BigInt(data.maxAttendees)] : []
        }] as [JitsiConfig],
        isPrivate: data.isPrivate || false
      };

      // Create the session
      const session = await sessionClient.createSession(sessionInput);
      
      toast.success('Session created successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(`Failed to create session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 15); // Minimum 15 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Create New Session</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter session title"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe what this session is about"
                rows={3}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Session Type */}
          <div>
            <Label>Session Type *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {sessionTypeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      watchedValues.sessionType === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setValue('sessionType', option.value as any)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 mt-0.5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{option.label}</h4>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Scheduling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduledDate">Date *</Label>
              <Input
                id="scheduledDate"
                type="date"
                {...register('scheduledDate')}
                min={new Date().toISOString().split('T')[0]}
                className={errors.scheduledDate ? 'border-red-500' : ''}
              />
              {errors.scheduledDate && (
                <p className="text-sm text-red-500 mt-1">{errors.scheduledDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="scheduledTime">Time *</Label>
              <Input
                id="scheduledTime"
                type="time"
                {...register('scheduledTime')}
                className={errors.scheduledTime ? 'border-red-500' : ''}
              />
              {errors.scheduledTime && (
                <p className="text-sm text-red-500 mt-1">{errors.scheduledTime.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                {...register('duration', { valueAsNumber: true })}
                min={15}
                max={480}
                step={15}
                className={errors.duration ? 'border-red-500' : ''}
              />
              {errors.duration && (
                <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="maxAttendees">Max Attendees *</Label>
              <Input
                id="maxAttendees"
                type="number"
                {...register('maxAttendees', { valueAsNumber: true })}
                min={2}
                max={100}
                className={errors.maxAttendees ? 'border-red-500' : ''}
              />
              {errors.maxAttendees && (
                <p className="text-sm text-red-500 mt-1">{errors.maxAttendees.message}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
            {watchedValues.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {watchedValues.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>{tag}</span>
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Session Settings */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Session Settings</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <Label htmlFor="isRecordingEnabled">Enable Recording</Label>
                </div>
                <Switch
                  id="isRecordingEnabled"
                  checked={watchedValues.isRecordingEnabled}
                  onCheckedChange={(checked) => setValue('isRecordingEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <Label htmlFor="enableChat">Enable Chat</Label>
                </div>
                <Switch
                  id="enableChat"
                  checked={watchedValues.enableChat}
                  onCheckedChange={(checked) => setValue('enableChat', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4" />
                  <Label htmlFor="enableScreenSharing">Screen Sharing</Label>
                </div>
                <Switch
                  id="enableScreenSharing"
                  checked={watchedValues.enableScreenSharing}
                  onCheckedChange={(checked) => setValue('enableScreenSharing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <Label htmlFor="requireModerator">Require Moderator</Label>
                </div>
                <Switch
                  id="requireModerator"
                  checked={watchedValues.requireModerator}
                  onCheckedChange={(checked) => setValue('requireModerator', checked)}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mic className="h-4 w-4" />
                  <Label htmlFor="startWithAudioMuted">Start Audio Muted</Label>
                </div>
                <Switch
                  id="startWithAudioMuted"
                  checked={watchedValues.startWithAudioMuted}
                  onCheckedChange={(checked) => setValue('startWithAudioMuted', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <Label htmlFor="startWithVideoMuted">Start Video Muted</Label>
                </div>
                <Switch
                  id="startWithVideoMuted"
                  checked={watchedValues.startWithVideoMuted}
                  onCheckedChange={(checked) => setValue('startWithVideoMuted', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Session'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateSessionForm;
