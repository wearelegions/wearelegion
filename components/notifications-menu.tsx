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

GREAT NEWS! THE STARTER PACK IS AFFORDABLE AS ₱399.99!

⚠️ Regular Price: ₱1,599.99
🔥 Promo Price: ₱399.99
⏰ Offer Ends: April 5, 2025

Don't miss this incredible opportunity! Get started with your hacking journey at a fraction of the cost.

GRAB IT NOW before the price reverts back to ₱1,599.99!

Note: This is a limited-time offer and will not be extended.`,
      date: "2024-03-25",
      isPromo: true
    },
    {
      id: "2",
      title: "TOR CREDITS SYSTEM UPDATE NOTICE",
      content: `OFFICIAL NOTIFICATION OF SYSTEM MODIFICATIONS
Ref: LGN-TOR-2024-03

Dear Valued Client,

This memorandum serves to inform you of substantial modifications to the TOR Credits System, effective immediately. The following amendments have been implemented to enhance system security and operational efficiency:

I. SYSTEM MODIFICATIONS
   A. Credit Transaction Framework
      1. Implementation of comprehensive credit tier system
      2. Enhanced transaction verification protocols
      3. Streamlined funds transfer methodology

II. OPERATIONAL CHANGES
   A. Minimum Balance Requirements
      1. Previous minimum threshold: 10 credits
      2. New minimum threshold: 150 credits
      3. Operational minimum requirement: 200 credits

III. COMPLIANCE REQUIREMENTS
    A. All transactions must be processed through authorized Legion financial representatives
    B. Client verification protocols have been enhanced
    C. Mandatory maintenance of minimum operational credits

Please be advised that your account currently maintains the minimum balance threshold. To ensure uninterrupted service access, immediate action is recommended to meet operational requirements.

For and on behalf of Legion Associates
Date of Effect: March 25, 2024`,
      date: "2024-03-25"
    },
    {
      id: "3",
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
      date: "2024-01-14"
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
