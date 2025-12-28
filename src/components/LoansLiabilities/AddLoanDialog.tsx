import { useState } from 'react'
import { Plus, Landmark, Percent, Calendar, Calculator, Clock } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Loan, LOAN_TYPES } from '@/types'

interface AddLoanDialogProps {
  onAddLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'remainingPrincipal' | 'isPaidOff'>) => void
}

export function AddLoanDialog({ onAddLoan }: AddLoanDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<typeof LOAN_TYPES[number]>('personal')
  const [principalAmount, setPrincipalAmount] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [tenureMonths, setTenureMonths] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [emiAmount, setEmiAmount] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !principalAmount || !interestRate || !tenureMonths || !emiAmount) return

    onAddLoan({
      name,
      type,
      principalAmount: parseFloat(principalAmount),
      interestRate: parseFloat(interestRate),
      tenureMonths: parseInt(tenureMonths),
      startDate,
      emiAmount: parseFloat(emiAmount),
      nextEmiDate: startDate, // Set initial next EMI date to start date or calculated next month
    })

    // Reset form
    setName('')
    setType('personal')
    setPrincipalAmount('')
    setInterestRate('')
    setTenureMonths('')
    setEmiAmount('')
    setOpen(false)
  }

  const calculateEMI = () => {
    const p = parseFloat(principalAmount)
    const r = parseFloat(interestRate) / 12 / 100
    const n = parseInt(tenureMonths)

    if (p && r && n) {
      const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      setEmiAmount(emi.toFixed(2))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl gradient-purple shadow-lg shadow-indigo-100 border-none h-11 px-6 font-bold text-sm gap-2">
          <Plus className="h-4 w-4" />
          Add Loan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900 px-1">Add New Loan</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Loan Name</Label>
            <div className="relative">
              <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-11 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
                placeholder="e.g. HDFC Home Loan"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500 font-medium">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-xl">
                  {LOAN_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="rounded-xl capitalize">
                      {t.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-11 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="principal" className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Principal</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <Input
                  id="principal"
                  type="number"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  className="pl-8 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest" className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Rate (%)</Label>
              <div className="relative">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="interest"
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="pl-11 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
                  placeholder="0.0"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenure" className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Tenure (Mo)</Label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="tenure"
                  type="number"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(e.target.value)}
                  className="pl-11 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
                  placeholder="Months"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emi" className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">EMI Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <Input
                  id="emi"
                  type="number"
                  value={emiAmount}
                  onChange={(e) => setEmiAmount(e.target.value)}
                  className="pl-8 h-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-indigo-500 font-medium"
                  placeholder="0.00"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={calculateEMI}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
                >
                  CALC
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              className="w-full h-12 rounded-2xl gradient-purple shadow-lg shadow-indigo-100 border-none font-bold text-sm"
            >
              Add Loan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

