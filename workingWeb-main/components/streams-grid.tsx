"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

type Stream = {
  id: string
  title: string
  streamer: string
  viewers: string
  thumbnail: string
  game: string
  tags?: string[]
}

export function StreamsGrid() {
  const streams: Stream[] = [
    {
      id: "1",
      title: "Motion Detection Module Testing",
      streamer: "MotionDetection",
      viewers: "398",
      thumbnail: "/placeholder.svg?height=180&width=320",
      game: "Computer Vision",
      tags: ["Technical", "Research"],
    },
    {
      id: "2",
      title: "Avatar Processing with Unity",
      streamer: "AvatarProcessing",
      viewers: "285",
      thumbnail: "/placeholder.svg?height=180&width=320",
      game: "Unity 3D",
      tags: ["Development", "3D"],
    },
    {
      id: "3",
      title: "Backend API Development",
      streamer: "BackendAPI",
      viewers: "272",
      thumbnail: "/placeholder.svg?height=180&width=320",
      game: "WebRTC",
      tags: ["Coding", "Backend"],
    },
    {
      id: "4",
      title: "Flutter Mobile App Development",
      streamer: "MobileFrontend",
      viewers: "156",
      thumbnail: "/placeholder.svg?height=180&width=320",
      game: "Flutter",
      tags: ["Mobile", "UI/UX"],
    },
    {
      id: "5",
      title: "Web Frontend with Three.js",
      streamer: "WebFrontend",
      viewers: "207",
      thumbnail: "/placeholder.svg?height=180&width=320",
      game: "Three.js",
      tags: ["Web", "3D"],
    },
    {
      id: "6",
      title: "Computer Vision Research",
      streamer: "GTULabs",
      viewers: "536",
      thumbnail: "/placeholder.svg?height=180&width=320",
      game: "Computer Vision",
      tags: ["Research", "Academic"],
    },
    {
      id: "7",
      title: "CSE396 Project Presentations",
      streamer: "CSE396",
      viewers: "381",
      thumbnail: "/placeholder.svg?height=180&width=320",
      game: "Project Demo",
      tags: ["Academic", "Live"],
    },
    {
      id: "8",
      title: "Virtual Social Spaces Development",
      streamer: "VirtualSpaces",
      viewers: "255",
      thumbnail: "/placeholder.svg?height=180&width=320",
      game: "Social VR",
      tags: ["VR", "Social"],
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {streams.map((stream) => (
        <Link href={`/stream/${stream.id}`} key={stream.id}>
          <Card className="overflow-hidden border-0 bg-transparent hover:bg-accent/50 transition-colors">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={stream.thumbnail || "/placeholder.svg"}
                  alt={stream.title}
                  className="w-full aspect-video object-cover rounded-md"
                />
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                  LIVE
                </div>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                  {stream.viewers} viewers
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                  {stream.streamer.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-sm line-clamp-1">{stream.title}</h3>
                  <p className="text-xs text-muted-foreground">{stream.streamer}</p>
                  <p className="text-xs text-muted-foreground">{stream.game}</p>
                  {stream.tags && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {stream.tags.map((tag, index) => (
                        <span key={index} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
