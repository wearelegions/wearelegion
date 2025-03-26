"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Pencil, Trash2, Save, X } from "lucide-react"
import { supabase } from "@/lib/supabase"

type StoredAccount = {
  id: string
  name: string
  username: string
  password: string
  notes: string
}

export default function AccountStoragePage() {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<StoredAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    notes: "",
  })

  useEffect(() => {
    const fetchAccounts = async () => {
      if (user) {
        setIsLoading(true)
        const { data, error } = await supabase.from("account_storage").select("*").eq("user_id", user.id).order("name")

        if (data && !error) {
          setAccounts(data)
        } else {
          console.error("Error fetching accounts:", error)
        }
        setIsLoading(false)
      }
    }

    fetchAccounts()
  }, [user])

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAdd = async () => {
    if (!formData.name || !formData.username || !formData.password) {
      alert("Name, username, and password are required")
      return
    }

    if (user) {
      const { data, error } = await supabase
        .from("account_storage")
        .insert([
          {
            user_id: user.id,
            name: formData.name,
            username: formData.username,
            password: formData.password,
            notes: formData.notes,
          },
        ])
        .select()

      if (data && !error) {
        setAccounts((prev) => [...prev, data[0]])
        setFormData({ name: "", username: "", password: "", notes: "" })
        setIsAdding(false)
      } else {
        console.error("Error adding account:", error)
      }
    }
  }

  const handleEdit = (account: StoredAccount) => {
    setFormData({
      name: account.name,
      username: account.username,
      password: account.password,
      notes: account.notes,
    })
    setEditingId(account.id)
  }

  const handleUpdate = async () => {
    if (!editingId) return

    if (!formData.name || !formData.username || !formData.password) {
      alert("Name, username, and password are required")
      return
    }

    const { error } = await supabase
      .from("account_storage")
      .update({
        name: formData.name,
        username: formData.username,
        password: formData.password,
        notes: formData.notes,
      })
      .eq("id", editingId)

    if (!error) {
      setAccounts((prev) => prev.map((account) => (account.id === editingId ? { ...account, ...formData } : account)))
      setFormData({ name: "", username: "", password: "", notes: "" })
      setEditingId(null)
    } else {
      console.error("Error updating account:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this account?")) {
      const { error } = await supabase.from("account_storage").delete().eq("id", id)

      if (!error) {
        setAccounts((prev) => prev.filter((account) => account.id !== id))
      } else {
        console.error("Error deleting account:", error)
      }
    }
  }

  const handleCancel = () => {
    setFormData({ name: "", username: "", password: "", notes: "" })
    setIsAdding(false)
    setEditingId(null)
  }

  return (
    <div>
      <Card className="border border-hacker-primary/30 bg-hacker-terminal">
        <CardHeader className="border-b border-hacker-primary/30 flex flex-row justify-between items-center">
          <CardTitle className="text-hacker-primary font-hack">Account Storage</CardTitle>
          {!isAdding && !editingId && (
            <Button
              variant="outline"
              size="sm"
              className="border-hacker-primary/50 text-hacker-primary hover:bg-hacker-primary/10"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> ADD
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-hacker-primary font-hack">Loading accounts...</p>
            </div>
          ) : (
            <>
              {(isAdding || editingId) && (
                <div className="border border-hacker-primary/30 rounded-md p-4 bg-black/50 mb-6">
                  <h3 className="text-hacker-primary font-hack mb-4">
                    {isAdding ? "Add New Account" : "Edit Account"}
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-hacker-primary font-hack">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                        className="bg-black border-hacker-primary/50 text-hacker-primary font-hack"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-hacker-primary font-hack">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleFormChange("username", e.target.value)}
                        className="bg-black border-hacker-primary/50 text-hacker-primary font-hack"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-hacker-primary font-hack">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleFormChange("password", e.target.value)}
                        className="bg-black border-hacker-primary/50 text-hacker-primary font-hack"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-hacker-primary font-hack">
                        Notes
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleFormChange("notes", e.target.value)}
                        className="bg-black border-hacker-primary/50 text-hacker-primary font-hack min-h-[100px]"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        className="border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={handleCancel}
                      >
                        <X className="h-4 w-4 mr-2" /> CANCEL
                      </Button>
                      <Button
                        className="bg-hacker-primary hover:bg-hacker-primary/80 text-black font-bold font-hack"
                        onClick={isAdding ? handleAdd : handleUpdate}
                      >
                        <Save className="h-4 w-4 mr-2" /> {isAdding ? "SAVE" : "UPDATE"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {accounts.length === 0 && !isAdding ? (
                <div className="text-center py-8">
                  <p className="text-hacker-primary font-hack">No accounts stored.</p>
                  <p className="text-hacker-primary/70 font-hack text-sm mt-2">
                    Click the ADD button to store your first account.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account.id} className="border border-hacker-primary/30 rounded-md p-4 bg-black/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-hacker-primary font-hack">{account.name}</h3>
                          <p className="text-hacker-primary/70 font-hack text-xs">Username: {account.username}</p>
                          <p className="text-hacker-primary/70 font-hack text-xs">Password: ••••••••</p>
                          {account.notes && (
                            <p className="text-hacker-primary/70 font-hack text-xs mt-2">Notes: {account.notes}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-hacker-primary/50 text-hacker-primary hover:bg-hacker-primary/10"
                            onClick={() => handleEdit(account)}
                            disabled={isAdding || !!editingId}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-destructive/50 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(account.id)}
                            disabled={isAdding || !!editingId}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

