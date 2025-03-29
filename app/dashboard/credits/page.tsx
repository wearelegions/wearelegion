"use client"

import { useState, useEffect } from "react"
import { Wallet, History } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { AlertModal } from "@/components/alert-modal"
import { TransactionHistoryModal } from "@/components/transaction-history-modal"

type Package = {
  id: string
  name: string
  price: number
  credits: number
  description: string
  bought_by: number
}

type Transaction = {
  id: string
  user_id: string
  package_name: string
  amount: number
  credits: number
  type: 'purchase' | 'usage'
  created_at: string
}

export default function CreditsPage() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<number>(0)
  const [funds, setFunds] = useState<number>(0)
  const [packages, setPackages] = useState<Package[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "" })
  const [showFundsInfo, setShowFundsInfo] = useState(false)
  const [showTransactionHistory, setShowTransactionHistory] = useState(false)

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

        // Fetch transaction history
        const { data: transactionData, error: transactionError } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50)

        if (transactionData && !transactionError) {
          setTransactions(transactionData)
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

    // Subscribe to transactions
    const transactionSubscription = supabase
      .channel('transactions_channel')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user?.id}` },
          payload => {
        if (payload.eventType === 'INSERT') {
          setTransactions(current => [payload.new as Transaction, ...current])
        }
      })
      .subscribe()

    return () => {
      packagesSubscription.unsubscribe()
      transactionSubscription.unsubscribe()
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

    // Add transaction record
    await supabase.from("transactions").insert([{
      user_id: user?.id,
      package_name: pkg.name,
      amount: pkg.price,
      credits: pkg.credits,
      type: 'purchase',
      created_at: new Date().toISOString()
    }])

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
    <div className="space-y-4 sm:space-y-6">
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
      <TransactionHistoryModal
        isOpen={showTransactionHistory}
        onClose={() => setShowTransactionHistory(false)}
        transactions={transactions}
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border border-hacker-primary/30 bg-hacker-terminal">
          <CardHeader className="border-b border-hacker-primary/30 p-4 sm:p-6">
            <CardTitle className="text-hacker-primary font-hack text-base sm:text-lg">Credits Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-2xl sm:text-4xl font-bold text-hacker-primary font-hack">{isLoading ? "..." : credits}</div>
            <p className="text-hacker-primary/70 font-hack text-xs sm:text-sm mt-2">Available credits for hacking operations</p>
          </CardContent>
        </Card>

        <Card className="border border-hacker-primary/30 bg-hacker-terminal">
          <CardHeader className="border-b border-hacker-primary/30 p-4 sm:p-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-hacker-primary font-hack text-base sm:text-lg">Funds Balance</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowTransactionHistory(true)}
                  className="text-hacker-primary hover:text-hacker-primary/80 h-8 w-8 sm:h-10 sm:w-10"
                >
                  <History className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowFundsInfo(true)}
                  className="text-hacker-primary hover:text-hacker-primary/80 h-8 w-8 sm:h-10 sm:w-10"
                >
                  <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-2xl sm:text-4xl font-bold text-hacker-primary font-hack">
              {isLoading ? "..." : formatCurrency(funds)}
            </div>
            <p className="text-hacker-primary/70 font-hack text-xs sm:text-sm mt-2">Available funds for purchasing credits</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-hacker-primary/30 bg-hacker-terminal">
        <CardHeader className="border-b border-hacker-primary/30 p-4 sm:p-6">
          <CardTitle className="text-hacker-primary font-hack text-base sm:text-lg">Available Packages</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-hacker-primary font-hack text-sm sm:text-base">Loading packages...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id || pkg.name}
                  className={`relative border border-hacker-primary/30 rounded-md p-3 sm:p-4 bg-black/50 ${
                    pkg.name === "STARTER PACK" ? "animate-pulse border-hacker-accent" : ""
                  }`}
                >
                  {pkg.name === "STARTER PACK" && (
                    <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 bg-hacker-accent text-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs font-hack animate-pulse">
                      PROMO
                    </div>
                  )}
                  <h3 className={`text-base sm:text-lg font-bold font-hack break-words ${
                    pkg.name === "STARTER PACK" ? "text-hacker-accent" : "text-hacker-primary"
                  }`}>
                    {pkg.name}
                  </h3>
                  <div className="mt-2 text-lg sm:text-xl font-bold text-hacker-primary font-hack">
                    {formatCurrency(pkg.price)}
                  </div>
                  <div className="text-sm sm:text-base text-hacker-primary font-hack">
                    {formatCredits(pkg.credits)} CREDITS
                  </div>
                  <p className="text-[10px] sm:text-xs text-hacker-primary/70 font-hack mt-2">
                    BOUGHT BY {pkg.bought_by.toLocaleString()} USERS
                  </p>
                  <Button
                    className="w-full mt-3 sm:mt-4 bg-hacker-primary hover:bg-hacker-primary/80 text-black font-bold font-hack text-xs sm:text-sm h-8 sm:h-10"
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

