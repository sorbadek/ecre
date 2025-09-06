"use client"

import { useState, useEffect } from "react"
import { BookOpen, Clock, Star, TrendingUp, Bookmark as BookMarked, CheckCircle, X } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { getRecommendations, markAsViewed, markAsClicked, markAsCompleted, saveRecommendation } from "@/lib/recommendations-client"
import { useApiClients } from "@/lib/use-api-clients"
import { toast } from "sonner"

type ContentType = 'course' | 'article' | 'video' | 'book' | 'tutorial' | 'workshop'

export interface Recommendation {
  id: string
  contentId: string
  contentType: ContentType
  title: string
  description: string
  thumbnailUrl?: string
  duration?: number
  level?: 'beginner' | 'intermediate' | 'advanced'
  rating?: number
  provider?: string
  tags?: string[]
  viewed: boolean
  clicked: boolean
  completed: boolean
  createdAt: bigint
  similarityScore?: number
  reason?: string
}

export function RecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'forYou' | 'trending' | 'saved'>('forYou')
  const { isAuthenticated } = useApiClients()

  // Load recommendations
  useEffect(() => {
    if (!isAuthenticated) return
    
    const loadRecommendations = async () => {
      try {
        setLoading(true)
        const recs = await getRecommendations(10)
        setRecommendations(recs || [])
      } catch (error) {
        console.error("Error loading recommendations:", error)
        toast.error("Failed to load recommendations")
      } finally {
        setLoading(false)
      }
    }
    
    loadRecommendations()
  }, [isAuthenticated])

  // Mark recommendation as viewed
  const handleView = async (id: string) => {
    try {
      await markAsViewed(id)
      setRecommendations(prev => 
        prev.map(r => r.id === id ? { ...r, viewed: true } : r)
      )
    } catch (error) {
      console.error("Error marking as viewed:", error)
      toast.error("Failed to update recommendation status")
    }
  }

  // Handle recommendation click
  const handleRecommendationClick = async (id: string) => {
    try {
      // Mark as viewed first if not already
      const recommendation = recommendations.find(r => r.id === id)
      if (recommendation && !recommendation.viewed) {
        await markAsViewed(id)
      }
      
      // Mark as clicked
      await markAsClicked(id)
      
      // Update local state
      setRecommendations(prev => 
        prev.map(r => r.id === id ? { ...r, clicked: true } : r)
      )
      
      // Navigate to content (would be implemented based on your routing)
      // router.push(`/content/${recommendation.contentType}/${recommendation.contentId}`)
    } catch (error) {
      console.error("Error handling click:", error)
      toast.error("Failed to open recommendation")
    }
  }

  // Mark recommendation as completed
  const handleComplete = async (id: string) => {
    try {
      await markAsCompleted(id)
      setRecommendations(prev => 
        prev.map(r => r.id === id ? { ...r, completed: true } : r)
      )
      toast.success("Marked as completed!")
    } catch (error) {
      console.error("Error marking as completed:", error)
      toast.error("Failed to mark as completed")
    }
  }

  // Save recommendation
  const handleSave = async (id: string) => {
    try {
      await saveRecommendation(id)
      toast.success("Saved to your library!")
    } catch (error) {
      console.error("Error saving recommendation:", error)
      toast.error("Failed to save recommendation")
    }
  }

  // Get content type icon
  const getContentTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'course':
        return <BookOpen className="h-4 w-4" />
      case 'article':
        return <BookMarked className="h-4 w-4" />
      case 'video':
        return <Play className="h-4 w-4" />
      case 'book':
        return <Book className="h-4 w-4" />
      case 'tutorial':
        return <GraduationCap className="h-4 w-4" />
      case 'workshop':
        return <Users className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  // Format duration
  const formatDuration = (minutes: number | undefined) => {
    if (!minutes) return ''
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
  }

  // Get difficulty badge
  const getDifficultyBadge = (level?: string) => {
    if (!level) return null
    
    const variants = {
      beginner: { label: 'Beginner', color: 'bg-green-100 text-green-800' },
      intermediate: { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
      advanced: { label: 'Advanced', color: 'bg-red-100 text-red-800' },
    }
    
    const { label, color } = variants[level as keyof typeof variants] || { label: level, color: 'bg-gray-100 text-gray-800' }
    
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
        {label}
      </span>
    )
  }

  // Filter recommendations based on active tab
  const filteredRecommendations = () => {
    switch (activeTab) {
      case 'forYou':
        return recommendations.filter(r => !r.completed)
      case 'trending':
        return recommendations.filter(r => r.similarityScore && r.similarityScore > 0.7)
      case 'saved':
        return recommendations.filter(r => r.completed || r.viewed)
      default:
        return recommendations
    }
  }

  // Get empty state message
  const getEmptyState = () => {
    switch (activeTab) {
      case 'forYou':
        return {
          title: 'No recommendations yet',
          description: 'Complete your profile to get personalized recommendations',
          icon: <BookOpen className="h-8 w-8 text-muted-foreground" />
        }
      case 'trending':
        return {
          title: 'No trending content',
          description: 'Check back later for trending recommendations',
          icon: <TrendingUp className="h-8 w-8 text-muted-foreground" />
        }
      case 'saved':
        return {
          title: 'No saved items',
          description: 'Save recommendations to view them here',
          icon: <BookMarked className="h-8 w-8 text-muted-foreground" />
        }
      default:
        return {
          title: 'No recommendations',
          description: 'We couldn\'t find any recommendations',
          icon: <BookOpen className="h-8 w-8 text-muted-foreground" />
        }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Recommended for You</CardTitle>
          <div className="flex space-x-1">
            <Button
              variant={activeTab === 'forYou' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setActiveTab('forYou')}
            >
              For You
            </Button>
            <Button
              variant={activeTab === 'trending' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setActiveTab('trending')}
            >
              Trending
            </Button>
            <Button
              variant={activeTab === 'saved' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => setActiveTab('saved')}
            >
              Saved
            </Button>
          </div>
        </div>
        <CardDescription>
          {activeTab === 'forYou' && 'Personalized recommendations based on your learning history'}
          {activeTab === 'trending' && 'Trending content in your network'}
          {activeTab === 'saved' && 'Your saved recommendations'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-2 bg-muted rounded w-1/4 mt-2" />
              </div>
            ))}
          </div>
        ) : filteredRecommendations().length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-muted mb-4">
              {getEmptyState().icon}
            </div>
            <h3 className="text-lg font-medium">{getEmptyState().title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {getEmptyState().description}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations().map((rec) => (
              <div 
                key={rec.id} 
                className={`group relative p-3 rounded-lg border ${
                  rec.viewed ? 'bg-muted/30' : 'bg-background hover:bg-muted/50'
                } transition-colors`}
                onClick={() => handleRecommendationClick(rec.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {rec.thumbnailUrl ? (
                      <img 
                        src={rec.thumbnailUrl} 
                        alt={rec.title}
                        className="h-16 w-24 rounded object-cover"
                      />
                    ) : (
                      <div className="h-16 w-24 rounded bg-muted flex items-center justify-center">
                        {getContentTypeIcon(rec.contentType)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm leading-tight line-clamp-2">
                        {rec.title}
                      </h3>
                      {rec.completed && (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    
                    {rec.provider && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {rec.provider}
                      </p>
                    )}
                    
                    <div className="mt-1.5 flex items-center space-x-2 text-xs text-muted-foreground">
                      {rec.duration && (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(rec.duration)}
                        </span>
                      )}
                      
                      {rec.level && getDifficultyBadge(rec.level)}
                      
                      {rec.rating !== undefined && (
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                          {rec.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    
                    {rec.tags && rec.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {rec.tags.slice(0, 2).map((tag) => (
                          <Badge 
                            key={tag} 
                            variant="secondary" 
                            className="text-xs font-normal"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {rec.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{rec.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {rec.similarityScore && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Relevance</span>
                          <span>{Math.round(rec.similarityScore * 100)}%</span>
                        </div>
                        <Progress 
                          value={rec.similarityScore * 100} 
                          className="h-1.5" 
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {rec.reason && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {rec.reason}
                  </p>
                )}
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        saveRecommendation(rec.id)
                      }}
                    >
                      <BookMarked className="h-3.5 w-3.5 mr-1" />
                      Save
                    </Button>
                    
                    {!rec.completed && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={async (e) => {
                          e.stopPropagation()
                          await markAsCompleted(rec.id)
                        }}
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      // Implement hide functionality
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {!loading && filteredRecommendations().length > 0 && (
        <CardFooter className="border-t pt-4">
          <Button variant="ghost" size="sm" className="mx-auto">
            View all recommendations
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

// Add missing Lucide icons
const Play = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
)

const Book = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
  </svg>
)

const GraduationCap = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
    <path d="M6 12v5c3 3 9 1 9-1v-5"></path>
  </svg>
)

const Users = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
)
