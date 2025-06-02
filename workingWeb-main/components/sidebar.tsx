"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Music } from "lucide-react"
import Link from "next/link"
import { roomsAPI } from "@/lib/api-service"
import { Skeleton } from "@/components/ui/skeleton"

type Room = {
  id: string | number
  name: string
  size: number
  capacity: number
  genre?: string
  avatar?: string
}

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [showAllRooms, setShowAllRooms] = useState(false)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true)

        const data = await roomsAPI.getAll()
        console.log("Sidebar rooms:", data)

        if (Array.isArray(data)) {
          setRooms(data)
        } else {
          console.error("Expected array but got:", data)
          // Fallback mock data
          setRooms([
            {
              id: "neon-lounge",
              name: "Neon Lounge",
              size: 5,
              capacity: 8,
              genre: "Electronic",
              avatar: "/placeholder.svg?height=30&width=30",
            },
            {
              id: "virtual-beats",
              name: "Virtual Beats",
              size: 3,
              capacity: 8,
              genre: "House",
              avatar: "/placeholder.svg?height=30&width=30",
            },
            {
              id: "digital-disco",
              name: "Digital Disco",
              size: 7,
              capacity: 8,
              genre: "Disco",
              avatar: "/placeholder.svg?height=30&width=30",
            },
            {
              id: "cyber-jazz",
              name: "Cyber Jazz",
              size: 2,
              capacity: 8,
              genre: "Jazz",
              avatar: "/placeholder.svg?height=30&width=30",
            },
            {
              id: "pixel-party",
              name: "Pixel Party",
              size: 4,
              capacity: 8,
              genre: "Pop",
              avatar: "/placeholder.svg?height=30&width=30",
            },
          ])
        }
      } catch (error) {
        console.error("Failed to fetch rooms for sidebar:", error)
        // Fallback mock data
        setRooms([
          {
            id: "neon-lounge",
            name: "Neon Lounge",
            size: 5,
            capacity: 8,
            genre: "Electronic",
            avatar: "/placeholder.svg?height=30&width=30",
          },
          {
            id: "virtual-beats",
            name: "Virtual Beats",
            size: 3,
            capacity: 8,
            genre: "House",
            avatar: "/placeholder.svg?height=30&width=30",
          },
          {
            id: "digital-disco",
            name: "Digital Disco",
            size: 7,
            capacity: 8,
            genre: "Disco",
            avatar: "/placeholder.svg?height=30&width=30",
          },
          {
            id: "cyber-jazz",
            name: "Cyber Jazz",
            size: 2,
            capacity: 8,
            genre: "Jazz",
            avatar: "/placeholder.svg?height=30&width=30",
          },
          {
            id: "pixel-party",
            name: "Pixel Party",
            size: 4,
            capacity: 8,
            genre: "Pop",
            avatar: "/placeholder.svg?height=30&width=30",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  const displayedRooms = showAllRooms ? rooms : rooms.slice(0, 5)
  const isLive = (room: Room) => room.size > 0

  if (isCollapsed) {
    return (
      <aside className="hidden md:flex flex-col w-16 bg-zinc-900 border-r border-purple-900/50 h-[calc(100vh-3.5rem)] overflow-y-auto">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-4 hover:bg-purple-900/30 flex justify-center text-purple-300"
        >
          <ChevronDown className="h-5 w-5" />
        </button>

        {loading
          ? Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="p-2 flex justify-center">
                  <Skeleton className="w-8 h-8 rounded-full" />
                </div>
              ))
          : rooms.slice(0, 10).map((room) => (
              <Link href={`/club/${room.id}`} key={room.id}>
                <div
                  className="p-2 hover:bg-purple-900/30 flex justify-center cursor-pointer relative"
                  title={room.name}
                >
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {room.avatar ? (
                      <img
                        src={room.avatar || "/placeholder.svg"}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      room.name.charAt(0)
                    )}
                  </div>
                  {isLive(room) && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                </div>
              </Link>
            ))}
      </aside>
    )
  }

  return (
    <aside className="hidden md:block w-60 bg-zinc-900 border-r border-purple-900/50 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="p-4 flex justify-between items-center border-b border-purple-900/50">
        <h2 className="font-semibold text-sm text-purple-300">POPULAR CLUBS</h2>
        <button onClick={() => setIsCollapsed(true)} className="hover:bg-purple-900/30 p-1 rounded text-purple-300">
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>

      <div className="py-2">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="px-4 py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            ))
        ) : (
          <>
            {displayedRooms.map((room) => (
              <Link href={`/club/${room.id}`} key={room.id}>
                <div className="flex items-center justify-between px-4 py-2 hover:bg-purple-900/30 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden relative">
                      {room.avatar ? (
                        <img
                          src={room.avatar || "/placeholder.svg"}
                          alt={room.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        room.name.charAt(0)
                      )}
                      {isLive(room) && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 border border-zinc-900 rounded-full"></span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-100">{room.name}</p>
                      <p className="text-xs text-purple-400">{room.genre || "Various"}</p>
                    </div>
                  </div>
                  <span className="text-xs text-purple-400">
                    {room.size}/{room.capacity}
                  </span>
                </div>
              </Link>
            ))}

            {rooms.length > 5 && (
              <button
                onClick={() => setShowAllRooms(!showAllRooms)}
                className="w-full text-left px-4 py-2 text-sm text-purple-500 hover:bg-purple-900/30"
              >
                {showAllRooms ? "Show less" : "Show more"}
              </button>
            )}
          </>
        )}
      </div>

    
    </aside>
  )
}
