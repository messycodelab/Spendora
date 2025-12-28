import { formatCurrency } from '@/lib/utils'
import { type Expense, type Budget } from '@/types'
import { Wallet, Calendar, TrendingUp, DollarSign, PiggyBank, Activity, ArrowDownRight, Clock, PieChart as PieChartIcon, BarChart3 } from 'lucide-react'
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell
} from 'recharts'

interface DashboardProps {
  expenses: Expense[]
  budgets: Budget[]
}

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#14b8a6', '#f43f5e', '#64748b']

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

  // Prepare data for Daily Spending Area Chart
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dayStr = `${currentMonth}-${day.toString().padStart(2, '0')}`
    const amount = currentMonthExpenses
      .filter(e => e.date.startsWith(dayStr))
      .reduce((sum, e) => sum + e.amount, 0)
    return {
      day: day.toString(),
      amount: amount
    }
  })

  // Prepare data for Category Distribution Pie Chart
  const categoryDataMap = currentMonthExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const categoryData = Object.entries(categoryDataMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const hasData = currentMonthExpenses.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Spent Card */}
        <div className="modern-card p-6 rounded-[2rem] group relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-2xl gradient-purple flex items-center justify-center text-white shadow-lg shadow-indigo-100 transition-transform group-hover:scale-110">
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
            <div className="h-10 w-10 rounded-2xl gradient-blue flex items-center justify-center text-white shadow-lg shadow-cyan-100 transition-transform group-hover:scale-110">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{formatCurrency(totalBudget)}</h3>
            <div className="flex items-center gap-1.5 text-slate-400">
              <DollarSign className="h-3 w-3 text-cyan-500" />
              <span className="text-xs font-medium">{budgets.filter(b => b.month === currentMonth).length} active</span>
            </div>
          </div>
        </div>

        {/* Remaining Card */}
        <div className="modern-card p-6 rounded-[2rem] group relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${remaining >= 0 ? 'gradient-green shadow-emerald-100' : 'gradient-orange shadow-orange-100'}`}>
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
              <span className="text-xs font-medium">{totalBudget > 0 ? `${((totalSpent / (totalBudget || 1)) * 100).toFixed(0)}% used` : 'No budget'}</span>
            </div>
          </div>
        </div>

        {/* Daily Avg Card */}
        <div className="modern-card p-6 rounded-[2rem] group relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-2xl gradient-pink flex items-center justify-center text-white shadow-lg shadow-pink-100 transition-transform group-hover:scale-110">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Spending Trend Chart */}
        <div className="modern-card p-6 rounded-[2.5rem] lg:col-span-2">
          <div className="flex items-center justify-between mb-6 px-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Spending Trend</h3>
              <p className="text-xs text-slate-400 font-medium">Daily expenses this month</p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-300" />
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <div className="bg-slate-50 h-16 w-16 rounded-3xl flex items-center justify-center mb-4 mx-auto">
                  <BarChart3 className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No data for this month</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Distribution Chart */}
        <div className="modern-card p-6 rounded-[2.5rem]">
          <div className="flex items-center justify-between mb-6 px-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Categories</h3>
              <p className="text-xs text-slate-400 font-medium">Spending by category</p>
            </div>
            <PieChartIcon className="h-5 w-5 text-slate-300" />
          </div>
          <div className="h-[250px] w-full flex items-center justify-center">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center">
                <div className="bg-slate-50 h-16 w-16 rounded-3xl flex items-center justify-center mb-4 mx-auto">
                  <PieChartIcon className="h-8 w-8 text-slate-200" />
                </div>
                <p className="text-slate-400 text-sm font-medium">No expenses yet</p>
              </div>
            )}
          </div>
          {hasData && (
            <div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto px-2 scrollbar-hide">
              {categoryData.slice(0, 5).map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-slate-600 truncate max-w-[100px]">{entry.name}</span>
                  </div>
                  <span className="text-slate-400">{((entry.value / (totalSpent || 1)) * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
