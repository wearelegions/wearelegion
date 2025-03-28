import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
      <DialogContent className="bg-hacker-terminal border border-hacker-primary/30">
        <DialogHeader>
          <DialogTitle className="text-hacker-primary font-hack">{news.title}</DialogTitle>
          <div className="text-xs text-hacker-primary/50 font-hack">{news.date}</div>
        </DialogHeader>
        <DialogDescription className="text-hacker-primary/70 font-hack whitespace-pre-wrap">
          {news.content}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
