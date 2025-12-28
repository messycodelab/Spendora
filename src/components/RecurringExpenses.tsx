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

        <div className="lg:col-span-2 grid md:grid-cols-2 gap-4 auto-rows-min">
          {recurringExpenses.length === 0 ? (
            <div className="md:col-span-2 text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 min-w-0">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg shrink-0 group-hover:rotate-12 transition-transform duration-500`}>
                        <Repeat className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm mb-1 truncate">{expense.description}</h4>
                        <div className="flex flex-col gap-1">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 inline-block w-fit`}>
                            {frequency}
                          </span>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate">
                            <Calendar className="h-2.5 w-2.5" />
                            {formatDate(expense.recurringDetails?.nextDate || '')}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-slate-900 tracking-tighter">
                        {formatCurrency(expense.amount)}
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
