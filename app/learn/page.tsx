"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  BookOpen,
  Zap,
  Star,
  PlusCircle,
  GraduationCap,
  Code,
  Lightbulb,
  Video,
  Mic,
  Play,
  Clock,
  Users,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { sessionClient, type Session } from "@/lib/session-client"
import { toast } from "@/hooks/use-toast"

interface MicroClass {
  id: string
  title: string
  description: string
  author: {
    name: string
    avatar: string
  }
  xpReward: number
  rating: number
  reviews: number
  category: string
  imageUrl: string
  type: "course" | "tutorial" | "project"
}

const mockMicroClasses: MicroClass[] = [
  {
    id: "mc1",
    title: "Introduction to Motoko Smart Contracts",
    description: "Learn the basics of Motoko, the native language for smart contracts on the Internet Computer.",
    author: { name: "Alice Johnson", avatar: "/alice-johnson-avatar.png" },
    xpReward: 200,
    rating: 4.8,
    reviews: 120,
    category: "Blockchain",
    imageUrl: "/placeholder.svg?height=200&width=300",
    type: "course",
  },
  {
    id: "mc2",
    title: "Building a Simple DApp with React & ICP",
    description: "A step-by-step tutorial on creating your first decentralized application frontend.",
    author: { name: "Bob Williams", avatar: "/bob-williams-avatar.png" },
    xpReward: 150,
    rating: 4.7,
    reviews: 90,
    category: "Frontend",
    imageUrl: "/placeholder.svg?height=200&width=300",
    type: "tutorial",
  },
  {
    id: "mc3",
    title: "Rust for Blockchain Developers",
    description: "Dive into Rust fundamentals essential for developing high-performance blockchain solutions.",
    author: { name: "Sarah Chen", avatar: "/sarah-chen-avatar.png" },
    xpReward: 250,
    rating: 4.9,
    reviews: 150,
    category: "Programming",
    imageUrl: "/rust-ownership-thumbnail.png",
    type: "course",
  },
  {
    id: "mc4",
    title: "NFT Minting on ICP: A Practical Guide",
    description: "Learn how to create and deploy your own NFT collection on the Internet Computer.",
    author: { name: "Michael Lee", avatar: "/michael-lee-avatar.png" },
    xpReward: 180,
    rating: 4.6,
    reviews: 80,
    category: "NFTs",
    imageUrl: "/placeholder.svg?height=200&width=300",
    type: "project",
  },
  {
    id: "mc5",
    title: "Introduction to Data Structures & Algorithms",
    description: "Fundamental concepts of data structures and algorithms using JavaScript.",
    author: { name: "Emily White", avatar: "/emily-white-avatar.png" },
    xpReward: 120,
    rating: 4.5,
    reviews: 70,
    category: "Computer Science",
    imageUrl: "/placeholder.svg?height=200&width=300",
    type: "course",
  },
]

export default function LearnPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [recordedSessions, setRecordedSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecordedSessions()
  }, [])

  const loadRecordedSessions = async () => {
    try {
      setLoading(true)
      const allSessions = await sessionClient.getAllSessions()
      // Filter for completed sessions that have recordings
      const completed = allSessions.filter((session) => "completed" in session.status && session.recordingUrl)
      setRecordedSessions(completed)
    } catch (error) {
      console.error("Failed to load recorded sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load recorded sessions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredClasses = mockMicroClasses.filter((mc) => {
    const matchesSearch =
      mc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mc.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeTab === "all" || activeTab === "classes" || mc.type === activeTab

    return matchesSearch && matchesCategory
  })

  const filteredSessions = recordedSessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = activeTab === "all" || activeTab === "sessions"

    return matchesSearch && matchesCategory
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "course":
        return <GraduationCap className="h-4 w-4" />
      case "tutorial":
        return <Lightbulb className="h-4 w-4" />
      case "project":
        return <Code className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Learn & Explore</h1>
        <div className="relative w-full md:w-auto flex-grow md:flex-grow-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search courses, tutorials, sessions..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="course">Courses</TabsTrigger>
          <TabsTrigger value="tutorial">Tutorials</TabsTrigger>
          <TabsTrigger value="project">Projects</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <Card className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
            <PlusCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-xl">Build a New Micro-Class</CardTitle>
            <CardDescription>Share your knowledge and earn XP by creating a new learning module.</CardDescription>
            <Button asChild className="mt-4">
              <Link href="/micro-class-builder">Start Building</Link>
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Render Micro Classes */}
            {(activeTab === "all" ||
              activeTab === "classes" ||
              ["course", "tutorial", "project"].includes(activeTab)) &&
              filteredClasses.map((microClass) => (
                <Card
                  key={microClass.id}
                  className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative w-full h-48 bg-muted">
                    <Image
                      src={microClass.imageUrl || "/placeholder.svg"}
                      alt={microClass.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                    />
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold">
                      {microClass.category}
                    </Badge>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-semibold">{microClass.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                      {microClass.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col flex-grow justify-between">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-yellow-500" />
                        <span>
                          {microClass.rating.toFixed(1)} ({microClass.reviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {getTypeIcon(microClass.type)}
                        <span>{microClass.type.charAt(0).toUpperCase() + microClass.type.slice(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={microClass.author.avatar || "/placeholder.svg"}
                            alt={microClass.author.name}
                          />
                          <AvatarFallback>{microClass.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{microClass.author.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                        <Zap className="h-4 w-4" /> {microClass.xpReward} XP
                      </div>
                    </div>
                    <Button className="w-full mt-3">Start Learning</Button>
                  </CardContent>
                </Card>
              ))}

            {/* Render Recorded Sessions */}
            {(activeTab === "all" || activeTab === "sessions") &&
              filteredSessions.map((session) => (
                <Card
                  key={session.id}
                  className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative w-full h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      RECORDED
                    </Badge>
                    <div className="absolute top-2 right-2">
                      {"video" in session.sessionType ? (
                        <Video className="w-5 h-5 text-white/80" />
                      ) : (
                        <Mic className="w-5 h-5 text-white/80" />
                      )}
                    </div>
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-semibold">{session.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                      {session.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col flex-grow justify-between">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(session.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{session.attendees.length} attended</span>
                      </div>
                    </div>

                    {session.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {session.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {session.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{session.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={session.hostAvatar || "/placeholder.svg"} alt={session.hostName} />
                          <AvatarFallback>{session.hostName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{session.hostName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">{formatDate(session.scheduledTime)}</div>
                    </div>
                    <Button className="w-full mt-3">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Recording
                    </Button>
                  </CardContent>
                </Card>
              ))}

            {/* No results message */}
            {((activeTab === "all" && filteredClasses.length === 0 && filteredSessions.length === 0) ||
              (activeTab === "classes" && filteredClasses.length === 0) ||
              (activeTab === "sessions" && filteredSessions.length === 0) ||
              (["course", "tutorial", "project"].includes(activeTab) && filteredClasses.length === 0)) && (
              <div className="col-span-full text-center text-muted-foreground py-10">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading sessions...</span>
                  </div>
                ) : (
                  "No content found matching your criteria."
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
