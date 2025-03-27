"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [userIndex, setUserIndex] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [ipInfo, setIpInfo] = useState<{ ip: string; country: string; city: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.push("/dashboard")
      }
    }

    checkSession()

    // Fetch IP information
    const fetchIpInfo = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/")
        const data = await res.json()
        setIpInfo({
          ip: data.ip,
          country: data.country_name,
          city: data.city,
        })
      } catch (error) {
        console.error("Error fetching IP info:", error)
        setIpInfo({
          ip: "192.168.1.1",
          country: "Unknown",
          city: "Unknown",
        })
      }
    }

    fetchIpInfo()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    if (!userIndex) {
      setError("USER INDEX is required")
      setIsLoading(false)
      return
    }

    // Format the email for Supabase (since Supabase requires email format)
    const email = `${userIndex}@gmail.com`

    // Send magic link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    setSuccess("Access link sent to your email. Check your inbox to continue.")
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-hacker-background p-4">
      <Card className="w-full max-w-md border border-hacker-primary/30 bg-hacker-terminal">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-hacker-primary font-hack">
            <span className="hacker-text-animation">LEGION</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
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

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="userIndex" className="text-sm font-medium text-hacker-primary font-hack">
                USER INDEX
              </label>
              <Input
                id="userIndex"
                value={userIndex}
                onChange={(e) => setUserIndex(e.target.value)}
                className="bg-black border-hacker-primary/50 text-hacker-primary font-hack"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-hacker-primary hover:bg-hacker-primary/80 text-black font-bold font-hack"
              disabled={isLoading}
            >
              {isLoading ? "SENDING ACCESS LINK..." : "ACCESS SYSTEM"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <div className="w-full text-xs text-hacker-primary/70 font-hack space-y-1">
            <div className="flex justify-between w-full">
              <span>IP ADDRESS:</span>
              <span>{ipInfo?.ip || "Loading..."}</span>
            </div>
            <div className="flex justify-between w-full">
              <span>LOCATION:</span>
              <span>{ipInfo ? `${ipInfo.city}, ${ipInfo.country}` : "Loading..."}</span>
            </div>
            <div className="flex justify-between w-full">
              <span>STATUS:</span>
              <span className="text-hacker-accent">SECURE CONNECTION</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

