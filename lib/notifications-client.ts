import { Actor, HttpAgent, AnonymousIdentity } from "@dfinity/agent"
import { useAuth } from "./auth-context"
import { idlFactory } from "./ic/notifications.idl"

// Notifications canister ID - local development
export const NOTIFICATIONS_CANISTER_ID = "bd3sg-teaaa-aaaaa-qaaba-cai"

// Host configuration
const isLocal = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")

// For local development, use port 4943 to match the deployment configuration
const HOST = isLocal 
  ? "http://127.0.0.1:4943"  // Using port 4943 to match deployment
  : "https://ic0.app"

console.log('Notifications client initialized with host:', HOST)

export type ActivityType = 
  | { comment: null }
  | { quiz_completed: null }
  | { deadline_approaching: null }
  | { course_available: null }
  | { achievement_earned: null }
  | { session_joined: null }
  | { partner_request: null }
  | { system_update: null };

export interface Activity {
  id: string;
  userId: string;
  activityType: ActivityType;
  title: string;
  description?: string;
  metadata?: string;
  timestamp: bigint;
  priority: number;
  isRead: boolean;
  expiresAt?: bigint;
}

export interface NotificationPreferences {
  userId: string;
  activityTypes: ActivityType[];
  weeklyDigest: boolean;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  pushNotifications: boolean;
}

class NotificationsClient {
  private actor: any = null;
  private identity: any = null;

  // Set the identity from the auth context
  public setIdentity(identity: any) {
    this.identity = identity;
    // Clear the actor when identity changes to force recreation
    this.actor = null;
  }

  private async getActor() {
    if (this.actor) return this.actor;

    try {
      // Use the provided identity or fall back to anonymous
      const identity = this.identity || new AnonymousIdentity();
      
      const agent = new HttpAgent({
        identity,
        host: HOST,
        verifyQuerySignatures: false,
      });

      console.log('Connecting to notifications canister:', NOTIFICATIONS_CANISTER_ID);
      console.log('Using host:', HOST);

      // For local development, fetch root key
      if (isLocal) {
        try {
          await agent.fetchRootKey();
          console.log('Successfully fetched root key for local development');
        } catch (error) {
          console.warn('Failed to fetch root key:', error);
        }
      }

      // Create the actor
      this.actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: NOTIFICATIONS_CANISTER_ID,
      });

