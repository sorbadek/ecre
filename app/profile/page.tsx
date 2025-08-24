"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  MessageSquare,
  BookOpen,
  Zap,
  Star,
  Calendar,
  MapPin,
  LinkIcon,
  Github,
  Twitter,
  Globe,
  UserIcon,
  Lightbulb,
  Users,
  TrendingUp,
  Target,
  Clock,
  Trophy,
  Flame,
  Heart,
  Share2,
  Settings,
  Edit3,
  Camera,
  Plus,
  ChevronRight,
  Sparkles,
  Crown,
  Shield,
  Rocket,
  Brain,
  Code,
  Palette,
  Music,
  Coffee,
  Mountain,
  Gamepad2,
  Diamond,
  Gem,
  ZapIcon,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  // Enhanced mock data for a more beautiful profile
  const currentUserProfile = {
    id: user?.principal || "user_id",
    name: user?.name || "Alex Rivera",
    username: user?.principal ? user.principal.substring(0, 8) + "..." : "alex_rivera",
    avatar: user?.avatar || "/alice-johnson-avatar.png",
    coverImage: "/abstract-geometric-shapes.png",
    bio: "🚀 Full-stack developer passionate about Web3 & decentralized learning. Building the future of education on the Internet Computer. Always learning, always teaching. 🌟",
    location: "San Francisco, CA",
    joinedDate: "2023-01-01",
    socialLinks: {
      website: "https://alexrivera.dev",
      github: "https://github.com/alexrivera",
      twitter: "https://twitter.com/alexrivera_dev",
    },
    xp: user?.xp || 12450,
    reputation: 4.8,
    level: 15,
    nextLevelXP: 15000,
    streak: 23,
    badges: [
      {
        name: "Pioneer",
        icon: <Rocket className="h-4 w-4" />,
        color: "from-violet-500 via-purple-500 to-pink-500",
        rarity: "legendary",
        glow: "shadow-violet-500/50",
      },
      {
        name: "Code Master",
        icon: <Code className="h-4 w-4" />,
        color: "from-cyan-400 via-blue-500 to-indigo-600",
        rarity: "epic",
        glow: "shadow-blue-500/50",
      },
      {
        name: "Community Hero",
        icon: <Heart className="h-4 w-4" />,
        color: "from-rose-400 via-pink-500 to-red-500",
        rarity: "rare",
        glow: "shadow-pink-500/50",
      },
      {
        name: "Knowledge Seeker",
        icon: <Brain className="h-4 w-4" />,
        color: "from-emerald-400 via-green-500 to-teal-600",
        rarity: "common",
        glow: "shadow-green-500/50",
      },
      {
        name: "Creative Mind",
        icon: <Palette className="h-4 w-4" />,
        color: "from-amber-400 via-orange-500 to-red-500",
        rarity: "rare",
        glow: "shadow-orange-500/50",
      },
      {
        name: "Night Owl",
        icon: <Coffee className="h-4 w-4" />,
        color: "from-yellow-400 via-amber-500 to-orange-600",
        rarity: "common",
        glow: "shadow-amber-500/50",
      },
      {
        name: "Diamond Achiever",
        icon: <Diamond className="h-4 w-4" />,
        color: "from-slate-300 via-gray-200 to-zinc-300",
        rarity: "legendary",
        glow: "shadow-gray-400/50",
      },
      {
        name: "Gem Collector",
        icon: <Gem className="h-4 w-4" />,
        color: "from-fuchsia-400 via-purple-500 to-violet-600",
        rarity: "epic",
        glow: "shadow-purple-500/50",
      },
    ],
    interests: ["Web3", "Motoko", "React", "Design", "Music", "Gaming", "Travel", "AI/ML"],
    skills: [
      { name: "Motoko", level: 95, color: "from-purple-500 via-violet-500 to-indigo-600" },
      { name: "React", level: 88, color: "from-blue-400 via-cyan-500 to-teal-600" },
      { name: "TypeScript", level: 92, color: "from-blue-600 via-indigo-600 to-purple-700" },
      { name: "UI/UX Design", level: 75, color: "from-pink-400 via-rose-500 to-red-600" },
      { name: "Smart Contracts", level: 85, color: "from-green-400 via-emerald-500 to-teal-600" },
      { name: "Node.js", level: 80, color: "from-lime-400 via-green-500 to-emerald-600" },
    ],
    contributions: [
      {
        type: "course",
        title: "Advanced Motoko Patterns",
        description: "Deep dive into advanced Motoko programming patterns and best practices for ICP development.",
        xp: 750,
        rating: 4.9,
        students: 234,
        thumbnail: "/motoko-programming-tutorial.png",
        tags: ["Motoko", "Advanced", "ICP"],
        publishedDate: "2024-07-15",
        color: "from-purple-500 to-indigo-600",
      },
      {
        type: "tutorial",
        title: "Building Responsive Web3 UIs",
        description: "Complete guide to creating beautiful, responsive user interfaces for decentralized applications.",
        xp: 500,
        rating: 4.7,
        students: 189,
        thumbnail: "/frontend-development-coding.png",
        tags: ["Frontend", "Web3", "UI/UX"],
        publishedDate: "2024-06-28",
        color: "from-cyan-500 to-blue-600",
      },
      {
        type: "workshop",
        title: "Rust for Blockchain Developers",
        description: "Hands-on workshop covering Rust fundamentals for blockchain and smart contract development.",
        xp: 600,
        rating: 4.8,
        students: 156,
        thumbnail: "/rust-programming-workshop.png",
        tags: ["Rust", "Blockchain", "Workshop"],
        publishedDate: "2024-06-10",
        color: "from-orange-500 to-red-600",
      },
      {
        type: "course",
        title: "DeFi Protocol Development",
        description: "Learn to build decentralized finance protocols from scratch using modern Web3 technologies.",
        xp: 850,
        rating: 4.9,
        students: 312,
        thumbnail: "/web3-development.png",
        tags: ["DeFi", "Web3", "Smart Contracts"],
        publishedDate: "2024-05-20",
        color: "from-emerald-500 to-green-600",
      },
    ],
    achievements: [
      {
        title: "First Course Published",
        description: "Published your first educational content",
        date: "2023-02-15",
        icon: <BookOpen className="h-5 w-5" />,
        color: "from-blue-500 via-indigo-500 to-purple-600",
      },
      {
        title: "100 Students Milestone",
        description: "Reached 100 students across all courses",
        date: "2023-08-20",
        icon: <Users className="h-5 w-5" />,
        color: "from-green-400 via-emerald-500 to-teal-600",
      },
      {
        title: "Top Rated Instructor",
        description: "Maintained 4.8+ rating for 6 months",
        date: "2024-01-10",
        icon: <Star className="h-5 w-5" />,
        color: "from-yellow-400 via-orange-500 to-red-500",
      },
      {
        title: "Community Champion",
        description: "Helped over 500 students in forums",
        date: "2024-03-15",
        icon: <Heart className="h-5 w-5" />,
        color: "from-pink-400 via-rose-500 to-red-500",
      },
      {
        title: "Innovation Award",
        description: "Created most innovative course of 2024",
        date: "2024-06-01",
        icon: <Lightbulb className="h-5 w-5" />,
        color: "from-amber-400 via-yellow-500 to-orange-500",
      },
      {
        title: "Streak Master",
        description: "Maintained 30+ day learning streak",
        date: "2024-07-01",
        icon: <Flame className="h-5 w-5" />,
        color: "from-orange-400 via-red-500 to-pink-500",
      },
    ],
    stats: {
      totalStudents: 579,
      totalCourses: 12,
      totalHours: 48,
      completionRate: 94,
      avgRating: 4.8,
      totalEarnings: 2450,
    },
  }

  const formatJoinedDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  }

  const getInterestIcon = (interest: string) => {
    const icons: Record<string, any> = {
      Web3: <Globe className="h-4 w-4" />,
      Motoko: <Code className="h-4 w-4" />,
      React: <Code className="h-4 w-4" />,
      Design: <Palette className="h-4 w-4" />,
      Music: <Music className="h-4 w-4" />,
      Gaming: <Gamepad2 className="h-4 w-4" />,
      Travel: <Mountain className="h-4 w-4" />,
      "AI/ML": <Brain className="h-4 w-4" />,
    }
    return icons[interest] || <Sparkles className="h-4 w-4" />
  }

  const getInterestColor = (interest: string) => {
    const colors: Record<string, string> = {
      Web3: "from-blue-500 to-cyan-500",
      Motoko: "from-purple-500 to-indigo-500",
      React: "from-cyan-500 to-blue-500",
      Design: "from-pink-500 to-rose-500",
      Music: "from-green-500 to-emerald-500",
      Gaming: "from-orange-500 to-red-500",
      Travel: "from-teal-500 to-green-500",
      "AI/ML": "from-violet-500 to-purple-500",
    }
    return colors[interest] || "from-gray-500 to-slate-500"
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-indigo-900 dark:to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Cover Image */}
        <div className="h-96 relative">
          <div
            className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
            style={{
              backgroundImage: `url(${currentUserProfile.coverImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/80 via-purple-600/60 to-pink-600/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Animated Floating Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-2xl animate-bounce" />
          <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-full blur-lg animate-pulse" />
          <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-full blur-xl animate-bounce" />

          {/* Edit Cover Button */}
          <Button
            size="sm"
            className="absolute top-6 right-6 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-md border border-white/30 text-white hover:from-white/30 hover:to-white/20 shadow-lg"
          >
            <Camera className="h-4 w-4 mr-2" />
            Edit Cover
          </Button>
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute -bottom-24 left-0 right-0 px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Avatar className="relative h-36 w-36 md:h-44 md:w-44 border-4 border-white shadow-2xl ring-4 ring-white/50">
                  <AvatarImage src={currentUserProfile.avatar || "/placeholder.svg"} alt={currentUserProfile.name} />
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 text-white">
                    {currentUserProfile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                {/* Online Status */}
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left text-white mb-8">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-200 bg-clip-text text-transparent">
                    {currentUserProfile.name}
                  </h1>
                  <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white font-bold px-4 py-2 text-lg shadow-lg">
                    <Crown className="h-5 w-5 mr-2" />
                    Level {currentUserProfile.level}
                  </Badge>
                </div>
                <p className="text-2xl text-cyan-200 mb-4 font-medium">@{currentUserProfile.username}</p>
                <p className="text-lg text-white/90 max-w-3xl leading-relaxed mb-6">{currentUserProfile.bio}</p>

                {/* Quick Stats */}
                <div className="flex flex-wrap justify-center md:justify-start gap-8 text-sm">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <MapPin className="h-5 w-5 text-cyan-300" />
                    <span className="text-white font-medium">{currentUserProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Calendar className="h-5 w-5 text-green-300" />
                    <span className="text-white font-medium">
                      Joined {formatJoinedDate(currentUserProfile.joinedDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                    <Flame className="h-5 w-5 text-orange-400" />
                    <span className="text-white font-medium">{currentUserProfile.streak} day streak</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 hover:from-cyan-600 hover:via-blue-700 hover:to-indigo-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-600 hover:from-pink-600 hover:via-rose-600 hover:to-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
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
      <div className="pt-32 pb-12 px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-6 text-center">
                <ZapIcon className="h-8 w-8 mx-auto mb-3 text-yellow-300 drop-shadow-lg" />
                <div className="text-3xl font-bold mb-1">{currentUserProfile.xp.toLocaleString()}</div>
                <div className="text-sm text-blue-100 font-medium">Total XP</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-purple-200 drop-shadow-lg" />
                <div className="text-3xl font-bold mb-1">{currentUserProfile.stats.totalStudents}</div>
                <div className="text-sm text-purple-100 font-medium">Students</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-3 text-green-200 drop-shadow-lg" />
                <div className="text-3xl font-bold mb-1">{currentUserProfile.stats.totalCourses}</div>
                <div className="text-sm text-green-100 font-medium">Courses</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-6 text-center">
                <Star className="h-8 w-8 mx-auto mb-3 text-orange-200 drop-shadow-lg" />
                <div className="text-3xl font-bold mb-1">{currentUserProfile.stats.avgRating}</div>
                <div className="text-sm text-orange-100 font-medium">Avg Rating</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-pink-200 drop-shadow-lg" />
                <div className="text-3xl font-bold mb-1">{currentUserProfile.stats.totalHours}</div>
                <div className="text-sm text-pink-100 font-medium">Hours</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 mx-auto mb-3 text-indigo-200 drop-shadow-lg" />
                <div className="text-3xl font-bold mb-1">{currentUserProfile.stats.completionRate}%</div>
                <div className="text-sm text-indigo-100 font-medium">Completion</div>
              </CardContent>
            </Card>
          </div>

          {/* XP Progress */}
          <Card className="mb-12 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 border-2 border-gradient-to-r from-indigo-300 to-pink-300 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Level Progress
                  </h3>
                  <p className="text-lg text-indigo-700 dark:text-indigo-300 font-medium">
                    {currentUserProfile.nextLevelXP - currentUserProfile.xp} XP to Level {currentUserProfile.level + 1}
                  </p>
                </div>
                <Badge className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-3 text-lg font-bold shadow-lg">
                  <Trophy className="h-6 w-6 mr-2" />
                  Level {currentUserProfile.level}
                </Badge>
              </div>
              <div className="relative">
                <Progress
                  value={(currentUserProfile.xp / currentUserProfile.nextLevelXP) * 100}
                  className="h-6 bg-gradient-to-r from-indigo-200 to-pink-200 dark:from-indigo-800 dark:to-pink-800 rounded-full overflow-hidden"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
              </div>
              <div className="flex justify-between text-lg font-semibold text-indigo-700 dark:text-indigo-300 mt-3">
                <span>{currentUserProfile.xp.toLocaleString()} XP</span>
                <span>{currentUserProfile.nextLevelXP.toLocaleString()} XP</span>
              </div>
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-16 bg-gradient-to-r from-white/80 via-cyan-50/80 to-blue-50/80 backdrop-blur-md border-2 border-white/30 shadow-xl rounded-2xl">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-lg font-semibold"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="contributions"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-lg font-semibold"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger
                value="achievements"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-lg font-semibold"
              >
                <Trophy className="h-5 w-5 mr-2" />
                Achievements
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-lg font-semibold"
              >
                <Brain className="h-5 w-5 mr-2" />
                Skills
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  {/* About Section */}
                  <Card className="bg-gradient-to-br from-white/90 via-cyan-50/80 to-blue-50/90 backdrop-blur-md border-2 border-white/30 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                          <UserIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          About Me
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-lg">
                        {currentUserProfile.bio}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {currentUserProfile.interests.map((interest, index) => (
                          <Badge
                            key={index}
                            className={`bg-gradient-to-r ${getInterestColor(interest)} text-white border-0 px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}
                          >
                            {getInterestIcon(interest)}
                            <span className="ml-2">{interest}</span>
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Contributions */}
                  <Card className="bg-gradient-to-br from-white/90 via-purple-50/80 to-pink-50/90 backdrop-blur-md border-2 border-white/30 shadow-xl">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-2xl">
                          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                            <Lightbulb className="h-6 w-6 text-white" />
                          </div>
                          <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                            Recent Contributions
                          </span>
                        </CardTitle>
                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg">
                          View All <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {currentUserProfile.contributions.slice(0, 2).map((contribution, index) => (
                        <div
                          key={index}
                          className="group p-6 rounded-2xl bg-gradient-to-r from-white/70 to-white/50 border-2 border-white/40 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                        >
                          <div className="flex gap-6">
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden shadow-lg">
                              <img
                                src={contribution.thumbnail || "/placeholder.svg"}
                                alt={contribution.title}
                                className="w-full h-full object-cover"
                              />
                              <div
                                className={`absolute inset-0 bg-gradient-to-br ${contribution.color} opacity-20`}
                              ></div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-xl text-gray-900 dark:text-gray-100 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-200">
                                {contribution.title}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2 text-base">
                                {contribution.description}
                              </p>
                              <div className="flex items-center gap-6 mt-4 text-sm">
                                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-full">
                                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                  <span className="font-semibold text-yellow-700">{contribution.rating}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-1 rounded-full">
                                  <Users className="h-4 w-4 text-blue-600" />
                                  <span className="font-semibold text-blue-700">{contribution.students} students</span>
                                </div>
                                <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-1 rounded-full">
                                  <Zap className="h-4 w-4 text-green-600" />
                                  <span className="font-semibold text-green-700">{contribution.xp} XP</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Badges */}
                  <Card className="bg-gradient-to-br from-white/90 via-violet-50/80 to-purple-50/90 backdrop-blur-md border-2 border-white/30 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          Badges
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {currentUserProfile.badges.map((badge, index) => (
                          <div
                            key={index}
                            className={`relative p-4 rounded-xl bg-gradient-to-br ${badge.color} text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 cursor-pointer group ${badge.glow}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              {badge.icon}
                              <span className="text-xs font-bold opacity-90 uppercase tracking-wider">
                                {badge.rarity}
                              </span>
                            </div>
                            <div className="text-sm font-bold group-hover:scale-105 transition-transform">
                              {badge.name}
                            </div>
                            <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Social Links */}
                  <Card className="bg-gradient-to-br from-white/90 via-blue-50/80 to-cyan-50/90 backdrop-blur-md border-2 border-white/30 shadow-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                          <LinkIcon className="h-6 w-6 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          Connect
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentUserProfile.socialLinks.website && (
                        <Link
                          href={currentUserProfile.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-100 via-cyan-100 to-teal-100 hover:from-blue-200 hover:via-cyan-200 hover:to-teal-200 transition-all duration-300 group shadow-lg hover:shadow-xl"
                        >
                          <Globe className="h-6 w-6 text-blue-600 group-hover:scale-125 transition-transform duration-200" />
                          <span className="text-blue-700 font-bold text-lg">Website</span>
                        </Link>
                      )}
                      {currentUserProfile.socialLinks.github && (
                        <Link
                          href={currentUserProfile.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-100 via-slate-100 to-zinc-100 hover:from-gray-200 hover:via-slate-200 hover:to-zinc-200 transition-all duration-300 group shadow-lg hover:shadow-xl"
                        >
                          <Github className="h-6 w-6 text-gray-700 group-hover:scale-125 transition-transform duration-200" />
                          <span className="text-gray-700 font-bold text-lg">GitHub</span>
                        </Link>
                      )}
                      {currentUserProfile.socialLinks.twitter && (
                        <Link
                          href={currentUserProfile.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-sky-100 via-blue-100 to-indigo-100 hover:from-sky-200 hover:via-blue-200 hover:to-indigo-200 transition-all duration-300 group shadow-lg hover:shadow-xl"
                        >
                          <Twitter className="h-6 w-6 text-sky-600 group-hover:scale-125 transition-transform duration-200" />
                          <span className="text-sky-700 font-bold text-lg">Twitter</span>
                        </Link>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white border-0 shadow-xl">
                    <CardContent className="p-8">
                      <h3 className="font-bold mb-6 flex items-center gap-3 text-2xl">
                        <Rocket className="h-6 w-6" />
                        Quick Actions
                      </h3>
                      <div className="space-y-4">
                        <Button
                          className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 text-lg py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                          variant="outline"
                        >
                          <Plus className="h-5 w-5 mr-2" />
                          Create Course
                        </Button>
                        <Button
                          className="w-full bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 text-lg py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                          variant="outline"
                        >
                          <MessageSquare className="h-5 w-5 mr-2" />
                          Start Discussion
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contributions" className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentUserProfile.contributions.map((contribution, index) => (
                  <Card
                    key={index}
                    className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={contribution.thumbnail || "/placeholder.svg"}
                        alt={contribution.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${contribution.color} opacity-60`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge
                          className={`${contribution.type === "course" ? "bg-gradient-to-r from-blue-500 to-cyan-600" : contribution.type === "tutorial" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-purple-500 to-violet-600"} text-white border-0 font-bold px-3 py-1 shadow-lg`}
                        >
                          {contribution.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex flex-wrap gap-2">
                          {contribution.tags.slice(0, 2).map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              className="text-xs bg-white/20 text-white border border-white/30 backdrop-blur-sm font-medium"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-8">
                      <h3 className="font-bold text-xl mb-3 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-200">
                        {contribution.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2 text-base leading-relaxed">
                        {contribution.description}
                      </p>
                      <div className="flex items-center justify-between mb-6 text-sm">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-2 rounded-full">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          <span className="font-bold text-yellow-700">{contribution.rating}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-2 rounded-full">
                          <Users className="h-4 w-4 text-blue-600" />
                          <span className="font-bold text-blue-700">{contribution.students}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-2 rounded-full">
                          <Zap className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-green-700">{contribution.xp} XP</span>
                        </div>
                      </div>
                      <Button
                        className={`w-full bg-gradient-to-r ${contribution.color} hover:shadow-xl text-white font-bold py-3 text-lg transition-all duration-200 hover:scale-105`}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="mt-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentUserProfile.achievements.map((achievement, index) => (
                  <Card
                    key={index}
                    className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md border-2 border-white/30 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                  >
                    <div className={`h-3 bg-gradient-to-r ${achievement.color}`} />
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div
                          className={`p-4 rounded-2xl bg-gradient-to-r ${achievement.color} text-white shadow-xl group-hover:scale-125 transition-transform duration-300`}
                        >
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-xl mb-2 group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-200">
                            {achievement.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-4 text-base leading-relaxed">
                            {achievement.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-gray-100 to-slate-100 px-3 py-2 rounded-full w-fit">
                            <Calendar className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold text-gray-700">
                              {new Date(achievement.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="skills" className="mt-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <Card className="bg-gradient-to-br from-white/90 via-purple-50/80 to-pink-50/90 backdrop-blur-md border-2 border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Technical Skills
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {currentUserProfile.skills.map((skill, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{skill.name}</span>
                          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {skill.level}%
                          </span>
                        </div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white/90 via-green-50/80 to-emerald-50/90 backdrop-blur-md border-2 border-white/30 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Learning Progress
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div className="text-center p-8 bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 rounded-2xl shadow-lg">
                        <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                          {currentUserProfile.stats.completionRate}%
                        </div>
                        <div className="text-lg font-semibold text-green-700">Course Completion Rate</div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center p-6 bg-gradient-to-br from-blue-100 via-cyan-100 to-indigo-100 rounded-xl shadow-lg">
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            {currentUserProfile.stats.totalHours}
                          </div>
                          <div className="text-sm font-semibold text-blue-700">Hours Learned</div>
                        </div>
                        <div className="text-center p-6 bg-gradient-to-br from-purple-100 via-violet-100 to-pink-100 rounded-xl shadow-lg">
                          <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                            {currentUserProfile.streak}
                          </div>
                          <div className="text-sm font-semibold text-purple-700">Day Streak</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
