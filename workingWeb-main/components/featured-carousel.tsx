"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

type FeaturedClub = {
  id: string
  title: string
  host: string
  attendees: string
  thumbnail: string
  genre: string
}

export function FeaturedCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const featuredClubs: FeaturedClub[] = [
    {
      id: "neon-lounge",
      title: "Neon Lounge - Weekend Party",
      host: "DJ Virtual",
      attendees: "536",
      thumbnail: "/placeholder.svg?height=400&width=700",
      genre: "Electronic",
    },
    {
      id: "virtual-beats",
      title: "Virtual Beats - Avatar Dance Night",
      host: "DJ Pixel",
      attendees: "272",
      thumbnail: "/placeholder.svg?height=400&width=700",
      genre: "House",
    },
    {
      id: "digital-disco",
      title: "Digital Disco - Retro Night",
      host: "DJ Binary",
      attendees: "156",
      thumbnail: "/placeholder.svg?height=400&width=700",
      genre: "Disco",
    },
  ]

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === featuredClubs.length - 1 ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? featuredClubs.length - 1 : prevIndex - 1))
  }

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide()
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  const currentClub = featuredClubs[currentIndex]

  return (
    <div className="relative w-full">
      <Link href={`/club/${currentClub.id}`}>
        <div className="relative aspect-video overflow-hidden rounded-lg group">
          <img
            src={currentClub.thumbnail || "/placeholder.svg"}
            alt={currentClub.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          {/* Neon glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-blue-500/10 opacity-60" />

          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">LIVE</div>

          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{currentClub.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                {currentClub.host.charAt(0)}
              </div>
              <span className="font-medium">{currentClub.host}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm flex items-center gap-1">
                <Users className="h-4 w-4" /> {currentClub.attendees} attending
              </span>
              <span className="text-sm">{currentClub.genre}</span>
            </div>
          </div>
        </div>
      </Link>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 border-0 text-white hover:bg-black/70"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 border-0 text-white hover:bg-black/70"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="flex justify-center gap-2 mt-4">
        {featuredClubs.map((_, index) => (
          <button
            key={index}
            className={cn("w-2 h-2 rounded-full", index === currentIndex ? "bg-purple-600" : "bg-zinc-700")}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
