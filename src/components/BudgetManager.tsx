import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { formatCurrency } from '@/lib/utils'
import { type Budget } from '@/types'
import { CATEGORIES } from '@/types'
import { TrendingUp, AlertTriangle, Target, DollarSign, CheckCircle2 } from 'lucide-react'

interface BudgetManagerProps {
  expenses: Expense[]
  budgets: Budget[]
  onSetBudget: (budget: Budget) => void
}

export function BudgetManager({ expenses, budgets, onSetBudget }: BudgetManagerProps) {
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')

  const currentMonth = new Date().toISOString().slice(0, 7)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !limit) {
      alert('Please fill all fields')
      return
    }

    const existingBudget = budgets.find(
      (b) => b.category === category && b.month === currentMonth
    )

    const budget: Budget = {
      id: existingBudget?.id || crypto.randomUUID(),
      category,
      monthlyLimit: parseFloat(limit),
      currentSpend: existingBudget?.currentSpend || 0,
      month: currentMonth,
    }

    onSetBudget(budget)
    setCategory('')
    setLimit('')
  }

  const currentMonthBudgets = budgets.filter((b) => b.month === currentMonth)

  const getCategorySpend = (category: string) => {
    return expenses
      .filter((e) => e.category === category && e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + e.amount, 0)
  }

  const getPercentage = (spent: number, limit: number) => {
    return (spent / limit) * 100
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-500'
    if (percentage >= 80) return 'text-orange-500'
    return 'text-emerald-500'
  }

  const getGradient = (percentage: number) => {
    if (percentage >= 100) return 'from-red-500 to-rose-500'
    if (percentage >= 80) return 'from-orange-400 to-red-400'
    return 'from-emerald-400 to-teal-500'
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Budget Targets</h2>
          <p className="text-xs text-slate-400 font-medium">Planning your monthly allowances</p>
        </div>
        <Target className="h-5 w-5 text-slate-300" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-1 space-y-5 p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100">
          <div className="space-y-2">
            <Label htmlFor="budget-category" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-white rounded-2xl border-slate-100 h-11 focus:ring-offset-0 focus:ring-indigo-100">
                <SelectValue placeholder="Select one" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="rounded-xl">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget-limit" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Monthly Limit (₹)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input
                id="budget-limit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="bg-white rounded-2xl border-slate-100 h-11 pl-9 focus:ring-offset-0 focus:ring-indigo-100"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-11 rounded-2xl gradient-purple text-white shadow-lg shadow-indigo-100 font-bold text-sm tracking-wide active:scale-[0.98] transition-all">
            Update Target
          </Button>
        </form>

        <div className="lg:col-span-2 grid md:grid-cols-2 gap-4 auto-rows-min">
          {currentMonthBudgets.length === 0 ? (
            <div className="md:col-span-2 text-center py-16 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-100">
              <div className="bg-white h-16 w-16 rounded-3xl flex items-center justify-center shadow-sm mx-auto mb-4">
                <Target className="h-8 w-8 text-slate-100" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No active targets set</p>
            </div>
          ) : (
            currentMonthBudgets.map((budget) => {
              const currentSpend = getCategorySpend(budget.category)
              const percentage = getPercentage(currentSpend, budget.monthlyLimit)
              const statusColor = getStatusColor(percentage)
              const gradient = getGradient(percentage)

              return (
                <div
                  key={budget.id}
                  className="p-5 bg-white rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shrink-0`}>
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm truncate max-w-[100px]">{budget.category}</h4>
                    </div>
                    <span className={`font-black text-lg ${statusColor} tracking-tighter`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out rounded-full`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Left</p>
                        <p className={`text-sm font-bold ${statusColor} tracking-tight`}>
                          {formatCurrency(Math.max(0, budget.monthlyLimit - currentSpend))}
                        </p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Limit</p>
                        <p className="text-[11px] font-bold text-slate-600 tracking-tight">
                          {formatCurrency(budget.monthlyLimit)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
