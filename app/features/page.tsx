"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Zap, ArrowRight, Play, Target } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const features = [
  {
    id: "01",
    title: "Create Your Profile & Connect",
    description:
      "Sign up and build your unique PeerVerse profile, showcasing your interests and what you're looking to learn. Connect with like-minded peers and start your learning journey together.",
    icon: Users,
    color: "from-blue-500 to-cyan-500",
    mockupContent: "Profile Setup",
  },
  {
    id: "02",
    title: "Discover & Learn Together",
    description:
      "Explore courses, join interactive sessions, and attend live workshops. PeerVerse's smart matching helps you discover new friends, collaborators, or even your perfect mentor.",
    icon: BookOpen,
    color: "from-purple-500 to-pink-500",
    mockupContent: "Course Discovery",
  },
  {
    id: "03",
    title: "Earn XP & Level Up",
    description:
      "Once your account is active, you'll receive a unique referral code. Share this code with your network and watch them join the PeerVerse community. Every successful referral earns you rewards!",
    icon: Zap,
    color: "from-yellow-500 to-orange-500",
    mockupContent: "XP Dashboard",
  },
  {
    id: "04",
    title: "Learn & Grow",
    description:
      "For every new user who signs up using your referral code and activates their account, you earn a percentage (5%-10%) from their activation fee. The more you refer, the more you earn!",
    icon: Target,
    color: "from-green-500 to-emerald-500",
    mockupContent: "Learning Progress",
  },
]

export default function FeaturesPage() {
  const { login, loading, user } = useAuth()
  const [watermarkData, setWatermarkData] = useState<Array<{ top: string; left: string }>>([])

  // Generate diagonal watermark positions
  useEffect(() => {
    const generateDiagonalWatermarkStyles = () => {
      const watermarks = []
      const spacing = 200
      const rows = Math.ceil(window.innerHeight / spacing) + 3
      const cols = Math.ceil(window.innerWidth / spacing) + 3

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
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

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Diagonal Watermark Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {watermarkData.map((style, index) => (
          <div
            key={index}
            className="absolute text-4xl font-bold text-gray-400 opacity-25 transform -rotate-12 select-none bradley-hand"
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
          <Link href="/" className="flex items-center gap-2">
            <Image src="/peerverse-logo.png" alt="Peerverse" width={24} height={24} className="rounded" />
            <span className="text-lg font-semibold text-gray-900 bradley-hand">Peerverse</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors font-medium bradley-hand">
              Home
            </Link>
            <Link href="/features" className="text-blue-600 font-medium bradley-hand">
              Features
            </Link>
          </nav>

          {user ? (
            <Button
              asChild
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium bradley-hand"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button
              onClick={login}
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 rounded-full font-medium bradley-hand"
            >
              {loading ? "Connecting..." : "Get started"}
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bradley-hand-bold">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your PeerVerse Journey
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 bradley-hand max-w-3xl mx-auto">
            Discover how PeerVerse helps you connect, grow your network, and unlock learning opportunities.
          </p>

          {/* Watch Journey Button */}
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-4 rounded-full text-lg bradley-hand-bold border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300 bg-transparent"
            onClick={() => window.open("https://youtu.be/r5s7nD_XO0M?si=w1Xa1AOI-4e4I-nr", "_blank")}
          >
            <Play className="mr-2 h-5 w-5" /> Watch your journey through PeerVerse
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isEven = index % 2 === 0

            return (
              <div key={feature.id} className="mb-32">
                <div
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${isEven ? "" : "lg:grid-flow-col-dense"}`}
                >
                  {/* Text Content */}
                  <div className={`${isEven ? "" : "lg:col-start-2"}`}>
                    <div className="mb-6">
                      <span className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent bradley-hand-bold">
                        {feature.id}
                      </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 bradley-hand-bold">
                      {feature.title}
                    </h2>

                    <p className="text-lg text-gray-700 mb-8 bradley-hand leading-relaxed">{feature.description}</p>
                  </div>

                  {/* Mockup Card */}
                  <div className={`${isEven ? "" : "lg:col-start-1"}`}>
                    <Card className="w-full h-80 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
                      <CardContent className="p-8 h-full flex flex-col items-center justify-center">
                        <div
                          className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}
                        >
                          <Icon className="h-10 w-10 text-white" />
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-4 bradley-hand-bold text-center">
                          {feature.mockupContent}
                        </h3>

                        {/* Mockup Elements */}
                        <div className="w-full space-y-3">
                          <div className="h-3 bg-gray-200 rounded-full"></div>
                          <div className="h-3 bg-gray-200 rounded-full w-4/5"></div>
                          <div className="h-3 bg-gray-200 rounded-full w-3/5"></div>
                        </div>

                        <div className="mt-6 flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* CTA Button between sections */}
                {index < features.length - 1 && (
                  <div className="text-center mt-16">
                    {user ? (
                      <Button
                        asChild
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg bradley-hand-bold"
                      >
                        <Link href="/dashboard">
                          Continue Learning <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        onClick={login}
                        disabled={loading}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg bradley-hand-bold"
                      >
                        {loading ? "Connecting..." : "Join PeerVerse Now"} <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-300 to-pink-400 rounded-full blur-3xl opacity-30 -z-10"></div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bradley-hand-bold">
              Ready to start your
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {" "}
                learning journey?
              </span>
            </h2>

            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto bradley-hand">
              Join thousands of learners and educators who are already transforming their skills with PeerVerse.
            </p>

            {user ? (
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg bradley-hand-bold"
              >
                <Link href="/dashboard">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button
                onClick={login}
                disabled={loading}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg bradley-hand-bold"
              >
                {loading ? "Connecting..." : "Join PeerVerse Today"} <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <p className="text-gray-500 text-sm bradley-hand">© 2024 Peerverse. Built on the Internet Computer Protocol.</p>
      </footer>
    </div>
  )
}
