"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, ArrowUp, PlusCircle, Eye, Clock, Tag, MessageSquare } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { RouteGuard } from "@/components/route-guard"
import { AppLayout } from "@/components/app-layout"
import ForumTopLevelRedirectNotice from "./ForumTopLevelRedirectNotice"

interface ForumQuestion {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar: string
    username: string
  }
  timestamp: string
  views: number
  upvotes: number
  answers: number
  tags: string[]
  status: "open" | "answered" | "resolved"
}

interface ForumAnswer {
  id: string
  questionId: string
  author: {
    name: string
    avatar: string
    username: string
  }
  timestamp: string
  content: string
  upvotes: number
  isAccepted?: boolean
}

const mockQuestions: ForumQuestion[] = [
  {
    id: "q1",
    title: "How to integrate Internet Identity with a Next.js DApp?",
    content:
      "I'm building a decentralized application using Next.js and I want to use Internet Identity for authentication. What's the best way to integrate it on the frontend and backend (if applicable)? Are there any specific libraries or patterns I should follow?",
    author: { name: "Michael Lee", avatar: "/michael-lee-avatar.png", username: "michael_l" },
    timestamp: "2 days ago",
    views: 150,
    upvotes: 25,
    answers: 5,
    tags: ["Internet Identity", "Next.js", "Authentication", "ICP"],
    status: "answered",
  },
  {
    id: "q2",
    title: "Understanding Motoko Candid Interface",
    content:
      "Can someone explain the Candid interface definition language (IDL) in Motoko? How does it help with interoperability between canisters and different programming languages?",
    author: { name: "Sarah Chen", avatar: "/sarah-chen-avatar.png", username: "sarah_c" },
    timestamp: "4 days ago",
    views: 230,
    upvotes: 40,
    answers: 8,
    tags: ["Motoko", "Candid", "ICP", "Smart Contracts"],
    status: "resolved",
  },
  {
    id: "q3",
    title: "Best practices for managing state in large React applications?",
    content:
      "Our React application is growing, and state management is becoming complex. We are currently using Context API, but considering Redux or Zustand. What are the pros and cons for large-scale apps?",
    author: { name: "Emily White", avatar: "/emily-white-avatar.png", username: "emily_w" },
    timestamp: "1 week ago",
    views: 300,
    upvotes: 55,
    answers: 15,
    tags: ["React", "State Management", "Frontend"],
    status: "open",
  },
  {
    id: "q4",
    title: "How to optimize DFX deployment times?",
    content:
      "My DFX deployments are taking a long time. Are there any configurations or strategies to speed up the deployment process for ICP canisters?",
    author: { name: "Charlie Brown", avatar: "/charlie-brown-avatar.png", username: "charlie_b" },
    timestamp: "3 days ago",
    views: 90,
    upvotes: 18,
    answers: 3,
    tags: ["DFX", "Deployment", "ICP"],
    status: "open",
  },
]

const mockAnswers: ForumAnswer[] = [
  {
    id: "a1_q1",
    questionId: "q1",
    author: { name: "Diana Prince", avatar: "/diana-prince-avatar.png", username: "diana_p" },
    timestamp: "1 day ago",
    content:
      "For Next.js, you can use `@dfinity/auth-client` on the client-side. For the backend (if you have a Node.js server), you'd typically pass the identity's principal to your server, which then interacts with canisters. Consider using a wrapper like `ic-js` for easier canister calls.",
    upvotes: 15,
    isAccepted: true,
  },
  {
    id: "a2_q1",
    questionId: "q1",
    author: { name: "Bob Williams", avatar: "/bob-williams-avatar.png", username: "bob_w" },
    timestamp: "1 day ago",
    content:
      "I recommend checking out the official DFINITY examples on GitHub. They have a good Next.js integration example that covers most of the setup.",
    upvotes: 8,
  },
]

