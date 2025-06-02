"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"

type Theme = {
  id: string
  name: string
  attendees: string
  thumbnail: string
  isNew?: boolean
}

export function ThemesSection() {
  const themes: Theme[] = [
    {
      id: "electronic",
      name: "Electronic",
      attendees: "1.2K",
      thumbnail: "/placeholder.svg?height=180&width=135",
    },
    {
      id: "house",
      name: "House",
      attendees: "985",
      thumbnail: "/placeholder.svg?height=180&width=135",
      isNew: true,
    },
    {
      id: "techno",
      name: "Techno",
      attendees: "756",
      thumbnail: "/placeholder.svg?height=180&width=135",
    },
    {
      id: "disco",
      name: "Disco",
      attendees: "1.5K",
      thumbnail: "/placeholder.svg?height=180&width=135",
    },
    {
      id: "hiphop",
      name: "Hip-Hop",
      attendees: "642",
      thumbnail: "/placeholder.svg?height=180&width=135",
    },
    {
      id: "jazz",
      name: "Jazz",
      attendees: "2.1K",
      thumbnail: "/placeholder.svg?height=180&width=135",
      isNew: true,
    },
    {
      id: "ambient",
      name: "Ambient",
      attendees: "487",
      thumbnail: "/placeholder.svg?height=180&width=135",
      isNew: true,
    },
    {
      id: "pop",
      name: "Pop",
      attendees: "325",
      thumbnail: "/placeholder.svg?height=180&width=135",
    },
    {
      id: "rock",
      name: "Rock",
      attendees: "876",
      thumbnail: "/placeholder.svg?height=180&width=135",
    },
    {
      id: "lofi",
      name: "Lo-Fi",
      attendees: "1.3K",
      thumbnail: "/placeholder.svg?height=180&width=135",
      isNew: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {themes.map((theme) => (
        <Link href={`/theme/${theme.id}`} key={theme.id}>
          <Card className="overflow-hidden border-0 bg-zinc-900/50 hover:bg-zinc-800/70 transition-colors group">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={theme.thumbnail || "/placeholder.svg"}
                  alt={theme.name}
                  className="w-full aspect-[3/4] object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
                />
                {theme.isNew && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                    NEW
                  </div>
                )}
              </div>

              <div className="mt-2 px-1">
                <h3 className="font-medium text-sm line-clamp-1 text-purple-100">{theme.name}</h3>
                <p className="text-xs text-purple-400 flex items-center gap-1">
                  <Users className="h-3 w-3" /> {theme.attendees} attending
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
