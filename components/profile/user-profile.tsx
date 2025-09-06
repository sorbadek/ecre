"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { User, Mail, Phone, MapPin, Briefcase, GraduationCap, Globe, Link as LinkIcon, X, Plus, Camera } from "lucide-react"
import { getMyProfile, updateProfile, uploadAvatar, uploadCover } from "@/lib/profile-client"

interface UserProfileProps {
  isEditable?: boolean
  userId?: string
}

export function UserProfile({ isEditable = true, userId }: UserProfileProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  
  // Profile state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    company: '',
    jobTitle: '',
    education: '',
    phone: '',
    skills: [] as string[],
    interests: [] as string[],
    avatarUrl: '',
    coverImageUrl: '',
  })
  
  // Form state
  const [formData, setFormData] = useState(profile)
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')
  
  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const profileData = await getMyProfile()
        
        setProfile(prev => ({
          ...prev,
          ...profileData,
          phone: profileData.phone || '',
          skills: profileData.skills || [],
          interests: profileData.interests || []
        }))
        setFormData(prev => ({
          ...prev,
          ...profileData,
          phone: profileData.phone || '',
          skills: profileData.skills || [],
          interests: profileData.interests || []
        }))
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast.error("Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProfile()
  }, [userId])
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Add a new skill
  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }
  
  // Remove a skill
  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }
  
  // Add a new interest
  const addInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
      setNewInterest('')
    }
  }
  
  // Remove an interest
  const removeInterest = (interestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }))
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsLoading(true)
      const updatedProfile = await updateProfile(formData)
      setProfile(prev => ({
        ...prev,
        ...updatedProfile,
        phone: updatedProfile.phone || '',
        skills: updatedProfile.skills || [],
        interests: updatedProfile.interests || []
      }))
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      setIsLoading(true)
      const imageUrl = await uploadAvatar(file)
      setFormData(prev => ({
        ...prev,
        avatarUrl: imageUrl
      }))
      toast.success("Avatar updated successfully")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error("Failed to upload avatar")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle cover image upload
  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      setIsLoading(true)
      const imageUrl = await uploadCover(file)
      setFormData(prev => ({
        ...prev,
        coverImageUrl: imageUrl
      }))
      toast.success("Cover image updated successfully")
    } catch (error) {
      console.error("Error uploading cover image:", error)
      toast.error("Failed to upload cover image")
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading && !isEditing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Cover Image */}
      <div className="relative h-48 bg-muted rounded-lg overflow-hidden">
        {formData.coverImageUrl ? (
          <img 
            src={formData.coverImageUrl} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-50 to-cyan-50 flex items-center justify-center">
            <Globe className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        
        {isEditable && isEditing && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <label className="inline-flex items-center justify-center px-4 py-2 bg-white text-sm font-medium rounded-md text-foreground hover:bg-gray-50 cursor-pointer">
              <input 
                type="file" 
                className="sr-only" 
                accept="image/*"
                onChange={handleCoverImageUpload}
              />
              Change Cover
            </label>
          </div>
        )}
      </div>
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 px-6 relative z-10">
        <div className="flex items-end space-x-6">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={formData.avatarUrl} alt={profile.name} />
              <AvatarFallback className="text-3xl">
                {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {isEditable && isEditing && (
              <label className="absolute bottom-0 right-0 bg-foreground text-background p-2 rounded-full cursor-pointer hover:bg-foreground/90 transition-colors">
                <input 
                  type="file" 
                  className="sr-only" 
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
                <Camera className="h-4 w-4" />
              </label>
            )}
          </div>
          
          <div className="pb-2">
            {isEditing ? (
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="text-2xl font-bold border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b-2 border-transparent focus:border-primary mb-1 w-full md:w-auto"
              />
            ) : (
              <h1 className="text-2xl font-bold">{profile.name}</h1>
            )}
            
            {isEditing ? (
              <Input
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                placeholder="Job title"
                className="text-muted-foreground border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b border-transparent focus:border-primary w-full md:w-auto"
              />
            ) : (
              <p className="text-muted-foreground">{profile.jobTitle}</p>
            )}
            
            {isEditing ? (
              <Input
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Company"
                className="text-muted-foreground border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b border-transparent focus:border-primary w-full md:w-auto mt-1"
              />
            ) : (
              <p className="text-muted-foreground text-sm">{profile.company}</p>
            )}
          </div>
        </div>
        
        {isEditable && (
          <div className="mt-4 md:mt-0">
            {isEditing ? (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFormData(profile)
                    setIsEditing(false)
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <Tabs defaultValue="about" className="mt-8">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger value="about" className="relative">
            About
          </TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="interests">Interests</TabsTrigger>
        </TabsList>
        
        <div className="py-6">
          <TabsContent value="about" className="m-0">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      className="min-h-[120px]"
                    />
                  ) : (
                    <p className="text-muted-foreground whitespace-pre-line">
                      {profile.bio || 'No bio provided.'}
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      {isEditing ? (
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b border-transparent focus:border-primary"
                        />
                      ) : (
                        <p>{profile.email}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      {isEditing ? (
                        <Input
                          name="phone"
                          type="tel"
                          value={formData.phone || ''}
                          onChange={handleInputChange}
                          placeholder="Add phone number"
                          className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b border-transparent focus:border-primary"
                        />
                      ) : (
                        <p>{profile.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Location</p>
                      {isEditing ? (
                        <Input
                          name="location"
                          value={formData.location || ''}
                          onChange={handleInputChange}
                          placeholder="Add location"
                          className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b border-transparent focus:border-primary"
                        />
                      ) : (
                        <p>{profile.location || 'Not specified'}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <LinkIcon className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Website</p>
                      {isEditing ? (
                        <Input
                          name="website"
                          value={formData.website || ''}
                          onChange={handleInputChange}
                          placeholder="Add website URL"
                          className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b border-transparent focus:border-primary"
                        />
                      ) : profile.website ? (
                        <a 
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {profile.website}
                        </a>
                      ) : (
                        <p>Not provided</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Input
                      name="education"
                      value={formData.education || ''}
                      onChange={handleInputChange}
                      placeholder="Add your education"
                      className="border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none border-b border-transparent focus:border-primary"
                    />
                  ) : (
                    <div className="flex items-start">
                      <GraduationCap className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-muted-foreground">
                        {profile.education || 'No education information provided.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="skills" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  Add the skills you have expertise in. This helps others find you for relevant opportunities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        placeholder="Add a skill"
                        className="flex-1"
                      />
                      <Button onClick={addSkill} type="button">
                        Add
                      </Button>
                    </div>
                    
                    {formData.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill) => (
                          <Badge key={skill} className="px-3 py-1 text-sm">
                            {skill}
                            <button 
                              type="button" 
                              onClick={() => removeSkill(skill)}
                              className="ml-2 hover:text-destructive"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ) : profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No skills added yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="interests" className="m-0">
            <Card>
              <CardHeader>
                <CardTitle>Interests</CardTitle>
                <CardDescription>
                  Add topics you're interested in to get personalized recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                        placeholder="Add an interest"
                        className="flex-1"
                      />
                      <Button onClick={addInterest} type="button">
                        Add
                      </Button>
                    </div>
                    
                    {formData.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((interest) => (
                          <Badge key={interest} variant="outline" className="px-3 py-1 text-sm">
                            {interest}
                            <button 
                              type="button" 
                              onClick={() => removeInterest(interest)}
                              className="ml-2 hover:text-destructive"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ) : profile.interests && profile.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <Badge key={interest} variant="outline" className="px-3 py-1 text-sm">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No interests added yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
