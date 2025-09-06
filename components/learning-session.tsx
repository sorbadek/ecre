"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { formatDistanceToNow } from "date-fns"
import { learningAnalyticsClient } from "@/lib/learning-analytics-client"
import { useApiClients } from "@/lib/use-api-clients"
import { toast } from "sonner"

export function LearningSessionTracker({ contentId, contentType, contentTitle }: { contentId: string; contentType: string; contentTitle: string }) {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [progress, setProgress] = useState(0)
  const { isAuthenticated } = useApiClients()

  // Format time in seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return [h, m > 9 ? m : h ? '0' + m : m || '0', s > 9 ? s : '0' + s]
      .filter(Boolean)
      .join(':')
  }

  // Start a new learning session
  const startSession = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to start a learning session")
      return
    }

    try {
      const sessionId = await learningAnalyticsClient.startLearningSession(contentId, contentType)
      setSessionId(sessionId)
      const startTime = new Date()
      setSessionStartTime(startTime)
      setIsSessionActive(true)
      setElapsedTime(0)
      setProgress(0)
      
      // Start timer
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
      
      return () => clearInterval(timer)
    } catch (error) {
      console.error("Error starting session:", error)
      toast.error("Failed to start learning session")
    }
  }

  // End the current learning session
  const endSession = async () => {
    if (!sessionId) return
    
    try {
      // Calculate XP based on session duration and progress
      const xpEarned = Math.floor(elapsedTime / 60) * 5 // 5 XP per minute
      
      await learningAnalyticsClient.endLearningSession(
        sessionId,
        progress >= 100,
        progress,
        xpEarned
      )
      
      // Update course progress if this is a course
      if (contentType === 'course') {
        await learningAnalyticsClient.updateCourseProgress(
          contentId,
          contentTitle,
          10, // totalLessons - this should come from your course data
          Math.floor(progress / 10), // completedLessons based on progress
          elapsedTime,
          xpEarned,
          progress >= 100 ? 'completed' : 'in_progress'
        )
      }
      
      toast.success(`Session completed! You earned ${xpEarned} XP`)
      resetSession()
    } catch (error) {
      console.error("Error ending session:", error)
      toast.error("Failed to end learning session")
    }
  }

  // Reset session state
  const resetSession = () => {
    setIsSessionActive(false)
    setSessionId(null)
    setSessionStartTime(null)
    setElapsedTime(0)
    setProgress(0)
  }

  // Handle progress update
  const updateProgress = (newProgress: number) => {
    setProgress(Math.min(100, Math.max(0, newProgress)))
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSessionActive && sessionId) {
        // Try to end session if user navigates away
        endSession().catch(console.error)
      }
    }
  }, [isSessionActive, sessionId])

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Learning Session</CardTitle>
        <CardDescription>
          {isSessionActive 
            ? "Track your learning progress"
            : "Start a new learning session"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">{contentTitle}</h3>
            <p className="text-sm text-muted-foreground">
              {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
            </p>
          </div>
          <div className="text-2xl font-mono">
            {formatTime(elapsedTime)}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
        
        {isSessionActive && (
          <div className="grid grid-cols-5 gap-2 pt-2">
            {[0, 25, 50, 75, 100].map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                className={`h-8 ${progress === value ? 'bg-primary/10' : ''}`}
                onClick={() => updateProgress(value)}
              >
                {value}%
              </Button>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isSessionActive ? (
          <>
            <Button variant="outline" onClick={resetSession}>
              Cancel
            </Button>
            <Button onClick={endSession}>
              End Session
            </Button>
          </>
        ) : (
          <Button onClick={startSession}>
            Start Learning Session
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
