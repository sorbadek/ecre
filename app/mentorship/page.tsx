'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, Users, Calendar, Clock, MessageSquare, PlusCircle, Handshake, Star, UserIcon, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface MentorshipCircle {
  id: string
  name: string
  description: string
  currentGuide: {
    name: string
    avatar: string
    username: string
    expertise: string
  } | null // Can be null if no guide is set or for a new circle
  members: {
    name: string
    avatar: string
  }[]
  topics: string[]
  nextMeeting: string | null // ISO string date
  goals: string[]
  status: 'open' | 'full' | 'private'
}

const mentorshipCircles: MentorshipCircle[] = [
  {
    id: 'mc1',
    name: 'ICP Devs Guild',
    description: 'A collaborative circle for developers building on the Internet Computer Protocol. Share challenges, solutions, and learn together.',
    currentGuide: {
      name: 'Alice Johnson',
      avatar: '/alice-johnson-avatar.png',
      username: 'alice_j',
      expertise: 'Motoko, Azle, Canisters',
    },
    members: [
      { name: 'Alice Johnson', avatar: '/alice-johnson-avatar.png' },
      { name: 'Bob Williams', avatar: '/bob-williams-avatar.png' },
      { name: 'Sarah Chen', avatar: '/sarah-chen-avatar.png' },
      { name: 'Michael Lee', avatar: '/michael-lee-avatar.png' },
      { name: 'Emily White', avatar: '/emily-white-avatar.png' },
    ],
    topics: ['ICP', 'Motoko', 'Azle', 'Web3', 'Smart Contracts'],
    nextMeeting: '2024-08-15T14:00:00Z',
    goals: ['Deploy 5 new dApps', 'Contribute to open-source ICP projects', 'Host 2 workshops'],
    status: 'open',
  },
  {
    id: 'mc2',
    name: 'Rust Learners Group',
    description: 'For anyone diving into Rust programming. We cover ownership, borrowing, concurrency, and more through practical exercises.',
    currentGuide: {
      name: 'Bob Williams',
      avatar: '/bob-williams-avatar.png',
      username: 'bob_w',
      expertise: 'Rust, Systems Programming',
    },
    members: [
      { name: 'Bob Williams', avatar: '/bob-williams-avatar.png' },
      { name: 'Charlie Brown', avatar: '/charlie-brown-avatar.png' },
      { name: 'Diana Prince', avatar: '/diana-prince-avatar.png' },
    ],
    topics: ['Rust', 'Programming', 'Concurrency'],
    nextMeeting: '2024-08-18T18:30:00Z',
    goals: ['Complete "The Book"', 'Build a CLI tool in Rust', 'Understand lifetimes'],
    status: 'open',
  },
  {
    id: 'mc3',
    name: 'Frontend Fanatics',
    description: 'A circle dedicated to modern frontend development. Discuss React, Next.js, UI/UX, and performance optimization.',
    currentGuide: {
      name: 'Emily White',
      avatar: '/emily-white-avatar.png',
      username: 'emily_w',
      expertise: 'React, Next.js, UI/UX',
    },
    members: [
      { name: 'Emily White', avatar: '/emily-white-avatar.png' },
      { name: 'Sarah Chen', avatar: '/sarah-chen-avatar.png' },
    ],
    topics: ['React', 'Next.js', 'UI/UX', 'CSS-in-JS'],
    nextMeeting: '2024-08-22T10:00:00Z',
    goals: ['Build a design system', 'Optimize app performance', 'Learn new animation libraries'],
    status: 'full',
  },
  {
    id: 'mc4',
    name: 'Data Science Deep Dive',
    description: 'Exploring machine learning, data analysis, and AI concepts with Python. All skill levels welcome.',
    currentGuide: {
      name: 'Diana Prince',
      avatar: '/diana-prince-avatar.png',
      username: 'diana_p',
      expertise: 'Python, ML, AI',
    },
    members: [
      { name: 'Diana Prince', avatar: '/diana-prince-avatar.png' },
      { name: 'Charlie Brown', avatar: '/charlie-brown-avatar.png' },
    ],
    topics: ['Python', 'Machine Learning', 'AI', 'Data Analysis'],
    nextMeeting: '2024-08-25T16:00:00Z',
    goals: ['Complete a Kaggle competition', 'Implement a neural network from scratch', 'Read 5 research papers'],
    status: 'open',
  },
]

