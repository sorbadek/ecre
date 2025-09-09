import { type Identity, AnonymousIdentity } from "@dfinity/agent"
import { ActorSubclass } from "@dfinity/agent"
import { idlFactory } from "./ic/notifications.idl"
import { createActor, NOTIFICATIONS_CANISTER_ID } from "./ic/agent"

// Define types based on the IDL
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
  description: string;
  timestamp: bigint;
  isRead: boolean;
  expiresAt?: bigint;
}

// Define the service interface based on the IDL
export interface NotificationsService {
  createActivity: (activityType: ActivityType, title: string, description: [] | [string]) => 
    Promise<{ ok: string } | { err: string }>;
  generateSampleActivities: () => Promise<{ ok: string } | { err: string }>;
  getMyActivities: (limit: [] | [bigint]) => Promise<Array<{
    id: string;
    userId: any; // Principal
    activityType: ActivityType;
    title: string;
    description: string;
    timestamp: bigint;
    isRead: boolean;
    expiresAt?: bigint;
  }>>;
  markActivityAsRead: (activityId: string) => Promise<{ ok: Activity } | { err: string }>;
  getUnreadCount: () => Promise<bigint>;
  cleanupExpiredActivities: () => Promise<{ ok: string } | { err: string }>;
}

export class NotificationsClient {
  private actor: ActorSubclass<NotificationsService> | null = null;
  private identity: Identity | null = null;

  // Set the identity from the auth context
  public setIdentity(identity: Identity | null): void {
    this.identity = identity;
    // Clear the actor when identity changes to force recreation
    this.actor = null;
  }

  private async getActor(): Promise<ActorSubclass<NotificationsService>> {
    if (this.actor) return this.actor;

    try {
      this.actor = await createActor<NotificationsService>({
        canisterId: NOTIFICATIONS_CANISTER_ID,
        idlFactory,
        identity: this.identity || new AnonymousIdentity()
      });
      return this.actor;
    } catch (error) {
      console.error('Failed to create actor:', error);
      throw new Error('Failed to initialize notifications client');
    }
  }

  async createActivity(
    activityType: ActivityType,
    title: string,
    description: string = ''
  ): Promise<string> {
    try {
      const actor = await this.getActor();
      const result = await actor.createActivity(activityType, title, description ? [description] : []);
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err || 'Failed to create activity');
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error instanceof Error ? error : new Error('Failed to create activity');
    }
  }

  async getActivities(limit?: bigint): Promise<Activity[]> {
    try {
      const actor = await this.getActor();
      const result = await actor.getMyActivities(limit ? [limit] : []);
      
      return result.map(activity => ({
        id: activity.id,
        userId: activity.userId.toString(),
        activityType: activity.activityType,
        title: activity.title,
        description: activity.description,
        timestamp: activity.timestamp,
        isRead: activity.isRead,
        expiresAt: activity.expiresAt
      }));
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch activities');
    }
  }

  async markActivityAsRead(activityId: string): Promise<Activity | null> {
    try {
      const actor = await this.getActor();
      const result = await actor.markActivityAsRead(activityId);
      
      if ('ok' in result) {
        const activity = result.ok;
        return {
          ...activity,
          userId: activity.userId.toString()
        };
      } else {
        throw new Error(result.err || 'Failed to mark activity as read');
      }
    } catch (error) {
      console.error('Error marking activity as read:', error);
      throw error instanceof Error ? error : new Error('Failed to mark activity as read');
    }
  }

  async generateSampleActivities(): Promise<string> {
    try {
      const actor = await this.getActor();
      const result = await actor.generateSampleActivities();
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err || 'Failed to generate sample activities');
      }
    } catch (error) {
      console.error('Error generating sample activities:', error);
      throw error instanceof Error ? error : new Error('Failed to generate sample activities');
    }
  }

  async getUnreadCount(): Promise<bigint> {
    try {
      const actor = await this.getActor();
      return await actor.getUnreadCount();
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error instanceof Error ? error : new Error('Failed to get unread count');
    }
  }

  async cleanupExpiredActivities(): Promise<string> {
    try {
      const actor = await this.getActor();
      const result = await actor.cleanupExpiredActivities();
      
      if ('ok' in result) {
        return result.ok;
      } else {
        throw new Error(result.err || 'Failed to clean up expired activities');
      }
    } catch (error) {
      console.error('Error cleaning up expired activities:', error);
      throw error instanceof Error ? error : new Error('Failed to clean up expired activities');
    }
  }
}

// Export a single instance of NotificationsClient
const notificationsClient = new NotificationsClient();

export { notificationsClient };
