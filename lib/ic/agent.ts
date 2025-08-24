import { HttpAgent, Actor, type Identity, type ActorSubclass } from "@dfinity/agent"
import { AuthClient } from "@dfinity/auth-client"
import type { IDL } from "@dfinity/candid"
import { idlFactory as userProfileIdl } from "./user-profile.idl"

export const USER_PROFILE_CANISTER_ID = "b77ix-eeaaa-aaaaa-qaada-cai" // Local user_profile canister
export const LEARNING_ANALYTICS_CANISTER_ID = "bkyz2-fmaaa-aaaaa-qaaaq-cai" // Local learning_analytics canister
export const NOTIFICATIONS_CANISTER_ID = "bd3sg-teaaa-aaaaa-qaaba-cai" // Local notifications canister
export const RECOMMENDATIONS_CANISTER_ID = "be2us-64aaa-aaaaa-qaabq-cai" // Local recommendations canister
export const SESSIONS_CANISTER_ID = "br5f7-7uaaa-aaaaa-qaaca-cai" // Local sessions canister
export const SOCIAL_CANISTER_ID = "bw4dl-smaaa-aaaaa-qaacq-cai" // Local social canister
export const ASSET_CANISTER_ID = "by6od-j4aaa-aaaaa-qaadq-cai" // Local UI/asset canister

export function detectIcHost(): string {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      (window.location.hostname.includes("preview-") && window.location.hostname.includes("vusercontent.net")))

  const host = isLocal ? "http://127.0.0.1:4943" : "https://ic0.app"

  console.log(
    "[v0] IC Host detected:",
    host,
    "| Local:",
    isLocal,
    "| Hostname:",
    typeof window !== "undefined" ? window.location.hostname : "server",
  )

  return host
}

export async function getIdentity(): Promise<Identity | null> {
  const client = await AuthClient.create({
    idleOptions: {
      idleTimeout: 1000 * 60 * 30, // 30 minutes
      disableDefaultIdleCallback: true,
    },
  })
  const ok = await client.isAuthenticated()
  return ok ? client.getIdentity() : null
}

export async function getAgent(identity?: Identity) {
  const host = detectIcHost()
  const isLocal = host.includes("127.0.0.1")

  console.log("[v0] Creating IC agent with host:", host, "| Identity:", !!identity, "| Local:", isLocal)

  const agent = new HttpAgent({
    host,
    identity,
    // Use fetch for better compatibility
    fetch: globalThis.fetch,
    // Disable certificate verification for local development
    verifyQuerySignatures: !isLocal,
  })

  if (isLocal) {
    console.log("[v0] Fetching root key for local development")
    try {
      await agent.fetchRootKey()
      console.log("[v0] Root key fetched successfully")
    } catch (error) {
      console.error("[v0] Failed to fetch root key:", error)
      throw error
    }
  }

  return agent
}

export async function createActor<T>(canisterId: string, idlFactory: IDL.InterfaceFactory, identity?: Identity) {
  console.log("[v0] Creating actor for canister:", canisterId)

  try {
    const agent = await getAgent(identity)
    const actor = Actor.createActor<T>(idlFactory, {
      agent,
      canisterId,
    })
    console.log("[v0] Actor created successfully for canister:", canisterId)
    return actor
  } catch (error) {
    console.error("[v0] Failed to create actor for canister:", canisterId, "Error:", error)
    throw error
  }
}

// Convenience creator for the User Profile canister
export async function userProfileActor<T = any>(identity?: Identity): Promise<ActorSubclass<T>> {
  return createActor<T>(USER_PROFILE_CANISTER_ID, userProfileIdl as unknown as IDL.InterfaceFactory, identity)
}
