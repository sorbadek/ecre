"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  BookOpen,
  Code,
  Eye,
  ExternalLink,
  ImageIcon,
  Play,
  Search,
  Shield,
  Star,
  UserRound,
  Video,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

type MaterialKind = "material" | "talent"
type MaterialType = "course" | "tutorial" | "resource" | "template" | "tool" | "talent"

type PreviewType = "video" | "image" | "link"

interface MarketplaceItemBase {
  id: string
  title: string
  description: string
  rating: number
  reviews: number
  imageUrl: string
  category: string
  type: MaterialType
  kind: MaterialKind
}

interface MaterialItem extends MarketplaceItemBase {
  kind: "material"
  price: number
  xpReward: number
  previewType: PreviewType
  previewUrl: string // for video/image/link preview
}

interface TalentItem extends MarketplaceItemBase {
  kind: "talent"
  hourlyRate: number
  profileUsername: string
  skillTags: string[]
}

type MarketplaceItem = MaterialItem | TalentItem

const seed: MarketplaceItem[] = [
  // Materials with preview support
  {
    id: "m1",
    kind: "material",
    type: "course",
    category: "Blockchain",
    title: "Introduction to Web3 Development",
    description: "Learn the fundamentals of decentralized app development on the Internet Computer.",
    price: 100,
    xpReward: 500,
    imageUrl: "/web3-development.png",
    rating: 4.8,
    reviews: 120,
    previewType: "video",
    previewUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/12-njIcKkKTXur9V3dpd18lxZAK9f7nJf.mp4",
  },
  {
    id: "m2",
    kind: "material",
    type: "tutorial",
    category: "Programming",
    title: "Rust Ownership & Borrowing Deep Dive",
    description: "Master Rust’s ownership model for safer, more performant code.",
    price: 75,
    xpReward: 300,
    imageUrl: "/rust-ownership-thumbnail.png",
    rating: 4.9,
    reviews: 90,
    previewType: "image",
    previewUrl: "/rust-ownership-thumbnail.png",
  },
  {
    id: "m3",
    kind: "material",
    type: "resource",
    category: "Frontend",
    title: "Advanced React Hooks Handbook",
    description: "A comprehensive guide to custom hooks and state management in React.",
    price: 50,
    xpReward: 200,
    imageUrl: "/react-hooks-handbook.png",
    rating: 4.7,
    reviews: 150,
    previewType: "image",
    previewUrl: "/react-hooks-handbook.png",
  },
  {
    id: "m4",
    kind: "material",
    type: "template",
    category: "Web Development",
    title: "Next.js Performance Optimization Checklist",
    description: "A practical checklist to optimize your Next.js applications for speed.",
    price: 30,
    xpReward: 100,
    imageUrl: "/nextjs-optimization.png",
    rating: 4.5,
    reviews: 70,
    previewType: "link",
    previewUrl: "https://vercel.com/docs/optimizations?ref=peerverse-marketplace",
  },
  {
    id: "m5",
    kind: "material",
    type: "template",
    category: "Blockchain",
    title: "Decentralized Chat App Template",
    description: "A starter template for building a real-time chat application on ICP.",
    price: 120,
    xpReward: 600,
    imageUrl: "/decentralized-chat-app.png",
    rating: 4.6,
    reviews: 80,
    previewType: "image",
    previewUrl: "/decentralized-chat-app.png",
  },
  {
    id: "m6",
    kind: "material",
    type: "course",
    category: "Design",
    title: "UI/UX Design Principles for DApps",
    description: "Design user-friendly interfaces for decentralized applications.",
    price: 60,
    xpReward: 250,
    imageUrl: "/dapp-ui-ux.png",
    rating: 4.7,
    reviews: 110,
    previewType: "image",
    previewUrl: "/dapp-ui-ux.png",
  },
  {
    id: "m7",
    kind: "material",
    type: "resource",
    category: "Blockchain",
    title: "Solidity Smart Contract Best Practices",
    description: "Guidelines and patterns for writing secure and efficient contracts.",
    price: 90,
    xpReward: 400,
    imageUrl: "/solidity-best-practices.png",
    rating: 4.8,
    reviews: 95,
    previewType: "link",
    previewUrl: "https://docs.soliditylang.org/en/latest/security-considerations.html",
  },
  {
    id: "m8",
    kind: "material",
    type: "course",
    category: "Data Science",
    title: "Intro to Machine Learning with Python",
    description: "Beginner-friendly course covering fundamental ML concepts and libraries.",
    price: 110,
    xpReward: 550,
    imageUrl: "/machine-learning-python.png",
    rating: 4.7,
    reviews: 130,
    previewType: "image",
    previewUrl: "/machine-learning-python.png",
  },
  // Talent (hireable individuals)
  {
    id: "t1",
    kind: "talent",
    type: "talent",
    category: "Talent",
    title: "Rust/ICP Engineer",
    description: "Specialist in canister development, candid interfaces, and performance tuning.",
    hourlyRate: 85,
    imageUrl: "/alice-johnson-avatar.png",
    rating: 4.9,
    reviews: 52,
    profileUsername: "alice_j",
    skillTags: ["Rust", "ICP", "Candid", "Azle", "Motoko"],
  },
  {
    id: "t2",
    kind: "talent",
    type: "talent",
    category: "Talent",
    title: "Next.js + Design System Lead",
    description: "Design systems, shadcn/ui, accessibility, and DX for modern web apps.",
    hourlyRate: 95,
    imageUrl: "/emily-white-avatar.png",
    rating: 4.8,
    reviews: 41,
    profileUsername: "emily_w",
    skillTags: ["Next.js", "shadcn", "Accessibility", "Design Systems"],
  },
  {
    id: "t3",
    kind: "talent",
    type: "talent",
    category: "Talent",
    title: "Solidity + Foundry Auditor",
    description: "Smart contract reviews, threat modeling, and security best practices.",
    hourlyRate: 120,
    imageUrl: "/michael-lee-avatar.png",
    rating: 4.9,
    reviews: 67,
    profileUsername: "michael_lee",
    skillTags: ["Solidity", "Foundry", "Security", "Audits"],
  },
]

