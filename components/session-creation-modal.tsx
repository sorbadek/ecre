"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Video } from "lucide-react"
import { createSession } from "@/lib/session-client"

interface SessionCreationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SessionCreationModal({ isOpen, onClose }: SessionCreationModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("live") // 'live', 'q&a', 'workshop'
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("") // in minutes
  const [maxAttendees, setMaxAttendees] = useState("")
  const [price, setPrice] = useState("") // in XP
  const [isOnline, setIsOnline] = useState(true)
  const [location, setLocation] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (!title || !description || !date || !time || !duration || !maxAttendees || !price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!isOnline && !location) {
      toast({
        title: "Missing Location",
        description: "Please provide a location for in-person sessions.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const created = await createSession({
        title,
        description,
        sessionType: type,
        date,
        time,
        durationMins: Number.parseInt(duration),
        maxAttendees: Number.parseInt(maxAttendees),
        priceXp: Number.parseInt(price),
        isOnline,
        location: isOnline ? "Online" : location,
      })

      toast({
        title: "Session Created!",
        description:
          created.isOnline && created.meetingUrl
            ? `Your "${created.title}" session is scheduled. Meeting link: ${created.meetingUrl}`
            : `Your "${created.title}" session has been scheduled.`,
        // note: your toast system may ignore non-standard variants
        duration: 5000,
      })

      // Reset form
      setTitle("")
      setDescription("")
      setType("live")
      setDate("")
      setTime("")
      setDuration("")
      setMaxAttendees("")
      setPrice("")
      setIsOnline(true)
      setLocation("")
      onClose()
    } catch (err: any) {
      console.error("Create session failed:", err)
      toast({
        title: "Failed to create session",
        description: err?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" /> Create New Session
          </DialogTitle>
          <DialogDescription>Host a live class, Q&amp;A, or workshop for the Peerverse community.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              placeholder="e.g., Mastering Motoko Basics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what attendees will learn or discuss."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Session Type</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select session type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live Class</SelectItem>
                <SelectItem value="q&a">Q&amp;A Session</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="time">Time (UTC)</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="e.g., 60"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="max-attendees">Max Attendees</Label>
              <Input
                id="max-attendees"
                type="number"
                placeholder="e.g., 20"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price (XP)</Label>
            <Input
              id="price"
              type="number"
              placeholder="e.g., 50 XP"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="is-online" checked={isOnline} onCheckedChange={(checked) => setIsOnline(Boolean(checked))} />
            <Label htmlFor="is-online">Online Session</Label>
          </div>
          {!isOnline && (
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Community Hall, 123 Main St"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required={!isOnline}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
