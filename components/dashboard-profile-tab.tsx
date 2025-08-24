"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import PrincipalChip from "@/components/principal-chip"
import { useToast } from "@/hooks/use-toast"

// Simple local persistence key (canister wiring can replace this storage)
const LS_KEY = "peerverse.profile.v1"

type ProfileData = {
  username: string
  interests: string[]
}

export default function DashboardProfileTab() {
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [interestInput, setInterestInput] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const canSave = useMemo(() => username.trim().length >= 3, [username])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as ProfileData
        setUsername(parsed.username || "")
        setInterests(Array.isArray(parsed.interests) ? parsed.interests : [])
      }
    } catch {
      // ignore
    }
  }, [])

  function saveToLocal(data: ProfileData) {
    localStorage.setItem(LS_KEY, JSON.stringify(data))
  }

  function onAddInterest() {
    const val = interestInput.trim()
    if (!val) return
    if (interests.includes(val)) {
      setInterestInput("")
      return
    }
    const next = [...interests, val]
    setInterests(next)
    setInterestInput("")
  }

  function removeInterest(tag: string) {
    const next = interests.filter((i) => i !== tag)
    setInterests(next)
  }

  async function handleSave() {
    const data: ProfileData = {
      username: username.trim(),
      interests,
    }

    // Local persistence as a baseline
    saveToLocal(data)

    toast({
      title: "Profile saved",
      description: "Your public username and interests were saved locally. Connect your canister to persist on-chain.",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-white/10 bg-white/5 text-white">
        <CardHeader>
          <CardTitle className="text-white/90">Public Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <div className="text-sm text-white/70">Authenticated Principal</div>
            <PrincipalChip />
          </div>

          <Separator className="bg-white/10" />

          <div className="space-y-2">
            <label className="text-sm text-white/80">Public Username</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a name others will see (min 3 chars)"
              className="bg-white/10 text-white placeholder:text-white/40"
            />
            <p className="text-xs text-white/60">People will see this username instead of your principal.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/80">Interests</label>
            <div className="flex gap-2">
              <Input
                value={interestInput}
                onChange={(e) => setInterestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    onAddInterest()
                  }
                }}
                placeholder="Add an interest and press Enter"
                className="bg-white/10 text-white placeholder:text-white/40"
              />
              <Button type="button" onClick={onAddInterest} variant="secondary" className="bg-white/20 text-white">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {interests.length === 0 ? (
                <span className="text-xs text-white/60">No interests yet.</span>
              ) : (
                interests.map((tag) => (
                  <Badge
                    key={tag}
                    className="cursor-pointer bg-white/15 text-white hover:bg-white/25"
                    onClick={() => removeInterest(tag)}
                    title="Click to remove"
                  >
                    {tag}
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              disabled={!canSave}
              onClick={handleSave}
              className="rounded-lg bg-gradient-to-r from-sky-500 to-amber-400 text-white hover:opacity-90"
            >
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
