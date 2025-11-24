"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Sparkles } from "lucide-react"
import { PhotoGrid } from "@/components/photo-grid"

interface Photo {
  id: string
  url: string
  eventName: string
  eventDate: string
  confidence: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [universityId, setUniversityId] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authToken = localStorage.getItem("auth_token")
    if (!authToken) {
      router.push("/login")
      return
    }

    const storedName = localStorage.getItem("user_name")
    const storedId = localStorage.getItem("university_id")
    const storedEmail = localStorage.getItem("user_email") || "student@mfu.ac.th"
    if (storedName) setUserName(storedName)
    if (storedId) setUniversityId(storedId)
    setUserEmail(storedEmail)

    // Fetch real events and photos from backend
    const loadData = async () => {
      try {
        const eventsRes = await fetch('http://localhost:3000/events')
        const eventsData = await eventsRes.json()

        const photosRes = await fetch('http://localhost:3000/photos')
        const photosData = await photosRes.json()

        // Transform backend data to match frontend format
        const transformedPhotos = photosData.map((photo: any) => {
          const event = eventsData.find((e: any) => e.id === photo.eventId)
          return {
            id: photo.id,
            url: photo.storageUrl,
            eventName: event?.name || 'Unknown Event',
            eventDate: event?.date || photo.createdAt,
            confidence: 0.95, // Placeholder since we don't have this data yet
          }
        })

        setAllPhotos(transformedPhotos)
        setIsLoading(false)
      } catch (err) {
        console.error('Failed to load data:', err)
        setIsLoading(false)
      }
    }

    loadData()
  }, [router])

  const filteredPhotos = selectedFilter === "all" ? allPhotos : allPhotos.filter((p) => p.eventName === selectedFilter)
  const events = [...new Set(allPhotos.map((p) => p.eventName))]

  return (
    <>
      <Header userRole="student" />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">My Photos</h1>
                <p className="text-sm text-muted-foreground mt-1">Discover yourself in campus events</p>
              </div>
            </div>
            <div className="mt-6">
              <Button
                onClick={() => router.push("/search")}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-500 text-base"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Face Search
              </Button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="photos" className="space-y-6">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="photos">My Photos ({allPhotos.length})</TabsTrigger>
              <TabsTrigger value="events">Recent Events ({events.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="photos" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading your photos...</p>
                </div>
              ) : filteredPhotos.length > 0 ? (
                <>
                  {selectedFilter !== "all" && (
                    <Button variant="ghost" onClick={() => setSelectedFilter("all")} className="text-muted-foreground">
                      ← Back to all
                    </Button>
                  )}
                  <PhotoGrid photos={filteredPhotos} />
                </>
              ) : (
                <Card className="border border-border">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No photos found. Try uploading or using face search.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="events" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <Card
                    key={event}
                    className="border border-border cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => {
                      setSelectedFilter(event)
                      const photosTab = document.querySelector('[value="photos"]') as HTMLElement
                      photosTab?.click()
                    }}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-foreground">{event}</h3>
                        <p className="text-sm text-muted-foreground">
                          {allPhotos.filter((p) => p.eventName === event).length} photos
                        </p>
                        <Button size="sm" variant="outline" className="border-border w-full bg-transparent">
                          <Search className="w-4 h-4 mr-2" />
                          View Gallery
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}
