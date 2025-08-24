import { Actor, HttpAgent } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import { idlFactory } from "./ic/social.idl"

const SOCIAL_CANISTER_ID = "bw4dl-smaaa-aaaaa-qaacq-cai"

export interface PartnerProfile {
  principal: string
  name: string
  role: string
  xp: number
  onlineStatus: "online" | "away" | "offline"
  avatarColor: string
  initials: string
  lastActive: bigint
  studyStreak: number
  completedCourses: number
  joinedAt: bigint
}

export interface PartnerRequest {
  id: string
  from: string
  to: string
  message?: string
  timestamp: bigint
  status: "pending" | "accepted" | "declined"
}

export interface StudyGroup {
  id: string
  name: string
  description: string
  creator: string
  members: string[]
  maxMembers: number
  isPublic: boolean
  createdAt: bigint
  tags: string[]
}

class SocialClient {
  private actor: any = null;
  
  // Helper to generate a random color
  private getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B786F', '#A4C2A5'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Helper to get initials from name
  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  private async getActor() {
    if (this.actor) return this.actor

    try {
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
        canisterId: SOCIAL_CANISTER_ID,
      })

      return this.actor
    } catch (error) {
      console.warn("Failed to create social actor:", error)
      return null
    }
  }

  async sendPartnerRequest(to: string, message?: string): Promise<string> {
    try {
      const actor = await this.getActor()
      if (!actor) throw new Error("Actor not available")

      const result = await actor.sendPartnerRequest(to, message ? [message] : [])
      if ("ok" in result) {
        return result.ok
      } else {
        throw new Error(result.err)
      }
    } catch (error) {
      console.error("Error sending partner request:", error)
      throw error
    }
  }

  private mapToPartnerProfile(partner: any): PartnerProfile | null {
    try {
      if (!partner || typeof partner !== 'object') {
        console.warn('Invalid partner data:', partner);
        return null;
      }

      const currentTimestamp = BigInt(Date.now()) * BigInt(1_000_000); // Convert to nanoseconds
      
      // Handle onlineStatus which comes as an object from the backend
      let onlineStatus: 'online' | 'away' | 'offline' = 'offline';
      if (partner.onlineStatus) {
        if (typeof partner.onlineStatus === 'object') {
          if ('online' in partner.onlineStatus) onlineStatus = 'online';
          else if ('away' in partner.onlineStatus) onlineStatus = 'away';
          else if ('offline' in partner.onlineStatus) onlineStatus = 'offline';
        } else if (typeof partner.onlineStatus === 'string') {
          onlineStatus = partner.onlineStatus as 'online' | 'away' | 'offline';
        }
      }

      // Convert principal to string if it's a Principal object
      const principal = partner.principal?.toString ? 
        partner.principal.toString() : 
        (typeof partner.principal === 'string' ? partner.principal : '');
      
      return {
        principal,
        name: partner.name?.toString() || 'Unknown User',
        role: partner.role?.toString() || 'member',
        xp: typeof partner.xp === 'bigint' ? Number(partner.xp) : 
            typeof partner.xp === 'number' ? partner.xp : 0,
        onlineStatus,
        avatarColor: typeof partner.avatarColor === 'string' 
          ? partner.avatarColor 
          : this.getRandomColor(),
        initials: typeof partner.initials === 'string' 
          ? partner.initials 
          : this.getInitials(partner.name?.toString() || 'UU'),
        lastActive: partner.lastActive 
          ? (typeof partner.lastActive === 'bigint' 
              ? partner.lastActive 
              : BigInt(Number(partner.lastActive) || 0)) 
          : currentTimestamp,
        studyStreak: typeof partner.studyStreak === 'number' 
          ? partner.studyStreak 
          : 0,
        completedCourses: typeof partner.completedCourses === 'number' 
          ? partner.completedCourses 
          : 0,
        joinedAt: partner.joinedAt
          ? (typeof partner.joinedAt === 'bigint'
              ? partner.joinedAt
              : BigInt(Number(partner.joinedAt) || 0))
          : currentTimestamp - BigInt(30 * 24 * 60 * 60 * 1_000_000_000) // Default to 30 days ago if not provided
      };
    } catch (error) {
      console.error('Error mapping partner profile:', error, 'Raw data:', partner);
      return null;
    }
  }

  async getMyPartners(): Promise<PartnerProfile[]> {
    try {
      const actor = await this.getActor();
      if (!actor) {
        console.warn('No actor available, using fallback partners');
        return this.getFallbackPartners();
      }

      // Using the query method for better performance
      const result = await actor.getMyPartnersQuery();
      
      // Ensure result is an array
      if (!Array.isArray(result)) {
        console.warn('Unexpected response format from getMyPartnersQuery:', result);
        return this.getFallbackPartners();
      }

      // Debug log the raw response
      console.log('Raw partners response:', JSON.stringify(result, null, 2));

      // Map and filter out any null values
      const mappedPartners = result
        .map(partner => {
          try {
            const mapped = this.mapToPartnerProfile(partner);
            if (!mapped) {
              console.warn('Failed to map partner profile:', partner);
            } else if (!('joinedAt' in mapped)) {
              console.warn('Mapped partner missing joinedAt:', mapped);
            }
            return mapped;
          } catch (error) {
            console.error('Error mapping partner:', error, 'Partner data:', partner);
            return null;
          }
        })
        .filter((p): p is PartnerProfile => p !== null);

      if (mappedPartners.length === 0) {
        console.warn('No valid partners found in response, using fallback');
        return this.getFallbackPartners();
      }

      return mappedPartners;
    } catch (error) {
      console.warn("Error getting partners, using fallback:", error);
      return this.getFallbackPartners();
    }
  }

  async getPartnerRequests(): Promise<PartnerRequest[]> {
    try {
      const actor = await this.getActor()
      if (!actor) return []

      const result = await actor.getPartnerRequests()
      return result
    } catch (error) {
      console.warn("Error getting partner requests:", error)
      return []
    }
  }

  async createStudyGroup(
    name: string,
    description: string,
    maxMembers: number,
    isPublic: boolean,
    tags: string[],
  ): Promise<StudyGroup> {
    try {
      const actor = await this.getActor()
      if (!actor) throw new Error("Actor not available")

      const result = await actor.createStudyGroup(name, description, maxMembers, isPublic, tags)
      if ("ok" in result) {
        return result.ok
      } else {
        throw new Error(result.err)
      }
    } catch (error) {
      console.error("Error creating study group:", error)
      throw error
    }
  }

  async generateSamplePartners(): Promise<string> {
    try {
      const actor = await this.getActor()
      if (!actor) throw new Error("Actor not available")

      const result = await actor.generateSamplePartners()
      if ("ok" in result) {
        return result.ok
      } else {
        throw new Error(result.err)
      }
    } catch (error) {
      console.error("Error generating sample partners:", error)
      throw error
    }
  }

  private getFallbackPartners(): PartnerProfile[] {
    const currentTime = BigInt(Date.now()) * BigInt(1_000_000);
    return [
      {
        principal: '2vxsx-fae',
        name: 'Sarah Chen',
        role: 'Frontend Developer',
        xp: 15420,
        onlineStatus: 'online',
        avatarColor: this.getRandomColor(),
        initials: 'SC',
        lastActive: currentTime - BigInt(3600 * 1_000_000_000), // 1 hour ago
        studyStreak: 5,
        completedCourses: 12,
        joinedAt: currentTime - BigInt(90 * 24 * 60 * 60 * 1_000_000_000) // 90 days ago
      },
      {
        principal: '2vxsx-faf',
        name: 'Michael Rodriguez',
        role: 'Full Stack Engineer',
        xp: 22100,
        onlineStatus: 'away',
        avatarColor: this.getRandomColor(),
        initials: 'MR',
        lastActive: currentTime - BigInt(7200 * 1_000_000_000), // 2 hours ago
        studyStreak: 12,
        completedCourses: 8,
        joinedAt: currentTime - BigInt(60 * 24 * 60 * 60 * 1_000_000_000) // 60 days ago
      },
      {
        principal: '2vxsx-fag',
        name: 'Emily Watson',
        role: 'Backend Developer',
        xp: 18750,
        onlineStatus: 'online',
        avatarColor: this.getRandomColor(),
        initials: 'EW',
        lastActive: currentTime - BigInt(1800 * 1_000_000_000), // 30 minutes ago
        studyStreak: 7,
        completedCourses: 10,
        joinedAt: currentTime - BigInt(30 * 24 * 60 * 60 * 1_000_000_000) // 30 days ago
      }
    ];
  }
}

export const socialClient = new SocialClient()
