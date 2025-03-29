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
  Stealth: 200,
  "Brute-force": 350,
  Grab: 400,
  Steal: 1000,
  Retrieval: 2500,
}

const ADDITIONAL_COSTS: { [key: string]: number } = {
  silentAttack: 100,
  hideIpAddress: 100,
  spamCode: 500,
  spamNotif: 500,
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
  const [isExecuting, setIsExecuting] = useState(false)
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
- Stealth: Silent operation, minimal traces (200 credits)
- Brute-force: Aggressive approach, higher success rate (350 credits)
- Grab: Quick data extraction (400 credits)
- Steal: Complete account takeover (1000 credits)
- Retrieval: Recover lost credentials (2500 credits)
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

  const generateFakeEmail = (): string => {
    return `${formData.name.toLowerCase().replace(/\s+/g, "")}@${formData.accountType.toLowerCase()}.com`
  }

  const generateFakePassword = (): string => {
    return Math.random().toString(36).slice(-10)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsExecuting(true)

    try {
      const platformType = formData.accountType === "Auto Detect" ? detectPlatform(formData.url) : formData.accountType

      // Calculate credits cost early
      const creditsCost = calculateTotalCost(formData.method, {
        silentAttack: formData.silentAttack,
        hideIpAddress: formData.hideIpAddress,
        spamCode: formData.spamCode,
        spamNotif: formData.spamNotif,
      })

      // Check credits and show deduction immediately
      if (credits < creditsCost) {
        addLogEntry(`Error: Insufficient credits. Required: ${creditsCost}, Available: ${credits}`, "error")
        return
      }

      // Show credit deduction immediately
      addLogEntry(`Credits deduction: -${creditsCost} credits`, "info")
      addLogEntry(`Remaining credits: ${credits - creditsCost} credits`, "info")

      // Update credits early
      const newCredits = credits - creditsCost
      setCredits(newCredits)

      // Update database credits early
      if (user) {
        await supabase.from("users").update({ credits: newCredits }).eq("id", user.id)
      }

      if (formData.method === "Stealth" && platformType === "Facebook") {
        addLogEntry("Initializing Facebook Stealth Protocol...", "info")

        const packages = [
          "@fb/core-injection@2.4.1",
          "@stealth/network-trace@1.8.0",
          "@fb/security-bypass@3.1.2",
          "@hack/profile-extractor@4.0.1",
          "@stealth/trace-remover@2.2.0",
          "@fb/cookie-interceptor@1.9.3",
          "@crypto/hash-decoder@5.1.0",
          "@fb/session-handler@2.0.1",
          "@stealth/ip-masker@3.4.2",
          "@fb/auth-bypass@4.1.0",
          "@hack/request-interceptor@2.8.1",
          "@stealth/packet-analyzer@1.7.3",
          "@fb/token-extractor@3.2.1",
          "@hack/browser-emulator@4.3.0",
          "@fb/2fa-bypass@2.1.4",
        ]

        // Simulate longer installation process
        for (const pkg of packages) {
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000))
          addLogEntry(`Installing ${pkg}...`, "command")
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500))
          addLogEntry(`Resolving dependencies for ${pkg}...`, "info")
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 1500 + 800))
          addLogEntry(`Fetching package data...`, "info")
        }

        await new Promise((resolve) => setTimeout(resolve, 3000))
        addLogEntry("All packages for stealth mode installed successfully", "success")

        await new Promise((resolve) => setTimeout(resolve, 2000))
        addLogEntry("Processing packages...", "info")
        await new Promise((resolve) => setTimeout(resolve, 4000))
        addLogEntry("Initializing stealth sequence...", "info")
        await new Promise((resolve) => setTimeout(resolve, 3000))

        addLogEntry(
          `
IMPORTANT: Account Recovery Instructions

If you suspect your Facebook account has been compromised, follow these steps immediately:

1. Access Recovery Page:
   - Use a device that you frequently use to access Facebook
   - Visit https://facebook.com/hacked from this trusted device
   - This helps Facebook recognize your regular IP address

2. Initial Steps:
   - Click on "My Account Is Compromised"
   - Enter the email address or phone number associated with your account
   - Use the most recent email/phone that was linked to your account

3. Security Checkpoints:
   - Verify your identity using a trusted device
   - Facebook may ask for a government-issued ID
   - Previous login locations will be checked against your current one

4. Password Reset:
   - Create a strong, unique password
   - Use a combination of letters, numbers, and symbols
   - Avoid using personal information in your password

5. Additional Security Measures:
   - Enable two-factor authentication immediately
   - Review and remove any suspicious login locations
   - Check and revoke access from unknown devices
   - Update your email recovery options

6. Post-Recovery Steps:
   - Change passwords for other accounts using the same password
   - Check if any posts were made without your consent
   - Review and update your privacy settings
   - Monitor your account for any unusual activity

IMPORTANT: 
- Act quickly - the first 24 hours are crucial
- Use a device that you've previously logged in with
- Keep your recovery email secure
- Don't share recovery codes with anyone
- Enable login alerts for future security

For additional support, visit: https://facebook.com/help/security
        `,
          "info",
        )

        const fakeEmail = generateFakeEmail()
        const fakePassword = generateFakePassword()

        await supabase.from("hacked_accounts").insert([
          {
            user_id: user?.id,
            account_name: formData.name,
            account_email: fakeEmail,
            account_password: fakePassword,
            account_type: formData.accountType === "Auto Detect" ? detectPlatform(formData.url) : formData.accountType,
            execute_method: formData.method,
            date_executed: new Date().toISOString(),
            credits_used: creditsCost,
          },
        ])

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
      } else if (formData.method === "Grab") {
        addLogEntry("Initializing Grabber Protocol...", "info")

        // Simulate package installation
        const packages = [
          "@grabber/core@1.0.0",
          "@grabber/credentials-extractor@2.1.0",
          "@grabber/network-tools@1.5.0",
        ]

        // Install packages
        addLogEntry("Installing required packages...", "info")
        for (const pkg of packages) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          addLogEntry(`pnpm install ${pkg}`, "command")
          await new Promise((resolve) => setTimeout(resolve, 500))
          addLogEntry(`✓ Installed ${pkg}`, "success")
        }

        // Extract username from URL
        const url = new URL(formData.url)
        const username = url.pathname.split("/").pop() || "user"

        // Generate random password
        const password = Math.random().toString(36).slice(-12)

        addLogEntry(`[+] Credentials extracted successfully!`, "success")
        addLogEntry(
          `
LOGIN:
USERNAME: ${username}
PASSWORD: ${password}`,
          "success",
        )

        // Save to database
        if (user) {
          await supabase.from("hacked_accounts").insert([
            {
              user_id: user.id,
              account_name: formData.name,
              account_email: username,
              account_password: password,
              account_type: platformType,
              execute_method: formData.method,
              date_executed: new Date().toISOString(),
              credits_used: creditsCost,
            },
          ])
        }

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
      } else {
        handleExecute(creditsCost)
      }
    } catch (error) {
      addLogEntry("[!] Error during execution", "error")
      console.error(error)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleExecute = async (creditsCost: number) => {
    if (!formData.name || !formData.url) {
      addLogEntry("Error: NAME and URL are required fields", "error")
      return
    }

    addLogEntry(`Executing ${formData.method} attack on ${formData.name} (${formData.url})...`, "info")

    try {
      // Fetch wordlist.txt
      const response = await fetch("/wordlist.txt")
      const text = await response.text()
      const passwords = text.split("\n").filter((line) => line && !line.startsWith("//"))

      addLogEntry(`[*] Loaded ${passwords.length} passwords from wordlist`, "info")
      addLogEntry(`[*] Starting brute force attack...`, "info")

      let counter = 0
      // Generate a random successful password from the list
      const successPass = passwords[Math.floor(Math.random() * passwords.length)]

      for (const pass of passwords) {
        counter++
        const cleanPass = pass.trim()
        if (!cleanPass) continue

        await new Promise((resolve) => setTimeout(resolve, 50))
        addLogEntry(`[*] Attempt ${counter}/${passwords.length}: Testing ${cleanPass}`, "info")

        if (cleanPass === successPass) {
          addLogEntry(`[+] PASSWORD FOUND! ${cleanPass}`, "success")
          addLogEntry(
            `
LOGIN:
USERNAME: ${formData.name.toLowerCase().replace(/\s+/g, "")}
PASSWORD: ${cleanPass}`,
            "success",
          )

          if (user) {
            await supabase.from("hacked_accounts").insert([
              {
                user_id: user.id,
                account_name: formData.name,
                account_email: formData.name.toLowerCase().replace(/\s+/g, ""),
                account_password: cleanPass,
                account_type: formData.accountType === "Auto Detect" ? detectPlatform(formData.url) : formData.accountType,
                execute_method: formData.method,
                date_executed: new Date().toISOString(),
                credits_used: creditsCost,
              },
            ])
          }

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

          break
        }

        // Show progress every 100 attempts
        if (counter % 100 === 0) {
          const progress = ((counter / passwords.length) * 100).toFixed(2)
          addLogEntry(`[*] Progress: ${progress}%`, "info")
        }
      }
    } catch (error) {
      addLogEntry("[!] Error loading wordlist", "error")
      console.error(error)
    }
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

          <div className="space-y-2"></div>
          <Label htmlFor="url" className="text-hacker-primary font-hack">
            URL
          </Label>
          <Input
            id="url"
            value={formData.url}
            onChange={(e) => handleFormChange("url", e.target.value)}
            className="bg-black border-hacker-primary/50 text-hacker-primary font-hack"
          />

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
            onClick={handleFormSubmit}
            disabled={isExecuting}
            className="w-full bg-hacker-primary hover:bg-hacker-primary/80 text-black font-bold font-hack"
          >
            {isExecuting ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                EXECUTING...
              </div>
            ) : (
              "EXECUTE"
            )}
          </Button>

          <div className="text-xs text-hacker-primary/70 font-hack text-right">Available Credits: {credits}</div>
        </CardContent>
      </Card>
    </div>
  )
}

