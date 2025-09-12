import { Actor, HttpAgent, type Identity } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import { idlFactory } from "./ic/social.idl"
import { Principal } from "@dfinity/principal"
import { getIdentity, customFetch } from "./ic/agent"

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
  memberCount: number
  maxMembers: number
  isPublic: boolean
  tags: string[]
  createdAt: bigint
  isMember: boolean
  owner: string
  creator?: string
  members?: string[]
}

class SocialClient {
  private actor: any = null;
  private identity: Identity | null = null;
  
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

  public setIdentity(identity: Identity | null) {
    this.identity = identity;
    this.actor = null; // Reset actor so it's recreated with the new identity
  }

  private async getActor() {
    if (this.actor) return this.actor;

    if (!this.identity) {
      console.warn('No identity set for social client');
      return null;
    }

    try {
      if (!this.identity) {
        throw new Error('No identity available. Please authenticate first.');
      }

      const identity = this.identity;
      console.log('[SocialClient] Using identity principal:', identity.getPrincipal().toText());

      // Determine if we're in a local development environment
      const isLocal = typeof window !== "undefined" && 
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
      
      // Use the same host configuration as the rest of the application
      const host = isLocal 
        ? "http://127.0.0.1:4943"  // Local replica port
        : "https://ic0.app";

      console.log('[SocialClient] Initializing with host:', host);
      console.log('[SocialClient] Using canister ID:', SOCIAL_CANISTER_ID);

      // Create a custom fetch handler for local development
      const customFetchWithBypass = async (input: RequestInfo | URL, init?: RequestInit) => {
        try {
          // Handle both string URLs and Request objects
          const url = new URL(
            input instanceof Request ? input.url : input.toString(),
            typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:4943'
          );
          
          // Fix double API version in path if it exists
          if (url.pathname.includes('/v2/v3/')) {
            url.pathname = url.pathname.replace('/v2/v3/', '/v2/');
          }
          
          const isICApiCall = url.pathname.includes('/api/v2/');
          const isLocal = url.hostname === '127.0.0.1' || url.hostname === 'localhost';
          const origin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:4943';
          
          // Prepare request headers
          const requestHeaders = new Headers(init?.headers);
          
          // Always set the Origin header for CORS
          requestHeaders.set('Origin', origin);
          
          // Add required headers for IC API calls
          if (isICApiCall) {
            requestHeaders.set('Content-Type', 'application/cbor');
            requestHeaders.set('Accept', 'application/cbor');
            
            // For local development, add headers to bypass certificate validation
            if (isLocal) {
              // Add cache-busting for status endpoint
              if (url.pathname.endsWith('/status')) {
                url.searchParams.set('_', Date.now().toString());
              }
              
              // Add IC-specific headers
              requestHeaders.set('X-IC-Disable-Certificate-Validation', 'true');
              requestHeaders.set('X-IC-Allow-Insecure-Requests', 'true');
              
              // For preflight requests, ensure we have the necessary headers
              if (init?.method === 'OPTIONS') {
                requestHeaders.set('Access-Control-Request-Method', init.method || 'GET');
                requestHeaders.set('Access-Control-Request-Headers', 'content-type,authorization');
              }
            }
          }
          
          // Prepare fetch options
          const fetchOptions: RequestInit = {
            ...init,
            headers: requestHeaders,
            mode: 'cors',
            cache: 'no-cache',
            credentials: isICApiCall ? 'include' : 'same-origin'
          };
          
          // For local development, ensure we're not sending credentials to non-local endpoints
          if (isLocal && !isICApiCall) {
            delete (fetchOptions as any).credentials;
          }
          
          console.log(`[SocialClient] Making request to: ${url.toString()}`, {
            method: fetchOptions.method,
            headers: Object.fromEntries(requestHeaders.entries()),
            credentials: fetchOptions.credentials
          });
          
          // Make the request through our custom fetch
          const response = await customFetch(url, fetchOptions);
          
          // For local development, ensure CORS headers are set in the response
          if (isLocal && isICApiCall) {
            const responseHeaders = new Headers(response.headers);
            responseHeaders.set('Access-Control-Allow-Origin', origin);
            responseHeaders.set('Access-Control-Allow-Credentials', 'true');
            
            // Create a new response with the modified headers
            if (response.body) {
              return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: responseHeaders
              });
            }
          }
          
          return response;
        } catch (error) {
          console.error('[SocialClient] Error in custom fetch:', error);
          throw error;
        }
      };

      // Configure the HTTP agent
      const agent = new HttpAgent({
        identity,
        host,
        ...(isLocal ? { 
          fetch: customFetchWithBypass,
          // Disable all verification for local development
          verifyQuerySignatures: false,
          verifyUpdateCalls: false,
          verifyTimeNanos: false,
          // Use empty root key to bypass verification
          rootKey: new Uint8Array(0),
          // Additional options
          callOptions: {
            http_request_timeout_ms: 30000, // 30 second timeout
          },
          retryTimes: 2,
          maxResponseBytes: 1024 * 1024 * 10, // 10MB
        } : {})
      });

