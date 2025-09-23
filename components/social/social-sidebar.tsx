"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, MessageSquare, Search, X, Check, Plus, Users2, Hash, Lock, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  getMyPartners, 
  sendPartnerRequest, 
  getStudyGroups, 
  createStudyGroup, 
  joinStudyGroup, 
  leaveStudyGroup 
} from "@/lib/social-client"
import { useApiClients } from "@/lib/use-api-clients"
import { toast } from "sonner"

type TabType = 'partners' | 'groups' | 'discover'

export interface PartnerProfile {
  principal: string
  name: string
  role: string
  bio?: string
  avatarUrl?: string
  initials: string
  avatarColor: string
  xp: number
  onlineStatus: 'online' | 'offline' | 'away'
  lastSeen?: number
  skills?: string[]
  interests?: string[]
}

// Import the StudyGroup type from social-client to ensure type consistency
type StudyGroup = import('@/lib/social-client').StudyGroup

export function SocialSidebar() {
  const [activeTab, setActiveTab] = useState<TabType>('partners')
  const [searchQuery, setSearchQuery] = useState('')
  const [partners, setPartners] = useState<PartnerProfile[]>([])
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [discoverGroups, setDiscoverGroups] = useState<StudyGroup[]>([])
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  // These states are now handled by showAddPartner and showCreateGroup
  const [newPartnerPrincipal, setNewPartnerPrincipal] = useState('')
  const [newPartnerMessage, setNewPartnerMessage] = useState('')
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: '',
    maxMembers: 10,
    isPublic: true,
    tags: [] as string[]
  })
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<{id: string, from: string, message?: string}[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Get the social client from the API clients hook
  const { socialClient, isAuthenticated } = useApiClients()

  // Load social data
  useEffect(() => {
    const loadData = async () => {
      if (!socialClient || !isAuthenticated) return;
      
      try {
        setIsLoading(true)
        const [partnersData, groupsData] = await Promise.all([
          socialClient.getMyPartners(),
          socialClient.getStudyGroups()
        ])
        setPartners(partnersData)
        setStudyGroups(groupsData)
      } catch (error) {
        console.error('Error loading social data:', error)
        toast.error('Failed to load social data')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [socialClient, isAuthenticated])

  // Handle adding a new partner
  const handleAddPartner = async () => {
    if (!newPartnerPrincipal.trim()) return
    
    try {
      await sendPartnerRequest(newPartnerPrincipal, 'Let\'s connect and learn together!')
      toast.success("Partner request sent!")
      setNewPartnerPrincipal('')
      setShowAddPartner(false)
    } catch (error) {
      console.error("Error sending partner request:", error)
      toast.error("Failed to send partner request")
    }
  }

  // Handle creating a new study group
  const handleCreateGroup = async () => {
    if (!newGroupData.name.trim()) return
    
    try {
      if (!socialClient) {
        throw new Error('Not authenticated. Please log in to create a study group.')
      }
      
      await socialClient.createStudyGroup(
        newGroupData.name,
        newGroupData.description,
        newGroupData.isPublic,
        newGroupData.tags,
        newGroupData.maxMembers
      )
      toast.success("Study group created!")
      setNewGroupData({
        name: '',
        description: '',
        maxMembers: 10,
        isPublic: true,
        tags: []
      })
      setShowCreateGroup(false)
      
      // Refresh groups
      const groupsData = await socialClient.getStudyGroups()
      setStudyGroups(groupsData)
    } catch (error) {
      console.error("Error creating study group:", error)
      toast.error("Failed to create study group")
    }
  }

  // Handle joining a study group
  const handleJoinGroup = async (groupId: string) => {
    if (!socialClient) {
      toast.error('Not authenticated. Please log in to join a group.')
      return
    }
    
    try {
      await socialClient.joinStudyGroup(groupId)
      setStudyGroups(groups => 
        groups.map(group => 
          group.id === groupId 
            ? { ...group, isMember: true, memberCount: group.memberCount + 1 }
            : group
        )
      )
      toast.success('Successfully joined the group')
    } catch (error) {
      console.error('Error joining group:', error)
      toast.error('Failed to join group')
    }
  }

  // Handle leaving a study group
  const handleLeaveGroup = async (groupId: string) => {
    if (!socialClient) {
      toast.error('Not authenticated. Please log in to leave a group.')
      return
    }
    
    try {
      await socialClient.leaveStudyGroup(groupId)
      setStudyGroups(groups => 
        groups.map(group => 
          group.id === groupId 
            ? { ...group, isMember: false, memberCount: Math.max(0, group.memberCount - 1) }
            : group
        )
      )
      toast.success('Successfully left the group')
    } catch (error) {
      console.error('Error leaving group:', error)
      toast.error('Failed to leave group')
    }
  }

  // Filter partners and groups based on search query
  const filteredPartners = partners.filter(partner => 
    partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredGroups = studyGroups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredDiscoverGroups = (discoverGroups || []).filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (group.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="w-80 border-l h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Learning Community</h2>
          <div className="flex space-x-2">
            <Dialog open={showAddPartner} onOpenChange={setShowAddPartner}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Learning Partner</DialogTitle>
                  <DialogDescription>
                    Send a connection request to another user by entering their principal ID.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="principal">Principal ID</Label>
                    <Input
                      id="principal"
                      placeholder="Enter principal ID"
                      value={newPartnerPrincipal}
                      onChange={(e) => setNewPartnerPrincipal(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddPartner(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPartner}>
                    Send Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
              <DialogTrigger asChild>
                <Button variant="default" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Study Group</DialogTitle>
                  <DialogDescription>
                    Create a new study group to collaborate with other learners.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input
                      id="group-name"
                      placeholder="Enter group name"
                      value={newGroupData.name}
                      onChange={(e) => setNewGroupData({...newGroupData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your group"
                      value={newGroupData.description}
                      onChange={(e) => setNewGroupData({...newGroupData, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max-members">Max Members</Label>
                      <Input
                        id="max-members"
                        type="number"
                        min="2"
                        max="100"
                        value={newGroupData.maxMembers}
                        onChange={(e) => setNewGroupData({...newGroupData, maxMembers: parseInt(e.target.value)})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="privacy">Privacy</Label>
                      <select
                        id="privacy"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={newGroupData.isPublic ? 'public' : 'private'}
                        onChange={(e) => setNewGroupData({...newGroupData, isPublic: e.target.value === 'public'})}
                      >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="new-tag"
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newTag.trim()) {
                            e.preventDefault();
                            setNewGroupData({
                              ...newGroupData,
                              tags: [...newGroupData.tags, newTag.trim()]
                            });
                            setNewTag('');
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (newTag.trim()) {
                            setNewGroupData({
                              ...newGroupData,
                              tags: [...newGroupData.tags, newTag.trim()]
                            });
                            setNewTag('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newGroupData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setNewGroupData({
                                ...newGroupData,
                                tags: newGroupData.tags.filter((_, i) => i !== index)
                              });
                            }}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateGroup(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGroup}>
                    Create Group
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-background pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs 
        defaultValue="partners" 
        className="flex-1 flex flex-col"
        onValueChange={(value) => setActiveTab(value as TabType)}
      >
        <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
          <TabsTrigger value="partners" className="py-4">
            <Users className="h-4 w-4 mr-2" />
            Partners
          </TabsTrigger>
          <TabsTrigger value="groups" className="py-4">
            <Users2 className="h-4 w-4 mr-2" />
            My Groups
          </TabsTrigger>
          <TabsTrigger value="discover" className="py-4">
            <Hash className="h-4 w-4 mr-2" />
            Discover
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1">
          <TabsContent value="partners" className="m-0">
            <div className="p-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-muted" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPartners.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No partners found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery ? 'Try a different search' : 'Connect with other learners to see them here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPartners.map((partner) => (
                    <div key={partner.principal} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={partner.avatarUrl} alt={partner.name} />
                            <AvatarFallback className={partner.avatarColor}>
                              {partner.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background ${
                            partner.onlineStatus === 'online' ? 'bg-green-500' : 
                            partner.onlineStatus === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{partner.name}</p>
                          <p className="text-xs text-muted-foreground">{partner.role}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="groups" className="m-0">
            <div className="p-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2 mb-3" />
                      <div className="h-4 bg-muted rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users2 className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No groups yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery ? 'No matching groups found' : 'Create or join a group to get started'}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setShowCreateGroup(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredGroups.map((group) => (
                    <div key={group.id} className="border rounded-lg p-3 hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{group.name}</h3>
                            {!group.isPublic && <Lock className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {group.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {group.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{group.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {group.memberCount}/{group.maxMembers} members
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex -space-x-2">
                          {Array(Math.min(3, group.memberCount)).fill(0).map((_, i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-xs">
                                {i + 1}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {group.memberCount > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              +{group.memberCount - 3}
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleLeaveGroup(group.id)}
                        >
                          Leave
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="discover" className="m-0">
            <div className="p-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2 mb-3" />
                      <div className="h-8 bg-muted rounded w-24" />
                    </div>
                  ))}
                </div>
              ) : filteredDiscoverGroups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Hash className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No groups to discover</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery ? 'No matching groups found' : 'Check back later for new groups'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDiscoverGroups.map((group) => (
                    <div key={group.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{group.name}</h3>
                            {!group.isPublic && <Lock className="h-3 w-3 text-muted-foreground" />}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {group.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {group.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{group.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">
                            {group.memberCount}/{group.maxMembers} members
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <div className="flex -space-x-2">
                          {Array(Math.min(3, group.memberCount)).fill(0).map((_, i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-xs">
                                {i + 1}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {group.memberCount > 3 && (
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                              +{group.memberCount - 3}
                            </div>
                          )}
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleJoinGroup(group.id)}
                          disabled={group.memberCount >= group.maxMembers}
                        >
                          {group.memberCount >= group.maxMembers ? 'Full' : 'Join Group'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
