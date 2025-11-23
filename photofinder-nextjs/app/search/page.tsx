"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader, AlertCircle, Camera, Sparkles } from "lucide-react"
import { PhotoGrid } from "@/components/photo-grid"

interface SearchResult {
  id: string
  url: string
  eventName: string
  eventDate: string
  confidence: number
}

export default function FaceSearchPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const authToken = localStorage.getItem("auth_token")
    if (!authToken) {
      router.push("/login")
      return
    }
  }, [router])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB")
      return
    }

    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string)
      setSearchResults([])
      setHasSearched(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSearch = async () => {
    if (!uploadedImage) {
      setError("Please upload an image first")
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      // Simulate API call to /search/face with local-only matching
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Mock search results
      const mockResults: SearchResult[] = [
        {
          id: "1",
          url: "/placeholder.svg?key=av3kp",
          eventName: "Spring Orientation 2024",
          eventDate: "2024-03-15",
          confidence: 0.98,
        },
        {
          id: "2",
          url: "/placeholder.svg?key=k99b3",
          eventName: "Sports Day 2024",
          eventDate: "2024-04-20",
          confidence: 0.92,
        },
        {
          id: "3",
          url: "/placeholder.svg?key=ykote",
          eventName: "Campus Concert",
          eventDate: "2024-05-10",
          confidence: 0.88,
        },
      ]

      setSearchResults(mockResults)
      setHasSearched(true)
    } catch (err) {
      setError("Face search failed. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <>
      <Header showLogout />
      <main className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">AI-Powered Face Search</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground">Find Your Photos</h1>
            <p className="text-muted-foreground mt-3 text-lg">
              Upload a selfie and let AI discover all your moments across campus events
            </p>
          </div>

          <Card className="border-2 border-primary/30 mb-8 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Upload Your Selfie
              </CardTitle>
              <CardDescription>Local processing only - your image is analyzed on your device first</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-card/50"
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

                {uploadedImage ? (
                  <div className="space-y-4">
                    <div className="relative w-32 h-32 mx-auto">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Uploaded selfie"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Click to upload a different image</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="font-semibold text-foreground">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">PNG, JPG or GIF (max. 10MB)</p>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSearch}
                disabled={!uploadedImage || isSearching}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground py-6"
                size="lg"
              >
                {isSearching ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Searching with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Search My Photos
                  </>
                )}
              </Button>

              {/* Privacy Notice */}
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">
                  Your uploaded image is processed locally first and not stored on our servers. Only aggregate face
                  embeddings are used for matching against event photos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {hasSearched && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">Found {searchResults.length} matches</h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadedImage(null)
                    setSearchResults([])
                    setHasSearched(false)
                  }}
                  className="border-border"
                >
                  New Search
                </Button>
              </div>

              {searchResults.length > 0 ? (
                <PhotoGrid photos={searchResults} />
              ) : (
                <Card className="border border-border">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No matching photos found. Try uploading a different image.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Help Section */}
          {!hasSearched && !uploadedImage && (
            <Card className="border border-border mt-8 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Tips for Best Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>- Use a clear, well-lit selfie with your face clearly visible</p>
                <p>- Similar lighting and angle to your photos in events works best</p>
                <p>- Avoid heavy filters or makeup changes from event photos</p>
                <p>- Multiple search attempts can help find more photos</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}
