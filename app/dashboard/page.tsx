"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

const SUPPORTED_PLATFORMS: { [key: string]: string } = {
  "facebook.com": "Facebook",
  "instagram.com": "Instagram",
  "twitter.com": "Twitter",
  "x.com": "Twitter",
  "gmail.com": "Gmail",
  "mail.google.com": "Gmail",
  "youtube.com": "YouTube",
  "viber.com": "Viber",
  "telegram.org": "Telegram",
  "t.me": "Telegram",
  "linkedin.com": "LinkedIn",
  "bybit.com": "Bybit",
}

const METHOD_COSTS: { [key: string]: number } = {
  Stealth: 150,
  "Brute-force": 190,
  Grab: 200,
  Steal: 560,
  Retrieval: 150,
}

const ADDITIONAL_COSTS: { [key: string]: number } = {
  silentAttack: 100,
  hideIpAddress: 80,
  spamCode: 100,
  spamNotif: 100,
}

type LogEntry = {
  id: string
  timestamp: string
  message: string
  type: "info" | "success" | "error" | "command"
}

export default function DashboardPage() {
  const { signOut, user } = useAuth()
  const router = useRouter()
  const [terminalInput, setTerminalInput] = useState("")
  const [terminalHistory, setTerminalHistory] = useState<LogEntry[]>([
    {
      id: "1",
      timestamp: new Date().toISOString(),
      message: 'Welcome to the Legion Terminal. Type "help" for available commands.',
      type: "info",
    },
  ])
  const [credits, setCredits] = useState<number>(0)
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    accountType: "Auto Detect",
    method: "Stealth",
    silentAttack: false,
    hideIpAddress: false,
    spamCode: false,
    spamNotif: false,
  })
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom of terminal when history changes
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }

    // Fetch user credits
    const fetchCredits = async () => {
      if (user) {
        const { data, error } = await supabase.from("users").select("credits").eq("id", user.id).single()

        if (data && !error) {
          setCredits(data.credits)
        } else {
          // If no user record exists, create one with default credits
          await supabase
            .from("users")
            .insert([{ id: user.id, user_index: user.email?.split("@")[0], credits: 0, funds: 0 }])
          setCredits(0)
        }
      }
    }

    fetchCredits()
  }, [terminalHistory, user])

  const addLogEntry = (message: string, type: "info" | "success" | "error" | "command" = "info") => {
    const newEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Ensure unique IDs
      timestamp: new Date().toISOString(),
      message,
      type,
    }
    setTerminalHistory((prev) => [...prev, newEntry])
  }

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!terminalInput.trim()) return

    // Add the command to the terminal history
    addLogEntry(`$zsh: ${terminalInput}`, "command")

    // Process the command
    processCommand(terminalInput)

    // Clear the input
    setTerminalInput("")
  }

  const processCommand = (command: string) => {
    const cmd = command.trim().toLowerCase()

    if (cmd === "help") {
      addLogEntry(
        `
Available commands:
- logout: Logs out and clears session
- psx: Shows available hacking methods
- goclue [url]: Extracts clues for hacking from URL
- summit: Locks the account for focused targeting
- sumout: Unlocks the account from focused targeting
- gxr: Shows remaining credit balance
- clean --force: Clears the terminal
      `,
        "info",
      )
    } else if (cmd === "logout") {
      addLogEntry("Logging out...", "info")
      setTimeout(() => {
        signOut()
        router.push("/login")
      }, 1000)
    } else if (cmd === "psx") {
      addLogEntry(
        `
Available hacking methods:
- Stealth: Silent operation, minimal traces (150 credits)
- Brute-force: Aggressive approach, higher success rate (190 credits)
- Grab: Quick data extraction (200 credits)
- Steal: Complete account takeover (500 credits)
- Retrieval: Recover lost credentials (150 credits)
      `,
        "info",
      )
    } else if (cmd.startsWith("goclue ")) {
      const url = cmd.substring(7).trim()
      if (url) {
        addLogEntry(`Analyzing ${url} for clues...`, "info")
        setTimeout(() => {
          addLogEntry(
            `
Clues extracted from ${url}:
- Platform: ${detectPlatform(url)}
- Security level: Medium
- Estimated success rate: 78%
- Recommended method: Stealth
          `,
            "success",
          )
        }, 1500)
      } else {
        addLogEntry("Error: URL parameter required", "error")
      }
    } else if (cmd === "summit") {
      addLogEntry("Account locked for focused targeting. Use the form to execute.", "success")
    } else if (cmd === "sumout") {
      addLogEntry("Account unlocked from focused targeting.", "info")
    } else if (cmd === "gxr") {
      addLogEntry(`Current credit balance: ${credits} credits`, "info")
    } else if (cmd === "clean --force") {
      setTerminalHistory([
        {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          message: 'Terminal cleared. Type "help" for available commands.',
          type: "info",
        },
      ])
    } else {
      addLogEntry(`Command not recognized: ${command}`, "error")
    }
  }

  const detectPlatform = (url: string): string => {
    url = url.toLowerCase()
    for (const platform in SUPPORTED_PLATFORMS) {
      if (url.includes(platform)) return SUPPORTED_PLATFORMS[platform]
    }
    return "Unknown"
  }

  const validateUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url)
      const domain = parsedUrl.hostname.toLowerCase()
      return Object.keys(SUPPORTED_PLATFORMS).some((platform) => domain.includes(platform))
    } catch {
      return false
    }
  }

  const handleFormChange = (field: string, value: any) => {
    if (field === "url") {
      if (value && !validateUrl(value)) {
        addLogEntry("Warning: URL not supported or invalid", "error")
        setFormData((prev) => ({
          ...prev,
          [field]: value,
          accountType: "Auto Detect",
        }))
        return
      }

      const platform = detectPlatform(value)
      setFormData((prev) => ({
        ...prev,
        [field]: value,
        accountType: platform !== "Unknown" ? platform : "Auto Detect",
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const calculateTotalCost = (method: string, options: any): number => {
    let total = METHOD_COSTS[method] || 0
    Object.entries(options).forEach(([key, enabled]) => {
      if (enabled && ADDITIONAL_COSTS[key]) {
        total += ADDITIONAL_COSTS[key]
      }
    })
    return total
  }

  const canAffordMethod = (method: string, options: any): boolean => {
    return credits >= calculateTotalCost(method, options)
  }

  const handleExecute = async () => {
    // Validate form
    if (!formData.name || !formData.url) {
      addLogEntry("Error: NAME and URL are required fields", "error")
      return
    }

    // Calculate credits cost
    const creditsCost = calculateTotalCost(formData.method, {
      silentAttack: formData.silentAttack,
      hideIpAddress: formData.hideIpAddress,
      spamCode: formData.spamCode,
      spamNotif: formData.spamNotif,
    })

    // Check if user has enough credits
    if (credits < creditsCost) {
      addLogEntry(`Error: Insufficient credits. Required: ${creditsCost}, Available: ${credits}`, "error")
      return
    }

    // Start execution
    addLogEntry(`Executing ${formData.method} attack on ${formData.name} (${formData.url})...`, "info")

    // Simulate progress
    setTimeout(() => {
      addLogEntry("Initializing connection...", "info")
    }, 500)

    setTimeout(() => {
      addLogEntry("Bypassing security measures...", "info")
    }, 1500)

    setTimeout(() => {
      addLogEntry("Extracting account information...", "info")
    }, 2500)

    setTimeout(async () => {
      // Generate fake credentials
      const fakeEmail = `${formData.name.toLowerCase().replace(/\s+/g, "")}@${formData.accountType.toLowerCase()}.com`
      const fakePassword = Math.random().toString(36).slice(-10)

      addLogEntry(
        `
Attack successful! Account credentials:
- Email: ${fakeEmail}
- Password: ${fakePassword}
      `,
        "success",
      )

      // Deduct credits
      const newCredits = credits - creditsCost
      setCredits(newCredits)

      // Update credits in database
      if (user) {
        await supabase.from("users").update({ credits: newCredits }).eq("id", user.id)

        // Save hacked account to database
        await supabase.from("hacked_accounts").insert([
          {
            user_id: user.id,
            account_name: formData.name,
            account_email: fakeEmail,
            account_password: fakePassword,
            account_type: formData.accountType === "Auto Detect" ? detectPlatform(formData.url) : formData.accountType,
            execute_method: formData.method,
            date_executed: new Date().toISOString(),
            credits_used: creditsCost,
          },
        ])
      }

      // Reset form
      setFormData({
        name: "",
        url: "",
        accountType: "Auto Detect",
        method: "Stealth",
        silentAttack: false,
        hideIpAddress: false,
        spamCode: false,
        spamNotif: false,
      })
    }, 4000)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Terminal Interface */}
      <Card className="border border-hacker-primary/30 bg-hacker-terminal">
        <CardHeader className="border-b border-hacker-primary/30">
          <CardTitle className="text-hacker-primary font-hack">Terminal Interface</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div
            ref={terminalRef}
            className="h-[400px] overflow-y-auto p-4 font-hack text-sm"
            style={{ backgroundColor: "#121212" }}
          >
            {terminalHistory.map((entry) => (
              <div key={entry.id} className="mb-2">
                <span
                  className={`
                    ${entry.type === "info" ? "text-hacker-primary" : ""}
                    ${entry.type === "success" ? "text-green-500" : ""}
                    ${entry.type === "error" ? "text-red-500" : ""}
                    ${entry.type === "command" ? "text-yellow-500" : ""}
                  `}
                >
                  {entry.message}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleTerminalSubmit} className="border-t border-hacker-primary/30 p-4 flex">
            <span className="text-hacker-primary font-hack mr-2">$zsh:</span>
            <Input
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              className="flex-1 bg-transparent border-none text-hacker-primary font-hack focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Type a command..."
            />
          </form>
        </CardContent>
      </Card>

      {/* Hacking Form */}
      <Card className="border border-hacker-primary/30 bg-hacker-terminal">
        <CardHeader className="border-b border-hacker-primary/30">
          <CardTitle className="text-hacker-primary font-hack">EXECUTION FORM</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-hacker-primary font-hack">
              NAME
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              className="bg-black border-hacker-primary/50 text-hacker-primary font-hack"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url" className="text-hacker-primary font-hack">
              URL
            </Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => handleFormChange("url", e.target.value)}
              className="bg-black border-hacker-primary/50 text-hacker-primary font-hack"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType" className="text-hacker-primary font-hack">
              ACCOUNT TYPE
            </Label>
            <Select value={formData.accountType} onValueChange={(value) => handleFormChange("accountType", value)}>
              <SelectTrigger className="bg-black border-hacker-primary/50 text-hacker-primary font-hack">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent className="bg-hacker-terminal border-hacker-primary/50">
                <SelectItem value="Auto Detect" className="text-hacker-primary font-hack">
                  Auto Detect
                </SelectItem>
                <SelectItem value="Facebook" className="text-hacker-primary font-hack">
                  Facebook
                </SelectItem>
                <SelectItem value="Instagram" className="text-hacker-primary font-hack">
                  Instagram
                </SelectItem>
                <SelectItem value="Twitter" className="text-hacker-primary font-hack">
                  Twitter
                </SelectItem>
                <SelectItem value="Gmail" className="text-hacker-primary font-hack">
                  Gmail
                </SelectItem>
                <SelectItem value="YouTube" className="text-hacker-primary font-hack">
                  YouTube
                </SelectItem>
                <SelectItem value="Viber" className="text-hacker-primary font-hack">
                  Viber
                </SelectItem>
                <SelectItem value="Telegram" className="text-hacker-primary font-hack">
                  Telegram
                </SelectItem>
                <SelectItem value="LinkedIn" className="text-hacker-primary font-hack">
                  LinkedIn
                </SelectItem>
                <SelectItem value="Bybit" className="text-hacker-primary font-hack">
                  Bybit
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method" className="text-hacker-primary font-hack">
              METHOD
            </Label>
            <Select
              value={formData.method}
              onValueChange={(value) => handleFormChange("method", value)}
              disabled={credits === 0}
            >
              <SelectTrigger className="bg-black border-hacker-primary/50 text-hacker-primary font-hack">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent className="bg-hacker-terminal border-hacker-primary/50">
                {Object.entries(METHOD_COSTS).map(([method, cost]) => (
                  <SelectItem
                    key={method}
                    value={method}
                    className="text-hacker-primary font-hack"
                    disabled={!canAffordMethod(method, {
                      silentAttack: formData.silentAttack,
                      hideIpAddress: formData.hideIpAddress,
                      spamCode: formData.spamCode,
                      spamNotif: formData.spamNotif,
                    })}
                  >
                    {method} ({cost} credits)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="silentAttack"
                checked={formData.silentAttack}
                disabled={credits < ADDITIONAL_COSTS.silentAttack || credits === 0}
                onCheckedChange={(checked) => handleFormChange("silentAttack", checked)}
              />
              <Label htmlFor="silentAttack" className="text-hacker-primary font-hack">
                Silent Attack ({ADDITIONAL_COSTS.silentAttack} credits)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hideIpAddress"
                checked={formData.hideIpAddress}
                disabled={credits < ADDITIONAL_COSTS.hideIpAddress || credits === 0}
                onCheckedChange={(checked) => handleFormChange("hideIpAddress", checked)}
              />
              <Label htmlFor="hideIpAddress" className="text-hacker-primary font-hack">
                Hide IP Address ({ADDITIONAL_COSTS.hideIpAddress} credits)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="spamCode"
                checked={formData.spamCode}
                disabled={credits < ADDITIONAL_COSTS.spamCode || credits === 0}
                onCheckedChange={(checked) => handleFormChange("spamCode", checked)}
              />
              <Label htmlFor="spamCode" className="text-hacker-primary font-hack">
                Spam Code ({ADDITIONAL_COSTS.spamCode} credits)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="spamNotif"
                checked={formData.spamNotif}
                disabled={credits < ADDITIONAL_COSTS.spamNotif || credits === 0}
                onCheckedChange={(checked) => handleFormChange("spamNotif", checked)}
              />
              <Label htmlFor="spamNotif" className="text-hacker-primary font-hack">
                Spam Notif ({ADDITIONAL_COSTS.spamNotif} credits)
              </Label>
            </div>
          </div>

          <Button
            onClick={handleExecute}
            className="w-full bg-hacker-primary hover:bg-hacker-primary/80 text-black font-bold font-hack"
          >
            EXECUTE
          </Button>

          <div className="text-xs text-hacker-primary/70 font-hack text-right">Available Credits: {credits}</div>
        </CardContent>
      </Card>
    </div>
  )
}

