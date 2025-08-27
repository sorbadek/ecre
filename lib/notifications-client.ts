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
    const actor = await this.getActor();
    if (!actor) {
      throw new Error('Failed to initialize actor');
    }

    console.log(`Fetching activities with limit: ${limit}`);
    
    // For optional Nat parameters, we need to use an array with 0 or 1 elements
    const limitParam = limit > 0 ? [BigInt(limit)] : [];
    console.log('Calling getMyActivities with limit:', limitParam);
    
    const result = await actor.getMyActivities(limitParam);
    
    if (!Array.isArray(result)) {
      throw new Error('Unexpected result format from canister');
    }
    
    // Ensure each activity has all required fields with proper types
    return result.map(activity => ({
      id: activity.id?.toString() || '',
      userId: activity.userId?.toString() || '',
      activityType: activity.activityType || { system_update: null },
      title: activity.title?.toString() || '',
      description: activity.description?.toString(),
      metadata: activity.metadata?.toString(),
      timestamp: activity.timestamp ? BigInt(activity.timestamp.toString()) : BigInt(0),
      priority: typeof activity.priority === 'number' ? activity.priority : 1,
      isRead: !!activity.isRead,
      expiresAt: activity.expiresAt ? BigInt(activity.expiresAt.toString()) : undefined
    }));
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

}

// Export a single instance of NotificationsClient
const notificationsClient = new NotificationsClient();
export { notificationsClient };