export default function ForumPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [newQuestionTitle, setNewQuestionTitle] = useState("")
  const [newQuestionContent, setNewQuestionContent] = useState("")
  const [newQuestionTags, setNewQuestionTags] = useState("") // Comma-separated tags

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault()
    if (newQuestionTitle.trim() && newQuestionContent.trim()) {
      const newQuestion: ForumQuestion = {
        id: `q${mockQuestions.length + 1}`,
        title: newQuestionTitle.trim(),
        content: newQuestionContent.trim(),
        author: { name: "Current User", avatar: "/user123-avatar.png", username: "current_user" },
        timestamp: "Just now",
        views: 0,
        upvotes: 0,
        answers: 0,
        tags: newQuestionTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
        status: "open",
      }
      mockQuestions.unshift(newQuestion) // Add to the beginning
      setNewQuestionTitle("")
      setNewQuestionContent("")
      setNewQuestionTags("")
      toast({
        title: "Question Posted",
        description: "Your question has been successfully added to the forum!",
        variant: "default",
      })
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in both the title and content for your question.",
        variant: "destructive",
      })
    }
  }

  const filteredQuestions = mockQuestions.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = activeTab === "all" || q.status === activeTab

    return matchesSearch && matchesStatus
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'answered':
        return 'secondary'
      case 'resolved':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <RouteGuard>
      <AppLayout>
        <ForumTopLevelRedirectNotice />
        <div className="flex flex-col gap-6 p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <h1 className="text-3xl font-bold">Q&A Forum</h1>
            <div className="relative w-full md:w-auto flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search questions or tags..."
                className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 h-auto">
              <TabsTrigger value="all">All Questions</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="answered">Answered</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value="ask" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Ask a New Question</CardTitle>
                  <CardDescription>Get help from the Peerverse community.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAskQuestion} className="space-y-4">
                    <div className="grid gap-2">
                      <label htmlFor="question-title" className="block text-gray-400 text-sm mb-2">
                        Question Title
                      </label>
                      <Input
                        id="question-title"
                        placeholder="e.g., How to deploy a canister on ICP?"
                        value={newQuestionTitle}
                        onChange={(e) => setNewQuestionTitle(e.target.value)}
                        className="bg-[#1A1F2E] border-gray-700 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="question-content" className="block text-gray-400 text-sm mb-2">
                        Details
                      </label>
                      <Textarea
                        id="question-content"
                        placeholder="Provide more details about your question..."
                        rows={6}
                        value={newQuestionContent}
                        onChange={(e) => setNewQuestionContent(e.target.value)}
                        className="bg-[#1A1F2E] border-gray-700 text-white"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="question-tags" className="block text-gray-400 text-sm mb-2">
                        Tags (comma-separated)
                      </label>
                      <Input
                        id="question-tags"
                        placeholder="e.g., ICP, Motoko, Frontend"
                        value={newQuestionTags}
                        onChange={(e) => setNewQuestionTags(e.target.value)}
                        className="bg-[#1A1F2E] border-gray-700 text-white"
                      />
                    </div>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                      <PlusCircle className="h-4 w-4 mr-2" /> Post Question
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value={activeTab} className="mt-6">
              <Button
                onClick={() => setActiveTab("ask")}
                className="w-full mb-4 md:hidden bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Ask a New Question
              </Button>
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((question) => (
                  <Card
                    key={question.id}
                    className="bg-[#1A1F2E] border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          href={`/forum/${question.id}`}
                          className="text-lg font-semibold hover:text-primary transition-colors text-white"
                        >
                          {question.title}
                        </Link>
                        <Badge
                          variant={getStatusBadgeVariant(question.status)}
                          className="text-xs text-white bg-blue-600"
                        >
                          {question.status.charAt(0).toUpperCase() + question.status.slice(1)}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm line-clamp-2 text-gray-300">
                        {question.content}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={question.author.avatar || "/placeholder.svg"}
                              alt={question.author.name}
                            />
                            <AvatarFallback>{question.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="text-white font-medium">{question.author.username}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" /> {question.timestamp}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4 text-gray-400" /> {question.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowUp className="h-4 w-4 text-gray-400" /> {question.upvotes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-gray-400" /> {question.answers}
                        </div>
                      </div>
                    </CardContent>
                    <CardContent className="pt-0 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {question.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="flex items-center gap-1 text-blue-400 border-blue-400"
                          >
                            <Tag className="h-3 w-3 text-blue-400" /> {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  No questions found matching your criteria.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </AppLayout>
    </RouteGuard>
  )
}
