"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { roomsAPI } from "@/lib/api-service"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateClubPage() {
  const [formData, setFormData] = useState({
    name: "",
    genre: "",
    capacity: "8",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to create a club")
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(null)

      const newRoom = {
        name: formData.name,
        genre: formData.genre,
        capacity: Number.parseInt(formData.capacity),
        description: formData.description,
        hostId: user.id,
      }

      const response = await roomsAPI.create(newRoom)
      console.log("Created room:", response)

      setSuccess("Club created successfully!")

      // Reset form
      setFormData({
        name: "",
        genre: "",
        capacity: "8",
        description: "",
      })

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/club/${response.id}`)
      }, 1500)
    } catch (err) {
      console.error("Failed to create club:", err)
      setError("Failed to create club. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-black text-purple-50">
        <Navbar />

        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-gradient-to-b from-black to-zinc-900">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold mb-6 text-purple-100">Create a New Club</h1>

              {error && (
                <Alert variant="destructive" className="mb-4 bg-red-900/30 border-red-800 text-red-200">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-4 bg-green-900/30 border-green-800 text-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-purple-200">
                    Club Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter club name"
                    required
                    className="bg-zinc-800 border-purple-900/50 text-purple-100 placeholder:text-purple-400/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-purple-200">
                    Music Genre
                  </Label>
                  <Select value={formData.genre} onValueChange={(value) => handleSelectChange("genre", value)}>
                    <SelectTrigger className="bg-zinc-800 border-purple-900/50 text-purple-100">
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-purple-900/50 text-purple-100">
                      <SelectItem value="Electronic">Electronic</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Techno">Techno</SelectItem>
                      <SelectItem value="Hip-Hop">Hip-Hop</SelectItem>
                      <SelectItem value="Pop">Pop</SelectItem>
                      <SelectItem value="Rock">Rock</SelectItem>
                      <SelectItem value="Jazz">Jazz</SelectItem>
                      <SelectItem value="Ambient">Ambient</SelectItem>
                      <SelectItem value="Disco">Disco</SelectItem>
                      <SelectItem value="Various">Various</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-purple-200">
                    Capacity
                  </Label>
                  <Select value={formData.capacity} onValueChange={(value) => handleSelectChange("capacity", value)}>
                    <SelectTrigger className="bg-zinc-800 border-purple-900/50 text-purple-100">
                      <SelectValue placeholder="Select capacity" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-purple-900/50 text-purple-100">
                      <SelectItem value="4">4 people</SelectItem>
                      <SelectItem value="8">8 people</SelectItem>
                      <SelectItem value="12">12 people</SelectItem>
                      <SelectItem value="16">16 people</SelectItem>
                      <SelectItem value="24">24 people</SelectItem>
                      <SelectItem value="32">32 people</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-purple-200">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your club..."
                    rows={4}
                    className="bg-zinc-800 border-purple-900/50 text-purple-100 placeholder:text-purple-400/50"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Club"
                  )}
                </Button>
              </form>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
