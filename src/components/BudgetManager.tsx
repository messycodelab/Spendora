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
  budgets: Budget[]
  onSetBudget: (budget: Budget) => void
}

export function BudgetManager({ budgets, onSetBudget }: BudgetManagerProps) {
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

  const getPercentage = (budget: Budget) => {
    return (budget.currentSpend / budget.monthlyLimit) * 100
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

        <div className="lg:col-span-2 space-y-4">
          {currentMonthBudgets.length === 0 ? (
            <div className="text-center py-16 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-100">
              <div className="bg-white h-16 w-16 rounded-3xl flex items-center justify-center shadow-sm mx-auto mb-4">
                <Target className="h-8 w-8 text-slate-100" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No active targets set</p>
            </div>
          ) : (
            currentMonthBudgets.map((budget) => {
              const percentage = getPercentage(budget)
              const statusColor = getStatusColor(percentage)
              const gradient = getGradient(percentage)

              return (
                <div
                  key={budget.id}
                  className="p-6 bg-white rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg`}>
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg">{budget.category}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      {percentage >= 80 && (
                        <AlertTriangle className={`h-5 w-5 ${statusColor} animate-pulse`} />
                      )}
                      <span className={`font-black text-2xl ${statusColor} tracking-tighter`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out rounded-full`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Remaining</p>
                        <p className={`text-lg font-bold ${statusColor} tracking-tight`}>
                          {formatCurrency(Math.max(0, budget.monthlyLimit - budget.currentSpend))}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Limit</p>
                        <p className="text-sm font-bold text-slate-600 tracking-tight">
                          {formatCurrency(budget.currentSpend)} <span className="text-slate-300 font-medium mx-1">/</span> {formatCurrency(budget.monthlyLimit)}
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
