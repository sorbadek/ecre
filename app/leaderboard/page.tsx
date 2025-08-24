'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, Zap, Trophy, Star, Users, Award } from 'lucide-react'
import Image from 'next/image'

interface LeaderboardEntry {
  id: string
  rank: number
  name: string
  username: string
  avatar: string
  xp: number
  reputation: number
  badges: string[]
}

const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: '1',
    rank: 1,
    name: 'Alice Johnson',
    username: 'alice_j',
    avatar: '/alice-johnson-avatar.png',
    xp: 15000,
    reputation: 4.9,
    badges: ['Web3 Pioneer', 'Top Contributor'],
  },
  {
    id: '2',
    rank: 2,
    name: 'Bob Williams',
    username: 'bob_w',
    avatar: '/bob-williams-avatar.png',
    xp: 12500,
    reputation: 4.8,
    badges: ['Rustacean'],
  },
  {
    id: '3',
    rank: 3,
    name: 'Sarah Chen',
    username: 'sarah_c',
    avatar: '/sarah-chen-avatar.png',
    xp: 11000,
    reputation: 4.7,
    badges: ['Motoko Master'],
  },
  {
    id: '4',
    rank: 4,
    name: 'Michael Lee',
    username: 'michael_l',
    avatar: '/michael-lee-avatar.png',
    xp: 9800,
    reputation: 4.6,
    badges: [],
  },
  {
    id: '5',
    rank: 5,
    name: 'Emily White',
    username: 'emily_w',
    avatar: '/emily-white-avatar.png',
    xp: 8500,
    reputation: 4.5,
    badges: ['Frontend Fanatic'],
  },
  {
    id: '6',
    rank: 6,
    name: 'Charlie Brown',
    username: 'charlie_b',
    avatar: '/charlie-brown-avatar.png',
    xp: 7200,
    reputation: 4.4,
    badges: [],
  },
  {
    id: '7',
    rank: 7,
    name: 'Diana Prince',
    username: 'diana_p',
    avatar: '/diana-prince-avatar.png',
    xp: 6000,
    reputation: 4.3,
    badges: ['Data Scientist'],
  },
  {
    id: '8',
    rank: 8,
    name: 'Frank Green',
    username: 'frank_g',
    avatar: '/placeholder.svg?height=40&width=40',
    xp: 5500,
    reputation: 4.2,
    badges: [],
  },
  {
    id: '9',
    rank: 9,
    name: 'Grace Hall',
    username: 'grace_h',
    avatar: '/placeholder.svg?height=40&width=40',
    xp: 4800,
    reputation: 4.1,
    badges: [],
  },
  {
    id: '10',
    rank: 10,
    name: 'Henry King',
    username: 'henry_k',
    avatar: '/placeholder.svg?height=40&width=40',
    xp: 4000,
    reputation: 4.0,
    badges: [],
  },
]

export default function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('xp') // 'xp' or 'reputation'

  const sortedLeaderboard = [...mockLeaderboard].sort((a, b) => {
    if (activeTab === 'xp') {
      return b.xp - a.xp
    } else {
      return b.reputation - a.reputation
    }
  }).map((entry, index) => ({ ...entry, rank: index + 1 })) // Re-rank after sorting

  const filteredLeaderboard = sortedLeaderboard.filter(entry =>
    entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.badges.some(badge => badge.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <div className="relative w-full md:w-auto flex-grow md:flex-grow-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search users or badges..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="xp" className="flex items-center gap-2">
            <Zap className="h-4 w-4" /> Top XP Earners
          </TabsTrigger>
          <TabsTrigger value="reputation" className="flex items-center gap-2">
            <Star className="h-4 w-4" /> Top Reputation
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Peers</CardTitle>
              <CardDescription>Rankings based on {activeTab === 'xp' ? 'XP earned' : 'reputation score'}.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredLeaderboard.length > 0 ? (
                  filteredLeaderboard.map(entry => (
                    <div key={entry.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className="font-bold text-lg w-8 text-center">
                        {entry.rank <= 3 ? (
                          <Trophy className={`h-6 w-6 mx-auto ${entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-gray-400' : 'text-amber-700'}`} />
                        ) : (
                          entry.rank
                        )}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.avatar || "/placeholder.svg"} alt={entry.name} />
                        <AvatarFallback>{entry.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 grid gap-0.5">
                        <p className="font-semibold text-base">{entry.name}</p>
                        <p className="text-sm text-muted-foreground">@{entry.username}</p>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                          <Zap className="h-4 w-4" /> {entry.xp} XP
                        </div>
                        <div className="flex items-center gap-1 text-blue-500 font-semibold">
                          <Star className="h-4 w-4" /> {entry.reputation.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-10">
                    No users found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
