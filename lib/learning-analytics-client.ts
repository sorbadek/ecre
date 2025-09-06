import { Actor, HttpAgent, Identity } from "@dfinity/agent"
import { idlFactory } from "./ic/learning-analytics.idl"

const LEARNING_ANALYTICS_CANISTER_ID = "lz3um-vp777-77777-aaaba-cai"

// Host configuration
const isLocal = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const HOST = isLocal 
  ? "http://127.0.0.1:4943"  // Using port 4943 for local development
  : "https://ic0.app";

console.log('Learning Analytics client configured with host:', HOST);

export interface LearningSession {
  id: string
  userId: string
  contentId: string
  contentType: string
  startTime: bigint
  endTime?: bigint
  duration: bigint  // Changed from number to bigint to match Motoko Int
  completed: boolean
  progress: number
  xpEarned: bigint  // Changed from number to bigint to match Motoko Int
  date: string
}

export interface CourseProgress {
  userId: string
  courseId: string
  courseName: string
  totalLessons: number
  completedLessons: number
  totalDuration: bigint  // Changed from number to bigint to match Motoko Int
  timeSpent: bigint     // Changed from number to bigint to match Motoko Int
  lastAccessed: bigint
  completionRate: number
  xpEarned: bigint      // Changed from number to bigint to match Motoko Int
  status: string
}

export interface WeeklyStats {
  userId: string
  weekDates: string[]
  dailyHours: number[]
  totalHours: number
  averageHours: number
}

export interface CourseStats {
  userId: string
  completed: number
  inProgress: number
  paused: number
  notStarted: number
  totalCourses: number
  overallCompletionRate: number
}

export class LearningAnalyticsClient {
  private actor: any = null
  private identity: Identity | null = null

  constructor(identity: Identity | null = null) {
    this.identity = identity
  }

  setIdentity(identity: Identity | null) {
    this.identity = identity
    this.actor = null // Reset actor to be re-created with the new identity
  }

  private async getActor() {
    if (this.actor) return this.actor;

    if (!this.identity) {
      // Optionally, handle the case where there's no identity.
      // For now, we'll let it proceed, and HttpAgent will use an anonymous identity.
      console.warn("LearningAnalyticsClient is using an anonymous identity.");
    }

    console.log('Initializing learning analytics client with host:', HOST);
    
    try {
      // Configure agent with explicit API version for local development
      const agent = new HttpAgent({
        identity: this.identity || undefined,
        host: HOST,
        // Force API v2 for local development
        ...(isLocal && { _agent: { _host: { origin: HOST, protocol: 'http:' } } })
      });

      if (isLocal) {
        try {
          await agent.fetchRootKey();
          console.log('Successfully fetched root key for local development');
        } catch (error) {
          console.warn('Failed to fetch root key:', error);
          // Even if root key fetch fails, we can still proceed in most cases
        }
      }

      this.actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: LEARNING_ANALYTICS_CANISTER_ID,
      });

      return this.actor;
    } catch (error) {
      console.error('Failed to initialize actor:', error);
      throw new Error('Failed to initialize learning analytics client');
    }
  }

  async startLearningSession(contentId: string, contentType: string): Promise<string> {
    try {
      const actor = await this.getActor()
      const result = await actor.startLearningSession(contentId, contentType)
      if ("ok" in result) {
        return result.ok
      } else {
        throw new Error(result.err)
      }
    } catch (error) {
      console.error("Error starting learning session:", error)
      throw error
    }
  }

  async endLearningSession(
    sessionId: string,
    completed: boolean,
    progress: number,
    xpEarned: number,
  ): Promise<LearningSession> {
    try {
      const actor = await this.getActor()
      const result = await actor.endLearningSession(sessionId, completed, progress, xpEarned)
      if ("ok" in result) {
        return result.ok
      } else {
        throw new Error(result.err)
      }
    } catch (error) {
      console.error("Error ending learning session:", error)
      throw error
    }
  }

  async updateCourseProgress(
    courseId: string,
    courseName: string,
    totalLessons: number,
    completedLessons: number,
    timeSpent: number,
    xpEarned: number,
    status: string,
  ): Promise<CourseProgress> {
    try {
      const actor = await this.getActor()
      const result = await actor.updateCourseProgress(
        courseId,
        courseName,
        totalLessons,
        completedLessons,
        timeSpent,
        xpEarned,
        status,
      )
      if ("ok" in result) {
        return result.ok
      } else {
        throw new Error(result.err)
      }
    } catch (error) {
      console.error("Error updating course progress:", error)
      throw error
    }
  }

  async getWeeklyStats(): Promise<WeeklyStats> {
    try {
      const actor = await this.getActor()
      const result = await actor.getWeeklyStats()
      return result
    } catch (error) {
      console.error("Error getting weekly stats:", error)
      throw error
    }
  }

  async getCourseStats(): Promise<CourseStats> {
    try {
      const actor = await this.getActor()
      const result = await actor.getCourseStats()
      return result
    } catch (error) {
      console.error("Error getting course stats:", error)
      throw error
    }
  }

  async getMySessions(): Promise<LearningSession[]> {
    try {
      const actor = await this.getActor()
      const result = await actor.getMySessions()
      return result
    } catch (error) {
      console.error("Error getting sessions:", error)
      return []
    }
  }

  async getMyCourseProgress(): Promise<CourseProgress[]> {
    try {
      const actor = await this.getActor()
      const result = await actor.getMyCourseProgress()
      return result
    } catch (error) {
      console.error("Error getting course progress:", error)
      return []
    }
  }

  async generateSampleData(): Promise<string> {
    try {
      const actor = await this.getActor()
      const result = await actor.generateSampleData()
      if ("ok" in result) {
        return result.ok
      } else {
        throw new Error(result.err)
      }
    } catch (error) {
      console.error("Error generating sample data:", error)
      throw error
    }
  }
}


// Create a singleton instance of the client
export const learningAnalyticsClient = new LearningAnalyticsClient();

