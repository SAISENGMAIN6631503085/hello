"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Download, Share2, Trash2, AlertCircle } from "lucide-react"

interface Photo {
  id: string
  url: string
  eventName: string
  eventDate: string
  confidence?: number
}

interface PhotoDetailModalProps {
  photo: Photo | null
  isOpen: boolean
  onClose: () => void
}

export function PhotoDetailModal({ photo, isOpen, onClose }: PhotoDetailModalProps) {
  const [showRemovalRequest, setShowRemovalRequest] = useState(false)

  if (!photo) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{photo.eventName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo Display */}
          <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden">
            <Image src={photo.url || "/placeholder.svg"} alt={photo.eventName} fill className="object-cover" />
            {photo.confidence && (
              <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                {Math.round(photo.confidence * 100)}% match
              </div>
            )}
          </div>

          {/* Photo Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-card border border-border rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Event</p>
              <p className="font-semibold text-foreground">{photo.eventName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
              <p className="font-semibold text-foreground">{new Date(photo.eventDate).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {!showRemovalRequest ? (
              <>
                <Button
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = photo.url
                    link.download = `${photo.eventName}-${photo.id}.jpg`
                    link.click()
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-border bg-transparent"
                  onClick={() => {
                    navigator
                      .share?.({
                        title: photo.eventName,
                        text: `Check out this photo from ${photo.eventName}!`,
                        url: window.location.href,
                      })
                      .catch(() => {
                        // Fallback if share API not available
                        const text = `${photo.eventName} - ${window.location.href}`
                        navigator.clipboard.writeText(text)
                      })
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive/90"
                  onClick={() => setShowRemovalRequest(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Request Removal or Blur
                </Button>
              </>
            ) : (
              <div className="space-y-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-2">
                    <p className="font-semibold text-foreground">Request Photo Removal or Blur</p>
                    <p className="text-muted-foreground">
                      Our team will review your request within 24 hours. You'll receive an email confirmation.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      alert("Removal request submitted. We will review it within 24 hours.")
                      setShowRemovalRequest(false)
                    }}
                    className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Submit Request
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRemovalRequest(false)}
                    className="flex-1 border-border"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
