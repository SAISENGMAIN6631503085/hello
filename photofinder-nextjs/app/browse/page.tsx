"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PhotoGrid } from "@/components/photo-grid"
import { Search, X, ChevronDown } from "lucide-react"

interface Photo {
  id: string
  url: string
  eventName: string
  eventDate: string
  confidence: number
}

export default function BrowsePhotosPage() {
  const router = useRouter()
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([])
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"date-newest" | "date-oldest" | "confidence">("date-newest")
  const [showFilters, setShowFilters] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authToken = localStorage.getItem("auth_token")
    if (!authToken) {
      router.push("/login")
      return
    }

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
            confidence: 0.95, // Placeholder
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

  // Apply filters
  useEffect(() => {
    let results = allPhotos

    // Filter by event
    if (selectedEvents.length > 0) {
      results = results.filter((photo) => selectedEvents.includes(photo.eventName))
    }

    // Filter by search query
    if (searchQuery.trim()) {
      results = results.filter((photo) => photo.eventName.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Sort
    if (sortBy === "date-newest") {
      results.sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
    } else if (sortBy === "date-oldest") {
      results.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    } else if (sortBy === "confidence") {
      results.sort((a, b) => b.confidence - a.confidence)
    }

    setFilteredPhotos(results)
  }, [allPhotos, selectedEvents, searchQuery, sortBy])

  const events = [...new Set(allPhotos.map((p) => p.eventName))]

  const handleToggleEvent = (eventName: string) => {
    setSelectedEvents((prev) => (prev.includes(eventName) ? prev.filter((e) => e !== eventName) : [...prev, eventName]))
  }

  const handleClearFilters = () => {
    setSelectedEvents([])
    setSearchQuery("")
    setSortBy("date-newest")
  }

  const isFiltered = selectedEvents.length > 0 || searchQuery.trim() !== "" || sortBy !== "date-newest"

  return (
    <>
      <Header showLogout />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        {/* Header Section */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Browse All Photos</h1>
            <p className="text-muted-foreground">
              {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            <aside
              className={`${showFilters ? "w-64" : "w-0"} transition-all duration-300 overflow-hidden flex-shrink-0`}
            >
              <div className="bg-card border border-border rounded-lg p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-foreground">Filters</h2>
                  {isFiltered && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                      className="text-xs text-primary hover:text-primary/80"
                    >
                      Clear all
                    </Button>
                  )}
                </div>

                {/* Sort */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <label className="text-sm font-medium text-foreground block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="date-newest">Newest First</option>
                    <option value="date-oldest">Oldest First</option>
                    <option value="confidence">Best Match</option>
                  </select>
                </div>

                {/* Events Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground block">Events</label>
                  <div className="space-y-2">
                    {events.map((event) => (
                      <label key={event} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedEvents.includes(event)}
                          onChange={() => handleToggleEvent(event)}
                          className="w-4 h-4 rounded border border-border accent-primary cursor-pointer"
                        />
                        <span className="text-sm text-foreground flex-1">{event}</span>
                        <span className="text-xs text-muted-foreground">
                          ({allPhotos.filter((p) => p.eventName === event).length})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Controls */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-border bg-background text-foreground"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden border-border bg-transparent"
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Photo Grid or Empty State */}
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Loading photos...</p>
                </div>
              ) : filteredPhotos.length > 0 ? (
                <>
                  <PhotoGrid photos={filteredPhotos} />
                  <div className="mt-8 text-center text-sm text-muted-foreground">
                    Showing {filteredPhotos.length} of {allPhotos.length} photos
                  </div>
                </>
              ) : (
                <Card className="border border-border">
                  <CardContent className="py-12 text-center space-y-4">
                    <p className="text-muted-foreground">No photos match your filters</p>
                    {isFiltered && (
                      <Button variant="outline" onClick={handleClearFilters} className="border-border bg-transparent">
                        <X className="w-4 h-4 mr-2" />
                        Clear filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
