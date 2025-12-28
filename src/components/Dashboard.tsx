import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { formatCurrency } from '@/lib/utils'
import { type Expense, type Budget } from '@/types'
import { TrendingDown, Wallet, CreditCard, Calendar } from 'lucide-react'

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Spent This Month
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {currentMonthExpenses.length} transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Budget
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {budgets.filter(b => b.month === currentMonth).length} categories
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Remaining Budget
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${remaining < 0 ? 'text-destructive' : ''}`}>
            {formatCurrency(remaining)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalBudget > 0 ? `${((totalSpent / totalBudget) * 100).toFixed(0)}% used` : 'No budget set'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Daily Average
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(averageDaily)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Based on this month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

