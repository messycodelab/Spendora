import { useState } from 'react'
import { Plus, DollarSign, Calendar, TrendingDown, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type Loan, type LoanPayment } from '@/types'

interface AddPaymentDialogProps {
  loan: Loan
  onAddPayment: (payment: Omit<LoanPayment, 'id' | 'createdAt'>) => void
}

export function AddPaymentDialog({ loan, onAddPayment }: AddPaymentDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(loan.emiAmount.toString())
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [principalComponent, setPrincipalComponent] = useState('')
  const [interestComponent, setInterestComponent] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !date || !principalComponent || !interestComponent) return

    onAddPayment({
      loanId: loan.id,
      amount: parseFloat(amount),
      principalComponent: parseFloat(principalComponent),
      interestComponent: parseFloat(interestComponent),
      date,
    })

    setOpen(false)
  }

  const calculateSplit = () => {
    const totalAmount = parseFloat(amount)
    if (!totalAmount) return

    // Rough calculation: Interest = Remaining Principal * Monthly Rate
    const monthlyRate = (loan.interestRate / 100) / 12
    const interest = loan.remainingPrincipal * monthlyRate
    const principal = totalAmount - interest

    setInterestComponent(interest.toFixed(2))
    setPrincipalComponent(principal.toFixed(2))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg">
          LOG EMI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 px-1">Log EMI Payment</DialogTitle>
          <p className="text-xs text-slate-400 font-medium px-1 italic">For {loan.name}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-8 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-11 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
                  required
                />
              </div>
            </div>
          </div>

          <div className="modern-card p-4 rounded-2xl bg-slate-50/50 border-dashed border-2 border-slate-100 mb-2">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">P&I Split</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={calculateSplit}
                className="h-7 text-[9px] font-bold text-indigo-600 hover:bg-indigo-50 px-2 rounded-lg"
              >
                AUTO-CALC SPLIT
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="principalComp" className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Principal</Label>
                <div className="relative">
                  <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-emerald-500" />
                  <Input
                    id="principalComp"
                    type="number"
                    value={principalComponent}
                    onChange={(e) => setPrincipalComponent(e.target.value)}
                    className="pl-8 h-10 rounded-xl bg-white border-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-xs font-bold"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="interestComp" className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Interest</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-orange-500" />
                  <Input
                    id="interestComp"
                    type="number"
                    value={interestComponent}
                    onChange={(e) => setInterestComponent(e.target.value)}
                    className="pl-8 h-10 rounded-xl bg-white border-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-xs font-bold"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 rounded-2xl gradient-indigo shadow-lg shadow-indigo-100 border-none font-bold text-sm"
            >
              Log Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

