"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  Zap,
  LinkIcon,
  Globe,
  UserIcon,
  TrendingUp,
  Trophy,
  Heart,
  Settings,
  Edit3,
  Camera,
  Plus,
  Sparkles,
  Crown,
  Shield,
  Rocket,
  Brain,
  Code,
  Palette,
  Gem,
  Save,
  Upload,
  Loader2,
  X,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import {
  getMyProfile,
  updateMyProfile,
  uploadAvatar,
  uploadCover,
  uploadAndLinkFile,
  createProfile,
  addSocialLink,
  removeSocialLink,
} from "@/lib/profile-client"
import type { UserProfile } from "@/lib/ic/user-profile.idl"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function DashboardProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("overview")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    interests: [] as string[],
  })
  const [newInterest, setNewInterest] = useState("")
  const [newSocialPlatform, setNewSocialPlatform] = useState("")
  const [newSocialUrl, setNewSocialUrl] = useState("")

  // Load user profile on mount
  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      let userProfile = await getMyProfile()

      if (!userProfile) {
        // Create profile if it doesn't exist
        const defaultName = user.name || generateRandomName()
        const defaultEmail = user.email || `${user.principal?.slice(0, 8)}@ic.local`

        userProfile = await createProfile(defaultName, defaultEmail)

        // Update with random data
        userProfile = await updateMyProfile({
          bio: generateRandomBio(),
          interests: generateRandomInterests(),
        })
      }

      setProfile(userProfile)
      setEditForm({
        name: userProfile.name,
        bio: userProfile.bio,
        interests: userProfile.interests || [],
      })
    } catch (error) {
      console.error("Failed to load profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateRandomName = () => {
    const firstNames = ["Alex", "Jordan", "Casey", "Morgan", "Riley", "Avery", "Quinn", "Sage", "River", "Phoenix"]
    const lastNames = [
      "Smith",
      "Johnson",
      "Williams",
      "Brown",
      "Jones",
      "Garcia",
      "Miller",
      "Davis",
      "Rodriguez",
      "Martinez",
    ]
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
  }

  const generateRandomBio = () => {
    const bios = [
      "🚀 Passionate about Web3 and decentralized learning. Building the future of education on the Internet Computer.",
      "💡 Full-stack developer exploring the intersection of blockchain and education. Always learning, always teaching.",
      "🌟 Blockchain enthusiast and educator. Helping others navigate the world of decentralized technologies.",
      "🔥 Web3 developer and lifelong learner. Creating innovative solutions on the Internet Computer.",
      "⚡ Decentralized learning advocate. Empowering others through peer-to-peer education.",
    ]
    return bios[Math.floor(Math.random() * bios.length)]
  }

  const generateRandomInterests = () => {
    const allInterests = [
      "Web3",
      "Motoko",
      "React",
      "TypeScript",
      "Blockchain",
      "DeFi",
      "NFTs",
      "Smart Contracts",
      "UI/UX",
      "AI/ML",
    ]
    const numInterests = Math.floor(Math.random() * 4) + 3 // 3-6 interests
    const shuffled = allInterests.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, numInterests)
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const updatedProfile = await updateMyProfile({
        name: editForm.name,
        bio: editForm.bio,
        interests: editForm.interests,
      })
      setProfile(updatedProfile)
      setEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddInterest = () => {
    if (newInterest.trim() && !editForm.interests.includes(newInterest.trim())) {
      setEditForm({
        ...editForm,
        interests: [...editForm.interests, newInterest.trim()],
      })
      setNewInterest("")
    }
  }

  const handleRemoveInterest = (interest: string) => {
    setEditForm({
      ...editForm,
      interests: editForm.interests.filter((i) => i !== interest),
    })
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadAvatar(file)
      const updatedProfile = await getMyProfile()
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      })
    } catch (error) {
      console.error("Failed to upload avatar:", error)
      toast({
        title: "Error",
        description: "Failed to upload avatar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const url = await uploadCover(file)
      const updatedProfile = await getMyProfile()
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      toast({
        title: "Success",
        description: "Cover image updated successfully",
      })
    } catch (error) {
      console.error("Failed to upload cover:", error)
      toast({
        title: "Error",
        description: "Failed to upload cover image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleAddSocialLink = async () => {
    if (!newSocialPlatform.trim() || !newSocialUrl.trim()) return

    try {
      const updatedProfile = await addSocialLink(newSocialPlatform.trim(), newSocialUrl.trim())
      setProfile(updatedProfile)
      setNewSocialPlatform("")
      setNewSocialUrl("")
      toast({
        title: "Success",
        description: "Social link added successfully",
      })
    } catch (error) {
      console.error("Failed to add social link:", error)
      toast({
        title: "Error",
        description: "Failed to add social link",
        variant: "destructive",
      })
    }
  }

  const handleRemoveSocialLink = async (platform: string) => {
    try {
      const updatedProfile = await removeSocialLink(platform)
      setProfile(updatedProfile)
      toast({
        title: "Success",
        description: "Social link removed successfully",
      })
    } catch (error) {
      console.error("Failed to remove social link:", error)
      toast({
        title: "Error",
        description: "Failed to remove social link",
        variant: "destructive",
      })
    }
  }

  const getInterestIcon = (interest: string) => {
    const icons: Record<string, any> = {
      Web3: <Globe className="h-4 w-4" />,
      Motoko: <Code className="h-4 w-4" />,
      React: <Code className="h-4 w-4" />,
      TypeScript: <Code className="h-4 w-4" />,
      Blockchain: <Shield className="h-4 w-4" />,
      DeFi: <TrendingUp className="h-4 w-4" />,
      NFTs: <Gem className="h-4 w-4" />,
      "Smart Contracts": <Brain className="h-4 w-4" />,
      "UI/UX": <Palette className="h-4 w-4" />,
      "AI/ML": <Brain className="h-4 w-4" />,
    }
    return icons[interest] || <Sparkles className="h-4 w-4" />
  }

  const getInterestColor = (interest: string) => {
    const colors: Record<string, string> = {
      Web3: "from-blue-500 to-cyan-500",
      Motoko: "from-purple-500 to-indigo-500",
      React: "from-cyan-500 to-blue-500",
      TypeScript: "from-blue-600 to-indigo-600",
      Blockchain: "from-green-500 to-emerald-500",
      DeFi: "from-yellow-500 to-orange-500",
      NFTs: "from-pink-500 to-rose-500",
      "Smart Contracts": "from-violet-500 to-purple-500",
      "UI/UX": "from-pink-500 to-rose-500",
      "AI/ML": "from-violet-500 to-purple-500",
    }
    return colors[interest] || "from-gray-500 to-slate-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-xl">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-semibold">
            Loading your profile...
          </span>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Profile not found</h2>
          <Button onClick={loadProfile} className="bg-gradient-to-r from-indigo-500 to-purple-600">
            Retry Loading
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Cover Image */}
        <div className="h-80 relative">
          {profile.coverUrl ? (
            <Image src={profile.coverUrl || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Animated Floating Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-2xl animate-bounce" />
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-lg animate-pulse" />

          {/* Edit Cover Button */}
          <label className="absolute top-6 right-6 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md border border-white/30 text-white hover:from-white/30 hover:to-white/20 shadow-lg rounded-lg cursor-pointer transition-all duration-200">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Edit Cover
              </>
            )}
            <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute -bottom-20 left-0 right-0 px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <Avatar className="relative h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-2xl ring-4 ring-white/50">
                  <AvatarImage src={profile.avatarUrl || "/placeholder.svg"} alt={profile.name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 text-white">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 cursor-pointer flex items-center justify-center">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {/* Online Status */}
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left text-white mb-6">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                    {profile.name}
                  </h1>
                  <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-bold px-4 py-2 text-lg shadow-lg">
                    <Crown className="h-5 w-5 mr-2" />
                    {Number(profile.xpBalance)} XP
                  </Badge>
                </div>
                <p className="text-xl text-cyan-200 mb-3 font-medium">@{profile.id.slice(0, 8)}...</p>
                <p className="text-lg text-white/90 max-w-2xl leading-relaxed mb-4">{profile.bio}</p>

                {/* Interests */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {profile.interests?.slice(0, 4).map((interest, index) => (
                    <Badge
                      key={index}
                      className={`bg-gradient-to-r ${getInterestColor(interest)} text-white border-0 px-3 py-1 text-sm font-medium shadow-lg`}
                    >
                      {getInterestIcon(interest)}
                      <span className="ml-1">{interest}</span>
                    </Badge>
                  ))}
                </div>

                {/* Social Links */}
                {profile.socialLinks && profile.socialLinks.length > 0 && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                    {profile.socialLinks.map(([platform, url], index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white hover:bg-white/30 transition-all duration-200"
                      >
                        <Globe className="h-3 w-3" />
                        {platform}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <Button
                  size="lg"
                  onClick={() => setEditing(!editing)}
                  className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 hover:from-cyan-600 hover:via-blue-700 hover:to-indigo-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  {editing ? "Cancel" : "Edit Profile"}
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* XP Progress */}
          <Card className="mb-8 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 border-2 border-indigo-200 dark:border-indigo-800 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">Your XP Balance</h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">Earned through learning and teaching</p>
                </div>
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2">
                  <Zap className="h-4 w-4 mr-2" />
                  {Number(profile.xpBalance)} XP
                </Badge>
              </div>
            </CardContent>
          </Card>

          {editing ? (
            /* Edit Mode */
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md border-2 border-white/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                      <Edit3 className="h-6 w-6 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Edit Profile
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-lg font-semibold">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="text-lg p-3"
                      placeholder="Your display name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-lg font-semibold">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="text-lg p-3 min-h-[120px]"
                      placeholder="Tell others about yourself..."
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Interests</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddInterest()
                          }
                        }}
                        placeholder="Add an interest..."
                        className="flex-1"
                      />
                      <Button onClick={handleAddInterest} type="button">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editForm.interests.map((interest, index) => (
                        <Badge
                          key={index}
                          className={`bg-gradient-to-r ${getInterestColor(interest)} text-white border-0 px-3 py-2 cursor-pointer hover:opacity-80`}
                          onClick={() => handleRemoveInterest(interest)}
                        >
                          {getInterestIcon(interest)}
                          <span className="ml-1 mr-2">{interest}</span>
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">Social Links</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newSocialPlatform}
                        onChange={(e) => setNewSocialPlatform(e.target.value)}
                        placeholder="Platform (e.g., Twitter, LinkedIn)"
                        className="flex-1"
                      />
                      <Input
                        value={newSocialUrl}
                        onChange={(e) => setNewSocialUrl(e.target.value)}
                        placeholder="URL"
                        className="flex-1"
                      />
                      <Button onClick={handleAddSocialLink} type="button">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.socialLinks?.map(([platform, url], index) => (
                        <Badge
                          key={index}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-3 py-2 cursor-pointer hover:opacity-80"
                          onClick={() => handleRemoveSocialLink(platform)}
                        >
                          <Globe className="h-3 w-3 mr-1" />
                          <span className="mr-2">{platform}</span>
                          <X className="h-3 w-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white flex-1"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button onClick={() => setEditing(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* View Mode */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Details */}
              <div className="lg:col-span-2">
                <Card className="bg-gradient-to-br from-white/90 via-cyan-50/80 to-blue-50/90 backdrop-blur-md border-2 border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Profile Information
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">About</h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Interests</h3>
                      <div className="flex flex-wrap gap-3">
                        {profile.interests?.map((interest, index) => (
                          <Badge
                            key={index}
                            className={`bg-gradient-to-r ${getInterestColor(interest)} text-white border-0 px-4 py-2 text-sm font-medium shadow-lg`}
                          >
                            {getInterestIcon(interest)}
                            <span className="ml-2">{interest}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Social Links</h3>
                      {profile.socialLinks && profile.socialLinks.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {profile.socialLinks.map(([platform, url], index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg"
                            >
                              <Globe className="h-4 w-4" />
                              {platform}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No social links added yet</p>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Files</h3>
                      {profile.files && profile.files.length > 0 ? (
                        <div className="space-y-2">
                          {profile.files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg"
                            >
                              <LinkIcon className="h-4 w-4 text-gray-500" />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 dark:text-gray-100">{file.filename}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{file.category}</p>
                              </div>
                              <a
                                href={file.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400">No files uploaded yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Stats */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-white/90 via-purple-50/80 to-pink-50/90 backdrop-blur-md border-2 border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Your Stats
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-blue-700">Total XP</span>
                      </div>
                      <span className="font-bold text-blue-800">{Number(profile.xpBalance)}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-700">Files Uploaded</span>
                      </div>
                      <span className="font-bold text-green-800">{profile.files?.length || 0}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-purple-700">Interests</span>
                      </div>
                      <span className="font-bold text-purple-800">{profile.interests?.length || 0}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-orange-600" />
                        <span className="font-medium text-orange-700">Social Links</span>
                      </div>
                      <span className="font-bold text-orange-800">{profile.socialLinks?.length || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2 text-xl">
                      <Rocket className="h-6 w-6" />
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <Button
                        className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50"
                        variant="outline"
                        onClick={() => setEditing(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 rounded-md cursor-pointer transition-all duration-200">
                        <Upload className="h-4 w-4" />
                        Upload Files
                        <input
                          type="file"
                          multiple
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || [])
                            for (const file of files) {
                              try {
                                await uploadAndLinkFile(file, "document")
                                toast({
                                  title: "Success",
                                  description: `${file.name} uploaded successfully`,
                                })
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: `Failed to upload ${file.name}`,
                                  variant: "destructive",
                                })
                              }
                            }
                            // Refresh profile to show new files
                            const updatedProfile = await getMyProfile()
                            if (updatedProfile) setProfile(updatedProfile)
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
