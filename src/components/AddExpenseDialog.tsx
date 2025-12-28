import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { CATEGORIES, PAYMENT_METHODS, RECURRING_FREQUENCIES, type Expense } from '@/types'
import { Plus } from 'lucide-react'

interface AddExpenseDialogProps {
  onAddExpense: (expense: Expense) => void
}

export function AddExpenseDialog({ onAddExpense }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cash' | 'card'>('upi')
  const [type, setType] = useState<'one-time' | 'recurring'>('one-time')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !category || !description) {
      alert('Please fill all required fields')
      return
    }

    const now = new Date().toISOString()
    const expense: Expense = {
      id: crypto.randomUUID(),
      amount: parseFloat(amount),
      category,
      description,
      date: now,
      paymentMethod,
      type,
    }

    if (type === 'recurring') {
      const nextDate = new Date()
      if (frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1)
      if (frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7)
      if (frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1)
      if (frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1)

      expense.recurringDetails = {
        frequency,
        nextDate: nextDate.toISOString(),
      }
    }

    onAddExpense(expense)
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setAmount('')
    setCategory('')
    setDescription('')
    setPaymentMethod('upi')
    setType('one-time')
    setFrequency('monthly')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Record your expense with details below
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Grocery shopping"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Expense Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="recurring">Recurring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === 'recurring' && (
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRING_FREQUENCIES.map((freq) => (
                      <SelectItem key={freq} value={freq}>
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Expense</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