export default function MentorshipCirclesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('explore')

  const formatMeetingTime = (isoString: string | null) => {
    if (!isoString) return 'No upcoming meeting'
    const date = new Date(isoString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    })
  }

  const filteredCircles = mentorshipCircles.filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          circle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          circle.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (circle.currentGuide?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = activeTab === 'explore' ? circle.status === 'open' : true // 'my-circles' shows all
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Mentorship Circles</h1>
        <div className="relative w-full md:w-auto flex-grow md:flex-grow-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search circles, topics, or guides..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="explore">Explore Circles</TabsTrigger>
          <TabsTrigger value="my-circles">My Circles</TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCircles.length > 0 ? (
              filteredCircles.map(circle => (
                <Card key={circle.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg font-semibold">{circle.name}</CardTitle>
                      <Badge variant={circle.status === 'open' ? 'default' : 'secondary'} className="text-xs">
                        {circle.status.charAt(0).toUpperCase() + circle.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                      {circle.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col flex-grow justify-between">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={circle.currentGuide?.avatar || '/placeholder.svg?height=40&width=40&query=guide-avatar'} alt={circle.currentGuide?.name || 'No Guide'} />
                        <AvatarFallback>{circle.currentGuide?.name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Guide: {circle.currentGuide?.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {circle.currentGuide?.expertise || 'No expertise listed'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> {circle.members.length} Members
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> {formatMeetingTime(circle.nextMeeting)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {circle.topics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{topic}</Badge>
                      ))}
                    </div>
                    <Button className="w-full mt-auto" disabled={circle.status !== 'open'}>
                      {circle.status === 'open' ? 'Join Circle' : 'View Details'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-10">
                No open mentorship circles found matching your criteria.
              </div>
            )}
            <Card className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed hover:border-primary transition-colors cursor-pointer">
              <PlusCircle className="h-10 w-10 text-muted-foreground mb-3" />
              <CardTitle className="text-lg">Create New Circle</CardTitle>
              <CardDescription>Start a new peer-led mentorship group.</CardDescription>
              <Button asChild className="mt-4">
                <Link href="#">Start a Circle</Link>
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="my-circles" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Filter mockCircles to show only circles the current user is a member of */}
            {mentorshipCircles.filter(circle => circle.members.some(member => member.name === 'Alice Johnson')).length > 0 ? (
              mentorshipCircles.filter(circle => circle.members.some(member => member.name === 'Alice Johnson')).map(circle => (
                <Card key={circle.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg font-semibold">{circle.name}</CardTitle>
                      <Badge variant="default" className="text-xs">My Circle</Badge>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                      {circle.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col flex-grow justify-between">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={circle.currentGuide?.avatar || '/placeholder.svg?height=40&width=40&query=guide-avatar'} alt={circle.currentGuide?.name || 'No Guide'} />
                        <AvatarFallback>{circle.currentGuide?.name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">Guide: {circle.currentGuide?.name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {circle.currentGuide?.expertise || 'No expertise listed'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> {circle.members.length} Members
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> {formatMeetingTime(circle.nextMeeting)}
                      </div>
                    </div>
                    {circle.goals && circle.goals.length > 0 && (
                      <div className="mb-3">
                        <h4 className="font-semibold text-sm mb-1">Goals:</h4>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {circle.goals.map((goal, idx) => (
                            <li key={idx}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {circle.topics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">{topic}</Badge>
                      ))}
                    </div>
                    <Button className="w-full mt-auto">View Circle</Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-10">
                You are not currently part of any mentorship circles. Explore to join one!
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
