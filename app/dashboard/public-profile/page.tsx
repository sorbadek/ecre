"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Calendar, Star, Award, Users, MessageCircle, ExternalLink, Shield, Trophy, Zap } from "lucide-react"

interface NFTContribution {
  id: string
  title: string
  type: "tutorial" | "guide" | "cheatsheet" | "project"
  thumbnail: string
  mintDate: string
  views: number
  likes: number
  tokenId: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  earnedDate: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

interface PublicProfile {
  username: string
  displayName: string
  avatar: string
  bio: string
  location: string
  joinDate: string
  rating: number
  totalReviews: number
  totalStudents: number
  totalSessions: number
  specialties: string[]
  hourlyRate: number
  responseTime: string
  languages: string[]
  achievements: Achievement[]
  nftContributions: NFTContribution[]
  stats: {
    totalXP: number
    rank: number
    completionRate: number
    avgRating: number
  }
}

const mockProfile: PublicProfile = {
  username: "alice_j",
  displayName: "Alice Johnson",
  avatar: "/alice-johnson-avatar.png",
  bio: "Passionate Motoko developer and ICP ecosystem contributor. I love teaching complex concepts in simple, digestible ways. With 5+ years in blockchain development, I specialize in smart contract architecture and dApp development.",
  location: "San Francisco, CA",
  joinDate: "2023-01-15",
  rating: 4.9,
  totalReviews: 127,
  totalStudents: 450,
  totalSessions: 89,
  specialties: ["Motoko", "ICP Development", "Smart Contracts", "dApp Architecture"],
  hourlyRate: 85,
  responseTime: "< 2 hours",
  languages: ["English", "Spanish", "Mandarin"],
  achievements: [
    {
      id: "a1",
      title: "Top Contributor",
      description: "Created 50+ high-quality tutorials",
      icon: "trophy",
      earnedDate: "2024-06-15",
      rarity: "legendary",
    },
    {
      id: "a2",
      title: "Community Favorite",
      description: "Received 1000+ likes on contributions",
      icon: "star",
      earnedDate: "2024-05-20",
      rarity: "epic",
    },
    {
      id: "a3",
      title: "Mentor Master",
      description: "Successfully mentored 100+ students",
      icon: "users",
      earnedDate: "2024-04-10",
      rarity: "rare",
    },
    {
      id: "a4",
      title: "Quick Responder",
      description: "Maintains <2hr response time",
      icon: "zap",
      earnedDate: "2024-03-01",
      rarity: "common",
    },
  ],
  nftContributions: [
    {
      id: "nft1",
      title: "Motoko Fundamentals: Complete Guide",
      type: "tutorial",
      thumbnail: "/motoko-lesson-nft.png",
      mintDate: "2024-07-15",
      views: 2340,
      likes: 189,
      tokenId: "PV-TUT-001",
    },
    {
      id: "nft2",
      title: "Canister Upgrade Best Practices",
      type: "guide",
      thumbnail: "/canister-upgrade-guide-nft.png",
      mintDate: "2024-06-28",
      views: 1876,
      likes: 156,
      tokenId: "PV-GDE-002",
    },
    {
      id: "nft3",
      title: "Rust Ownership Cheatsheet",
      type: "cheatsheet",
      thumbnail: "/rust-ownership-cheatsheet-nft.png",
      mintDate: "2024-06-10",
      views: 3421,
      likes: 267,
      tokenId: "PV-CHT-003",
    },
  ],
  stats: {
    totalXP: 15420,
    rank: 12,
    completionRate: 98,
    avgRating: 4.9,
  },
}

export default function PublicProfilePage() {
  const [activeTab, setActiveTab] = useState("overview")

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500"
      case "epic":
        return "bg-gradient-to-r from-purple-400 to-pink-500"
      case "rare":
        return "bg-gradient-to-r from-blue-400 to-cyan-500"
      default:
        return "bg-gradient-to-r from-gray-400 to-gray-500"
    }
  }

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case "trophy":
        return <Trophy className="h-5 w-5" />
      case "star":
        return <Star className="h-5 w-5" />
      case "users":
        return <Users className="h-5 w-5" />
      case "zap":
        return <Zap className="h-5 w-5" />
      default:
        return <Award className="h-5 w-5" />
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl" />
        <div className="absolute -bottom-16 left-6 flex items-end gap-6">
          <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
            <AvatarImage src={mockProfile.avatar || "/placeholder.svg"} alt={mockProfile.displayName} />
            <AvatarFallback className="text-2xl">{mockProfile.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="pb-4">
            <h1 className="text-3xl font-bold text-white mb-1">{mockProfile.displayName}</h1>
            <p className="text-white/80">@{mockProfile.username}</p>
          </div>
        </div>
        <div className="absolute bottom-6 right-6">
          <Button size="lg" className="bg-white text-black hover:bg-gray-100">
            <MessageCircle className="h-4 w-4 mr-2" />
            Hire Me
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{mockProfile.stats.totalXP.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total XP</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">#{mockProfile.stats.rank}</div>
            <div className="text-sm text-muted-foreground">Global Rank</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{mockProfile.stats.completionRate}%</div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span className="text-2xl font-bold text-primary">{mockProfile.stats.avgRating}</span>
            </div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="contributions">NFT Contributions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{mockProfile.bio}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {mockProfile.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockProfile.achievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <div className={`p-2 rounded-full text-white ${getRarityColor(achievement.rarity)}`}>
                          {getAchievementIcon(achievement.icon)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {achievement.rarity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{mockProfile.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Joined {new Date(mockProfile.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {mockProfile.rating} ({mockProfile.totalReviews} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{mockProfile.totalStudents} students taught</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hire Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">${mockProfile.hourlyRate}/hr</div>
                    <div className="text-sm text-muted-foreground">Hourly Rate</div>
                  </div>
                  <div>
                    <div className="font-medium">{mockProfile.responseTime}</div>
                    <div className="text-sm text-muted-foreground">Response Time</div>
                  </div>
                  <div>
                    <div className="font-medium">{mockProfile.languages.join(", ")}</div>
                    <div className="text-sm text-muted-foreground">Languages</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockProfile.achievements.map((achievement) => (
              <Card key={achievement.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${getRarityColor(achievement.rarity)}`} />
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full text-white ${getRarityColor(achievement.rarity)}`}>
                      {getAchievementIcon(achievement.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {achievement.rarity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(achievement.earnedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="contributions" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProfile.nftContributions.map((nft) => (
              <Card key={nft.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={nft.thumbnail || "/placeholder.svg"}
                    alt={nft.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-black/70 text-white border-0">
                      <Shield className="h-3 w-3 mr-1" />
                      NFT
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-white/90 text-black">
                      {nft.type}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-2">{nft.title}</h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{nft.views.toLocaleString()} views</span>
                    <span>{nft.likes} likes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">{nft.tokenId}</span>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
