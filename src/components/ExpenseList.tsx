import { Button } from './ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { type Expense } from '@/types'
import { 
  Trash2, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Repeat,
  UtensilsCrossed,
  Car,
  ShoppingBag,
  Film,
  Lightbulb,
  Heart,
  GraduationCap,
  Home,
  Tv,
  MoreHorizontal,
  Receipt
} from 'lucide-react'

interface ExpenseListProps {
  expenses: Expense[]
  onDeleteExpense: (id: string) => void
}

const paymentIcons = {
  upi: Smartphone,
  cash: Banknote,
  card: CreditCard,
}

const categoryConfig = {
  'Food & Dining': { icon: UtensilsCrossed, color: 'from-orange-400 to-red-500', bg: 'bg-orange-50', text: 'text-orange-600' },
  'Transportation': { icon: Car, color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  'Shopping': { icon: ShoppingBag, color: 'from-pink-400 to-purple-500', bg: 'bg-pink-50', text: 'text-pink-600' },
  'Entertainment': { icon: Film, color: 'from-purple-400 to-indigo-500', bg: 'bg-purple-50', text: 'text-purple-600' },
  'Bills & Utilities': { icon: Lightbulb, color: 'from-yellow-400 to-orange-500', bg: 'bg-yellow-50', text: 'text-yellow-600' },
  'Healthcare': { icon: Heart, color: 'from-red-400 to-pink-500', bg: 'bg-red-50', text: 'text-red-600' },
  'Education': { icon: GraduationCap, color: 'from-green-400 to-teal-500', bg: 'bg-green-50', text: 'text-green-600' },
  'Rent': { icon: Home, color: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-50', text: 'text-cyan-600' },
  'Subscriptions': { icon: Tv, color: 'from-indigo-400 to-purple-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  'Others': { icon: MoreHorizontal, color: 'from-gray-400 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-600' },
} as const

export function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
          <p className="text-xs text-slate-400 font-medium">Monitoring your latest activities</p>
        </div>
        <Receipt className="h-5 w-5 text-slate-300" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
        {sortedExpenses.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
            <div className="bg-white h-16 w-16 rounded-3xl flex items-center justify-center shadow-sm mx-auto mb-4">
              <Receipt className="h-8 w-8 text-slate-200" />
            </div>
            <p className="text-slate-400 text-sm font-medium">
              No transactions found
            </p>
          </div>
        ) : (
          sortedExpenses.map((expense) => {
            const PaymentIcon = paymentIcons[expense.paymentMethod]
            const categoryInfo = categoryConfig[expense.category as keyof typeof categoryConfig] || categoryConfig['Others']
            const CategoryIcon = categoryInfo.icon
            
            return (
              <div
                key={expense.id}
                className="flex flex-col p-5 bg-white border border-slate-50 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${categoryInfo.color} shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform duration-500`}>
                    <CategoryIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    {expense.type === 'recurring' && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 rounded-full">
                        <Repeat className="h-2.5 w-2.5 text-indigo-500" />
                        <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-wider">Auto</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteExpense(expense.id)}
                      className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1 mb-4 min-w-0">
                  <h4 className="font-bold text-slate-800 truncate text-sm">{expense.description}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                    <span className={`${categoryInfo.text}`}>{expense.category}</span>
                    <span>•</span>
                    <span>{formatDate(expense.date)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <PaymentIcon className="h-2.5 w-2.5" />
                    <span>{expense.paymentMethod}</span>
                  </div>
                  <span className="font-black text-base text-slate-900 tracking-tight">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
