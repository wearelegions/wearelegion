"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

type HackedAccount = {
  id: string
  account_name: string
  account_email: string
  account_password: string
  account_type: string
  execute_method: string
  date_executed: string
  credits_used: number
}

export default function HackingPocketsPage() {
  const { user } = useAuth()
  const [hackedAccounts, setHackedAccounts] = useState<HackedAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAccount, setSelectedAccount] = useState<HackedAccount | null>(null)

  useEffect(() => {
    const fetchHackedAccounts = async () => {
      if (user) {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("hacked_accounts")
          .select("*")
          .eq("user_id", user.id)
          .order("date_executed", { ascending: false })

        if (data && !error) {
          setHackedAccounts(data)
        } else {
          console.error("Error fetching hacked accounts:", error)
        }
        setIsLoading(false)
      }
    }

    fetchHackedAccounts()
  }, [user])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this account?")) {
      const { error } = await supabase.from("hacked_accounts").delete().eq("id", id)

      if (!error) {
        setHackedAccounts((prev) => prev.filter((account) => account.id !== id))
      } else {
        console.error("Error deleting account:", error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString()
  }

  return (
    <div>
      <Card className="border border-hacker-primary/30 bg-hacker-terminal">
        <CardHeader className="border-b border-hacker-primary/30">
          <CardTitle className="text-hacker-primary font-hack">Hacking Pockets</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-hacker-primary font-hack">Loading hacked accounts...</p>
            </div>
          ) : hackedAccounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-hacker-primary font-hack">No hacked accounts found.</p>
              <p className="text-hacker-primary/70 font-hack text-sm mt-2">
                Use the dashboard to hack accounts and they will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {hackedAccounts.map((account) => (
                <div key={account.id} className="border border-hacker-primary/30 rounded-md p-4 bg-black/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-hacker-primary font-hack">{account.account_name}</h3>
                      <p className="text-hacker-primary/70 font-hack text-xs">
                        Type: {account.account_type} | Method: {account.execute_method}
                      </p>
                      <p className="text-hacker-primary/70 font-hack text-xs">
                        Date: {formatDate(account.date_executed)}
                      </p>
                      <p className="text-hacker-primary/70 font-hack text-xs">Credits: {account.credits_used}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-hacker-primary/50 text-hacker-primary hover:bg-hacker-primary/10"
                            onClick={() => setSelectedAccount(account)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-hacker-terminal border border-hacker-primary/30">
                          <DialogHeader>
                            <DialogTitle className="text-hacker-primary font-hack">Account Details</DialogTitle>
                          </DialogHeader>
                          {selectedAccount && (
                            <div className="space-y-4 p-4 bg-black/50 rounded-md">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-hacker-primary/70 font-hack text-sm">Account Name:</div>
                                <div className="text-hacker-primary font-hack text-sm">
                                  {selectedAccount.account_name}
                                </div>

                                <div className="text-hacker-primary/70 font-hack text-sm">Account Email:</div>
                                <div className="text-hacker-primary font-hack text-sm">
                                  {selectedAccount.account_email}
                                </div>

                                <div className="text-hacker-primary/70 font-hack text-sm">Account Password:</div>
                                <div className="text-hacker-primary font-hack text-sm">
                                  {selectedAccount.account_password}
                                </div>

                                <div className="text-hacker-primary/70 font-hack text-sm">Account Type:</div>
                                <div className="text-hacker-primary font-hack text-sm">
                                  {selectedAccount.account_type}
                                </div>

                                <div className="text-hacker-primary/70 font-hack text-sm">Execute Method:</div>
                                <div className="text-hacker-primary font-hack text-sm">
                                  {selectedAccount.execute_method}
                                </div>

                                <div className="text-hacker-primary/70 font-hack text-sm">Date Executed:</div>
                                <div className="text-hacker-primary font-hack text-sm">
                                  {formatDate(selectedAccount.date_executed)}
                                </div>

                                <div className="text-hacker-primary/70 font-hack text-sm">Credits Used:</div>
                                <div className="text-hacker-primary font-hack text-sm">
                                  {selectedAccount.credits_used}
                                </div>
                              </div>
                            </div>
                          )}
                          <DialogClose asChild>
                            <Button className="bg-hacker-primary hover:bg-hacker-primary/80 text-black font-bold font-hack">
                              CLOSE
                            </Button>
                          </DialogClose>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="icon"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

