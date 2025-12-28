import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { formatCurrency } from '@/lib/utils'
import { type Expense, type Budget } from '@/types'
import { Wallet, Calendar, TrendingUp, DollarSign, PiggyBank, Activity, ArrowDownRight, Clock } from 'lucide-react'

interface DashboardProps {
  expenses: Expense[]
  budgets: Budget[]
}

export function Dashboard({ expenses, budgets }: DashboardProps) {
  const currentMonth = new Date().toISOString().slice(0, 7)
  
  const currentMonthExpenses = expenses.filter(
    (e) => e.date.startsWith(currentMonth)
  )

  const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
  
  const totalBudget = budgets
    .filter((b) => b.month === currentMonth)
    .reduce((sum, b) => sum + b.monthlyLimit, 0)

  const remaining = totalBudget - totalSpent

  const averageDaily = currentMonthExpenses.length > 0
    ? totalSpent / new Date().getDate()
    : 0

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Spent Card */}
      <div className="modern-card p-6 rounded-[2rem] group relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-2xl gradient-purple flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <ArrowDownRight className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spent</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{formatCurrency(totalSpent)}</h3>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Activity className="h-3 w-3 text-indigo-500" />
            <span className="text-xs font-medium">{currentMonthExpenses.length} items</span>
          </div>
        </div>
      </div>

      {/* Total Budget Card */}
      <div className="modern-card p-6 rounded-[2rem] group relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-2xl gradient-blue flex items-center justify-center text-white shadow-lg shadow-cyan-100">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{formatCurrency(totalBudget)}</h3>
          <div className="flex items-center gap-1.5 text-slate-400">
            <DollarSign className="h-3 w-3 text-cyan-500" />
            <span className="text-xs font-medium">{budgets.filter(b => b.month === currentMonth).length} categories</span>
          </div>
        </div>
      </div>

      {/* Remaining Card */}
      <div className="modern-card p-6 rounded-[2rem] group relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${remaining >= 0 ? 'gradient-green shadow-emerald-100' : 'gradient-orange shadow-orange-100'}`}>
            {remaining >= 0 ? <PiggyBank className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{remaining >= 0 ? 'Safe' : 'Over'}</span>
        </div>
        <div>
          <h3 className={`text-2xl font-bold tracking-tight mb-1 ${remaining >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
            {formatCurrency(Math.abs(remaining))}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-400">
            <div className={`h-1.5 w-1.5 rounded-full ${remaining >= 0 ? 'bg-emerald-500' : 'bg-orange-500'}`} />
            <span className="text-xs font-medium">{totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% used` : 'No budget'}</span>
          </div>
        </div>
      </div>

      {/* Daily Avg Card */}
      <div className="modern-card p-6 rounded-[2rem] group relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-2xl gradient-pink flex items-center justify-center text-white shadow-lg shadow-pink-100">
            <Calendar className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{formatCurrency(averageDaily)}</h3>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="h-3 w-3 text-pink-500" />
            <span className="text-xs font-medium capitalize">{new Date().toLocaleDateString('en-US', { month: 'short' })} Avg</span>
          </div>
        </div>
      </div>
    </div>
  )
}
