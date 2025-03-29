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
      <DialogContent className="bg-hacker-terminal border border-hacker-primary/30 w-[90vw] max-w-2xl h-[90vh] max-h-[800px] p-0">
        <DialogHeader className="p-4 sm:p-6 border-b border-hacker-primary/30">
          <DialogTitle className="text-hacker-primary font-hack text-base sm:text-lg">Transaction History</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 h-[calc(90vh-8rem)] max-h-[calc(800px-8rem)]">
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {transactions.length === 0 ? (
              <p className="text-center text-hacker-primary/70 font-hack text-sm">No transactions found</p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 sm:p-4 border border-hacker-primary/30 rounded-md bg-black/50"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className={`p-1.5 sm:p-2 rounded-full shrink-0 ${
                      transaction.type === 'purchase' 
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.type === 'purchase' ? 
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                        <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-hacker-primary font-hack text-sm sm:text-base truncate">{transaction.package_name}</p>
                      <p className="text-hacker-primary/70 font-hack text-[10px] sm:text-xs">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-hacker-primary font-hack text-sm sm:text-base">{formatCurrency(transaction.amount)}</p>
                    <p className={`font-hack text-[10px] sm:text-xs whitespace-nowrap ${
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
