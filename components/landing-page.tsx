'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Zap, BookOpen, Menu, Heart, Star, Users, Trophy, MessageCircle, Clock, Target, Award, Lightbulb, Globe } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'

export default function LandingPage() {
  const { login, loading, user } = useAuth()
  const [watermarkData, setWatermarkData] = useState<Array<{ top: string; left: string }>>([])

  // Generate diagonal watermark positions
  useEffect(() => {
    const generateDiagonalWatermarkStyles = () => {
      const watermarks = []
      const spacing = 200 // Space between watermarks
      const rows = Math.ceil(window.innerHeight / spacing) + 3
      const cols = Math.ceil(window.innerWidth / spacing) + 3

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Create diagonal pattern by offsetting every other row
          const offsetX = (row % 2) * (spacing / 2)
          const x = col * spacing + offsetX - spacing
          const y = row * spacing - spacing

          watermarks.push({
            top: `${y}px`,
            left: `${x}px`,
          })
        }
      }

      return watermarks
    }

    setWatermarkData(generateDiagonalWatermarkStyles())

    const handleResize = () => {
      setWatermarkData(generateDiagonalWatermarkStyles())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Diagonal Watermark Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {watermarkData.map((style, index) => (
          <div
            key={index}
            className="absolute text-4xl font-bold text-blue-200 opacity-20 transform -rotate-12 select-none bradley-hand"
            style={{
              top: style.top,
              left: style.left,
            }}
          >
            Peerverse
          </div>
        ))}
      </div>

      {/* Floating Header */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl">
        <div className="bg-white/90 backdrop-blur-md rounded-full shadow-lg px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/peerverse-logo.png"
              alt="Peerverse"
              width={24}
              height={24}
              className="rounded"
            />
            <span className="text-lg font-semibold text-gray-900 bradley-hand">Peerverse</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-blue-600 font-medium bradley-hand">
              Home
            </Link>
            <Link href="/features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium bradley-hand">
              Features
            </Link>
          </nav>
          
          {user ? (
            <Button asChild className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium bradley-hand">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button 
              onClick={login} 
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium bradley-hand"
            >
              {loading ? 'Connecting...' : 'Get started'}
            </Button>
          )}

          {/* Mobile Menu Icon */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </div>
      </header>

      {/* Hero Text Section - Added above main content */}
      <div className="relative z-10 pt-32 pb-8 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 bradley-hand-bold">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Learn Together,
            </span>
            <br />
            <span className="text-gray-800">
              Grow Forever
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 bradley-hand max-w-2xl mx-auto">
            Connect with peers, share knowledge, and unlock your potential in our vibrant learning community
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="secondary" className="px-4 py-2 bradley-hand text-sm">
              <Heart className="w-4 h-4 mr-2 text-red-500" />
              Supportive Community
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 bradley-hand text-sm">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Interactive Learning
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 bradley-hand text-sm">
              <Users className="w-4 h-4 mr-2 text-blue-500" />
              Global Network
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[60vh]">
        <div className="relative w-[800px] h-[600px]">
          {/* Background Blur Effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full blur-3xl opacity-40 z-5"></div>
          
          {/* FLOATING ANIMATIONS - LIMITED TO IMAGE SECTION */}
          
          {/* Top Left of Section */}
          <div className="absolute top-8 left-16 animate-float z-25">
            <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
              <span className="font-medium text-lg bradley-hand">Hi</span>
            </div>
          </div>

          {/* Top Right of Section */}
          <div className="absolute top-16 right-32 animate-float-delayed z-25">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="font-medium text-sm bradley-hand">Achievement!</span>
            </div>
          </div>

          {/* Left Side of Section */}
          <div className="absolute top-1/3 -left-12 animate-float z-25">
            <Card className="w-64 shadow-xl bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/male-avatar.png" />
                    <AvatarFallback>PN</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900 bradley-hand">PEER NAME</h3>
                    <p className="text-sm text-green-600 bradley-hand">Online</p>
                    <p className="text-xs text-gray-500 bradley-hand">Available Now</p>
                  </div>
                </div>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white bradley-hand">
                  Connect
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side of Section */}
          <div className="absolute top-4 right-16 animate-float z-25">
            <Card className="w-56 shadow-lg bg-white/80 backdrop-blur-md">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/diverse-female-avatar.png" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-200 rounded mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Left of Section */}
          <div className="absolute bottom-24 left-12 animate-float-delayed z-25">
            <Card className="w-48 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  <span className="font-bold text-xl text-gray-900 bradley-hand">500 XP</span>
                </div>
                <p className="text-sm text-gray-600 bradley-hand">Earned Today</p>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Right of Section */}
          <div className="absolute bottom-8 right-20 animate-float z-25">
            <Card className="w-52 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <span className="font-medium text-gray-900 bradley-hand">Motoko Basics</span>
                </div>
                <p className="text-sm text-gray-600 mb-2 bradley-hand">Progress: 75%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mid Left of Section */}
          <div className="absolute top-48 -left-8 animate-float-delayed z-25">
            <Card className="w-44 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900 bradley-hand">New Message</span>
                </div>
                <p className="text-xs text-gray-600 bradley-hand">Sarah wants to study together!</p>
              </CardContent>
            </Card>
          </div>

          {/* Mid Right of Section */}
          <div className="absolute bottom-40 right-8 animate-float z-25">
            <Card className="w-40 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-lg text-gray-900 bradley-hand">25:00</span>
                </div>
                <p className="text-xs text-gray-600 bradley-hand">Focus Session</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Center Left of Section */}
          <div className="absolute top-32 left-20 animate-float z-25">
            <Card className="w-48 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-900 bradley-hand">Daily Goal</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
                <p className="text-xs text-gray-600 bradley-hand">3/5 lessons completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Center Right of Section */}
          <div className="absolute top-48 right-12 animate-float-delayed z-25">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Award className="w-5 h-5" />
              <span className="font-bold text-lg bradley-hand">7 Day Streak!</span>
            </div>
          </div>

          {/* Bottom Center Left of Section */}
          <div className="absolute bottom-52 left-24 animate-float z-25">
            <div className="bg-yellow-400 text-gray-800 px-3 py-2 rounded-full shadow-lg flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <span className="font-medium text-sm bradley-hand">Tip!</span>
            </div>
          </div>

          {/* Bottom Center Right of Section */}
          <div className="absolute bottom-64 right-32 animate-float-delayed z-25">
            <Card className="w-44 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900 bradley-hand">Global</span>
                </div>
                <p className="text-xs text-gray-600 bradley-hand">Connected to 50+ countries</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Floating Elements */}
          <div className="absolute top-96 left-32 animate-float z-25">
            <Card className="w-52 shadow-lg bg-white/95 backdrop-blur-sm">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900 bradley-hand">Study Group</span>
                </div>
                <p className="text-xs text-gray-600 bradley-hand">Join "React Masters" group</p>
                <Button size="sm" className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white bradley-hand text-xs">
                  Join Now
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="absolute top-20 left-48 animate-float-delayed z-25">
            <div className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-4 py-2 rounded-full shadow-lg max-w-48">
              <p className="text-sm bradley-hand text-center">"Every expert was once a beginner"</p>
            </div>
          </div>

          {/* Main Image - Centered */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
            <Image
              src="/image-removebg-preview.png"
              alt="Girl using phone"
              width={400}
              height={600}
              className="relative"
              priority
            />
          </div>
        </div>
      </main>

      {/* Bottom Text Section - Added below main content */}
      <div className="relative z-10 text-center py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 bradley-hand-bold">
            Why Choose PeerVerse?
          </h2>
          <p className="text-lg text-gray-600 mb-8 bradley-hand max-w-2xl mx-auto">
            Experience learning like never before with our innovative peer-to-peer platform that makes education fun, interactive, and rewarding.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-3 bradley-hand text-lg bg-blue-600 hover:bg-blue-700">
              Start Learning Now
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 bradley-hand text-lg">
              Explore Features
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8">
        <p className="text-gray-500 text-sm bradley-hand">
          © 2024 Peerverse. Built on the Internet Computer Protocol.
        </p>
      </footer>
    </div>
  )
}
