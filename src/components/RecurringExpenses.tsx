import { formatCurrency, formatDate } from '@/lib/utils'
import { type Expense } from '@/types'
import { Calendar, Repeat, Clock, TrendingUp } from 'lucide-react'

interface RecurringExpensesProps {
  expenses: Expense[]
}

export function RecurringExpenses({ expenses }: RecurringExpensesProps) {
  const recurringExpenses = expenses.filter((e) => e.type === 'recurring')

  const totalMonthlyRecurring = recurringExpenses.reduce((sum, expense) => {
    if (!expense.recurringDetails) return sum
    
    const { frequency } = expense.recurringDetails
    let monthlyAmount = expense.amount

    if (frequency === 'daily') monthlyAmount *= 30
    if (frequency === 'weekly') monthlyAmount *= 4
    if (frequency === 'yearly') monthlyAmount /= 12

    return sum + monthlyAmount
  }, 0)

  const frequencyColors = {
    daily: 'from-rose-400 to-pink-500',
    weekly: 'from-orange-400 to-amber-500',
    monthly: 'from-indigo-400 to-blue-500',
    yearly: 'from-emerald-400 to-teal-500',
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Automatic Subscriptions</h2>
          <p className="text-xs text-slate-400 font-medium">Tracking your repetitive commitments</p>
        </div>
        <Repeat className="h-5 w-5 text-slate-300" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="gradient-purple p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="bg-white/20 h-12 w-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <TrendingUp className="h-6 w-6" />
              </div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Monthly Committed</p>
              <h3 className="text-3xl font-black tracking-tighter mb-2">
                {formatCurrency(totalMonthlyRecurring)}
              </h3>
              <p className="text-indigo-200/60 text-[10px] font-medium leading-relaxed">
                Aggregated based on daily, weekly, and annual cycles.
              </p>
            </div>
            <Repeat className="absolute -right-8 -bottom-8 h-40 w-40 text-white/5 group-hover:rotate-45 transition-transform duration-1000" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {recurringExpenses.length === 0 ? (
            <div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
              <div className="bg-white h-16 w-16 rounded-3xl flex items-center justify-center shadow-sm mx-auto mb-4">
                <Clock className="h-8 w-8 text-slate-100" />
              </div>
              <p className="text-slate-400 text-sm font-medium">No recurring items configured</p>
            </div>
          ) : (
            recurringExpenses.map((expense) => {
              const frequency = expense.recurringDetails?.frequency || 'monthly'
              const gradient = frequencyColors[frequency as keyof typeof frequencyColors]
              
              return (
                <div
                  key={expense.id}
                  className="p-5 bg-white rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
                        <Repeat className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg mb-1">{expense.description}</h4>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 text-slate-500`}>
                            {frequency}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            <Calendar className="h-3 w-3" />
                            Next: {formatDate(expense.recurringDetails?.nextDate || '')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 tracking-tighter">
                        {formatCurrency(expense.amount)}
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        per cycle
                      </p>
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