function getTypeIcon(type: MaterialType) {
  switch (type) {
    case "course":
      return <BookOpen className="h-5 w-5 text-primary" />
    case "tutorial":
      return <Video className="h-5 w-5 text-primary" />
    case "resource":
      return <ImageIcon className="h-5 w-5 text-primary" />
    case "template":
      return <Code className="h-5 w-5 text-primary" />
    case "tool":
      return <Shield className="h-5 w-5 text-primary" />
    case "talent":
      return <Briefcase className="h-5 w-5 text-primary" />
    default:
      return <BookOpen className="h-5 w-5 text-primary" />
  }
}

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<MaterialType | "all">("all")
  const [savedItems, setSavedItems] = useState<MaterialItem[]>([])
  const [previewItem, setPreviewItem] = useState<MaterialItem | null>(null)
  const [hireTarget, setHireTarget] = useState<TalentItem | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const raw = localStorage.getItem("peerverse_vault_items")
    if (raw) {
      try {
        const parsed: MaterialItem[] = JSON.parse(raw)
        setSavedItems(parsed)
      } catch {
        // ignore
      }
    }
  }, [])

  const items = useMemo(() => seed, [])

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory = activeTab === "all" ? true : item.type === activeTab

      return matchesSearch && matchesCategory
    })
  }, [items, searchTerm, activeTab])

  const handleAccess = (item: MaterialItem) => {
    const exists = savedItems.some((i) => i.id === item.id)
    if (exists) {
      toast({
        title: "Already in Vault",
        description: `${item.title} is already saved.`,
      })
      return
    }
    const updated = [...savedItems, item]
    setSavedItems(updated)
    localStorage.setItem("peerverse_vault_items", JSON.stringify(updated))
    toast({
      title: "Added to Vault",
      description: `${item.title} has been added to your Vault.`,
    })
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search materials and talent..."
            className="w-full pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7 h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="course">Courses</TabsTrigger>
          <TabsTrigger value="tutorial">Tutorials</TabsTrigger>
          <TabsTrigger value="resource">Resources</TabsTrigger>
          <TabsTrigger value="template">Templates</TabsTrigger>
          <TabsTrigger value="tool">Tools</TabsTrigger>
          <TabsTrigger value="talent">Talent</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                if (item.kind === "talent") {
                  const t = item as TalentItem
                  return (
                    <Card key={t.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative w-full h-44 bg-muted">
                        <Image src={t.imageUrl || "/placeholder.svg"} alt={t.title} fill className="object-cover" />
                        <Badge className="absolute top-2 left-2">Talent</Badge>
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">{t.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{t.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center justify-between text-sm mb-3">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-yellow-500" />
                            <span>
                              {t.rating.toFixed(1)} ({t.reviews})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <UserRound className="h-4 w-4" />
                            <span>@{t.profileUsername}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {t.skillTags.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">${t.hourlyRate}/hr</span>
                          <div className="flex gap-2">
                            <Link href="/public-profile">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" /> Profile
                              </Button>
                            </Link>
                            <Button size="sm" onClick={() => setHireTarget(t)}>
                              <Briefcase className="h-4 w-4 mr-1" /> Hire
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                } else {
                  const m = item as MaterialItem
                  return (
                    <Card key={m.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative w-full h-44 bg-muted">
                        <Image src={m.imageUrl || "/placeholder.svg"} alt={m.title} fill className="object-cover" />
                        <Badge className="absolute top-2 left-2">{m.category}</Badge>
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">{m.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{m.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center justify-between text-sm mb-3">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-yellow-500" />
                            <span>
                              {m.rating.toFixed(1)} ({m.reviews})
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getTypeIcon(m.type)}
                            <span className="capitalize">{m.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary">${m.price}</span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPreviewItem(m)}>
                              {m.previewType === "video" ? (
                                <Play className="h-4 w-4 mr-1" />
                              ) : (
                                <Eye className="h-4 w-4 mr-1" />
                              )}
                              Preview
                            </Button>
                            <Button size="sm" onClick={() => handleAccess(m)}>
                              Save
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }
              })
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-10">
                No items found matching your criteria.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog for Materials */}
      <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-3xl">
          {previewItem && (
            <>
              <DialogHeader>
                <DialogTitle>{previewItem.title}</DialogTitle>
                <DialogDescription>{previewItem.description}</DialogDescription>
              </DialogHeader>
              <div className="mt-2">
                {previewItem.previewType === "video" && (
                  <video
                    src={previewItem.previewUrl}
                    controls
                    className="w-full rounded-md"
                    poster={previewItem.imageUrl}
                  />
                )}
                {previewItem.previewType === "image" && (
                  <div className="relative w-full h-[360px] bg-muted rounded-md overflow-hidden">
                    <Image
                      src={previewItem.previewUrl || "/placeholder.svg"}
                      alt={previewItem.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                {previewItem.previewType === "link" && (
                  <div className="p-4 rounded-md border bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-3">This material links to an external resource.</p>
                    <Link href={previewItem.previewUrl} target="_blank" rel="noopener noreferrer">
                      <Button>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Link
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setPreviewItem(null)}>
                  Close
                </Button>
                <Button onClick={() => handleAccess(previewItem)}>Save to Vault</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Hire Dialog for Talent */}
      <HireDialog
        talent={hireTarget}
        onOpenChange={(open) => !open && setHireTarget(null)}
        onSubmitted={() => {
          setHireTarget(null)
          toast({
            title: "Hire request sent",
            description: "The talent has been notified. You will be contacted shortly.",
          })
        }}
      />
    </div>
  )
}

function HireDialog({
  talent,
  onOpenChange,
  onSubmitted,
}: {
  talent: TalentItem | null
  onOpenChange: (open: boolean) => void
  onSubmitted: () => void
}) {
  const [message, setMessage] = useState("")
  const [budget, setBudget] = useState("")
  const [scope, setScope] = useState("")

  return (
    <Dialog open={!!talent} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hire {talent?.title}</DialogTitle>
          <DialogDescription>Send a brief scope and budget to kick off the engagement.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="scope">Scope</Label>
            <Input
              id="scope"
              placeholder="e.g., Build a canister-backed session manager"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="budget">Budget (USD)</Label>
            <Input
              id="budget"
              type="number"
              inputMode="decimal"
              placeholder={`${talent ? talent.hourlyRate : ""} / hr baseline`}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Share context, timelines, and success criteria…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              // This is client-only for now; in a real app, send to your backend/canister.
              console.log("Hire request", { to: talent?.profileUsername, scope, budget, message })
              onSubmitted()
            }}
          >
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
