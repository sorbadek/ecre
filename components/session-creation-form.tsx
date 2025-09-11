"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { X, CalendarIcon, Users, Video, Mic, Tag } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { sessionClient, type Session, type CreateSessionInput } from "@/lib/session-client"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

interface SessionCreationFormProps {
  onCancel: () => void
  onSessionCreated: (session: Session) => void
}

export default function SessionCreationForm({ onCancel, onSessionCreated }: SessionCreationFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedType, setSelectedType] = useState<{ video: null } | { voice: null }>({ video: null })
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 60,
    maxAttendees: 10,
    recordSession: false
  })

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags((prev) => [...prev, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a session",
        variant: "destructive",
      })
      return
    }

    if (!time) {
      toast({
        title: "Error",
        description: "Please select a time for your session",
        variant: "destructive",
      })
      return
    }
    
    // Use today's date if none is selected
    const selectedDate = date || new Date()

    try {
      setLoading(true)

      // Combine date and time in local time
      const [hours, minutes] = time.split(":").map(Number)
      const scheduledDateTime = new Date(selectedDate)
      scheduledDateTime.setHours(hours, minutes, 0, 0)
      
      // Convert to UTC timestamp in milliseconds since epoch
      const utcTimestamp = Date.UTC(
        scheduledDateTime.getFullYear(),
        scheduledDateTime.getMonth(),
        scheduledDateTime.getDate(),
        scheduledDateTime.getHours(),
        scheduledDateTime.getMinutes(),
        scheduledDateTime.getSeconds()
      )
      
      // Convert to nanoseconds (IC uses nanoseconds since epoch)
      const scheduledTimeNs = BigInt(utcTimestamp) * 1_000_000n
      
      console.log('Scheduled time (local):', scheduledDateTime.toString())
      console.log('Scheduled time (UTC):', new Date(utcTimestamp).toISOString())
      console.log('Scheduled time (ns):', scheduledTimeNs.toString())

      // Create the session input
      const sessionInput = {
        title: formData.title,
        description: formData.description,
        sessionType: selectedType,
        scheduledTime: scheduledTimeNs,
        duration: formData.duration,
        maxAttendees: formData.maxAttendees,
        price: 0, // All sessions are free
        hostName: user.name || "Anonymous",
        hostAvatar: user.avatar || "/placeholder.svg?height=40&width=40",
        tags,
        recordSession: formData.recordSession || false,
      } as const;

      const newSession = await sessionClient.createSession(sessionInput)
      onSessionCreated(newSession)
    } catch (error) {
      console.error("Failed to create session:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create session",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Session</h1>
          <p className="text-gray-600 mt-1">Set up your free live learning session</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Session Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Video className="w-5 h-5 mr-2" />
              Session Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  'video' in selectedType
                    ? "border-primary bg-primary/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedType({ video: null })}
              >
                <Video className="w-6 h-6 mr-2" />
                <span>Video Call</span>
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  'voice' in selectedType
                    ? "border-primary bg-primary/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedType({ voice: null })}
              >
                <Mic className="w-6 h-6 mr-2" />
                <span>Voice Call</span>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recordSession" className="text-right">
                  Record Session
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <input
                    type="checkbox"
                    id="recordSession"
                    checked={formData.recordSession as boolean}
                    onChange={(e) => handleInputChange("recordSession", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-500">
                    Record this session (can be downloaded later)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="col-span-3"
                  placeholder="Describe what you'll be teaching"
                  rows={4}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Time *</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="480"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", Number.parseInt(e.target.value))}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Session Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="w-5 h-5 mr-2" />
              Session Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxAttendees">Maximum Attendees *</Label>
              <Input
                id="maxAttendees"
                type="number"
                min="1"
                max="100"
                value={formData.maxAttendees}
                onChange={(e) => handleInputChange("maxAttendees", Number.parseInt(e.target.value))}
                required
              />
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Free Session</h4>
                  <p className="text-green-700 text-sm">
                    All sessions on Peerverse are completely free for attendees to join and learn from.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Tag className="w-5 h-5 mr-2" />
              Tags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="px-3 py-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {loading ? "Creating..." : "Create Free Session"}
          </Button>
        </div>
      </form>
    </div>
  )
}
