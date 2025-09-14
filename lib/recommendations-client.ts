import { getIdentity, createActor, RECOMMENDATIONS_CANISTER_ID } from "./ic/agent"
import { idlFactory } from "./ic/recommendations.idl"
// Remove the _SERVICE import since it's not exported from the IDL file
import { Principal } from "@dfinity/principal"

export type ContentType = 'course' | 'article' | 'video' | 'book' | 'tutorial' | 'workshop'

export interface Recommendation {
  id: string
  contentId: string
  contentType: ContentType
  title: string
  description: string
  thumbnailUrl?: string
  duration?: number
  level?: 'beginner' | 'intermediate' | 'advanced'
  rating?: number
  provider?: string
  tags?: string[]
  viewed: boolean
  clicked: boolean
  completed: boolean
  saved: boolean
  createdAt: bigint
  similarityScore?: number
  reason?: string
}

export async function getRecommendations(limit: number = 10): Promise<Recommendation[]> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")
  
  const actor = await createActor({
    canisterId: RECOMMENDATIONS_CANISTER_ID,
    idlFactory,
    identity
  }) as any
  
  const result = await actor.getRecommendations(BigInt(limit))
  
  if ('ok' in result) {
    return result.map((r: any) => ({
      ...r,
      id: r.id.toString(),
      contentId: r.contentId.toString(),
      contentType: r.contentType as ContentType,
      viewed: r.viewed,
      clicked: r.clicked,
      completed: r.completed,
      saved: r.saved,
      createdAt: r.createdAt,
      similarityScore: r.similarityScore !== undefined ? Number(r.similarityScore) : undefined
    }))
  } else {
    throw new Error("Failed to get recommendations")
  }
}

export async function markAsViewed(id: string): Promise<void> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")
  
  const actor = await createActor({
    canisterId: RECOMMENDATIONS_CANISTER_ID,
    idlFactory,
    identity
  }) as any
  
  await actor.markAsViewed(Principal.fromText(id))
}

export async function markAsClicked(id: string): Promise<void> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")
  
  const actor = await createActor({
    canisterId: RECOMMENDATIONS_CANISTER_ID,
    idlFactory,
    identity
  }) as any
  
  await actor.markAsClicked(Principal.fromText(id))
}

export async function markAsCompleted(id: string): Promise<void> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")
  
  const actor = await createActor({
    canisterId: RECOMMENDATIONS_CANISTER_ID,
    idlFactory,
    identity
  }) as any
  
  await actor.markAsCompleted(Principal.fromText(id))
}

export async function saveRecommendation(id: string): Promise<void> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")
  
  const actor = await createActor({
    canisterId: RECOMMENDATIONS_CANISTER_ID,
    idlFactory,
    identity
  }) as any
  
  await actor.saveRecommendation(Principal.fromText(id))
}

// Helper function to get recommendations by content type
export async function getRecommendationsByType(
  contentType: ContentType,
  limit: number = 5
): Promise<Recommendation[]> {
  const allRecs = await getRecommendations(limit * 3) // Get more to filter
  return allRecs
    .filter(r => r.contentType === contentType)
    .slice(0, limit)
}

// Get trending recommendations
export async function getTrendingRecommendations(limit: number = 5): Promise<Recommendation[]> {
  const allRecs = await getRecommendations(limit * 2)
  return allRecs
    .sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0))
    .slice(0, limit)
}

// Get saved recommendations
export async function getSavedRecommendations(limit: number = 10): Promise<Recommendation[]> {
  const allRecs = await getRecommendations(limit * 2)
  return allRecs
    .filter(r => r.saved)
    .slice(0, limit)
}
