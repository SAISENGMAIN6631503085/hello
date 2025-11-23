"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { PhotoDetailModal } from "@/components/photo-detail-modal"

interface Photo {
  id: string
  url: string
  eventName: string
  eventDate: string
  confidence: number
}

interface PhotoGridProps {
  photos: Photo[]
}

export function PhotoGrid({ photos }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card
            key={photo.id}
            className="overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer group"
            onClick={() => {
              setSelectedPhoto(photo)
              setShowDetail(true)
            }}
          >
            <div className="relative aspect-square bg-muted overflow-hidden">
              <Image
                src={photo.url || "/placeholder.svg"}
                alt={photo.eventName}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedPhoto(photo)
                    setShowDetail(true)
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </div>

              {/* Confidence badge */}
              <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
                {Math.round(photo.confidence * 100)}%
              </div>
            </div>

            {/* Photo Info */}
            <div className="p-3 space-y-1">
              <p className="font-semibold text-sm text-foreground truncate">{photo.eventName}</p>
              <p className="text-xs text-muted-foreground">{new Date(photo.eventDate).toLocaleDateString()}</p>
            </div>
          </Card>
        ))}
      </div>

      {selectedPhoto && (
        <PhotoDetailModal photo={selectedPhoto} isOpen={showDetail} onClose={() => setShowDetail(false)} />
      )}
    </>
  )
}
