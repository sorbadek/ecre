"use client"

import { Users, MessageSquarePlus, Search, Tag, ThumbsUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CommunityPage() {
  const groups = [
    { name: "Web3 Builders", members: 1284, topics: ["IC", "Solidity", "DeFi"] },
    { name: "AI Learners", members: 2140, topics: ["LLMs", "RLHF", "Agents"] },
    { name: "Frontend Guild", members: 987, topics: ["React", "Next.js", "CSS"] },
  ]

  const posts = [
    {
      author: "Alice",
      avatar: "/alice-johnson-avatar.png",
      title: "Share your best resources for learning Motoko",
      tags: ["Motoko", "Beginner"],
      likes: 23,
    },
    {
      author: "Bob",
      avatar: "/bob-williams-avatar.png",
      title: "Showcase: My first dapp on ICP",
      tags: ["Project", "ICP"],
      likes: 54,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Community</h1>
          <p className="text-sm text-muted-foreground">Discover groups, join discussions, and share knowledge.</p>
        </div>
        <div className="flex w-full max-w-md items-center gap-2">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search groups, posts, or people..." />
          </div>
          <Button variant="default">
            <MessageSquarePlus className="mr-2 size-4" />
            New Post
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Trending Posts</CardTitle>
            <CardDescription>What the community is talking about today</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {posts.map((post, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.avatar || "/placeholder.svg"} alt={post.author} />
                  <AvatarFallback>{post.author.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{post.author}</span>
                    <Badge variant="secondary" className="gap-1">
                      <Users className="size-3" />
                      Member
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm">{post.title}</p>
                  <div className="mt-2 flex items-center gap-2">
                    {post.tags.map((t) => (
                      <Badge key={t} variant="outline" className="gap-1">
                        <Tag className="size-3" />
                        {t}
                      </Badge>
                    ))}
                    <div className="ml-auto flex items-center gap-1 text-muted-foreground">
                      <ThumbsUp className="size-4" />
                      <span className="text-xs">{post.likes}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discover Groups</CardTitle>
            <CardDescription>Join a group to connect with peers</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {groups.map((g) => (
              <div key={g.name} className="rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="size-4 text-muted-foreground" />
                      <span className="font-medium">{g.name}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{g.members.toLocaleString()} members</p>
                  </div>
                  <Button size="sm" variant="secondary">
                    Join
                  </Button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {g.topics.map((t) => (
                    <Badge key={t} variant="outline">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
