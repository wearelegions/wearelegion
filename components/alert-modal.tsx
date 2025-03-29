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
      <DialogContent className="bg-hacker-terminal border border-hacker-primary/30 w-[90vw] max-w-[425px] p-4 sm:p-6 gap-4">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-hacker-primary font-hack text-base sm:text-lg">{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-hacker-primary/70 font-hack text-sm sm:text-base">
          {message}
        </DialogDescription>
        <DialogFooter>
          <Button
            className="bg-hacker-primary hover:bg-hacker-primary/80 text-black font-bold font-hack w-full sm:w-auto h-9 sm:h-10 text-sm"
            onClick={onClose}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
