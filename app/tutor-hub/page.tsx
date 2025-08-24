"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Video, Mic, Users, Clock, Calendar, Play } from "lucide-react"
import SessionCreationForm from "@/components/session-creation-form"
import SessionView from "@/components/session-view"
import { sessionClient, type Session } from "@/lib/session-client"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

export default function TutorHubPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const allSessions = await sessionClient.getAllSessions()
      setSessions(allSessions)
    } catch (error) {
      console.error("Failed to load sessions:", error)
      toast({
        title: "Error",
        description: "Failed to load sessions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSessionCreated = (newSession: Session) => {
    setSessions((prev) => [newSession, ...prev])
    setShowCreateForm(false)
    toast({
      title: "Success!",
      description: "Your session has been created and stored on the blockchain",
    })
  }

  const filteredSessions = sessions.filter(
    (session) =>
      session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: Session["status"]) => {
    if ("live" in status) return "bg-red-500"
    if ("scheduled" in status) return "bg-blue-500"
    if ("completed" in status) return "bg-gray-500"
    return "bg-yellow-500"
  }

  const getStatusText = (status: Session["status"]) => {
    if ("live" in status) return "LIVE"
    if ("scheduled" in status) return "UPCOMING"
    if ("completed" in status) return "RECORDED"
    return "CANCELLED"
  }

  if (selectedSession) {
    return (
      <SessionView 
        session={selectedSession} 
        onClose={() => setSelectedSession(null)} 
      />
    )
  }

  if (showCreateForm) {
    return <SessionCreationForm onCancel={() => setShowCreateForm(false)} onSessionCreated={handleSessionCreated} />
  }

  return (
    <div className="w-full h-full space-y-6 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tutor Hub</h1>
          <p className="text-gray-600">Discover and join live learning sessions</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Session
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search sessions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="aspect-video bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Video className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? "Try adjusting your search terms" : "Be the first to create a learning session!"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Session
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <Card
              key={session.id}
              onClick={() => {
                // Only allow joining if session is live or about to start soon
                const now = Date.now() * 1000000; // Convert to nanoseconds
                const startTime = Number(session.scheduledTime);
                const endTime = startTime + (session.duration * 60 * 1000000000);
                
                if (now >= startTime - 300000000000 && now <= endTime) { // 5 minutes before start until end
                  setSelectedSession(session);
                } else if (now < startTime) {
                  toast({
                    title: "Session not started",
                    description: "This session hasn't started yet. Please wait until the scheduled time.",
                  });
                } else {
                  toast({
                    title: "Session ended",
                    description: "This session has already ended.",
                  });
                }
              }}
              className="group relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              {/* Background Image */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />

              {/* Status Badge */}
              <div className="absolute top-3 left-3 z-10">
                <Badge className={`${getStatusColor(session.status)} text-white border-0 text-xs font-medium`}>
                  {getStatusText(session.status)}
                </Badge>
              </div>

              {/* Session Type Icon */}
              <div className="absolute top-3 right-3 z-10">
                {"video" in session.sessionType ? (
                  <Video className="w-5 h-5 text-white/80" />
                ) : (
                  <Mic className="w-5 h-5 text-white/80" />
                )}
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>

              {/* Content */}
              <div className="relative p-4 h-full flex flex-col justify-end">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-2">{session.title}</h3>

                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={session.hostAvatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs bg-white/20">
                        {session.hostName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{session.hostName}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-white/70">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>
                        {session.attendees.length}/{session.maxAttendees}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration}m</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-white/70">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(session.scheduledTime)}</span>
                  </div>

                  {session.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {session.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-white/20 text-white border-0">
                          {tag}
                        </Badge>
                      ))}
                      {session.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs bg-white/20 text-white border-0">
                          +{session.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
