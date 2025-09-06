import { Actor, HttpAgent, AnonymousIdentity } from "@dfinity/agent"
import { getIdentity } from "./ic/agent"
import { idlFactory } from "./ic/notifications.idl"
import { Principal } from "@dfinity/principal"
import { IDL } from "@dfinity/candid"

// Notifications canister ID - local development
export const NOTIFICATIONS_CANISTER_ID = "l62sy-yx777-77777-aaabq-cai"

// Host configuration
const isLocal = typeof window !== "undefined" && 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")

const HOST = isLocal 
  ? "http://127.0.0.1:4943"
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
  marketingEmails?: boolean;
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

      const result = await actor.createActivity(
        activityType,
        title,
        description ? [description] : [],
        metadata ? [metadata] : [],
        BigInt(priority),
        expiresAt ? [BigInt(expiresAt)] : []
      );

      if ("ok" in result) {
        return {
          ...result.ok,
          id: result.ok.id.toString(),
          userId: result.ok.userId.toString(),
          timestamp: BigInt(result.ok.timestamp.toString()),
          expiresAt: result.ok.expiresAt ? BigInt(result.ok.expiresAt.toString()) : undefined
        };
      } else {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  }

  async getActivities(limit: number = 10, offset: number = 0): Promise<Activity[]> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");
      
      // Use getMyActivities which is the actual method in the canister
      const result = await actor.getMyActivities(BigInt(limit));
      
      if (Array.isArray(result)) {
        return result.map((activity: any) => ({
          id: activity.id,
          userId: activity.userId.toString(),
          activityType: activity.activityType,
          title: activity.title,
          description: activity.description?.[0],
          metadata: activity.metadata?.[0],
          timestamp: activity.timestamp,
          priority: 1, // Default priority since it's not in the canister
          isRead: activity.isRead,
          expiresAt: activity.expiresAt?.[0]
        }));
      }
      return [];
    } catch (error) {
      console.error("Error getting activities:", error);
      return [];
    }
  }

  async markAsRead(activityId: string): Promise<void> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");
      await actor.markAsRead(activityId);
    } catch (error) {
      console.error("Error marking activity as read:", error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");
      await actor.markAllAsRead();
    } catch (error) {
      console.error("Error marking all as read:", error);
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
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  async deleteActivity(activityId: string): Promise<void> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");
      await actor.deleteActivity(activityId);
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  }

  async getActivity(activityId: string): Promise<Activity | null> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");
      
      const result = await actor.getActivity(activityId);
      
      if ("ok" in result) {
        return {
          ...result.ok,
          id: result.ok.id.toString(),
          userId: result.ok.userId.toString(),
          timestamp: BigInt(result.ok.timestamp.toString()),
          expiresAt: result.ok.expiresAt ? BigInt(result.ok.expiresAt.toString()) : undefined
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting activity:", error);
      return null;
    }
  }

  async updateNotificationPreferences(prefs: Partial<NotificationPreferences>): Promise<void> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");
      
      // Check if the method exists before calling it
      if (typeof actor.updateNotificationPreferences === 'function') {
        const currentPrefs = await this.getNotificationPreferences();
        const updatedPrefs = {
          ...currentPrefs,
          ...prefs,
          userId: this.identity?.getPrincipal()?.toString() || ""
        };
        
        await actor.updateNotificationPreferences(updatedPrefs);
      } else {
        console.warn("updateNotificationPreferences not implemented in canister, using local storage");
        // Store preferences in local storage as a fallback
        const userId = this.identity?.getPrincipal()?.toString();
        if (userId) {
          const key = `notifications_prefs_${userId}`;
          localStorage.setItem(key, JSON.stringify(prefs));
        }
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      // Don't throw error since this is a non-critical feature
    }
  }

  async getNotificationPreferences(): Promise<NotificationPreferences> {
    // Return default preferences since this method is not implemented in the canister
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");
      
      // Check if the method exists before calling it
      if (typeof actor.getNotificationPreferences === 'function') {
        const result = await actor.getNotificationPreferences();
        if ("ok" in result) {
          return result.ok;
        } else {
          console.warn("Error in getNotificationPreferences:", result.err);
        }
      }
      
      // Return default preferences
      return {
        userId: this.identity?.getPrincipal()?.toString() || "",
        activityTypes: [
          { comment: null },
          { quiz_completed: null },
          { deadline_approaching: null },
          { course_available: null },
          { achievement_earned: null },
          { session_joined: null },
          { partner_request: null },
          { system_update: null }
        ],
        weeklyDigest: true,
        emailNotifications: true,
        inAppNotifications: true,
        pushNotifications: true
      };
    } catch (error) {
      console.error("Error in getNotificationPreferences:", error);
      // Return default preferences on error
      return {
        userId: this.identity?.getPrincipal()?.toString() || "",
        activityTypes: [],
        weeklyDigest: true,
        emailNotifications: true,
        inAppNotifications: true,
        pushNotifications: true
      };
    }
  }

  async cleanupExpiredActivities(): Promise<void> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");
      await actor.cleanupExpiredActivities();
    } catch (error) {
      console.error("Error cleaning up expired activities:", error);
      throw error;
    }
  }

  // Helper method for backward compatibility
  async getMyActivities(limit: number = 10): Promise<Activity[]> {
    return this.getActivities(limit, 0);
  }
}

// Export a single instance of NotificationsClient
const notificationsClient = new NotificationsClient();

export { notificationsClient };
