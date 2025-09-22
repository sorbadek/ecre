"use client"

import { useState, useEffect, useCallback } from "react"
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
  Trophy,
  Plus,
  Bell,
  Target,
  Zap,
  CheckCircle,
  Sparkles,
  BarChart3,
  Brain,
  Code,
  Lightbulb,
  Rocket,
  BookMarked,
  Users2,
  Video,
  FileText,
  Settings,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  MessageCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltipComponent,
} from "recharts"
import { XPPurchaseModal } from "@/components/xp-purchase-modal"
import { notificationsClient, type Activity } from "@/lib/notifications-client"
import { useApiClients } from "@/lib/use-api-clients"
import { socialClient, type PartnerProfile, type StudyGroup } from "@/lib/social-client"
import { toast } from "sonner"
import { LearningSessionTracker } from "@/components/learning-session"
import { NotificationsPanel } from "@/components/notifications/notifications-panel"
import { SocialSidebar } from "@/components/social/social-sidebar"
import { RecommendationsPanel } from "@/components/recommendations/recommendations-panel"
import { type CourseProgress } from "@/lib/learning-analytics-client"
import {useLearningAnalytics} from "@/hooks/useLearningAnalytics"

interface ChartCourseProgress {
  course: string
  value: number
  color: string
  percentage: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: {
      course: string
      value: number
      percentage?: number
    }
  }>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-sky-200">
        <p className="font-medium text-sky-800">{data.course}</p>
        <p className="text-sm text-sky-600">
          {`${data.value} courses${data.percentage ? ` (${data.percentage}%)` : ''}`}
        </p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useApiClients();
  const [socialLoading, setSocialLoading] = useState(true);
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [socialError, setSocialError] = useState<string | null>(null);
  
  const { 
    weeklyStats, 
    courseStats, 
    courseProgress: detailedCourseProgress, 
    loading, 
    error,
    refresh: refreshAnalytics 
  } = useLearningAnalytics();
  
  const [showXPModal, setShowXPModal] = useState(false);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [chartCourseProgress, setChartCourseProgress] = useState<ChartCourseProgress[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);

  // Process weekly stats when they change
  useEffect(() => {
    if (weeklyStats) {
      const { weekDates, dailyHours } = weeklyStats;
      
      const chartData = weekDates.map((date: string, index: number) => {
        const hours = dailyHours[index] || 0;
        const hoursNum = typeof hours === 'bigint' ? Number(hours) : hours;
        const day = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
        
        return {
          day,
          hours: hoursNum,
          xp: Math.round(hoursNum * 50) // Assuming 50 XP per hour
        };
      });
      
      setWeeklyData(chartData);
    } else {
      setWeeklyData([]);
    }
  }, [weeklyStats]);

  // Process course stats when they change
  useEffect(() => {
    if (courseStats) {
      const { completed, inProgress, paused, notStarted } = courseStats;
      const total = Number(completed) + Number(inProgress) + Number(paused) + Number(notStarted);
      
      const progressData: ChartCourseProgress[] = [
        {
          course: "Completed",
          value: Number(completed) || 0,
          color: "#0ea5e9",
          percentage: total > 0 ? Math.round((Number(completed) / total) * 100) : 0,
        },
        {
          course: "In Progress",
          value: Number(inProgress) || 0,
          color: "#38bdf8",
          percentage: total > 0 ? Math.round((Number(inProgress) / total) * 100) : 0,
        },
        {
          course: "Paused",
          value: Number(paused) || 0,
          color: "#7dd3fc",
          percentage: total > 0 ? Math.round((Number(paused) / total) * 100) : 0,
        },
        {
          course: "Not Started",
          value: Number(notStarted) || 0,
          color: "#bae6fd",
          percentage: total > 0 ? Math.round((Number(notStarted) / total) * 100) : 0,
        },
      ];
      
      setChartCourseProgress(progressData);
      setTotalCourses(total);
    } else {
      setChartCourseProgress([]);
      setTotalCourses(0);
    }
  }, [courseStats]);

  // Load notifications and partners when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;
      
      try {
        // Load notifications
        const notifications = await notificationsClient.getActivities(5n);
        setActivities(notifications || []);

        // Load social data
        const loadSocialData = async () => {
          setSocialLoading(true);
          setSocialError(null);
          
          try {
            // Load study partners
            const partnersData = await socialClient.getMyPartners();
            setPartners(partnersData);
            
            // Load study groups
            const groupsData = await socialClient.getStudyGroups();
            setStudyGroups(groupsData);
          } catch (error) {
            console.error('Failed to load social data:', error);
            setSocialError('Failed to load social data. Please try again later.');
          } finally {
            setSocialLoading(false);
          }
        };
        
        loadSocialData();
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        // setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const formatRelativeTime = (timestamp: bigint | number): string => {
    const date = new Date(Number(timestamp) * 1000)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getActivityIcon = (activityType: { [key: string]: any }) => {
    if (activityType.comment) return <MessageSquare className="h-4 w-4" />
    if (activityType.quiz_completed) return <CheckCircle className="h-4 w-4" />
    if (activityType.deadline_approaching) return <AlertCircle className="h-4 w-4" />
    if (activityType.course_available) return <BookOpen className="h-4 w-4" />
    if (activityType.achievement_earned) return <Trophy className="h-4 w-4" />
    if (activityType.session_joined) return <Users className="h-4 w-4" />
    return <Bell className="h-4 w-4" />
  }

  const getActivityColor = (activityType: { [key: string]: any }) => {
    if (activityType.comment) return "text-blue-500"
    if (activityType.quiz_completed) return "text-green-500"
    if (activityType.deadline_approaching) return "text-amber-500"
    if (activityType.course_available) return "text-indigo-500"
    if (activityType.achievement_earned) return "text-yellow-500"
    if (activityType.session_joined) return "text-purple-500"
    return "text-gray-500"
  }

  const handleJoinGroup = async (groupId: string) => {
    try {
      await socialClient.joinStudyGroup(groupId);
      // Update local state to reflect the change
      setStudyGroups(groups => 
        groups.map(group => 
          group.id === groupId 
            ? { ...group, isMember: true, memberCount: group.memberCount + 1 }
            : group
        )
      );
      toast.success('Successfully joined the study group');
    } catch (error) {
      console.error('Failed to join study group:', error);
      toast.error('Failed to join study group. Please try again.');
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    try {
      await socialClient.leaveStudyGroup(groupId);
      // Update local state to reflect the change
      setStudyGroups(groups => 
        groups.map(group => 
          group.id === groupId 
            ? { ...group, isMember: false, memberCount: Math.max(0, group.memberCount - 1) }
            : group
        )
      );
      toast.success('Successfully left the study group');
    } catch (error) {
      console.error('Failed to leave study group:', error);
      toast.error('Failed to leave study group. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="flex h-screen overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-700 to-cyan-600 bg-clip-text text-transparent">
                  Dashboard Overview
                </h1>
                <p className="text-sky-600/70 mt-1">Welcome back! Here's your learning progress.</p>
              </div>
              <div className="flex items-center space-x-2">
                <NotificationsPanel />
              </div>
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
                      <p className="text-3xl font-bold text-sky-800">
                        {detailedCourseProgress
                          .reduce((acc, p) => {
                            const xp = typeof p.xpEarned === 'bigint' ? Number(p.xpEarned) : (p.xpEarned || 0);
                            return acc + xp;
                          }, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowXPModal(true)}
                    className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Buy XP
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Learning Session Tracker */}
            <LearningSessionTracker 
              contentId="intro-to-react"
              contentType="course"
              contentTitle="Introduction to React"
            />

            {/* Weekly Progress */}
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f9ff" />
                      <XAxis dataKey="day" stroke="#0ea5e9" />
                      <YAxis stroke="#0ea5e9" />
                      <RechartsTooltipComponent content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="hours"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Course Progress */}
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Course Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartCourseProgress}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartCourseProgress.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltipComponent content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    {chartCourseProgress.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-4 h-4 rounded-sm" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-medium">{item.course}</span>
                        </div>
                        <span className="text-sm font-semibold">
                          {item.value} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                    <div className="pt-4">
                      <p className="text-sm text-gray-500">
                        Total Courses: <span className="font-semibold">{totalCourses}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                        <div className={`p-2 rounded-full ${getActivityColor(activity.activityType)} bg-opacity-10`}>
                          {getActivityIcon(activity.activityType)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          {activity.description && (
                            <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatRelativeTime(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No recent activities</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Partners */}
            <Card className="bg-white border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Learning Partners</CardTitle>
              </CardHeader>
              <CardContent>
                {socialLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                  </div>
                ) : socialError ? (
                  <div className="text-red-500 text-sm p-4">{socialError}</div>
                ) : partners.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {partners.map((partner) => (
                      <div key={partner.principal} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {partner.name ? partner.name[0].toUpperCase() : 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{partner.name || 'Anonymous'}</p>
                          <p className="text-sm text-gray-500">{partner.role || 'Learning Partner'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No learning partners yet</p>
                    <p className="text-sm mt-2">Connect with others to enhance your learning experience</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <RecommendationsPanel />
          </div>
        </div>
        
        {/* Social Sidebar */}
        <SocialSidebar />
      </div>
      
      <XPPurchaseModal isOpen={showXPModal} onClose={() => setShowXPModal(false)} />
    </div>
  )
}
