import { Actor, HttpAgent } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import { idlFactory } from "./ic/learning-analytics.idl"

const LEARNING_ANALYTICS_CANISTER_ID = "bkyz2-fmaaa-aaaaa-qaaaq-cai"

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

class LearningAnalyticsClient {
  private actor: any = null

  private async getActor() {
    if (this.actor) return this.actor

    const authClient = await AuthClient.create()
    const identity = authClient.getIdentity()

    const host =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
        ? "http://127.0.0.1:4943"
        : "https://ic0.app"

    const agent = new HttpAgent({
      identity,
      host,
    })

    if (host.includes("127.0.0.1")) {
      await agent.fetchRootKey()
    }

    this.actor = Actor.createActor(idlFactory, {
      agent,
      canisterId: LEARNING_ANALYTICS_CANISTER_ID,
    })

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
      // Return fallback data if canister call fails
      return {
        userId: "anonymous",
        weekDates: ["SAT", "SUN", "MON", "TUE", "WED", "THU", "FRI"],
        dailyHours: [2.5, 4.2, 3.8, 5.1, 4.7, 3.2, 4.8],
        totalHours: 28.3,
        averageHours: 4.04,
      }
    }
  }

  async getCourseStats(): Promise<CourseStats> {
    try {
      const actor = await this.getActor()
      const result = await actor.getCourseStats()
      return result
    } catch (error) {
      console.error("Error getting course stats:", error)
      // Return fallback data if canister call fails
      return {
        userId: "anonymous",
        completed: 3,
        inProgress: 2,
        paused: 1,
        notStarted: 1,
        totalCourses: 7,
        overallCompletionRate: 65,
      }
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

export const learningAnalyticsClient = new LearningAnalyticsClient()
