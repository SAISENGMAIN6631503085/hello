"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"



export default function AdminDashboardPage() {
  const router = useRouter()
  const [adminName, setAdminName] = useState("")
  const [events, setEvents] = useState<any[]>([])
  const [photos, setPhotos] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const adminToken = localStorage.getItem("admin_token")
    if (!adminToken) {
      router.push("/admin/login")
      return
    }

    const storedName = localStorage.getItem("admin_name")
    if (storedName) {
      setAdminName(storedName)
    }

    const fetchData = async () => {
      try {
        const [eventsRes, photosRes] = await Promise.all([
          apiClient.getEvents(),
          apiClient.getAllPhotos()
        ])

        if (eventsRes.data && Array.isArray(eventsRes.data)) {
          setEvents(eventsRes.data)
        }
        if (photosRes.data && Array.isArray(photosRes.data)) {
          setPhotos(photosRes.data)
        }
      } catch (error) {
        console.error("Failed to fetch data", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return

    try {
      await apiClient.deletePhoto(photoId)
      setPhotos(photos.filter(p => p.id !== photoId))
    } catch (error) {
      console.error("Failed to delete photo", error)
      alert("Failed to delete photo")
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      DRAFT: "bg-secondary text-secondary-foreground",
      PUBLISHED: "bg-primary text-primary-foreground",
      ARCHIVED: "bg-muted text-muted-foreground",
    }
    return styles[status as keyof typeof styles] || styles.DRAFT
  }

  const activeEvents = events.filter((e) => e.status === "PUBLISHED").length

  return (
    <>
      <Header userRole="admin" />
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back, {adminName}</p>
              </div>
              <Button
                onClick={() => router.push("/admin/events/create")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border border-border backdrop-blur-sm bg-card/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{activeEvents}</div>
                  <p className="text-xs text-muted-foreground mt-1">currently published</p>
                </CardContent>
              </Card>

              <Card className="border border-border backdrop-blur-sm bg-card/80">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{events.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">all time</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
            </TabsList>

            <TabsContent value="events">
              <Card className="border border-border backdrop-blur-sm bg-card/80">
                <CardHeader>
                  <CardTitle>Events</CardTitle>
                  <CardDescription>Manage your campus events</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading events...</div>
                  ) : events.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No events found. Create one to get started.</div>
                  ) : (
                    <div className="space-y-4">
                      {events.map((event) => (
                        <div key={event.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border border-border rounded-lg bg-card/50">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-foreground">{event.name}</h3>
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded capitalize ${getStatusBadge(event.status)}`}
                              >
                                {event.status.toLowerCase()}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium text-foreground">{new Date(event.date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Created</p>
                                <p className="font-medium text-foreground">{new Date(event.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="photos">
              <Card className="border border-border backdrop-blur-sm bg-card/80">
                <CardHeader>
                  <CardTitle>All Photos</CardTitle>
                  <CardDescription>Manage all uploaded photos ({photos.length})</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading photos...</div>
                  ) : photos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No photos found.</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {photos.map((photo) => (
                        <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden bg-muted border border-border">
                          <img
                            src={photo.thumbnailUrl || photo.storageUrl}
                            alt="Event photo"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs truncate">
                            {new Date(photo.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}
