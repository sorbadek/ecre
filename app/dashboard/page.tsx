"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Coins,
  BookOpen,
  Users,
  MessageSquare,
  Trophy,
  Plus,
  Bell,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowUp,
  BarChart3,
  Brain,
  Code,
  Lightbulb,
  Rocket,
  BookMarked,
  Users2,
  MessageCircle,
  Video,
  FileText,
  Settings,
  HelpCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { XPPurchaseModal } from "@/components/xp-purchase-modal"
import { learningAnalyticsClient } from "@/lib/learning-analytics-client"
import { notificationsClient, type Activity } from "@/lib/notifications-client"
import { socialClient, type PartnerProfile } from "@/lib/social-client"

// Sample data for charts
const weeklyLearningData = [
  { day: "Mon", hours: 2.5, xp: 120 },
  { day: "Tue", hours: 3.2, xp: 180 },
  { day: "Wed", hours: 1.8, xp: 90 },
  { day: "Thu", hours: 4.1, xp: 220 },
  { day: "Fri", hours: 2.9, xp: 150 },
  { day: "Sat", hours: 5.2, xp: 280 },
  { day: "Sun", hours: 3.8, xp: 200 },
]

const courseProgressData = [
  { course: "Completed", value: 3, color: "#0ea5e9", percentage: 43 },
  { course: "In Progress", value: 2, color: "#38bdf8", percentage: 29 },
  { course: "Paused", value: 1, color: "#7dd3fc", percentage: 14 },
  { course: "Not Started", value: 1, color: "#bae6fd", percentage: 14 },
]