      return this.actor;
    } catch (error) {
      console.error('Error in getActor:', error);
      throw error;
    }
  }

  async createActivity(
    activityType: ActivityType,
    title: string,
    description?: string,
    metadata?: string,
    priority: number = 1,
    expiresAt?: bigint
  ): Promise<Activity> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");

      const result = await actor.createActivity({
        activityType,
        title,
        description: description ? [description] : [],
        metadata: metadata ? [metadata] : [],
        priority,
        expiresAt: expiresAt ? [expiresAt] : [],
      });

      if ("ok" in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  }

  async getMyActivities(limit: number = 10): Promise<Activity[]> {
    try {
      // First try to get the actor
      let actor;
      try {
        actor = await this.getActor();
        if (!actor) {
          console.warn('No actor available, returning fallback activities');
          return this.getFallbackActivities();
        }
      } catch (authError) {
        console.warn('Error getting actor, using fallback activities:', authError);
        return this.getFallbackActivities();
      }

      console.log(`Fetching activities with limit: ${limit}`);
      
      try {
        // For optional Nat parameters, we need to use an array with 0 or 1 elements
        const limitParam = limit > 0 ? [BigInt(limit)] : [];
        console.log('Calling getMyActivities with limit:', limitParam);
        const result = await actor.getMyActivities(limitParam);
        
        if (!Array.isArray(result)) {
          console.warn('Unexpected result format from canister, expected array:', result);
          return this.getFallbackActivities();
        }
        
        // Ensure each activity has all required fields with proper types
        return result.map(activity => ({
          id: activity.id?.toString() || '',
          userId: activity.userId?.toString() || '',
          activityType: activity.activityType || { system_update: null },
          title: activity.title?.toString() || 'New Activity',
          description: activity.description?.toString(),
          metadata: activity.metadata?.toString(),
          timestamp: activity.timestamp ? BigInt(activity.timestamp.toString()) : BigInt(0),
          priority: typeof activity.priority === 'number' ? activity.priority : 1,
          isRead: !!activity.isRead,
          expiresAt: activity.expiresAt ? BigInt(activity.expiresAt.toString()) : undefined
        }));
      } catch (callError) {
        console.error('Error calling getMyActivities:', callError);
        return this.getFallbackActivities();
      }
    } catch (error) {
      console.error('Error in getMyActivities:', error);
      // Return fallback activities but don't mask the error completely
      const fallback = this.getFallbackActivities();
      console.warn('Using fallback activities due to error');
      return fallback;
    }
  }

  async markActivityAsRead(activityId: string): Promise<Activity> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");

      const result = await actor.markActivityAsRead(activityId);
      if ("ok" in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error marking activity as read:", error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const actor = await this.getActor();
      if (!actor) return 0;

      const count = await actor.getUnreadCount();
      return Number(count);
    } catch (error) {
      console.warn("Error getting unread count:", error);
      return 0;
    }
  }

  async generateSampleActivities(): Promise<string> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");

      const result = await actor.generateSampleActivities();
      if ("ok" in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error generating sample activities:", error);
      throw error;
    }
  }

  async updatePreferences(
    emailNotifications: boolean,
    inAppNotifications: boolean,
    pushNotifications: boolean,
    weeklyDigest: boolean,
    activityTypes: ActivityType[]
  ): Promise<NotificationPreferences> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");

      const result = await actor.updatePreferences({
        emailNotifications,
        inAppNotifications,
        pushNotifications,
        weeklyDigest,
        activityTypes,
      });

      if ("ok" in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      throw error;
    }
  }

  async getMyPreferences(): Promise<NotificationPreferences | null> {
    try {
      const actor = await this.getActor();
      if (!actor) return null;

      const result = await actor.getMyPreferences();
      return result[0] || null;
    } catch (error) {
      console.error("Error getting preferences:", error);
      return null;
    }
  }

  async cleanupExpiredActivities(): Promise<number> {
    try {
      const actor = await this.getActor();
      if (!actor) return 0;

      const result = await actor.cleanupExpiredActivities();
      if ("ok" in result) {
        return Number(result.ok);
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error cleaning up expired activities:", error);
      throw error;
    }
  }

  private getFallbackActivities(): Activity[] {
    const now = BigInt(Date.now() * 1000000);
    return [
      {
        id: "1",
        userId: "anonymous",
        activityType: { quiz_completed: null },
        title: "Quiz Completed",
        description: "You completed the React Fundamentals quiz with 95% score!",
        metadata: JSON.stringify({ score: 95, quiz: "react-fundamentals" }),
        timestamp: now - BigInt(3600000000000), // 1 hour ago
        priority: 2,
        isRead: false,
      },
      {
        id: "2",
        userId: "anonymous",
        activityType: { achievement_earned: null },
        title: "Achievement Unlocked",
        description: "You earned the 'Fast Learner' badge for completing 5 lessons in one day!",
        metadata: JSON.stringify({ badge: "fast-learner", xp: 100 }),
        timestamp: now - BigInt(7200000000000), // 2 hours ago
        priority: 3,
        isRead: false,
      },
      {
        id: "3",
        userId: "anonymous",
        activityType: { course_available: null },
        title: "New Course Available",
        description: "Advanced TypeScript course is now available in your learning path.",
        metadata: JSON.stringify({ course: "advanced-typescript", instructor: "Jane Doe" }),
        timestamp: now - BigInt(10800000000000), // 3 hours ago
        priority: 1,
        isRead: true,
      },
      {
        id: "4",
        userId: "anonymous",
        activityType: { session_joined: null },
        title: "Study Session Joined",
        description: "You joined the 'React Patterns' study group session.",
        metadata: JSON.stringify({ session: "react-patterns", host: "John Smith" }),
        timestamp: now - BigInt(14400000000000), // 4 hours ago
        priority: 1,
        isRead: true,
      },
      {
        id: "5",
        userId: "anonymous",
        activityType: { comment: null },
        title: "New Comment",
        description: "Sarah Chen commented on your project submission.",
        metadata: JSON.stringify({ project: "final-project", commentId: "cmt123" }),
        timestamp: now - BigInt(18000000000000), // 5 hours ago
        priority: 1,
        isRead: true,
      },
    ];
  }
}

// Export a single instance of NotificationsClient
const notificationsClient = new NotificationsClient();
export { notificationsClient };
