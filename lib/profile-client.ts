import { getIdentity, userProfileActor } from "./ic/agent"
import type { UserProfile, ProfileUpdate, UserFile } from "./ic/user-profile.idl"
import { uploadToAssetCanister } from "./ic/asset-uploader"

// Local fallback keys - KEYED BY PRINCIPAL
const LS_PREFIX = "peerverse_profile_"

function lsKey(principal: string) {
  return `${LS_PREFIX}${principal}`
}

function readOpt<T>(opt: any): T | undefined | null {
  if (Array.isArray(opt)) return opt.length ? (opt[0] as T) : undefined
  return opt as T
}

function normalizeProfileFromCanister(raw: any): UserProfile {
  return {
    id: raw.id.toText(),
    name: raw.name,
    email: raw.email,
    bio: raw.bio,
    avatarUrl: raw.avatarUrl,
    coverUrl: raw.coverUrl,
    xpBalance: BigInt(raw.xpBalance),
    reputation: BigInt(raw.reputation),
    interests: raw.interests,
    socialLinks: raw.socialLinks,
    settings: {
      notifications: raw.settings.notifications,
      privacy: raw.settings.privacy,
      theme: raw.settings.theme,
      language: raw.settings.language,
      emailNotifications: raw.settings.emailNotifications,
      profileVisibility: raw.settings.profileVisibility,
    },
    files: raw.files.map((file: any) => ({
      id: file.id,
      filename: file.filename,
      contentType: file.contentType,
      size: BigInt(file.size),
      url: file.url,
      category: file.category,
      uploadedAt: BigInt(file.uploadedAt),
      tags: file.tags,
    })),
    createdAt: BigInt(raw.createdAt),
    updatedAt: BigInt(raw.updatedAt),
  }
}

// USER-SPECIFIC DATA RETRIEVAL
export async function getMyProfile(): Promise<UserProfile | null> {
  const identity = await getIdentity()
  if (!identity) return null
  const principal = identity.getPrincipal().toText()

  try {
    const actor = await userProfileActor<any>(identity)
    const result = await actor.getMyProfile()
    if (result) {
      const normalized = normalizeProfileFromCanister(result)
      // Cache locally
      try {
        localStorage.setItem(lsKey(principal), JSON.stringify(normalized))
      } catch {}
      return normalized
    }
  } catch (e) {
    console.warn("getMyProfile canister call failed, using local fallback:", e)
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(lsKey(principal))
    if (raw) return JSON.parse(raw)
  } catch {}

  return null
}

export async function createProfile(name: string, email: string): Promise<UserProfile> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")

  const principal = identity.getPrincipal().toText()

  try {
    const actor = await userProfileActor<any>(identity)
    const result = await actor.createProfile(name, email)

    if ("ok" in result) {
      const normalized = normalizeProfileFromCanister(result.ok)
      try {
        localStorage.setItem(lsKey(principal), JSON.stringify(normalized))
      } catch {}
      return normalized
    } else {
      throw new Error(result.err)
    }
  } catch (e) {
    console.warn("createProfile canister call failed:", e)
    throw e
  }
}

export async function updateMyProfile(update: ProfileUpdate): Promise<UserProfile> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")

  const principal = identity.getPrincipal().toText()

  try {
    const actor = await userProfileActor<any>(identity)
    const result = await actor.updateProfile(update)

    if ("ok" in result) {
      const normalized = normalizeProfileFromCanister(result.ok)
      try {
        localStorage.setItem(lsKey(principal), JSON.stringify(normalized))
      } catch {}
      return normalized
    } else {
      throw new Error(result.err)
    }
  } catch (e) {
    console.warn("updateProfile canister call failed, saving to local fallback:", e)
    const current = await getMyProfile()
    if (!current) throw new Error("No profile found")

    const merged: UserProfile = {
      ...current,
      ...update,
      settings: { ...(current.settings ?? {}), ...(update.settings ?? {}) },
    } as UserProfile

    try {
      localStorage.setItem(lsKey(principal), JSON.stringify(merged))
    } catch {}
    return merged
  }
}

export async function updateAvatar(avatarUrl: string): Promise<UserProfile> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")

  const principal = identity.getPrincipal().toText()

  try {
    const actor = await userProfileActor<any>(identity)
    const result = await actor.updateAvatar(avatarUrl)

    if ("ok" in result) {
      const normalized = normalizeProfileFromCanister(result.ok)
      try {
        localStorage.setItem(lsKey(principal), JSON.stringify(normalized))
      } catch {}
      return normalized
    } else {
      throw new Error(result.err)
    }
  } catch (e) {
    console.warn("updateAvatar canister call failed:", e)
    throw e
  }
}

export async function updateCover(coverUrl: string): Promise<UserProfile> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")

  const principal = identity.getPrincipal().toText()

  try {
    const actor = await userProfileActor<any>(identity)
    const result = await actor.updateCover(coverUrl)

    if ("ok" in result) {
      const normalized = normalizeProfileFromCanister(result.ok)
      try {
        localStorage.setItem(lsKey(principal), JSON.stringify(normalized))
      } catch {}
      return normalized
    } else {
      throw new Error(result.err)
    }
  } catch (e) {
    console.warn("updateCover canister call failed:", e)
    throw e
  }
}