      if (isLocal) {
        try {
          console.log('[SocialClient] Fetching root key...');
          // First try to fetch the root key
          await agent.fetchRootKey();
          console.log('[SocialClient] Successfully fetched root key');
        } catch (error) {
          console.warn('[SocialClient] Failed to fetch root key, patching agent to bypass verification', error);
          // If fetching fails, patch the agent to bypass verification
         (agent as any)._verifyCert = async () => true;
        }
      }

      try {
        console.log('[SocialClient] Creating actor...');
        // Create the actor with the configured agent
        this.actor = Actor.createActor(idlFactory, {
          agent,
          canisterId: SOCIAL_CANISTER_ID,
        });

        // Test the actor with a simple query
        if (isLocal) {
          try {
            console.log('[SocialClient] Testing actor connection...');
            await this.actor.whoami();
            console.log('[SocialClient] Actor connection test successful');
          } catch (testError) {
            console.warn('[SocialClient] Actor connection test failed, but continuing', testError);
          }
        }

        return this.actor;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('[SocialClient] Failed to create actor:', error);
        throw new Error(`Failed to initialize actor: ${errorMessage}`);
      }
    } catch (error) {
      console.warn("Failed to create social actor:", error)
      return null
    }
  }

  async sendPartnerRequest(to: string, message?: string): Promise<string> {
    try {
      const actor = await this.getActor()
      if (!actor) throw new Error("Actor not available")

      const result = await actor.sendPartnerRequest(Principal.fromText(to), message || '')
      if ("ok" in result) {
        return result.ok;
      } else {
        throw new Error(result.err);
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

      // Get partners from the canister
      const result = await actor.getMyPartners();
      
      // Ensure result is an array
      if (!Array.isArray(result)) {
        console.warn('Unexpected response format from getMyPartners:', result);
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
      if (!this.identity) throw new Error("Not authenticated")

      const result = await actor.createStudyGroup(name, description, maxMembers, isPublic, tags)
      if ("ok" in result) {
        const group = result.ok;
        const members = group.members || [];
        const creator = group.creator?.toString() || this.identity.getPrincipal().toString();
        
        return {
          id: group.id.toString(),
          name: group.name,
          description: group.description,
          memberCount: members.length,
          maxMembers: group.maxMembers,
          isPublic: group.isPublic,
          tags: group.tags,
          createdAt: group.createdAt,
          isMember: true, // Creator is automatically a member
          owner: creator,
          creator,
          members: members.map((m: Principal) => m.toString())
        };
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

  async joinStudyGroup(groupId: string): Promise<void> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");
      
      const result = await actor.joinStudyGroup(Principal.fromText(groupId));
      if ("err" in result) {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error joining study group:", error);
      throw error;
    }
  }

  async leaveStudyGroup(groupId: string): Promise<void> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");
      
      const result = await actor.leaveStudyGroup(Principal.fromText(groupId));
      if ("err" in result) {
        throw new Error(result.err);
      }
    } catch (error) {
      console.error("Error leaving study group:", error);
      throw error;
    }
  }

  async getStudyGroups(): Promise<StudyGroup[]> {
    try {
      const actor = await this.getActor();
      if (!actor) throw new Error("Actor not available");
      if (!this.identity) throw new Error("Not authenticated");

      const principal = this.identity.getPrincipal();
      const principalString = principal.toString();

      // Use getStudyGroups which is now defined in the IDL
      const result = await actor.getStudyGroups();
        
      if (!Array.isArray(result)) {
        throw new Error("Unexpected response format from getStudyGroups");
      }

      return result.map((group: any) => {
        const members = Array.isArray(group.members)
          ? group.members.map((m: Principal) => m.toString())
          : [];
        const creator = group.creator?.toString() || principalString;
        const isMember = members.includes(principalString);
        
        return {
          id: group.id.toString(),
          name: group.name,
          description: group.description,
          memberCount: members.length,
          maxMembers: group.maxMembers,
          isPublic: group.isPublic,
          tags: group.tags || [],
          createdAt: group.createdAt,
          isMember,
          owner: creator,
          creator,
          members
        };
      });
    } catch (error) {
      console.error("Error getting study groups:", error);
      throw error;
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

// Export the social client instance
export const socialClient = new SocialClient();

// Helper functions that use the social client
export async function getMyPartners(): Promise<PartnerProfile[]> {
  return socialClient.getMyPartners();
}

export async function sendPartnerRequest(principal: string, message?: string): Promise<string> {
  return socialClient.sendPartnerRequest(principal, message);
}

export async function getStudyGroups(): Promise<StudyGroup[]> {
  return socialClient.getStudyGroups();
}

export async function createStudyGroup(
  name: string,
  description: string,
  maxMembers: number,
  isPublic: boolean,
  tags: string[]
): Promise<StudyGroup> {
  return socialClient.createStudyGroup(name, description, maxMembers, isPublic, tags);
}

export async function joinStudyGroup(groupId: string): Promise<void> {
  return socialClient.joinStudyGroup(groupId);
}

export async function leaveStudyGroup(groupId: string): Promise<void> {
  return socialClient.leaveStudyGroup(groupId);
}
