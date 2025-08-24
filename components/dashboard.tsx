'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/lib/auth-context'
import { GraduationCap, Zap, Star, Users, BookOpen, Video, MessageSquare, Award, TrendingUp, Calendar, Settings, LogOut } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  if (!user) return null

  const xpProgress = (user.xp / 200) * 100 // Assuming 200 XP for next level

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Peerverse</span>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              Principal: {user.principal.slice(0, 8)}...
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{user.xp} XP</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-purple-500" />
              <span className="font-semibold">{user.reputation}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <span>Your Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>XP Progress</span>
                    <span>{user.xp}/200</span>
                  </div>
                  <Progress value={xpProgress} className="h-2" />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Reputation</span>
                  <Badge variant="secondary" className="reputation-glow">
                    {user.reputation}
                  </Badge>
                </div>

                {user.isIncubating && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium text-primary">Incubation Period</p>
                    <p className="text-xs text-muted-foreground">
                      {user.incubationDaysLeft} days left of XP-free access
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="learn">Learn</TabsTrigger>
                <TabsTrigger value="teach">Teach</TabsTrigger>
                <TabsTrigger value="community">Community</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Sessions Attended</CardTitle>
                      <Video className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">+2 from last week</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Classes Created</CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">3</div>
                      <p className="text-xs text-muted-foreground">+1 this week</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">28</div>
                      <p className="text-xs text-muted-foreground">+5 from yesterday</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest contributions and learning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Answered question in "React Hooks"</p>
                          <p className="text-xs text-muted-foreground">2 hours ago • +5 XP</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Joined live session "Web3 Fundamentals"</p>
                          <p className="text-xs text-muted-foreground">1 day ago • +3 XP</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Created micro-class "CSS Grid Basics"</p>
                          <p className="text-xs text-muted-foreground">3 days ago • +15 XP</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="learn" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Learning Feed</h2>
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Browse Sessions
                  </Button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Live Session</Badge>
                        <Badge variant="outline">Beginner</Badge>
                      </div>
                      <CardTitle className="text-lg">Introduction to Blockchain</CardTitle>
                      <CardDescription>Learn the fundamentals of blockchain technology</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>By @alice_dev</span>
                        <span>Tomorrow 2:00 PM</span>
                      </div>
                      <Button className="w-full">Join Session</Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">Micro-Class</Badge>
                        <Badge variant="outline">Intermediate</Badge>
                      </div>
                      <CardTitle className="text-lg">React State Management</CardTitle>
                      <CardDescription>Master useState, useEffect, and custom hooks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <span>By @react_guru</span>
                        <span>15 min read</span>
                      </div>
                      <Button className="w-full" variant="outline">Start Learning</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="teach" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Share Your Knowledge</h2>
                  <div className="space-x-2">
                    <Button variant="outline">
                      <Video className="h-4 w-4 mr-2" />
                      Schedule Session
                    </Button>
                    <Button>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Create Micro-Class
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Teaching Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Sessions Hosted</span>
                        <span className="font-semibold">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Micro-Classes Created</span>
                        <span className="font-semibold">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Students Reached</span>
                        <span className="font-semibold">127</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Rating</span>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">4.8</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>Start sharing your knowledge today</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button className="w-full justify-start" variant="outline">
                        <Video className="h-4 w-4 mr-2" />
                        Schedule a Live Session
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Create Micro-Class
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Answer Questions
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Users className="h-4 w-4 mr-2" />
                        Start Mentorship Circle
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="community" className="space-y-6">
                <h2 className="text-2xl font-bold">Community Hub</h2>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Q&A Forum</CardTitle>
                      <CardDescription>Ask questions and help others</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Questions Today</span>
                          <span className="font-semibold">23</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Your Answers</span>
                          <span className="font-semibold">5</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">Browse Forum</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mentorship Circles</CardTitle>
                      <CardDescription>Join peer-led learning groups</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Active Circles</span>
                          <span className="font-semibold">12</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Your Circles</span>
                          <span className="font-semibold">2</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">Find Circles</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Leaderboard</CardTitle>
                      <CardDescription>Top contributors this week</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>🥇 @alice_dev</span>
                          <span className="font-semibold">450 XP</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>🥈 @react_guru</span>
                          <span className="font-semibold">380 XP</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>🥉 You</span>
                          <span className="font-semibold text-primary">150 XP</span>
                        </div>
                      </div>
                      <Button className="w-full mt-4" variant="outline">View Full Board</Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <h2 className="text-2xl font-bold">Your Achievements</h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="border-yellow-500/50">
                    <CardHeader className="text-center">
                      <Award className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                      <CardTitle className="text-lg">First Teacher</CardTitle>
                      <CardDescription>Created your first micro-class</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="border-blue-500/50">
                    <CardHeader className="text-center">
                      <Users className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                      <CardTitle className="text-lg">Community Helper</CardTitle>
                      <CardDescription>Answered 25 questions in the forum</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="border-green-500/50">
                    <CardHeader className="text-center">
                      <TrendingUp className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <CardTitle className="text-lg">Rising Star</CardTitle>
                      <CardDescription>Reached 100 XP milestone</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="border-dashed border-muted-foreground/50">
                    <CardHeader className="text-center opacity-50">
                      <Video className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <CardTitle className="text-lg">Session Master</CardTitle>
                      <CardDescription>Host 10 live sessions</CardDescription>
                      <Badge variant="outline" className="mt-2">7/10</Badge>
                    </CardHeader>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
