import { Actor, type Identity } from "@dfinity/agent"
import { idlFactory } from "./ic/learning-analytics.idl"
import { getAgent, LEARNING_ANALYTICS_CANISTER_ID, createActor } from "./ic/agent"

// Host configuration
const isLocal = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

console.log('Learning Analytics client initialized in', isLocal ? 'local' : 'production', 'mode');

export interface LearningSession {
  id: string
  userId: string
  contentId: string
  contentType: string
  startTime: bigint
  endTime?: bigint
  duration: number  // Changed to number since Motoko Int maps to number in JS
  completed: boolean
  progress: number
  xpEarned: number  // Changed to number since Motoko Int maps to number in JS
  date: string
}

export interface CourseProgress {
  userId: string
  courseId: string
  courseName: string
  totalLessons: number
  completedLessons: number
  totalDuration: number  // Changed to number
  timeSpent: number     // Changed to number
  lastAccessed: bigint
  completionRate: number
  xpEarned: number      // Changed to number
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
    if (!this.actor) {
      this.actor = await createActor({
        canisterId: LEARNING_ANALYTICS_CANISTER_ID,
        idlFactory,
        identity: this.identity || undefined
      })
    }
    return this.actor
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
      const result = await actor.endLearningSession(
        sessionId, 
        completed, 
        progress, 
        xpEarned
      )
      if ("ok" in result) {
        return {
          ...result.ok,
          userId: result.ok.userId.toString(),
          endTime: result.ok.endTime?.[0] // Handle optional endTime
        }
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
    status: 'not_started' | 'in_progress' | 'completed' | 'paused',
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
        return {
          ...result.ok,
          userId: result.ok.userId.toString()
        }
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
      return {
        ...result,
        userId: result.userId.toString()
      }
    } catch (error) {
      console.error("Error getting weekly stats:", error)
      throw error
    }
  }

  async getCourseStats(): Promise<CourseStats> {
    try {
      const actor = await this.getActor()
      const result = await actor.getCourseStats()
      return {
        ...result,
        userId: result.userId.toString()
      }
    } catch (error) {
      console.error("Error getting course stats:", error)
      throw error
    }
  }

  async getMySessions(): Promise<LearningSession[]> {
    try {
      const actor = await this.getActor()
      const result = await actor.getMySessions()
      return result.map((session: any) => ({
        ...session,
        userId: session.userId.toString(),
        endTime: session.endTime?.[0] // Unwrap optional endTime
      }))
    } catch (error) {
      console.error("Error getting sessions:", error)
      return []
    }
  }

  async getMyCourseProgress(): Promise<CourseProgress[]> {
    try {
      const actor = await this.getActor()
      const result = await actor.getMyCourseProgress()
      return result.map((progress: any) => ({
        ...progress,
        userId: progress.userId.toString()
      }))
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