"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { userAPI } from "@/lib/api-service"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProfilePage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    avatar: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email || "",
        avatar: user.avatar || "",
      })

      const fetchUserProfile = async () => {
        try {
          setIsLoading(true)
          setError(null)

          const userData = await userAPI.getProfile(user.id)
          console.log("Fetched user profile:", userData)

          if (userData) {
            setFormData({
              username: userData.username || user.username,
              email: userData.email || user.email || "",
              avatar: userData.avatar || user.avatar || "",
            })
          }
        } catch (err) {
          console.error("Failed to fetch user profile:", err)
          // We already have basic user data from auth context, so no need to show error
        } finally {
          setIsLoading(false)
        }
      }

      fetchUserProfile()
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccess(null)

      const updatedProfile = {
        username: formData.username,
        email: formData.email,
        avatar: formData.avatar,
      }

      await userAPI.updateProfile(user.id, updatedProfile)
      setSuccess("Profile updated successfully!")
    } catch (err) {
      console.error("Failed to update profile:", err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsSaving(false)
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
              <h1 className="text-2xl font-bold mb-6 text-purple-100">Your Profile</h1>

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

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <Avatar className="h-24 w-24 ring-2 ring-purple-600">
                      <AvatarImage src={formData.avatar || "/placeholder.svg"} alt={formData.username} />
                      <AvatarFallback className="bg-purple-900 text-2xl">
                        {formData.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-purple-200">
                            Username
                          </Label>
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="bg-zinc-800 border-purple-900/50 text-purple-100"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-purple-200">
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="bg-zinc-800 border-purple-900/50 text-purple-100"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="avatar" className="text-purple-200">
                            Avatar URL
                          </Label>
                          <Input
                            id="avatar"
                            name="avatar"
                            value={formData.avatar}
                            onChange={handleChange}
                            placeholder="https://example.com/avatar.jpg"
                            className="bg-zinc-800 border-purple-900/50 text-purple-100 placeholder:text-purple-400/50"
                          />
                          <p className="text-xs text-purple-400">
                            Enter a URL for your avatar image, or leave blank for default
                          </p>
                        </div>

                        <Button
                          type="submit"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>

                  <div className="border-t border-purple-900/30 pt-6">
                    <h2 className="text-xl font-semibold mb-4 text-purple-100">Account Settings</h2>

                    <div className="space-y-4">
                      <div>
                        <Button variant="outline" className="border-purple-700 text-purple-300 hover:bg-purple-900/30">
                          Change Password
                        </Button>
                      </div>

                      <div>
                        <Button variant="outline" className="border-red-700 text-red-300 hover:bg-red-900/30">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
