"use client"

import React, { useState, useEffect } from "react"
import { Bell, Check, CheckCircle, X, Settings as SettingsIcon, Trash2, MessageSquare, AlertCircle } from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Badge } from "../ui/badge"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import { Switch } from "../ui/switch"
import { Label } from "../ui/label"
import { notificationsClient, type Activity, type ActivityType } from "@/lib/notifications-client"
import { useApiClients } from "@/lib/use-api-clients"
import { toast } from "sonner"

type NotificationType = 'all' | 'unread'

interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  marketing: boolean
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Activity[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [view, setView] = useState<NotificationType>('unread')
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: true,
    push: true,
    inApp: true,
    marketing: false
  })
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useApiClients()

  // Define notification client methods
  const getNotificationPreferences = async () => {
    try {
      const prefs = await notificationsClient.getNotificationPreferences()
      setPreferences({
        email: prefs.emailNotifications,
        push: prefs.pushNotifications,
        inApp: prefs.inAppNotifications,
        marketing: prefs.weeklyDigest
      })
    } catch (error) {
      console.error("Error loading notification preferences:", error)
      toast.error("Failed to load notification preferences")
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await notificationsClient.deleteActivity(activityId)
      return true
    } catch (error) {
      console.error("Error deleting activity:", error)
      throw error
    }
  }

  const markAsRead = async (activityId: string) => {
    try {
      await notificationsClient.markAsRead(activityId)
      setNotifications(prev => 
        prev.map(n => n.id === activityId ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast.error("Failed to mark notification as read")
    }
  }

  const markAllAsRead = async () => {
    try {
      await notificationsClient.markAllAsRead()
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      )
      setUnreadCount(0)
      toast.success("All notifications marked as read")
    } catch (error) {
      console.error("Error marking all as read:", error)
      toast.error("Failed to mark all as read")
    }
  }

  const handleUpdatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      await notificationsClient.updateNotificationPreferences({
        emailNotifications: updates.email ?? preferences.email,
        pushNotifications: updates.push ?? preferences.push,
        inAppNotifications: updates.inApp ?? preferences.inApp,
        weeklyDigest: updates.marketing ?? preferences.marketing,
        activityTypes: [] // This should be populated based on your requirements
      })
      setPreferences(prev => ({
        ...prev,
        ...updates
      }))
      toast.success("Notification preferences updated")
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast.error("Failed to update preferences")
    }
  }

  // Load notifications and preferences
  useEffect(() => {
    if (!isAuthenticated) return
    
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load notifications
        const activities = await notificationsClient.getActivities(50, 0)
        setNotifications(activities || [])
        setUnreadCount(activities.filter(a => !a.isRead).length)
        
        // Load preferences
        await getNotificationPreferences()
      } catch (error) {
        console.error("Error loading notifications:", error)
        toast.error("Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
    
    // Set up polling for new notifications (every 5 minutes)
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const deleteNotification = async (id: string) => {
    try {
      await handleDeleteActivity(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      setUnreadCount(prev => Math.max(0, prev - 1))
      toast.success("Notification deleted")
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Failed to delete notification")
    }
  }

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)
    
    try {
      await handleUpdatePreferences(newPrefs)
    } catch (error) {
      console.error("Error updating preferences:", error)
      toast.error("Failed to update notification preferences")
      // Revert on error
      setPreferences(preferences)
    }
  }

  // Filter notifications based on view
  const filteredNotifications = view === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications

  // Format date
  const formatDate = (timestamp: bigint | number) => {
    const date = new Date(Number(timestamp) * 1000)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: ActivityType) => {
    if ('comment' in type) return <MessageSquare className="h-4 w-4" />
    if ('quiz_completed' in type) return <CheckCircle className="h-4 w-4" />
    if ('deadline_approaching' in type) return <AlertCircle className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView(view === 'all' ? 'unread' : 'all')}
              className="text-xs h-7 px-2"
            >
              {view === 'all' ? 'Show Unread' : 'Show All'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-7 px-2"
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowSettings(!showSettings)}
            >
              <SettingsIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showSettings ? (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Notification Preferences</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch
                    id="email-notifications"
                    checked={preferences.email}
                    onCheckedChange={(checked) => updatePreference('email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <Switch
                    id="push-notifications"
                    checked={preferences.push}
                    onCheckedChange={(checked) => updatePreference('push', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="in-app-notifications">In-App Notifications</Label>
                  <Switch
                    id="in-app-notifications"
                    checked={preferences.inApp}
                    onCheckedChange={(checked) => updatePreference('inApp', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing-emails">Marketing Emails</Label>
                  <Switch
                    id="marketing-emails"
                    checked={preferences.marketing}
                    onCheckedChange={(checked) => updatePreference('marketing', checked)}
                  />
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowSettings(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {view === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : "No notifications to display."}
              </div>
            ) : (
              <ScrollArea className="h-[300px]">
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-accent ${!notification.isRead ? 'bg-accent/50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-0.5">
                            {getActivityIcon(notification.activityType)}
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {notification.title}
                            </p>
                            {notification.description && (
                              <p className="text-sm text-muted-foreground">
                                {notification.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatDate(notification.timestamp)}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
