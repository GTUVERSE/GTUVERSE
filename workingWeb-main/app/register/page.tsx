"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [validationError, setValidationError] = useState<string | null>(null)
  const { register, isLoading, user, error } = useAuth()
  const router = useRouter()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setValidationError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simple validation
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters")
      return
    }

    await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    })
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <div className="flex items-center justify-center p-4 border-b border-purple-900/50">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-transparent bg-clip-text">
            GTUVERSE
          </span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-b from-black to-zinc-900">
        <div className="w-full max-w-md p-6 bg-zinc-900 rounded-lg shadow-lg border border-purple-900/50">
          <h1 className="text-2xl font-bold text-center mb-6 text-purple-100">Create your GTUVERSE Account</h1>

          {(validationError || error) && (
            <Alert variant="destructive" className="mb-4 bg-red-900/30 border-red-800 text-red-200">
              <AlertDescription>{validationError || error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-purple-200">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
                className="bg-zinc-800 border-purple-900/50 text-purple-100 placeholder:text-purple-300/50"
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
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="bg-zinc-800 border-purple-900/50 text-purple-100 placeholder:text-purple-300/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-purple-200">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-zinc-800 border-purple-900/50 text-purple-100 placeholder:text-purple-300/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-purple-200">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="bg-zinc-800 border-purple-900/50 text-purple-100 placeholder:text-purple-300/50"
              />
            </div>

            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-purple-300">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-purple-400 hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
