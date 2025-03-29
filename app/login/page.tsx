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

const retryWithDelay = async (fn: () => Promise<any>, retries = 3, delay = 1000) => {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error
    await new Promise(resolve => setTimeout(resolve, delay))
    return retryWithDelay(fn, retries - 1, delay)
  }
}

interface IpInfo {
  ip: string
  country: string
  city: string
  status: "online" | "offline"
}

export default function LoginPage() {
  const [userIndex, setUserIndex] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [ipInfo, setIpInfo] = useState<IpInfo>({
    ip: "Loading...",
    country: "Loading...",
    city: "Loading...",
    status: "offline"
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const { data, error } = await retryWithDelay(() => supabase.auth.getSession())
        if (error) {
          console.error("Session check error:", error)
          return
        }
        if (data?.session) {
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Session check failed:", error)
      }
    }

    // Initialize Supabase auth
    const initAuth = async () => {
      try {
        await supabase.auth.initialize()
      } catch (error) {
        console.error("Auth initialization failed:", error)
      }
    }

    initAuth()
    checkSession()

    // Check online status
    const updateOnlineStatus = () => {
      setIpInfo(prev => ({
        ...prev,
        status: navigator.onLine ? "online" : "offline"
      }))
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Fetch IP and location information
    const fetchIpInfo = async () => {
      try {
        // First fetch IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        if (!ipResponse.ok) throw new Error('Failed to fetch IP')
        const { ip } = await ipResponse.json()

        // Then fetch location data using ip-api.com
        const locationResponse = await fetch(`http://ip-api.com/json/${ip}`)
        if (!locationResponse.ok) throw new Error('Failed to fetch location')
        const locationData = await locationResponse.json()

        setIpInfo({
          ip,
          country: locationData.country,
          city: locationData.city,
          status: navigator.onLine ? "online" : "offline"
        })
      } catch (error) {
        console.error("Error fetching IP/location:", error)
        setIpInfo({
          ip: "Failed to fetch",
          country: "Unknown",
          city: "Unknown",
          status: navigator.onLine ? "online" : "offline"
        })
      }
    }

    fetchIpInfo()
    // Update IP info every 30 seconds
    const intervalId = setInterval(fetchIpInfo, 30000)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
      clearInterval(intervalId)
    }
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

    try {
      const email = `${userIndex}@gmail.com`
      const { error } = await retryWithDelay(() => 
        supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        }),
        5, // Increase retries for login
        2000 // Increase delay between retries
      )

      if (error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error('Network connection error. Please check your internet connection and try again.')
        }
        throw error
      }

      setSuccess("Access link sent to your email. Check your inbox to continue.")
    } catch (error: any) {
      setError(error.message || "Failed to send access link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-hacker-background p-4">
      <Card className="w-full max-w-md border border-hacker-primary/30 bg-hacker-terminal">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-hacker-primary font-hack">
            <span className="hacker-text-animation">LEGION</span>
          </CardTitle>
            <div className="text-xs text-hacker-primary/70 text-center">
            WE ARE ANONYMOUS. WE ARE LEGION. WE DO NOT FORGIVE. 
            WE DO NOT FORGET. EXPECT US.
            </div>
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

