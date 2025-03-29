import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

type Transaction = {
  id: string
  user_id: string
  package_name: string
  amount: number
  credits: number
  type: 'purchase' | 'usage'
  created_at: string
}

type Props = {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
}

const formatCurrency = (amount: number) => {
  return `₱${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

const formatCredits = (amount: number) => {
  return amount.toLocaleString()
}

export function TransactionHistoryModal({ isOpen, onClose, transactions }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-hacker-terminal border border-hacker-primary/30 max-w-2xl w-[90vw] max-h-[90vh] p-0">
        <DialogHeader className="p-6 border-b border-hacker-primary/30">
          <DialogTitle className="text-hacker-primary font-hack">Transaction History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-8rem)]">
          <div className="p-6 space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-hacker-primary/70 font-hack">No transactions found</p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border border-hacker-primary/30 rounded-md bg-black/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'purchase' 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.type === 'purchase' ? 
                        <ArrowUpRight className="w-4 h-4" /> : 
                        <ArrowDownRight className="w-4 h-4" />
                      }
                    </div>
                    <div>
                      <p className="text-hacker-primary font-hack">{transaction.package_name}</p>
                      <p className="text-hacker-primary/70 font-hack text-xs">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-hacker-primary font-hack">{formatCurrency(transaction.amount)}</p>
                    <p className={`font-hack text-xs ${
                      transaction.type === 'purchase' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'purchase' ? '+' : '-'}{formatCredits(transaction.credits)} CREDITS
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