export async function uploadAndLinkFile(file: File, category = "other"): Promise<{ url: string; files: UserFile[] }> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")

  const principal = identity.getPrincipal().toText()
  const safeName = file.name.replace(/\s+/g, "_")
  const objectKey = `${category}/${principal}/${Date.now()}_${safeName}`

  // Upload to asset canister
  const url = await uploadToAssetCanister(file, objectKey, identity)

  try {
    const actor = await userProfileActor<any>(identity)
    const result = await actor.linkFileToProfile(url, category)

    if ("ok" in result) {
      return {
        url,
        files: result.ok.map((file: any) => ({
          id: file.id,
          filename: file.filename,
          contentType: file.contentType,
          size: BigInt(file.size),
          url: file.url,
          category: file.category,
          uploadedAt: BigInt(file.uploadedAt),
          tags: file.tags,
        })),
      }
    } else {
      throw new Error(result.err)
    }
  } catch (e) {
    console.warn("linkFileToProfile canister call failed:", e)
    // Return just the URL if canister call fails
    return { url, files: [] }
  }
}

export async function uploadAvatar(file: File): Promise<string> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")

  const principal = identity.getPrincipal().toText()
  const safeName = file.name.replace(/\s+/g, "_")
  const objectKey = `avatars/${principal}/${Date.now()}_${safeName}`

  // Upload to asset canister
  const url = await uploadToAssetCanister(file, objectKey, identity)

  // Update profile with new avatar URL
  await updateAvatar(url)

  return url
}

export async function uploadCover(file: File): Promise<string> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")

  const principal = identity.getPrincipal().toText()
  const safeName = file.name.replace(/\s+/g, "_")
  const objectKey = `covers/${principal}/${Date.now()}_${safeName}`

  // Upload to asset canister
  const url = await uploadToAssetCanister(file, objectKey, identity)

  // Update profile with new cover URL
  await updateCover(url)

  return url
}

export async function getMyFiles(): Promise<UserFile[]> {
  const identity = await getIdentity()
  if (!identity) return []

  try {
    const actor = await userProfileActor<any>(identity)
    const files = await actor.getMyFiles()
    return files.map((file: any) => ({
      id: file.id,
      filename: file.filename,
      contentType: file.contentType,
      size: BigInt(file.size),
      url: file.url,
      category: file.category,
      uploadedAt: BigInt(file.uploadedAt),
      tags: file.tags,
    }))
  } catch (e) {
    console.warn("getMyFiles canister call failed:", e)
    return []
  }
}

export async function deleteFile(fileId: string): Promise<boolean> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")

  try {
    const actor = await userProfileActor<any>(identity)
    const result = await actor.deleteFile(fileId)

    if ("ok" in result) {
      return result.ok
    } else {
      throw new Error(result.err)
    }
  } catch (e) {
    console.warn("deleteFile canister call failed:", e)
    throw e
  }
}

export async function addSocialLink(platform: string, url: string): Promise<UserProfile> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")

  const principal = identity.getPrincipal().toText()

  try {
    const actor = await userProfileActor<any>(identity)
    const result = await actor.addSocialLink(platform, url)

    if ("ok" in result) {
      const normalized = normalizeProfileFromCanister(result.ok)
      try {
        localStorage.setItem(lsKey(principal), JSON.stringify(normalized))
      } catch {}
      return normalized
    } else {
      throw new Error(result.err)
    }
  } catch (e) {
    console.warn("addSocialLink canister call failed:", e)
    throw e
  }
}

export async function removeSocialLink(platform: string): Promise<UserProfile> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")

  const principal = identity.getPrincipal().toText()

  try {
    const actor = await userProfileActor<any>(identity)
    const result = await actor.removeSocialLink(platform)

    if ("ok" in result) {
      const normalized = normalizeProfileFromCanister(result.ok)
      try {
        localStorage.setItem(lsKey(principal), JSON.stringify(normalized))
      } catch {}
      return normalized
    } else {
      throw new Error(result.err)
    }
  } catch (e) {
    console.warn("removeSocialLink canister call failed:", e)
    throw e
  }
}

export async function getXPBalance(): Promise<number> {
  const identity = await getIdentity()
  if (!identity) return 0

  try {
    const actor = await userProfileActor<any>(identity)
    const balance = await actor.getXPBalance()
    return Number(balance)
  } catch (e) {
    console.warn("getXPBalance canister call failed:", e)
    return 0
  }
}

export async function addXP(amount: number, reason: string, source: string, metadata = ""): Promise<number> {
  const identity = await getIdentity()
  if (!identity) throw new Error("Not authenticated")

  try {
    const actor = await userProfileActor<any>(identity)
    const result = await actor.addXP(amount, reason, source, metadata)

    if ("ok" in result) {
      return Number(result.ok)
    } else {
      throw new Error(result.err)
    }
  } catch (e) {
    console.warn("addXP canister call failed:", e)
    throw e
  }
}
