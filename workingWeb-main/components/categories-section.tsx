"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

type Category = {
  id: string
  name: string
  viewers: string
  thumbnail: string
  isNew?: boolean
}

export function CategoriesSection() {
  const categories: Category[] = [
    {
      id: "motion-detection",
      name: "Motion Detection",
      viewers: "1.2K",
      thumbnail: "/placeholder.svg?height=180&width=135",
    },
    {
      id: "avatar-processing",
      name: "Avatar Processing",
      viewers: "985",
      thumbnail: "/placeholder.svg?height=180&width=135",
      isNew: true,
    },
    {
      id: "webrtc",
      name: "WebRTC",
      viewers: "756",
      thumbnail: "/placeholder.svg?height=180&width=135",
    },
    {
      id: "unity-3d",
      name: "Unity 3D",
      viewers: "1.5K",
      thumbnail: "/placeholder.svg?height=180&width=135",
    },
    {
      id: "flutter",
      name: "Flutter",
      viewers: "642",
      thumbnail: "/placeholder.svg?height=180&width=135",
    },
    {
      id: "computer-vision",
      name: "Computer Vision",
      viewers: "2.1K",
      thumbnail: "/placeholder.svg?height=180&width=135",
      isNew: true,
    },
    {
      id: "threejs",
      name: "Three.js",
      viewers: "487",
      thumbnail: "/placeholder.svg?height=180&width=135",
      isNew: true,
    },
    {
      id: "mediapipe",
      name: "MediaPipe",
      viewers: "325",
      thumbnail: "/placeholder.svg?height=180&width=135",
    },
    {
      id: "social-vr",
      name: "Social VR",
      viewers: "876",
      thumbnail: "/placeholder.svg?height=180&width=135",
    },
    {
      id: "project-demo",
      name: "Project Demo",
      viewers: "1.3K",
      thumbnail: "/placeholder.svg?height=180&width=135",
      isNew: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link href={`/category/${category.id}`} key={category.id}>
          <Card className="overflow-hidden border-0 bg-transparent hover:bg-accent/50 transition-colors">
            <CardContent className="p-0">
              <div className="relative">
                <img
                  src={category.thumbnail || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full aspect-[3/4] object-cover rounded-md"
                />
                {category.isNew && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded">
                    NEW
                  </div>
                )}
              </div>

              <div className="mt-2">
                <h3 className="font-medium text-sm line-clamp-1">{category.name}</h3>
                <p className="text-xs text-muted-foreground">{category.viewers} viewers</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
