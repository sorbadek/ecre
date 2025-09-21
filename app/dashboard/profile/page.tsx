"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Edit3, Plus, Camera, Globe, MapPin, Mail, Briefcase, GraduationCap, Link as LinkIcon } from "lucide-react";
import { getMyProfile, updateMyProfile, uploadAvatar, uploadCover } from "@/lib/profile-client";
import { UserProfile, ProfileFormData, convertBackendProfile, convertToBackendProfile } from "@/types/profile";
import type { UserFile as BackendUserFile, UserProfile as BackendUserProfile } from "@/lib/ic/user-profile.idl";

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    id: '',
    name: "",
    email: "",
    bio: "",
    location: "",
    jobTitle: "",
    company: "",
    education: "",
    avatarUrl: "",
    coverUrl: "",
    skills: [],
    interests: [],
    xpBalance: 0,
    reputation: 0,
    settings: { 
      theme: 'light',
      notifications: true, 
      emailNotifications: true,
      privacy: 'public',
      language: 'en',
      profileVisibility: 'public',
      socialLinks: []
    },
    files: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    socialLinks: []
  });
  
  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    bio: "",
    location: "",
    jobTitle: "",
    company: "",
    education: "",
    skills: [],
    interests: [],
  });
  
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data from profile
  const initFormData = (profileData: Partial<UserProfile>) => {
    const formData: ProfileFormData = {
      name: profileData.name || "",
      bio: profileData.bio || "",
      location: profileData.location || "",
      jobTitle: profileData.jobTitle || "",
      company: profileData.company || "",
      education: profileData.education || "",
      skills: profileData.skills || [],
      interests: profileData.interests || [],
    };
    setFormData(formData);
  };

  const loadProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Cast the backend profile to any to handle type mismatches
      const backendProfile = await getMyProfile() as any;
      
      if (!backendProfile) {
        // Initialize with default values if no profile exists
        const defaultProfile: UserProfile = {
          id: user.id || '',
          name: user.name || "",
          email: user.email || "",
          bio: "",
          avatarUrl: "",
          coverUrl: "",
          xpBalance: 0,
          reputation: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          files: [],
          socialLinks: [],
          settings: { 
            theme: 'light',
            notifications: true, 
            emailNotifications: true,
            privacy: 'public',
            language: 'en',
            profileVisibility: 'public',
            socialLinks: []
          },
          // Frontend-only fields
          location: "",
          jobTitle: "",
          company: "",
          education: "",
          phone: "",
          skills: [],
          interests: []
        };
        setProfile(defaultProfile);
        initFormData(defaultProfile);
      } else {
        // Convert backend profile to frontend format
        const frontendProfile = convertBackendProfile(backendProfile);
        setProfile(frontendProfile);
        initFormData(frontendProfile);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Handle form input changes
  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio should be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    setFormData(prev => ({
      ...prev,
      [name as keyof ProfileFormData]: value
    } as ProfileFormData));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      // Create update data with current profile values
      const updateData: Partial<UserProfile> = {
        ...profile,
        ...formData,
        updatedAt: Date.now(),
      };
      
      // Convert to backend format and update
      const backendUpdateData = convertToBackendProfile(updateData);
      // Cast the result to any to handle type mismatches
      const updatedBackendProfile = await updateMyProfile(backendUpdateData as any);
      
      if (updatedBackendProfile) {
        // Convert the updated profile back to frontend format
        const updatedProfile = convertBackendProfile(updatedBackendProfile as any);
        
        // Update the profile state with the new data
        setProfile(prev => ({
          ...prev,
          ...updatedProfile,
          // Preserve any frontend-only fields from the form
          location: formData.location,
          jobTitle: formData.jobTitle,
          company: formData.company,
          education: formData.education,
          skills: formData.skills,
          interests: formData.interests
        }));
        
        setEditing(false);
        
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPEG, PNG, GIF)",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 5MB",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      const imageUrl = await uploadAvatar(file);
      const updatedProfile = await updateMyProfile({ 
        ...profile,
        avatarUrl: imageUrl 
      });
      
      setProfile(updatedProfile);
      
      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };
  
  // Handle cover photo upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPEG, PNG, GIF)",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      const imageUrl = await uploadCover(file);
      const updatedProfile = await updateMyProfile({ 
        ...profile,
        coverUrl: imageUrl 
      });
      
      setProfile(updatedProfile);
      
      toast({
        title: "Success",
        description: "Cover photo updated successfully",
      });
    } catch (error) {
      console.error("Error uploading cover photo:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload cover photo';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input
      e.target.value = '';
    }
  };
  
  // Handle adding/removing skills and interests
  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      } as ProfileFormData));
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = [...formData.skills];
    newSkills.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    } as ProfileFormData));
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      } as ProfileFormData));
      setNewInterest("");
    }
  };

  const removeInterest = (index: number) => {
    const newInterests = [...formData.interests];
    newInterests.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      interests: newInterests
    } as ProfileFormData));
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        bio: profile.bio || "",
        location: profile.location || "",
        jobTitle: profile.jobTitle || "",
        company: profile.company || "",
        education: profile.education || "",
        skills: profile.skills || [],
        interests: profile.interests || []
      });
    }
    setEditing(false);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
        <p className="text-muted-foreground">We couldn't load your profile. Please try again later.</p>
      </div>
    );
  }

  const renderSkills = () => {
    return formData.skills?.map((skill: string, index: number) => (
      <div key={index} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-800 mr-2 mb-2">
        {skill}
        <button
          type="button"
          onClick={() => removeSkill(index)}
          className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          &times;
        </button>
      </div>
    ));
  };

  const renderInterests = () => {
    return formData.interests?.map((interest: string, index: number) => (
      <div key={index} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-800 mr-2 mb-2">
        {interest}
        <button
          type="button"
          onClick={() => removeInterest(index)}
          className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          &times;
        </button>
      </div>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cover Photo */}
      <div className="relative h-48 bg-muted rounded-lg overflow-hidden mb-6">
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-100 to-cyan-100 flex items-center justify-center">
            <Globe className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        {editing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <label className="bg-white/90 text-foreground px-4 py-2 rounded-full text-sm font-medium cursor-pointer hover:bg-white transition-colors">
              <Camera className="h-4 w-4 inline mr-1" />
              Change Cover
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={uploading}
              />
            </label>
          </div>
        )}
      </div>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 px-6 relative z-10">
        <div className="flex items-end space-x-6">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              <AvatarFallback className="text-3xl">
                {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
              {editing && (
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-6 w-6 text-white" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                </label>
              )}
            </Avatar>
          </div>
          
          {!editing ? (
            <div className="pb-4">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-muted-foreground">{profile.jobTitle || 'No title'}</p>
              <div className="flex items-center space-x-2 mt-2">
                {profile.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="pb-4 w-full max-w-2xl">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-muted-foreground mb-1">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-muted-foreground mb-1">
                      Job Title
                    </label>
                    <Input
                      id="jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="E.g. Software Engineer"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-muted-foreground mb-1">
                      Company
                    </label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Where you work"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-muted-foreground mb-1">
                    Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 md:mt-0">
          {editing ? (
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setEditing(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8">
        <Tabs defaultValue="about" className="w-full">
          <TabsList>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="interests">Interests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="mt-6">
            {editing ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-muted-foreground mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formData.bio ? formData.bio.length : 0}/500 characters
                  </p>
                  {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio}</p>}
                </div>
                
                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-muted-foreground mb-1">
                    Education
                  </label>
                  <Input
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="Your educational background"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Bio</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {profile.bio || 'No bio provided'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.company && (
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                  
                  {profile.education && (
                    <div className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-muted-foreground flex-shrink-0" />
                      <span>{profile.education}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="skills" className="mt-6">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-muted-foreground mb-1">
                    Add Skills
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="newSkill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      placeholder="Type a skill and press Enter"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddSkill}
                      disabled={!newSkill.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 min-h-[40px] border rounded-md p-2">
                  {formData.skills.length > 0 ? (
                    renderSkills()
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills added yet</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <div key={index} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-800">
                      {skill}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No skills added yet</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="interests" className="mt-6">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-muted-foreground mb-1">
                    Add Interests
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      id="newInterest"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                      placeholder="Type an interest and press Enter"
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      onClick={handleAddInterest}
                      disabled={!newInterest.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 min-h-[40px] border rounded-md p-2">
                  {formData.interests.length > 0 ? (
                    renderInterests()
                  ) : (
                    <p className="text-sm text-muted-foreground">No interests added yet</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.interests && profile.interests.length > 0 ? (
                  profile.interests.map((interest, index) => (
                    <div key={index} className="inline-flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-800">
                      {interest}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No interests added yet</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
