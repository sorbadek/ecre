"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Zap,
  CreditCard,
  Download,
  Trash2,
  Save,
  Camera,
  Link,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Lock,
  Key,
  AlertTriangle,
  X,
  Plus,
} from "lucide-react"
import { AppLayout } from "@/components/app-layout"
import { RouteGuard } from "@/components/route-guard"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const [profileName, setProfileName] = useState(user?.name || "")
  const [profileBio, setProfileBio] = useState("A passionate learner and peer educator on Peerverse.")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    mentions: true,
    messages: true,
  })
  const [activeTab, setActiveTab] = useState("profile")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [unsavedChanges, setUnsavedChanges] = useState(false)

  // Profile Settings
  const [profileData, setProfileData] = useState({
    displayName: "Alex Johnson",
    username: "alexj",
    email: "alex.johnson@example.com",
    bio: "Full-stack developer passionate about React, Node.js, and machine learning. Always eager to learn and share knowledge with the community.",
    location: "San Francisco, CA",
    website: "https://alexjohnson.dev",
    twitter: "@alexjdev",
    linkedin: "linkedin.com/in/alexjohnson",
    github: "github.com/alexj",
    phone: "+1 (555) 123-4567",
    timezone: "America/Los_Angeles",
    language: "English",
    skills: ["React", "Node.js", "Python", "Machine Learning", "TypeScript"],
    interests: ["Web Development", "AI/ML", "Open Source", "Teaching"],
    availability: "Available for mentoring",
    hourlyRate: 50,
    experience: "Senior",
    education: "Computer Science, Stanford University",
  })

  // Notification Settings
  const [oldNotifications, setOldNotifications] = useState({
    email: {
      newMessages: true,
      sessionReminders: true,
      weeklyDigest: true,
      marketingEmails: false,
      securityAlerts: true,
      mentorshipUpdates: true,
      forumReplies: true,
      xpUpdates: false,
    },
    push: {
      newMessages: true,
      sessionReminders: true,
      liveSessionStarting: true,
      mentorshipActivity: true,
      forumActivity: false,
      marketplaceUpdates: false,
    },
    inApp: {
      soundEnabled: true,
      desktopNotifications: true,
      showPreviews: true,
      quietHours: true,
      quietStart: "22:00",
      quietEnd: "08:00",
    },
  })

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: "public", // public, friends, private
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showOnlineStatus: true,
    allowDirectMessages: "everyone", // everyone, friends, none
    showActivity: true,
    showXP: true,
    showReputation: true,
    indexProfile: true,
    allowMentorshipRequests: true,
    showLearningProgress: "friends", // public, friends, private
  })

  // Security Settings
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: 30, // minutes
    allowedDevices: 3,
    passwordLastChanged: "2024-01-01",
    activeSessions: [
      {
        id: 1,
        device: "MacBook Pro",
        location: "San Francisco, CA",
        lastActive: "2024-01-15T10:30:00Z",
        current: true,
      },
      { id: 2, device: "iPhone 15", location: "San Francisco, CA", lastActive: "2024-01-15T09:15:00Z", current: false },
      {
        id: 3,
        device: "Chrome Browser",
        location: "San Francisco, CA",
        lastActive: "2024-01-14T16:45:00Z",
        current: false,
      },
    ],
  })

  // Appearance Settings
  const [appearance, setAppearance] = useState({
    theme: "dark", // light, dark, system
    accentColor: "blue",
    fontSize: "medium", // small, medium, large
    compactMode: false,
    showAnimations: true,
    highContrast: false,
    reducedMotion: false,
  })

  // Billing Settings
  const [billing, setBilling] = useState({
    currentPlan: "Premium",
    billingCycle: "monthly",
    nextBilling: "2024-02-15",
    paymentMethod: "**** **** **** 4242",
    billingHistory: [
      { id: 1, date: "2024-01-15", amount: 19.99, description: "Premium Plan - Monthly", status: "paid" },
      { id: 2, date: "2023-12-15", amount: 19.99, description: "Premium Plan - Monthly", status: "paid" },
      { id: 3, date: "2023-11-15", amount: 19.99, description: "Premium Plan - Monthly", status: "paid" },
    ],
    autoRenew: true,
    xpBalance: user?.xp || 0, // Use actual user XP
    xpPurchaseHistory: [
      { id: 1, date: "2024-01-10", amount: 1000, cost: 0.8, currency: "ICP" },
      { id: 2, date: "2024-01-05", amount: 500, cost: 0.45, currency: "ICP" },
    ],
  })

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate API call
    console.log("Saving profile:", { profileName, profileBio })
    toast({
      title: "Profile Saved",
      description: "Your profile information has been updated.",
      variant: "success",
    })
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirm password do not match.",
        variant: "destructive",
      })
      return
    }
    // Simulate API call
    console.log("Changing password:", { currentPassword, newPassword })
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
      variant: "success",
    })
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
      variant: "success",
    })
  }

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      // Simulate API call
      console.log("Deleting account...")
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
        variant: "destructive",
      })
      logout() // Log out after deletion
    }
  }

  const handleRevokeSessions = () => {
    if (
      window.confirm("Are you sure you want to revoke all active sessions? You will be logged out from all devices.")
    ) {
      // Simulate API call
      console.log("Revoking sessions...")
      toast({
        title: "Sessions Revoked",
        description: "All active sessions have been revoked. You will be logged out shortly.",
        variant: "default",
      })
      logout() // Log out after revoking sessions
    }
  }

  const handleSaveProfile = () => {
    // Simulate saving profile changes
    setUnsavedChanges(false)
    toast({
      title: "Profile Saved",
      description: "Your profile settings have been updated.",
      variant: "success",
    })
    console.log("Saving profile:", profileData)
  }

  const handleOldDeleteAccount = () => {
    // Simulate account deletion
    toast({
      title: "Account Deleted",
      description: "Your account has been permanently deleted.",
      variant: "destructive",
    })
    console.log("Deleting account")
    setShowDeleteModal(false)
  }

  const handleOldChangePassword = () => {
    // Simulate password change
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
      variant: "success",
    })
    console.log("Changing password")
    setShowPasswordModal(false)
  }

  const handleRevokeSession = (sessionId: number) => {
    setSecurity((prev) => ({
      ...prev,
      activeSessions: prev.activeSessions.filter((session) => session.id !== sessionId),
    }))
    toast({
      title: "Session Revoked",
      description: "The selected session has been terminated.",
      variant: "default",
    })
  }

  const handleExportData = () => {
    // Simulate data export
    toast({
      title: "Data Export Initiated",
      description: "Your data export is being prepared and will be sent to your email.",
      variant: "default",
    })
    console.log("Exporting user data")
  }

  return (
    <RouteGuard>
      <AppLayout>
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Settings</h1>
              <p className="text-gray-400 text-sm md:text-base">Manage your account preferences and privacy settings</p>
            </div>
            {unsavedChanges && (
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm">You have unsaved changes</span>
                <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-[#1A1F2E] h-auto">
              <TabsTrigger value="profile" className="data-[state=active]:bg-blue-600 flex-col sm:flex-row py-2">
                <User className="w-4 h-4 mr-0 sm:mr-2 mb-1 sm:mb-0" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-600 flex-col sm:flex-row py-2">
                <Bell className="w-4 h-4 mr-0 sm:mr-2 mb-1 sm:mb-0" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy" className="data-[state=active]:bg-blue-600 flex-col sm:flex-row py-2">
                <Shield className="w-4 h-4 mr-0 sm:mr-2 mb-1 sm:mb-0" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-blue-600 flex-col sm:flex-row py-2">
                <Lock className="w-4 h-4 mr-0 sm:mr-2 mb-1 sm:mb-0" />
                Security
              </TabsTrigger>
              <TabsTrigger value="appearance" className="data-[state=active]:bg-blue-600 flex-col sm:flex-row py-2">
                <Palette className="w-4 h-4 mr-0 sm:mr-2 mb-1 sm:mb-0" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-blue-600 flex-col sm:flex-row py-2">
                <CreditCard className="w-4 h-4 mr-0 sm:mr-2 mb-1 sm:mb-0" />
                Billing
              </TabsTrigger>
            </TabsList>

            {/* Profile Settings */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center relative">
                        <span className="text-white text-2xl font-bold">AJ</span>
                        <Button
                          size="sm"
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-700"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{profileData.displayName}</h3>
                        <p className="text-gray-400">@{profileData.username}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Display Name</label>
                      <Input
                        value={profileData.displayName}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, displayName: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Username</label>
                      <Input
                        value={profileData.username}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, username: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Email</label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, email: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Bio</label>
                      <Textarea
                        value={profileData.bio}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, bio: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white h-24"
                        placeholder="Tell others about yourself..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Location
                      </label>
                      <Input
                        value={profileData.location}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, location: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white"
                        placeholder="City, Country"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone
                      </label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, phone: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        <Link className="w-4 h-4 inline mr-1" />
                        Website
                      </label>
                      <Input
                        value={profileData.website}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, website: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Twitter</label>
                      <Input
                        value={profileData.twitter}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, twitter: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white"
                        placeholder="@username"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">LinkedIn</label>
                      <Input
                        value={profileData.linkedin}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, linkedin: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white"
                        placeholder="linkedin.com/in/username"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">GitHub</label>
                      <Input
                        value={profileData.github}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, github: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white"
                        placeholder="github.com/username"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Professional Information */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Professional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        <Briefcase className="w-4 h-4 inline mr-1" />
                        Experience Level
                      </label>
                      <select
                        value={profileData.experience}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, experience: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="w-full px-3 py-2 bg-[#0F1419] border border-gray-700 rounded-md text-white"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        <GraduationCap className="w-4 h-4 inline mr-1" />
                        Education
                      </label>
                      <Input
                        value={profileData.education}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, education: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white"
                        placeholder="Degree, University"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Availability</label>
                      <select
                        value={profileData.availability}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, availability: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="w-full px-3 py-2 bg-[#0F1419] border border-gray-700 rounded-md text-white"
                      >
                        <option value="Available for mentoring">Available for mentoring</option>
                        <option value="Available for projects">Available for projects</option>
                        <option value="Available for both">Available for both</option>
                        <option value="Not available">Not available</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Hourly Rate (XP)</label>
                      <Input
                        type="number"
                        value={profileData.hourlyRate}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, hourlyRate: Number.parseInt(e.target.value) }))
                          setUnsavedChanges(true)
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white"
                        placeholder="50"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Skills</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profileData.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-blue-400 border-blue-400">
                            {skill}
                            <X
                              className="w-3 h-3 ml-1 cursor-pointer"
                              onClick={() => {
                                setProfileData((prev) => ({
                                  ...prev,
                                  skills: prev.skills.filter((_, i) => i !== index),
                                }))
                                setUnsavedChanges(true)
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add a skill and press Enter"
                        className="bg-[#0F1419] border-gray-700 text-white"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim()) {
                            setProfileData((prev) => ({
                              ...prev,
                              skills: [...prev.skills, e.currentTarget.value.trim()],
                            }))
                            e.currentTarget.value = ""
                            setUnsavedChanges(true)
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">
                        <Globe className="w-4 h-4 inline mr-1" />
                        Timezone
                      </label>
                      <select
                        value={profileData.timezone}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, timezone: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="w-full px-3 py-2 bg-[#0F1419] border border-gray-700 rounded-md text-white"
                      >
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Language</label>
                      <select
                        value={profileData.language}
                        onChange={(e) => {
                          setProfileData((prev) => ({ ...prev, language: e.target.value }))
                          setUnsavedChanges(true)
                        }}
                        className="w-full px-3 py-2 bg-[#0F1419] border border-gray-700 rounded-md text-white"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Chinese">Chinese</option>
                        <option value="Japanese">Japanese</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Interests</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {profileData.interests.map((interest, index) => (
                          <Badge key={index} variant="outline" className="text-green-400 border-green-400">
                            {interest}
                            <X
                              className="w-3 h-3 ml-1 cursor-pointer"
                              onClick={() => {
                                setProfileData((prev) => ({
                                  ...prev,
                                  interests: prev.interests.filter((_, i) => i !== index),
                                }))
                                setUnsavedChanges(true)
                              }}
                            />
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Add an interest and press Enter"
                        className="bg-[#0F1419] border-gray-700 text-white"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && e.currentTarget.value.trim()) {
                            setProfileData((prev) => ({
                              ...prev,
                              interests: [...prev.interests, e.currentTarget.value.trim()],
                            }))
                            e.currentTarget.value = ""
                            setUnsavedChanges(true)
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Notification Settings */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email Notifications */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Email Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(oldNotifications.email).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-sm font-medium">
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {key === "newMessages" && "Get notified when you receive new messages"}
                            {key === "sessionReminders" && "Reminders for upcoming sessions"}
                            {key === "weeklyDigest" && "Weekly summary of your activity"}
                            {key === "marketingEmails" && "Updates about new features and promotions"}
                            {key === "securityAlerts" && "Important security notifications"}
                            {key === "mentorshipUpdates" && "Updates from your mentorship circles"}
                            {key === "forumReplies" && "When someone replies to your forum posts"}
                            {key === "xpUpdates" && "XP balance and transaction notifications"}
                          </div>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => {
                            setOldNotifications((prev) => ({
                              ...prev,
                              email: { ...prev.email, [key]: checked },
                            }))
                          }}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Push Notifications */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Smartphone className="w-5 h-5 mr-2" />
                      Push Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Object.entries(oldNotifications.push).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-sm font-medium">
                            {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {key === "newMessages" && "Instant notifications for new messages"}
                            {key === "sessionReminders" && "Push reminders for sessions"}
                            {key === "liveSessionStarting" && "When live sessions you joined are starting"}
                            {key === "mentorshipActivity" && "Activity in your mentorship circles"}
                            {key === "forumActivity" && "Forum replies and mentions"}
                            {key === "marketplaceUpdates" && "New items in marketplace"}
                          </div>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => {
                            setOldNotifications((prev) => ({
                              ...prev,
                              push: { ...prev.push, [key]: checked },
                            }))
                          }}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* In-App Notifications */}
                <Card className="bg-[#1A1F2E] border-gray-700 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Monitor className="w-5 h-5 mr-2" />
                      In-App Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm font-medium">Sound Enabled</div>
                            <div className="text-gray-400 text-xs">Play notification sounds</div>
                          </div>
                          <Switch
                            checked={oldNotifications.inApp.soundEnabled}
                            onCheckedChange={(checked) => {
                              setOldNotifications((prev) => ({
                                ...prev,
                                inApp: { ...prev.inApp, soundEnabled: checked },
                              }))
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm font-medium">Desktop Notifications</div>
                            <div className="text-gray-400 text-xs">Show browser notifications</div>
                          </div>
                          <Switch
                            checked={oldNotifications.inApp.desktopNotifications}
                            onCheckedChange={(checked) => {
                              setOldNotifications((prev) => ({
                                ...prev,
                                inApp: { ...prev.inApp, desktopNotifications: checked },
                              }))
                            }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm font-medium">Show Previews</div>
                            <div className="text-gray-400 text-xs">Show message content in notifications</div>
                          </div>
                          <Switch
                            checked={oldNotifications.inApp.showPreviews}
                            onCheckedChange={(checked) => {
                              setOldNotifications((prev) => ({
                                ...prev,
                                inApp: { ...prev.inApp, showPreviews: checked },
                              }))
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm font-medium">Quiet Hours</div>
                            <div className="text-gray-400 text-xs">Disable notifications during specified hours</div>
                          </div>
                          <Switch
                            checked={oldNotifications.inApp.quietHours}
                            onCheckedChange={(checked) => {
                              setOldNotifications((prev) => ({
                                ...prev,
                                inApp: { ...prev.inApp, quietHours: checked },
                              }))
                            }}
                          />
                        </div>

                        {oldNotifications.inApp.quietHours && (
                          <>
                            <div>
                              <label className="block text-gray-400 text-sm mb-2">Quiet Start Time</label>
                              <Input
                                type="time"
                                value={oldNotifications.inApp.quietStart}
                                onChange={(e) => {
                                  setOldNotifications((prev) => ({
                                    ...prev,
                                    inApp: { ...prev.inApp, quietStart: e.target.value },
                                  }))
                                }}
                                className="bg-[#0F1419] border-gray-700 text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-400 text-sm mb-2">Quiet End Time</label>
                              <Input
                                type="time"
                                value={oldNotifications.inApp.quietEnd}
                                onChange={(e) => {
                                  setOldNotifications((prev) => ({
                                    ...prev,
                                    inApp: { ...prev.inApp, quietEnd: e.target.value },
                                  }))
                                }}
                                className="bg-[#0F1419] border-gray-700 text-white"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Privacy */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Profile Privacy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Profile Visibility</label>
                      <select
                        value={privacy.profileVisibility}
                        onChange={(e) => {
                          setPrivacy((prev) => ({ ...prev, profileVisibility: e.target.value }))
                        }}
                        className="w-full px-3 py-2 bg-[#0F1419] border border-gray-700 rounded-md text-white"
                      >
                        <option value="public">Public - Anyone can view</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private - Only you</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Show Email</div>
                        <div className="text-gray-400 text-xs">Display email on public profile</div>
                      </div>
                      <Switch
                        checked={privacy.showEmail}
                        onCheckedChange={(checked) => {
                          setPrivacy((prev) => ({ ...prev, showEmail: checked }))
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Show Phone</div>
                        <div className="text-gray-400 text-xs">Display phone number on profile</div>
                      </div>
                      <Switch
                        checked={privacy.showPhone}
                        onCheckedChange={(checked) => {
                          setPrivacy((prev) => ({ ...prev, showPhone: checked }))
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Show Location</div>
                        <div className="text-gray-400 text-xs">Display location on profile</div>
                      </div>
                      <Switch
                        checked={privacy.showLocation}
                        onCheckedChange={(checked) => {
                          setPrivacy((prev) => ({ ...prev, showLocation: checked }))
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Show Online Status</div>
                        <div className="text-gray-400 text-xs">Let others see when you're online</div>
                      </div>
                      <Switch
                        checked={privacy.showOnlineStatus}
                        onCheckedChange={(checked) => {
                          setPrivacy((prev) => ({ ...prev, showOnlineStatus: checked }))
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Index Profile</div>
                        <div className="text-gray-400 text-xs">Allow search engines to index your profile</div>
                      </div>
                      <Switch
                        checked={privacy.indexProfile}
                        onCheckedChange={(checked) => {
                          setPrivacy((prev) => ({ ...prev, indexProfile: checked }))
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Privacy */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Activity Privacy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Direct Messages</label>
                      <select
                        value={privacy.allowDirectMessages}
                        onChange={(e) => {
                          setPrivacy((prev) => ({ ...prev, allowDirectMessages: e.target.value }))
                        }}
                        className="w-full px-3 py-2 bg-[#0F1419] border border-gray-700 rounded-md text-white"
                      >
                        <option value="everyone">Everyone can message me</option>
                        <option value="friends">Friends only</option>
                        <option value="none">No one can message me</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Learning Progress</label>
                      <select
                        value={privacy.showLearningProgress}
                        onChange={(e) => {
                          setPrivacy((prev) => ({ ...prev, showLearningProgress: e.target.value }))
                        }}
                        className="w-full px-3 py-2 bg-[#0F1419] border border-gray-700 rounded-md text-white"
                      >
                        <option value="public">Public - Anyone can see</option>
                        <option value="friends">Friends only</option>
                        <option value="private">Private - Only you</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Show Activity</div>
                        <div className="text-gray-400 text-xs">Display recent activity on profile</div>
                      </div>
                      <Switch
                        checked={privacy.showActivity}
                        onCheckedChange={(checked) => {
                          setPrivacy((prev) => ({ ...prev, showActivity: checked }))
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Show XP</div>
                        <div className="text-gray-400 text-xs">Display XP balance on profile</div>
                      </div>
                      <Switch
                        checked={privacy.showXP}
                        onCheckedChange={(checked) => {
                          setPrivacy((prev) => ({ ...prev, showXP: checked }))
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Show Reputation</div>
                        <div className="text-gray-400 text-xs">Display reputation score on profile</div>
                      </div>
                      <Switch
                        checked={privacy.showReputation}
                        onCheckedChange={(checked) => {
                          setPrivacy((prev) => ({ ...prev, showReputation: checked }))
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Allow Mentorship Requests</div>
                        <div className="text-gray-400 text-xs">Let others request mentorship from you</div>
                      </div>
                      <Switch
                        checked={privacy.allowMentorshipRequests}
                        onCheckedChange={(checked) => {
                          setPrivacy((prev) => ({ ...prev, allowMentorshipRequests: checked }))
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Settings */}
            <TabsContent value="security" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Security */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Account Security</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Two-Factor Authentication</div>
                        <div className="text-gray-400 text-xs">Add an extra layer of security</div>
                      </div>
                      <Switch
                        checked={security.twoFactorEnabled}
                        onCheckedChange={(checked) => {
                          setSecurity((prev) => ({ ...prev, twoFactorEnabled: checked }))
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Login Alerts</div>
                        <div className="text-gray-400 text-xs">Get notified of new login attempts</div>
                      </div>
                      <Switch
                        checked={security.loginAlerts}
                        onCheckedChange={(checked) => {
                          setSecurity((prev) => ({ ...prev, loginAlerts: checked }))
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Session Timeout (minutes)</label>
                      <Input
                        type="number"
                        value={security.sessionTimeout}
                        onChange={(e) => {
                          setSecurity((prev) => ({ ...prev, sessionTimeout: Number.parseInt(e.target.value) }))
                        }}
                        className="bg-[#0F1419] border-gray-700 text-white"
                        min="5"
                        max="480"
                      />
                    </div>

                    <div>
                      <Button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                      <p className="text-gray-400 text-xs mt-1">
                        Last changed: {new Date(security.passwordLastChanged).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Sessions */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Active Sessions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {security.activeSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            {session.device.includes("iPhone") ? (
                              <Smartphone className="w-5 h-5 text-white" />
                            ) : (
                              <Monitor className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium flex items-center">
                              {session.device}
                              {session.current && (
                                <Badge className="ml-2 bg-green-600 text-white text-xs">Current</Badge>
                              )}
                            </div>
                            <div className="text-gray-400 text-xs">{session.location}</div>
                            <div className="text-gray-400 text-xs">
                              Last active: {new Date(session.lastActive).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {!session.current && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                            className="text-red-400 border-red-600 hover:bg-red-600"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Data & Privacy */}
                <Card className="bg-[#1A1F2E] border-gray-700 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-white">Data & Privacy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Button onClick={handleExportData} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </Button>

                      <Button variant="outline" className="text-gray-400 border-gray-600 bg-transparent">
                        <Shield className="w-4 h-4 mr-2" />
                        Privacy Policy
                      </Button>

                      <Button
                        onClick={() => setShowDeleteModal(true)}
                        variant="outline"
                        className="text-red-400 border-red-600 hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Theme Settings */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Theme</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Color Theme</label>
                      <div className="grid grid-cols-3 gap-2">
                        {["light", "dark", "system"].map((theme) => (
                          <Button
                            key={theme}
                            variant={appearance.theme === theme ? "default" : "outline"}
                            onClick={() => setAppearance((prev) => ({ ...prev, theme }))}
                            className={`flex items-center justify-center p-3 ${
                              appearance.theme === theme ? "bg-blue-600 text-white" : "text-gray-400 border-gray-600"
                            }`}
                          >
                            {theme === "light" && <Sun className="w-4 h-4 mr-2" />}
                            {theme === "dark" && <Moon className="w-4 h-4 mr-2" />}
                            {theme === "system" && <Monitor className="w-4 h-4 mr-2" />}
                            {theme.charAt(0).toUpperCase() + theme.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Accent Color</label>
                      <div className="grid grid-cols-4 gap-2">
                        {["blue", "purple", "green", "orange"].map((color) => (
                          <Button
                            key={color}
                            variant="outline"
                            onClick={() => setAppearance((prev) => ({ ...prev, accentColor: color }))}
                            className={`h-10 ${appearance.accentColor === color ? "ring-2 ring-white" : ""}`}
                            style={{
                              backgroundColor:
                                color === "blue"
                                  ? "#3B82F6"
                                  : color === "purple"
                                    ? "#8B5CF6"
                                    : color === "green"
                                      ? "#10B981"
                                      : "#F59E0B",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Font Size</label>
                      <select
                        value={appearance.fontSize}
                        onChange={(e) => {
                          setAppearance((prev) => ({ ...prev, fontSize: e.target.value }))
                        }}
                        className="w-full px-3 py-2 bg-[#0F1419] border border-gray-700 rounded-md text-white"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>

                {/* Display Settings */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Display</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Compact Mode</div>
                        <div className="text-gray-400 text-xs">Reduce spacing and padding</div>
                      </div>
                      <Switch
                        checked={appearance.compactMode}
                        onCheckedChange={(checked) => {
                          setAppearance((prev) => ({ ...prev, compactMode: checked }))
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Show Animations</div>
                        <div className="text-gray-400 text-xs">Enable smooth transitions and animations</div>
                      </div>
                      <Switch
                        checked={appearance.showAnimations}
                        onCheckedChange={(checked) => {
                          setAppearance((prev) => ({ ...prev, showAnimations: checked }))
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">High Contrast</div>
                        <div className="text-gray-400 text-xs">Increase contrast for better visibility</div>
                      </div>
                      <Switch
                        checked={appearance.highContrast}
                        onCheckedChange={(checked) => {
                          setAppearance((prev) => ({ ...prev, highContrast: checked }))
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Reduced Motion</div>
                        <div className="text-gray-400 text-xs">Minimize motion for accessibility</div>
                      </div>
                      <Switch
                        checked={appearance.reducedMotion}
                        onCheckedChange={(checked) => {
                          setAppearance((prev) => ({ ...prev, reducedMotion: checked }))
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Billing Settings */}
            <TabsContent value="billing" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Plan */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Current Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-lg font-semibold">{billing.currentPlan}</div>
                        <div className="text-gray-400 text-sm">Billed {billing.billingCycle}</div>
                      </div>
                      <Badge className="bg-green-600 text-white">Active</Badge>
                    </div>

                    <div className="text-gray-400 text-sm">
                      Next billing date: {new Date(billing.nextBilling).toLocaleDateString()}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">Auto-renewal</div>
                        <div className="text-gray-400 text-xs">Automatically renew subscription</div>
                      </div>
                      <Switch
                        checked={billing.autoRenew}
                        onCheckedChange={(checked) => {
                          setBilling((prev) => ({ ...prev, autoRenew: checked }))
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Upgrade Plan</Button>
                      <Button variant="outline" className="w-full text-gray-400 border-gray-600 bg-transparent">
                        Change Billing Cycle
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{billing.paymentMethod}</div>
                        <div className="text-gray-400 text-xs">Expires 12/2025</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Update Payment Method</Button>
                      <Button variant="outline" className="w-full text-gray-400 border-gray-600 bg-transparent">
                        Add Payment Method
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* XP Balance */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                      XP Balance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">{billing.xpBalance.toLocaleString()}</div>
                      <div className="text-gray-400 text-sm">XP Available</div>
                    </div>

                    <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Purchase More XP
                    </Button>

                    <div className="space-y-2">
                      <div className="text-gray-400 text-sm font-medium">Recent Purchases</div>
                      {billing.xpPurchaseHistory.map((purchase) => (
                        <div key={purchase.id} className="flex justify-between text-sm">
                          <span className="text-gray-400">{new Date(purchase.date).toLocaleDateString()}</span>
                          <span className="text-white">
                            +{purchase.amount} XP ({purchase.cost} {purchase.currency})
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Billing History */}
                <Card className="bg-[#1A1F2E] border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Billing History</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {billing.billingHistory.map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                        <div>
                          <div className="text-white text-sm font-medium">{bill.description}</div>
                          <div className="text-gray-400 text-xs">{new Date(bill.date).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-white text-sm font-medium">${bill.amount}</div>
                          <Badge
                            className={bill.status === "paid" ? "bg-green-600 text-white" : "bg-red-600 text-white"}
                          >
                            {bill.status}
                          </Badge>
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" className="w-full text-gray-400 border-gray-600 bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Download All Invoices
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Delete Account Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="bg-[#1A1F2E] border-red-600 w-full max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Delete Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400">
                    This action cannot be undone. This will permanently delete your account and remove all your data
                    from our servers.
                  </p>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Type "DELETE" to confirm</label>
                    <Input placeholder="DELETE" className="bg-[#0F1419] border-gray-700 text-white" />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteModal(false)}
                      className="text-gray-400 border-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleOldDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="bg-[#1A1F2E] border-gray-700 w-full max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Current Password</label>
                    <Input
                      type="password"
                      placeholder="Enter current password"
                      className="bg-[#0F1419] border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">New Password</label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      className="bg-[#0F1419] border-gray-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Confirm New Password</label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      className="bg-[#0F1419] border-gray-700 text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordModal(false)}
                      className="text-gray-400 border-gray-600"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleOldChangePassword} className="bg-blue-600 hover:bg-blue-700 text-white">
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </AppLayout>
    </RouteGuard>
  )
}
