"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function SettingsPage() {
  const { user } = useAuth()
  const [userIndex, setUserIndex] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      // Extract user index from email (assuming email is in format userindex@example.com)
      const extractedUserIndex = user.email?.split("@")[0] || ""
      setUserIndex(extractedUserIndex)
    }
  }, [user])

  const handleChangeUserIndex = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    if (!userIndex) {
      setError("USER INDEX is required")
      setIsLoading(false)
      return
    }

    try {
      // Update user_index in the users table
      const { error: updateError } = await supabase.from("users").update({ user_index: userIndex }).eq("id", user?.id)

      if (updateError) {
        throw updateError
      }

      // Update email in auth (since we're using email as userindex@gmail.com)
      const { error: authError } = await supabase.auth.updateUser({
        email: `${userIndex}@gmail.com`,
      })

      if (authError) {
        throw authError
      }

      setSuccess("USER INDEX updated successfully. You may need to verify your new email.")
    } catch (err: any) {
      setError(err.message || "Failed to update USER INDEX")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    if (!password || !confirmPassword) {
      setError("Both password fields are required")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw error
      }

      setSuccess("Password updated successfully")
      setPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || "Failed to update password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border border-hacker-primary/30 bg-hacker-terminal">
        <CardHeader className="border-b border-hacker-primary/30">
          <CardTitle className="text-hacker-primary font-hack">Change USER INDEX</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {error && (
            <Alert variant="destructive" className="mb-4 bg-destructive/20 border-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 bg-hacker-primary/20 border-hacker-primary">
              <AlertDescription className="text-hacker-primary">{success}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleChangeUserIndex} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userIndex" className="text-hacker-primary font-hack">
                USER INDEX
              </Label>
              <Input
                id="userIndex"
                value={userIndex}
                onChange={(e) => setUserIndex(e.target.value)}
                className="bg-black border-hacker-primary/50 text-hacker-primary font-hack"
              />
            </div>

            <Button
              type="submit"
              className="bg-hacker-primary hover:bg-hacker-primary/80 text-black font-bold font-hack"
              disabled={isLoading}
            >
              {isLoading ? "UPDATING..." : "UPDATE USER INDEX"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border border-hacker-primary/30 bg-hacker-terminal">
        <CardHeader className="border-b border-hacker-primary/30">
          <CardTitle className="text-hacker-primary font-hack">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-hacker-primary font-hack">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black border-hacker-primary/50 text-hacker-primary font-hack"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-hacker-primary font-hack">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-black border-hacker-primary/50 text-hacker-primary font-hack"
              />
            </div>

            <Button
              type="submit"
              className="bg-hacker-primary hover:bg-hacker-primary/80 text-black font-bold font-hack"
              disabled={isLoading}
            >
              {isLoading ? "UPDATING..." : "UPDATE PASSWORD"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

