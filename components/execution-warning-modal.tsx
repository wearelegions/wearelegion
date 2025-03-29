import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ExecutionWarningModal({ isOpen, onClose, onConfirm }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-hacker-terminal border border-hacker-primary/30 w-[90vw] max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-hacker-primary font-hack text-base sm:text-lg">EXECUTION WARNING</DialogTitle>
        </DialogHeader>
        <div className="font-hack text-sm space-y-6 text-hacker-primary/90">
          <p className="font-semibold">PLEASE READ CAREFULLY:</p>

          <div className="space-y-4">
            <p className="font-semibold">DURING EXECUTION:</p>
            <ul className="list-decimal pl-5 space-y-2">
              <li>You must not power down or restart your device</li>
              <li>You must remain on the dashboard page</li>
              <li>You must not navigate away from this interface</li>
            </ul>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">LEGAL NOTICE:</p>
            <p>
              By proceeding, you acknowledge that failure to comply with the above requirements may result in:
              (a) immediate termination of the operation,
              (b) irreversible deduction of credits, and
              (c) potential loss of service access.
            </p>
          </div>

          <div>
            <p>
              For operational support or technical assistance, please contact your designated Legion operator immediately.
            </p>
          </div>
        </div>

        <DialogFooter className="sm:space-x-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-hacker-primary/50 text-hacker-primary font-hack w-full sm:w-auto"
          >
            CANCEL
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-hacker-primary hover:bg-hacker-primary/80 text-black font-bold font-hack w-full sm:w-auto"
          >
            I UNDERSTAND, PROCEED
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
