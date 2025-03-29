import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

type NewsModalProps = {
  isOpen: boolean
  onClose: () => void
  news: {
    title: string
    content: string
    date: string
  }
}

export function NewsModal({ isOpen, onClose, news }: NewsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-hacker-terminal border border-hacker-primary/30 w-[90vw] max-w-2xl h-[90vh] max-h-[800px] p-0">
        <DialogHeader className="p-4 sm:p-6 border-b border-hacker-primary/30">
          <DialogTitle className="text-hacker-primary font-hack text-base sm:text-lg">{news.title}</DialogTitle>
          <div className="text-xs text-hacker-primary/50 font-hack">{news.date}</div>
        </DialogHeader>
        <ScrollArea className="flex-1 h-[calc(90vh-8rem)] max-h-[calc(800px-8rem)]">
          <div className="p-4 sm:p-6">
            <div className="text-hacker-primary/70 font-hack text-sm sm:text-base whitespace-pre-wrap">
              {news.content}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