export default function DashboardPage() {
  const [showXPModal, setShowXPModal] = useState(false)
  const [weeklyData, setWeeklyData] = useState(weeklyLearningData)
  const [courseProgress, setCourseProgress] = useState(courseProgressData)
  const [activities, setActivities] = useState<Activity[]>([])
  const [partners, setPartners] = useState<PartnerProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)

        // Load learning analytics
        try {
          const analytics = await learningAnalyticsClient.getWeeklyStats()
          if (analytics && analytics.dailyHours) {
            const chartData = analytics.dailyHours.map((hours, index) => {
              // Convert BigInt to number if needed
              const hoursNum = typeof hours === 'bigint' ? Number(hours) : hours;
              return {
                day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index],
                hours: hoursNum,
                xp: Math.round(hoursNum * 50), // Approximate XP calculation
              };
            })
            setWeeklyData(chartData)
          }
        } catch (error) {
          console.warn("Using fallback learning data:", error)
        }

        try {
          const progress = await learningAnalyticsClient.getCourseStats()
          if (progress) {
            // Convert BigInt to number if needed
            const completed = typeof progress.completed === 'bigint' ? Number(progress.completed) : progress.completed;
            const inProgress = typeof progress.inProgress === 'bigint' ? Number(progress.inProgress) : progress.inProgress;
            const paused = typeof progress.paused === 'bigint' ? Number(progress.paused) : progress.paused;
            const notStarted = typeof progress.notStarted === 'bigint' ? Number(progress.notStarted) : progress.notStarted;
            const totalCourses = typeof progress.totalCourses === 'bigint' ? Number(progress.totalCourses) : progress.totalCourses;

            const progressData = [
              {
                course: "Completed",
                value: completed,
                color: "#0ea5e9",
                percentage: totalCourses > 0 ? Math.round((completed / totalCourses) * 100) : 0,
              },
              {
                course: "In Progress",
                value: inProgress,
                color: "#38bdf8",
                percentage: totalCourses > 0 ? Math.round((inProgress / totalCourses) * 100) : 0,
              },
              {
                course: "Paused",
                value: paused,
                color: "#7dd3fc",
                percentage: totalCourses > 0 ? Math.round((paused / totalCourses) * 100) : 0,
              },
              {
                course: "Not Started",
                value: notStarted,
                color: "#bae6fd",
                percentage: totalCourses > 0 ? Math.round((notStarted / totalCourses) * 100) : 0,
              },
            ]
            setCourseProgress(progressData)
          }
        } catch (error) {
          console.warn("Using fallback course progress:", error)
        }

        // Load activities
        try {
          const userActivities = await notificationsClient.getMyActivities(5)
          setActivities(userActivities)
        } catch (error) {
          console.warn("Using fallback activities:", error)
        }

        // Load learning partners
        try {
          const userPartners = await socialClient.getMyPartners()
          setPartners(userPartners.slice(0, 5)) // Show only first 5
        } catch (error) {
          console.warn("Using fallback partners:", error)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const generateSampleData = async () => {
    try {
      setLoading(true)

      // Generate sample data for all services
      await Promise.all([
        learningAnalyticsClient.generateSampleData().catch(console.warn),
        notificationsClient.generateSampleActivities().catch(console.warn),
        socialClient.generateSamplePartners().catch(console.warn),
      ])

      // Reload the data
      try {
        const analytics = await learningAnalyticsClient.getWeeklyStats()
        if (analytics && analytics.dailyHours) {
          const chartData = analytics.dailyHours.map((hours, index) => ({
            day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index],
            hours,
            xp: Math.round(hours * 50),
          }))
          setWeeklyData(chartData)
        }
      } catch (error) {
        console.warn("Failed to reload analytics:", error)
      }

      try {
        const progress = await learningAnalyticsClient.getCourseStats()
        if (progress) {
          const progressData = [
            {
              course: "Completed",
              value: progress.completed,
              color: "#0ea5e9",
              percentage: Math.round((progress.completed / progress.totalCourses) * 100),
            },
            {
              course: "In Progress",
              value: progress.inProgress,
              color: "#38bdf8",
              percentage: Math.round((progress.inProgress / progress.totalCourses) * 100),
            },
            {
              course: "Paused",
              value: progress.paused,
              color: "#7dd3fc",
              percentage: Math.round((progress.paused / progress.totalCourses) * 100),
            },
            {
              course: "Not Started",
              value: progress.notStarted,
              color: "#bae6fd",
              percentage: Math.round((progress.notStarted / progress.totalCourses) * 100),
            },
          ]
          setCourseProgress(progressData)
        }
      } catch (error) {
        console.warn("Failed to reload course progress:", error)
      }

      try {
        const userActivities = await notificationsClient.getMyActivities(5)
        setActivities(userActivities)
      } catch (error) {
        console.warn("Failed to reload activities:", error)
      }

      try {
        const userPartners = await socialClient.getMyPartners()
        setPartners(userPartners.slice(0, 5))
      } catch (error) {
        console.warn("Failed to reload partners:", error)
      }
    } catch (error) {
      console.error("Error generating sample data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getActivityIcon = (activityType: any) => {
    if ("comment" in activityType) return <MessageSquare className="h-4 w-4" />
    if ("quiz_completed" in activityType) return <CheckCircle className="h-4 w-4" />
    if ("deadline_approaching" in activityType) return <AlertCircle className="h-4 w-4" />
    if ("course_available" in activityType) return <BookOpen className="h-4 w-4" />
    if ("achievement_earned" in activityType) return <Trophy className="h-4 w-4" />
    if ("session_joined" in activityType) return <Users className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }

  const getActivityColor = (activityType: any) => {
    if ("comment" in activityType) return "text-sky-600"
    if ("quiz_completed" in activityType) return "text-sky-600"
    if ("deadline_approaching" in activityType) return "text-sky-600"
    if ("course_available" in activityType) return "text-sky-600"
    if ("achievement_earned" in activityType) return "text-sky-600"
    if ("session_joined" in activityType) return "text-sky-600"
    return "text-sky-600"
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-sky-200">
          <p className="font-medium text-sky-800">{data.course}</p>
          <p className="text-sm text-sky-600">{`${data.value} courses (${data.percentage}%)`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="flex gap-6 p-6">
        {/* Main Content - Left Side */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-700 to-cyan-600 bg-clip-text text-transparent">
                Dashboard Overview
              </h1>
              <p className="text-sky-600/70 mt-1">Welcome back! Here's your learning progress.</p>
            </div>
            <Button
              onClick={generateSampleData}
              disabled={loading}
              className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Sample Data
            </Button>
          </div>

          {/* XP Balance Card */}
          <Card className="bg-gradient-to-br from-sky-50/80 via-sky-100/50 to-cyan-50/50 border-sky-200/50 shadow-lg shadow-sky-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-sky-600">XP Balance</p>
                    <p className="text-3xl font-bold text-sky-800">2,847</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-sky-600 text-sm font-medium mb-2">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    +180 this week
                  </div>
                  <Button
                    onClick={() => setShowXPModal(true)}
                    className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Buy XP
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Learning Chart */}
          <Card className="bg-gradient-to-br from-sky-50/80 via-sky-100/50 to-cyan-50/50 border-sky-200/50 shadow-lg shadow-sky-100/50">
            <CardHeader>
              <CardTitle className="flex items-center text-sky-800">
                <BarChart3 className="h-5 w-5 mr-2 text-sky-600" />
                Weekly Learning Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                    <XAxis dataKey="day" stroke="#0369a1" />
                    <YAxis stroke="#0369a1" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#f0f9ff",
                        border: "1px solid #0ea5e9",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="xp"
                      stroke="#06b6d4"
                      strokeWidth={2}
                      dot={{ fill: "#06b6d4", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Course Progress Donut Chart */}
          <Card className="bg-gradient-to-br from-sky-50/80 via-sky-100/50 to-cyan-50/50 border-sky-200/50 shadow-lg shadow-sky-100/50">
            <CardHeader>
              <CardTitle className="flex items-center text-sky-800">
                <Target className="h-5 w-5 mr-2 text-sky-600" />
                Course Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {/* Donut Chart */}
                <div className="h-64 w-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={courseProgress}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {courseProgress.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend and Stats */}
                <div className="flex-1 ml-8 space-y-4">
                  <div className="text-center mb-6">
                    <p className="text-2xl font-bold text-sky-800">7</p>
                    <p className="text-sm text-sky-600">Total Courses</p>
                  </div>

                  <div className="space-y-3">
                    {courseProgress.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm font-medium text-sky-700">{item.course}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-sky-800">{item.value}</span>
                          <span className="text-xs text-sky-600 ml-1">({item.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-3 rounded-lg bg-sky-50/50 border border-sky-200/30">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-sky-600">Completion Rate</span>
                      <span className="font-bold text-sky-800">
                        {Math.round(
                          (courseProgress[0].value / courseProgress.reduce((sum, item) => sum + item.value, 0)) * 100,
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-gradient-to-br from-sky-50/80 via-sky-100/50 to-cyan-50/50 border-sky-200/50 shadow-lg shadow-sky-100/50">
            <CardHeader>
              <CardTitle className="flex items-center text-sky-800">
                <Lightbulb className="h-5 w-5 mr-2 text-sky-600" />
                Recommendations for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-sky-50/50 border border-sky-200/30">
                  <div className="p-2 rounded-full bg-gradient-to-r from-sky-400 to-cyan-400">
                    <Code className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sky-800">Advanced React Patterns</h4>
                    <p className="text-sm text-sky-600 mt-1">
                      Based on your progress in React fundamentals, this course will help you master advanced concepts.
                    </p>
                    <Badge className="mt-2 bg-sky-200/50 text-sky-700 border-sky-300/50">Recommended</Badge>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg bg-sky-50/50 border border-sky-200/30">
                  <div className="p-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-400">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sky-800">TypeScript Deep Dive</h4>
                    <p className="text-sm text-sky-600 mt-1">
                      Enhance your TypeScript skills with advanced type system features and best practices.
                    </p>
                    <Badge className="mt-2 bg-sky-200/50 text-sky-700 border-sky-300/50">Popular</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Fixed Width with Independent Scrolling */}
        <div className="w-80 sticky top-6 h-[calc(100vh-3rem)] overflow-hidden">
          <ScrollArea className="h-full pr-2">
            <div className="space-y-6">
              {/* Recent Activities */}
              <Card className="bg-gradient-to-br from-sky-50/80 via-sky-100/50 to-cyan-50/50 border-sky-200/50 shadow-lg shadow-sky-100/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sky-800 text-lg">
                    <Bell className="h-5 w-5 mr-2 text-sky-600" />
                    Recent Activities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-sky-200/50 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-sky-200/30 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : activities.length > 0 ? (
                    activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3 p-3 rounded-lg bg-sky-50/30 border border-sky-200/20 hover:bg-sky-100/40 transition-colors"
                      >
                        <div className={`p-1.5 rounded-full bg-sky-100/50 ${getActivityColor(activity.activityType)}`}>
                          {getActivityIcon(activity.activityType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-sky-800 truncate">{activity.title}</p>
                          {activity.description && (
                            <p className="text-xs text-sky-600 mt-1 line-clamp-2">{activity.description}</p>
                          )}
                          <p className="text-xs text-sky-500 mt-1">{formatTime(activity.timestamp)}</p>
                        </div>
                        {!activity.isRead && <div className="w-2 h-2 bg-sky-500 rounded-full mt-2"></div>}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Bell className="h-8 w-8 text-sky-400 mx-auto mb-2" />
                      <p className="text-sm text-sky-600">No recent activities</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Learning Partners */}
              <Card className="bg-gradient-to-br from-sky-50/80 via-sky-100/50 to-cyan-50/50 border-sky-200/50 shadow-lg shadow-sky-100/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sky-800 text-lg">
                    <Users2 className="h-5 w-5 mr-2 text-sky-600" />
                    Learning Partners
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-3 animate-pulse">
                          <div className="w-10 h-10 bg-sky-200/50 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-sky-200/50 rounded w-3/4 mb-1"></div>
                            <div className="h-3 bg-sky-200/30 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : partners.length > 0 ? (
                    partners.map((partner) => (
                      <div
                        key={partner.principal}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-sky-50/30 border border-sky-200/20 hover:bg-sky-100/40 transition-colors"
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={`${partner.avatarColor} text-white text-sm font-medium`}>
                              {partner.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                              partner.onlineStatus === "online"
                                ? "bg-emerald-500"
                                : partner.onlineStatus === "away"
                                  ? "bg-amber-500"
                                  : "bg-gray-400"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-sky-800 truncate">{partner.name}</p>
                          <p className="text-xs text-sky-600">{partner.role}</p>
                          <div className="flex items-center mt-1">
                            <Zap className="h-3 w-3 text-sky-500 mr-1" />
                            <span className="text-xs text-sky-600">{partner.xp.toLocaleString()} XP</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <Users2 className="h-8 w-8 text-sky-400 mx-auto mb-2" />
                      <p className="text-sm text-sky-600">No learning partners yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-sky-50/80 via-sky-100/50 to-cyan-50/50 border-sky-200/50 shadow-lg shadow-sky-100/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-sky-800 text-lg">
                    <Rocket className="h-5 w-5 mr-2 text-sky-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sky-700 hover:bg-sky-100/50 hover:text-sky-800"
                  >
                    <BookMarked className="h-4 w-4 mr-3" />
                    Start Learning Session
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sky-700 hover:bg-sky-100/50 hover:text-sky-800"
                  >
                    <Video className="h-4 w-4 mr-3" />
                    Join Study Group
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sky-700 hover:bg-sky-100/50 hover:text-sky-800"
                  >
                    <MessageCircle className="h-4 w-4 mr-3" />
                    Ask for Help
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sky-700 hover:bg-sky-100/50 hover:text-sky-800"
                  >
                    <FileText className="h-4 w-4 mr-3" />
                    Take Practice Quiz
                  </Button>
                  <Separator className="my-3 bg-sky-200/30" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sky-700 hover:bg-sky-100/50 hover:text-sky-800"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sky-700 hover:bg-sky-100/50 hover:text-sky-800"
                  >
                    <HelpCircle className="h-4 w-4 mr-3" />
                    Help & Support
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>

      <XPPurchaseModal open={showXPModal} onOpenChange={setShowXPModal} />
    </div>
  )
}
