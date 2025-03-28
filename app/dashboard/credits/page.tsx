"use client"

import { useState, useEffect } from "react"
import { Wallet } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { AlertModal } from "@/components/alert-modal"

type Package = {
  id: string
  name: string
  price: number
  credits: number
  description: string
  bought_by: number
}

export default function CreditsPage() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<number>(0)
  const [funds, setFunds] = useState<number>(0)
  const [packages, setPackages] = useState<Package[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "" })
  const [showFundsInfo, setShowFundsInfo] = useState(false)

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
        }

        // Fetch packages with real-time bought_by counts
        const { data: packagesData, error: packagesError } = await supabase
          .from("packages")
          .select("*")
          .order("price")

        if (packagesData && !packagesError) {
          setPackages(packagesData)
        }

        setIsLoading(false)
      }
    }

    fetchUserData()

    // Subscribe to package updates
    const packagesSubscription = supabase
      .channel('packages_channel')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'packages' },
          payload => {
        setPackages(current => 
          current.map(pkg => pkg.id === payload.new.id ? payload.new as Package : pkg)
        )
      })
      .subscribe()

    return () => {
      packagesSubscription.unsubscribe()
    }
  }, [user])

  const handlePurchase = async (pkg: Package) => {
    if (funds < pkg.price) {
      setAlertModal({
        isOpen: true,
        title: "Insufficient Funds",
        message: "Please add funds to your account.",
      })
      return
    }

    const newFunds = funds - pkg.price
    let newCredits = credits

    // Special handling for Hall of Fame Pack
    if (pkg.name === "HALL OF FAME PACK") {
      newCredits += 9999999
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

      setAlertModal({
        isOpen: true,
        title: "Success",
        message: `Successfully purchased ${pkg.name}!`,
      })
    } else {
      console.error("Error purchasing package:", error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: "Failed to purchase package. Please try again.",
      })
    }
  }

  const formatCredits = (amount: number) => {
    return amount.toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }

  return (
    <div className="space-y-6">
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
      />
      <AlertModal
        isOpen={showFundsInfo}
        onClose={() => setShowFundsInfo(false)}
        title="Add Funds"
        message="To add funds for purchasing credits, kindly contact your hacker."
      />
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
            <div className="flex justify-between items-center">
              <CardTitle className="text-hacker-primary font-hack">Funds Balance</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFundsInfo(true)}
                className="text-hacker-primary hover:text-hacker-primary/80"
              >
                <Wallet className="h-5 w-5" />
              </Button>
            </div>
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
                  className={`relative border border-hacker-primary/30 rounded-md p-4 bg-black/50 ${
                    pkg.name === "STARTER PACK" ? "animate-pulse border-hacker-accent" : ""
                  }`}
                >
                  {pkg.name === "STARTER PACK" && (
                    <div className="absolute -top-3 -right-3 bg-hacker-accent text-black px-2 py-1 rounded-md text-xs font-hack animate-pulse">
                      PROMO
                    </div>
                  )}
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
                    {formatCredits(pkg.credits)} CREDITS
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

