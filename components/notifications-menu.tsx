import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell } from "lucide-react"
import { NewsModal } from "./news-modal"
import { ScrollArea } from "@/components/ui/scroll-area"

type Notification = {
  id: string
  title: string
  content: string
  date: string
  isPromo?: boolean
}

export function NotificationsContent() {
  const [showNewsModal, setShowNewsModal] = React.useState(false)
  const [selectedNews, setSelectedNews] = React.useState<Notification | null>(null)
  
  const notifications: Notification[] = [
    {
      id: "1",
      title: "Limited Time Offer!",
      content: `🎉 SPECIAL PROMO ALERT! 🎉

GREAT NEWS! THE ELITE PACK IS AFFORDABLE AS ₱6,999.99!

⚠️ Regular Price: ₱9,999.99
🔥 Promo Price: ₱6,999.99
⏰ Offer Ends: April 5, 2025

Don't miss this incredible opportunity! Get started with your hacking journey at a fraction of the cost.

GRAB IT NOW before the price reverts back to ₱9,999.00!

Note: This is a limited-time offer and will not be extended.`,
      date: "2024-03-28",
      isPromo: true
    },
    {
      id: "2",
      title: "Important Security Update",
      content: `LEGION SECURITY BULLETIN

We've detected increased security measures across major platforms.
Please note the following updates:

1. Enhanced Stealth Mode
- Improved trace removal
- Better IP masking
- Reduced detection rates

2. New Security Bypass Methods
- Updated core injection techniques
- Enhanced cookie interceptors
- Improved 2FA handling

3. Important Reminders
- Always use trusted devices
- Enable additional security features
- Monitor your execution logs

Stay secure, stay undetected.
- Legion Security Team`,
      date: "2024-03-14"
    }
  ]

  return (
    <>
      <div className="px-4 py-3 border-b border-hacker-primary/30">
        <h3 className="font-hack text-sm font-medium text-hacker-primary">Notifications</h3>
      </div>
      <ScrollArea className="h-[300px]">
        <div className="px-2 py-2">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              className="w-full p-3 text-left rounded-md hover:bg-hacker-primary/10 transition-colors"
              onClick={() => {
                setSelectedNews(notif)
                setShowNewsModal(true)
              }}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-hack text-sm ${notif.isPromo ? 'text-green-400' : 'text-hacker-primary'}`}>
                      {notif.title}
                    </h4>
                    {notif.isPromo && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-hack bg-green-500/20 text-green-400">
                        PROMO
                      </span>
                    )}
                  </div>
                  <p className="text-hacker-primary/70 text-xs line-clamp-2 font-hack mt-1">
                    {notif.content.split('\n')[0]}
                  </p>
                  <span className="text-hacker-primary/50 text-[10px] font-hack mt-1 block">
                    {new Date(notif.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>

      <NewsModal
        isOpen={showNewsModal}
        onClose={() => setShowNewsModal(false)}
        news={selectedNews || notifications[0]}
      />
    </>
  )
}
