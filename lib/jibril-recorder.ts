// Real Jibril Recording SDK Implementation
// This implements actual video recording functionality using MediaRecorder API

export interface JibrilRecordingConfig {
  quality: '720p' | '1080p' | '4K';
  format: 'mp4' | 'webm';
  includeAudio: boolean;
  includeVideo: boolean;
  includeScreenShare: boolean;
  bitrate?: number;
  frameRate?: number;
}

export interface JibrilRecording {
  id: string;
  status: 'recording' | 'stopped' | 'processing' | 'ready' | 'error';
  startTime: number;
  endTime?: number;
  duration?: number;
  url?: string;
  size?: number;
  config: JibrilRecordingConfig;
}

export class JibrilRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private currentRecording: JibrilRecording | null = null;
  private stream: MediaStream | null = null;

  constructor() {
    this.checkBrowserSupport();
  }

  private checkBrowserSupport(): void {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      throw new Error('Browser does not support media recording');
    }
  }

  async startRecording(config: JibrilRecordingConfig & { roomName?: string }): Promise<string> {
    try {
      // Get media stream based on configuration
      this.stream = await this.getMediaStream(config);
      
      // Configure MediaRecorder options
      const options = this.getRecorderOptions(config);
      
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.recordedChunks = [];

      // Create recording session
      const recordingId = `jibril_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.currentRecording = {
        id: recordingId,
        status: 'recording',
        startTime: Date.now(),
        config,
      };

      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.handleRecordingStop();
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        if (this.currentRecording) {
          this.currentRecording.status = 'error';
        }
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      
      console.log(`Jibril recording started: ${recordingId}`);
      return recordingId;

    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(recordingId: string): Promise<void> {
    if (!this.mediaRecorder || !this.currentRecording || this.currentRecording.id !== recordingId) {
      throw new Error('No active recording found with the provided ID');
    }

    if (this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }

    // Stop all tracks in the stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  private async getMediaStream(config: JibrilRecordingConfig): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
      audio: config.includeAudio,
      video: config.includeVideo ? {
        width: this.getVideoWidth(config.quality),
        height: this.getVideoHeight(config.quality),
        frameRate: config.frameRate || 30,
      } : false,
    };

    let stream: MediaStream;

    if (config.includeScreenShare) {
      // Screen sharing takes priority
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: this.getVideoWidth(config.quality),
          height: this.getVideoHeight(config.quality),
          frameRate: config.frameRate || 30,
        },
        audio: config.includeAudio,
      });
    } else {
      // Regular camera/microphone recording
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    }

    return stream;
  }

  private getRecorderOptions(config: JibrilRecordingConfig): MediaRecorderOptions {
    const mimeType = config.format === 'mp4' 
      ? 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"'
      : 'video/webm; codecs="vp8, opus"';

    const options: MediaRecorderOptions = {
      mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : 'video/webm',
    };

    if (config.bitrate) {
      options.videoBitsPerSecond = config.bitrate;
    }

    return options;
  }

  private getVideoWidth(quality: string): number {
    switch (quality) {
      case '720p': return 1280;
      case '1080p': return 1920;
      case '4K': return 3840;
      default: return 1920;
    }
  }

  private getVideoHeight(quality: string): number {
    switch (quality) {
      case '720p': return 720;
      case '1080p': return 1080;
      case '4K': return 2160;
      default: return 1080;
    }
  }

  private handleRecordingStop(): void {
    if (!this.currentRecording) return;

    const blob = new Blob(this.recordedChunks, { 
      type: this.recordedChunks[0]?.type || 'video/webm' 
    });

    this.currentRecording.endTime = Date.now();
    this.currentRecording.duration = this.currentRecording.endTime - this.currentRecording.startTime;
    this.currentRecording.size = blob.size;
    this.currentRecording.status = 'processing';

    // Create object URL for the recording
    this.currentRecording.url = URL.createObjectURL(blob);
    this.currentRecording.status = 'ready';

    console.log('Recording completed:', this.currentRecording);
  }

  async getRecordingUrl(recordingId: string): Promise<string> {
    if (!this.currentRecording || this.currentRecording.id !== recordingId) {
      throw new Error('Recording not found');
    }

    if (this.currentRecording.status !== 'ready') {
      throw new Error('Recording is not ready yet');
    }

    return this.currentRecording.url || '';
  }

  async getRecordingInfo(recordingId: string): Promise<JibrilRecording> {
    if (!this.currentRecording || this.currentRecording.id !== recordingId) {
      throw new Error('Recording not found');
    }

    return { ...this.currentRecording };
  }

  async uploadRecording(recordingId: string, uploadUrl?: string): Promise<string> {
    const recording = await this.getRecordingInfo(recordingId);
    
    if (!recording.url) {
      throw new Error('Recording URL not available');
    }

    // If upload URL is provided, upload to external service
    if (uploadUrl) {
      const response = await fetch(recording.url);
      const blob = await response.blob();
      
      const formData = new FormData();
      formData.append('video', blob, `recording_${recordingId}.${recording.config.format}`);
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload recording');
      }
      
      const result = await uploadResponse.json();
      return result.url || result.downloadUrl || uploadUrl;
    }

    // Return the blob URL for local use
    return recording.url;
  }

  cleanup(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }

    if (this.currentRecording?.url) {
      URL.revokeObjectURL(this.currentRecording.url);
    }

    this.mediaRecorder = null;
    this.stream = null;
    this.currentRecording = null;
    this.recordedChunks = [];
  }
}

// Singleton instance
let jibrilRecorderInstance: JibrilRecorder | null = null;

export function getJibrilRecorder(): JibrilRecorder {
  if (!jibrilRecorderInstance) {
    jibrilRecorderInstance = new JibrilRecorder();
  }
  return jibrilRecorderInstance;
}

export default JibrilRecorder;
