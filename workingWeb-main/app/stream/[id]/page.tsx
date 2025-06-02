"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { MessageSquare, Users, Share2, Heart } from "lucide-react"

type Stream = {
  id: string
  title: string
  streamer: string
  viewers: string
  thumbnail: string
  game: string
  description: string
}

export default function StreamPage() {
  const params = useParams()
  const streamId = params.id as string
  const [stream, setStream] = useState<Stream | null>(null)
  const [loading, setLoading] = useState(true)
  const [chatMessage, setChatMessage] = useState("")

  // Mock chat messages
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: "MotionResearcher", message: "This avatar mapping is impressive!" },
    { id: 2, user: "GTUStudent", message: "How does the motion detection handle occlusion?" },
    { id: 3, user: "WebRTCDev", message: "What's the latency on the WebRTC connection?" },
    { id: 4, user: "CSE396TA", message: "Great progress on the project!" },
  ])

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      // Mock data - in a real app, this would come from an API
      const mockStream: Stream = {
        id: streamId,
        title: "Real-Time Avatar Motion Mapping Demo",
        streamer: "GTULabs",
        viewers: "536",
        thumbnail: "/placeholder.svg?height=720&width=1280",
        game: "Computer Vision",
        description:
          "In this stream, we're demonstrating the real-time avatar motion mapping system developed for the GTUVERSE project. We'll show how the system captures and processes live video input to detect human motion and applies it to virtual avatars.",
      }
      setStream(mockStream)
      setLoading(false)
    }, 1000)
  }, [streamId])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          id: chatMessages.length + 1,
          user: "You",
          message: chatMessage,
        },
      ])
      setChatMessage("")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-pulse">Loading stream...</div>
        </div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div>Stream not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
          {/* Video Player */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <img
                src={stream.thumbnail || "/placeholder.svg"}
                alt={stream.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                LIVE
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Users className="h-3 w-3" /> {stream.viewers}
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder.svg" alt={stream.streamer} />
                <AvatarFallback>{stream.streamer[0]}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-2xl font-bold">{stream.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{stream.streamer}</span>
                  <span>•</span>
                  <span>{stream.game}</span>
                  <span>•</span>
                  <span>{stream.viewers} viewers</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Follow
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <h2 className="font-semibold mb-2">About the Stream</h2>
              <p className="text-sm">{stream.description}</p>
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-1 flex flex-col h-[calc(100vh-5rem)] border rounded-lg overflow-hidden">
            <div className="p-3 border-b flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <h2 className="font-semibold">Stream Chat</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex gap-2">
                  <span className="font-semibold text-sm">{msg.user}:</span>
                  <span className="text-sm">{msg.message}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
              <Input
                type="text"
                placeholder="Send a message"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                Chat
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
