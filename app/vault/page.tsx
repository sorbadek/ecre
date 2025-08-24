"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Video, Code, Music, ImageIcon, Trash2, CheckCircle, Shield } from "lucide-react"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

interface VaultItem {
  id: string
  title: string
  description: string
  price: number
  xpReward: number
  category: string
  type: "course" | "tutorial" | "resource" | "template" | "tool"
  imageUrl: string
  rating: number
  reviews: number
  progress: number // 0-100
  savedDate: string // ISO string
}

export default function VaultPage() {
  const [savedResources, setSavedResources] = useState<VaultItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    const storedVaultItems = localStorage.getItem("peerverse_vault_items")
    if (storedVaultItems) {
      setSavedResources(JSON.parse(storedVaultItems))
    }
  }, [])

  const updateLocalStorage = (updatedItems: VaultItem[]) => {
    setSavedResources(updatedItems)
    localStorage.setItem("peerverse_vault_items", JSON.stringify(updatedItems))
  }

  const handleRemoveResource = (id: string) => {
    const updatedItems = savedResources.filter((item) => item.id !== id)
    updateLocalStorage(updatedItems)
    toast({
      title: "Resource Removed",
      description: "The item has been removed from your Vault.",
      variant: "default",
    })
  }

  const handleUpdateProgress = (id: string, newProgress: number) => {
    const updatedItems = savedResources.map((item) =>
      item.id === id ? { ...item, progress: Math.max(0, Math.min(100, newProgress)) } : item,
    )
    updateLocalStorage(updatedItems)
    toast({
      title: "Progress Updated",
      description: "Your progress has been saved.",
      variant: "success",
    })
  }

  const filteredItems = savedResources.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeTab === "all" || item.type === activeTab

    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (type: string) => {
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
        return <Music className="h-5 w-5 text-primary" /> // Placeholder, adjust as needed
      default:
        return <BookOpen className="h-5 w-5 text-primary" />
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="size-5 text-emerald-300" />
          <h1 className="text-3xl font-bold">Vault</h1>
        </div>
        <div className="relative w-full md:w-auto flex-grow md:flex-grow-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search your saved resources..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="course">Courses</TabsTrigger>
          <TabsTrigger value="tutorial">Tutorials</TabsTrigger>
          <TabsTrigger value="resource">Resources</TabsTrigger>
          <TabsTrigger value="template">Templates</TabsTrigger>
          <TabsTrigger value="tool">Tools</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-6">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative w-full h-48 bg-muted">
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.title}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-t-lg"
                    />
                  </div>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex flex-col flex-grow justify-between">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {getCategoryIcon(item.type)}
                        <span>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        Saved: {new Date(item.savedDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">Progress:</span>
                        <span className="font-semibold">{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} className="w-full" />
                    </div>
                    <div className="flex gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handleUpdateProgress(item.id, item.progress + 10)}
                      >
                        Mark Progress
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleRemoveResource(item.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                      {item.progress === 100 && (
                        <Button variant="secondary" size="icon" disabled>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="sr-only">Completed</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              Your Vault is empty. Explore the{" "}
              <Link href="/marketplace" className="text-primary hover:underline">
                Marketplace
              </Link>{" "}
              to add resources!
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
