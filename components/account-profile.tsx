'use client'

import * as React from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { getMyProfile, updateMyProfile, uploadAndLinkFile } from '@/lib/profile-client'
import Image from 'next/image'
import { Loader2, UploadCloud, Save, Zap } from 'lucide-react'

export default function AccountProfile() {
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const [profile, setProfile] = React.useState<{
    name: string
    bio: string
    xp: number
    avatarUrl?: string | null
    bannerUrl?: string | null
    files: string[]
  }>({
    name: '',
    bio: '',
    xp: 0,
    avatarUrl: null,
    bannerUrl: null,
    files: [],
  })

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await getMyProfile()
        if (!mounted || !data) return
        setProfile({
          name: data.name,
          bio: data.bio,
          xp: Number(data.xp ?? 0),
          avatarUrl: data.avatarUrl ?? null,
          bannerUrl: data.bannerUrl ?? null,
          files: data.files ?? [],
        })
      } catch (e) {
        console.error(e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const onSave = async () => {
    setSaving(true)
    try {
      const updated = await updateMyProfile({
        name: profile.name,
        bio: profile.bio,
        avatarUrl: profile.avatarUrl ?? null,
        bannerUrl: profile.bannerUrl ?? null,
      })
      setProfile((p) => ({
        ...p,
        name: updated.name,
        bio: updated.bio,
        avatarUrl: updated.avatarUrl ?? null,
        bannerUrl: updated.bannerUrl ?? null,
      }))
      toast({
        title: 'Profile saved',
        description: 'Your on-chain profile has been updated (or cached locally).',
      })
    } catch (e: any) {
      toast({
        title: 'Save failed',
        description: e?.message ?? 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'avatar' | 'banner') => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await uploadAndLinkFile(file, 'profile')
      setProfile((p) => ({
        ...p,
        [kind === 'avatar' ? 'avatarUrl' : 'bannerUrl']: url,
        files: [...p.files, url],
      }))
      toast({
        title: 'Uploaded',
        description: 'File uploaded to asset canister and linked.',
      })
    } catch (e: any) {
      toast({
        title: 'Upload failed',
        description: e?.message ?? 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
      e.currentTarget.value = ''
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className="bg-black/20 border-white/10 text-white/80">
        <CardHeader>
          <CardTitle>Sign in required</CardTitle>
        </CardHeader>
        <CardContent>Please sign in with Internet Identity to manage your profile.</CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/80">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading profile…
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Card className="bg-black/20 border-white/10 text-white/90">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white/70">Display Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                className="bg-black/30 border-white/10 text-white"
              />
            </div>
            <div>
              <Label htmlFor="bio" className="text-white/70">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                className="bg-black/30 border-white/10 text-white min-h-[120px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white">
                <Zap className="mr-1 h-4 w-4" /> {profile.xp} XP
              </Badge>
              <span className="text-white/60 text-sm">XP managed on-chain</span>
            </div>
            <div className="flex gap-3">
              <Button onClick={onSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-white/70">Avatar</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-full ring-1 ring-white/20 bg-white/5">
                  {profile.avatarUrl ? (
                    <Image src={profile.avatarUrl || "/placeholder.svg"} alt="Avatar" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-white/50">
                      No avatar
                    </div>
                  )}
                </div>
                <div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80 hover:bg-white/5">
                    <UploadCloud className="h-4 w-4" />
                    Upload
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => onUpload(e, 'avatar')} />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white/70">Banner</Label>
              <div className="mt-2">
                <div className="relative h-28 w-full overflow-hidden rounded-lg ring-1 ring-white/20 bg-white/5">
                  {profile.bannerUrl ? (
                    <Image src={profile.bannerUrl || "/placeholder.svg"} alt="Banner" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-white/50">
                      No banner
                    </div>
                  )}
                </div>
                <div className="mt-2">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80 hover:bg-white/5">
                    <UploadCloud className="h-4 w-4" />
                    Upload
                    <input type="file" accept="image/*" className="sr-only" onChange={(e) => onUpload(e, 'banner')} />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-white/70">Linked Files</Label>
              <div className="mt-2 space-y-2">
                {profile.files.length === 0 ? (
                  <div className="text-sm text-white/50">No files linked yet.</div>
                ) : (
                  profile.files.map((url, i) => (
                    <div key={i} className="truncate text-sm text-white/80">
                      <a href={url} target="_blank" rel="noreferrer" className="underline hover:text-white">
                        {url}
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-white/10 text-white/80">
        <CardHeader>
          <CardTitle>Upload any file</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80 hover:bg-white/5">
            <UploadCloud className="h-4 w-4" />
            Upload & Link
            <input
              type="file"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setUploading(true)
                try {
                  const { url, files } = await uploadAndLinkFile(file, 'files')
                  setProfile((p) => ({ ...p, files }))
                  toast({ title: 'Uploaded', description: url })
                } catch (err: any) {
                  toast({ title: 'Upload failed', description: err?.message ?? 'Try again.', variant: 'destructive' })
                } finally {
                  setUploading(false)
                  e.currentTarget.value = ''
                }
              }}
            />
          </label>
          {uploading && (
            <div className="mt-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
