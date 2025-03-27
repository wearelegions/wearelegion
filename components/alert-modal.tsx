import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type AlertModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
}

export function AlertModal({ isOpen, onClose, title, message }: AlertModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-hacker-terminal border border-hacker-primary/30">
        <DialogHeader>
          <DialogTitle className="text-hacker-primary font-hack">{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-hacker-primary/70 font-hack">
          {message}
        </DialogDescription>
        <DialogFooter>
          <Button
            className="bg-hacker-primary hover:bg-hacker-primary/80 text-black font-bold font-hack"
            onClick={onClose}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
