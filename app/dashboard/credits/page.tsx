"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

type Package = {
  id: string
  name: string
  price: number
  credits: number
  description: string
  bought_by: number
  is_unlimited: boolean
  duration_months?: number
}

export default function CreditsPage() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<number>(0)
  const [funds, setFunds] = useState<number>(0)
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setIsLoading(true)

        // Fetch user credits and funds
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("credits, funds")
          .eq("id", user.id)
          .single()

        if (userData && !userError) {
          setCredits(userData.credits)
          setFunds(userData.funds)
        } else {
          console.error("Error fetching user data:", userError)
        }

        // Fetch packages
        const { data: packagesData, error: packagesError } = await supabase.from("packages").select("*").order("price")

        if (packagesData && !packagesError) {
          setPackages(packagesData)
        } else {
          // If no packages exist, create default ones
          const defaultPackages = [
            {
              name: "STARTER PACK",
              price: 899,
              credits: 200,
              description: "Perfect for beginners",
              bought_by: 272329,
              is_unlimited: false,
            },
            {
              name: "PRO PACK",
              price: 1799,
              credits: 450,
              description: "For serious hackers",
              bought_by: 429723,
              is_unlimited: false,
            },
            {
              name: "EVIL PACK",
              price: 2599,
              credits: 650,
              description: "Advanced hacking capabilities",
              bought_by: 34658,
              is_unlimited: false,
            },
            {
              name: "HALL OF FAME PACK",
              price: 5999,
              credits: 0,
              description: "Unlimited credits for 12 months",
              bought_by: 5302,
              is_unlimited: true,
              duration_months: 12,
            },
          ]

          for (const pkg of defaultPackages) {
            await supabase.from("packages").insert([pkg])
          }

          setPackages(defaultPackages as Package[])
        }

        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handlePurchase = async (pkg: Package) => {
    if (funds < pkg.price) {
      alert("Insufficient funds. Please add funds to your account.")
      return
    }

    const newFunds = funds - pkg.price
    let newCredits = credits

    if (pkg.is_unlimited) {
      // Handle unlimited credits package (implementation would depend on your business logic)
      alert(`You've purchased the ${pkg.name} with unlimited credits for ${pkg.duration_months} months!`)
    } else {
      newCredits += pkg.credits
    }

    // Update user's credits and funds
    const { error } = await supabase
      .from("users")
      .update({
        credits: newCredits,
        funds: newFunds,
      })
      .eq("id", user?.id)

    if (!error) {
      setCredits(newCredits)
      setFunds(newFunds)

      // Update package bought count
      await supabase
        .from("packages")
        .update({ bought_by: pkg.bought_by + 1 })
        .eq("id", pkg.id)

      // Update local state
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, bought_by: p.bought_by + 1 } : p)))

      alert(`Successfully purchased ${pkg.name}!`)
    } else {
      console.error("Error purchasing package:", error)
      alert("Failed to purchase package. Please try again.")
    }
  }

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-hacker-primary/30 bg-hacker-terminal">
          <CardHeader className="border-b border-hacker-primary/30">
            <CardTitle className="text-hacker-primary font-hack">Credits Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-hacker-primary font-hack">{isLoading ? "..." : credits}</div>
            <p className="text-hacker-primary/70 font-hack text-sm mt-2">Available credits for hacking operations</p>
          </CardContent>
        </Card>

        <Card className="border border-hacker-primary/30 bg-hacker-terminal">
          <CardHeader className="border-b border-hacker-primary/30">
            <CardTitle className="text-hacker-primary font-hack">Funds Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-4xl font-bold text-hacker-primary font-hack">
              {isLoading ? "..." : formatCurrency(funds)}
            </div>
            <p className="text-hacker-primary/70 font-hack text-sm mt-2">Available funds for purchasing credits</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-hacker-primary/30 bg-hacker-terminal">
        <CardHeader className="border-b border-hacker-primary/30">
          <CardTitle className="text-hacker-primary font-hack">Available Packages</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-hacker-primary font-hack">Loading packages...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id || pkg.name}
                  className={`border border-hacker-primary/30 rounded-md p-4 bg-black/50 ${
                    pkg.name === "STARTER PACK" ? "animate-pulse border-hacker-accent" : ""
                  }`}
                >
                  <h3
                    className={`text-lg font-bold font-hack ${
                      pkg.name === "STARTER PACK" ? "text-hacker-accent" : "text-hacker-primary"
                    }`}
                  >
                    {pkg.name}
                  </h3>
                  <div className="mt-2 text-xl font-bold text-hacker-primary font-hack">
                    {formatCurrency(pkg.price)}
                  </div>
                  <div className="text-hacker-primary font-hack">
                    {pkg.is_unlimited ? `UNLIMITED (${pkg.duration_months} MONTHS)` : `${pkg.credits} CREDITS`}
                  </div>
                  <p className="text-hacker-primary/70 font-hack text-xs mt-2">
                    BOUGHT BY {pkg.bought_by.toLocaleString()} USERS
                  </p>
                  <Button
                    className="w-full mt-4 bg-hacker-primary hover:bg-hacker-primary/80 text-black font-bold font-hack"
                    onClick={() => handlePurchase(pkg)}
                    disabled={funds < pkg.price}
                  >
                    PURCHASE
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

