"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LayoutDashboard, Database, CreditCard, Settings, Menu, Bell, User, LogOut } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { NotificationsContent } from "@/components/notifications-menu"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [navCollapsed, setNavCollapsed] = useState(false)
  const { user, isLoading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-hacker-background">
        <div className="w-64 bg-hacker-terminal border-r border-hacker-primary/30">
          <Skeleton className="h-8 w-32 m-4 bg-hacker-primary/20" />
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full bg-hacker-primary/20" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <Skeleton className="h-16 w-full bg-hacker-primary/20" />
          <div className="p-6">
            <Skeleton className="h-64 w-full bg-hacker-primary/20" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-hacker-background">
      {/* Navigation Sidebar */}
      <div
        className={`${
          navCollapsed ? "w-16" : "w-64"
        } bg-hacker-terminal border-r border-hacker-primary/30 transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-hacker-primary/30">
          {!navCollapsed && <h2 className="text-hacker-primary font-bold font-hack text-lg">LEGION</h2>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNavCollapsed(!navCollapsed)}
            className="text-hacker-primary hover:text-hacker-accent hover:bg-transparent"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 p-2">
          <ul className="space-y-1">
            <li>
              <Link
                href="/dashboard"
                className="flex items-center p-2 rounded-md text-hacker-primary hover:bg-hacker-primary/10 hover:text-hacker-accent"
              >
                <LayoutDashboard className="h-5 w-5 mr-2" />
                {!navCollapsed && <span className="font-hack">DASHBOARD</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/hacking-pockets"
                className="flex items-center p-2 rounded-md text-hacker-primary hover:bg-hacker-primary/10 hover:text-hacker-accent"
              >
                <Database className="h-5 w-5 mr-2" />
                {!navCollapsed && <span className="font-hack">HACKING POCKETS</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/account-storage"
                className="flex items-center p-2 rounded-md text-hacker-primary hover:bg-hacker-primary/10 hover:text-hacker-accent"
              >
                <Database className="h-5 w-5 mr-2" />
                {!navCollapsed && <span className="font-hack">ACCOUNT STORAGE</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/credits"
                className="flex items-center p-2 rounded-md text-hacker-primary hover:bg-hacker-primary/10 hover:text-hacker-accent"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                {!navCollapsed && <span className="font-hack">CREDITS</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settings"
                className="flex items-center p-2 rounded-md text-hacker-primary hover:bg-hacker-primary/10 hover:text-hacker-accent"
              >
                <Settings className="h-5 w-5 mr-2" />
                {!navCollapsed && <span className="font-hack">SETTINGS</span>}
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-2 border-t border-hacker-primary/30">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full p-2 rounded-md text-hacker-primary hover:bg-hacker-primary/10 hover:text-hacker-accent"
          >
            <LogOut className="h-5 w-5 mr-2" />
            {!navCollapsed && <span className="font-hack">LOGOUT</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-hacker-terminal border-b border-hacker-primary/30 p-4">
          <div className="flex justify-between items-center">
            <div className="max-w-2xl overflow-hidden">
              {/* Remove the promo banner since it's now in notifications */}
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-hacker-primary hover:text-hacker-accent hover:bg-transparent relative"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-80 bg-hacker-terminal border-hacker-primary/30 p-0"
                  align="end"
                  sideOffset={8}
                >
                  <NotificationsContent />
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-hacker-primary hover:text-hacker-accent hover:bg-transparent"
                >
                  <User className="h-5 w-5" />
                </Button>
                <span className="text-hacker-primary font-hack text-sm ml-2">
                  {user?.email?.split("@")[0] || "USER"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>

        {/* Footer */}
        <footer className="bg-hacker-terminal border-t border-hacker-primary/30 p-4 text-center">          <p className="text-hacker-primary font-hack text-sm hacker-text-animation">            WE ARE LEGION. WE DO NOT FORGIVE. WE DO NOT FORGET. EXPECT US.
          </p>
        </footer>
      </div>
    </div>
  )
}

