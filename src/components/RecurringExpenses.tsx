import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { type Expense } from '@/types'
import { Calendar, Repeat } from 'lucide-react'

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Expenses</CardTitle>
        <CardDescription>
          Track your regular payments and subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-primary/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-primary" />
              <span className="font-semibold">Estimated Monthly Total</span>
            </div>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(totalMonthlyRecurring)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {recurringExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No recurring expenses set up yet
            </p>
          ) : (
            recurringExpenses.map((expense) => (
              <div
                key={expense.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{expense.description}</h4>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {expense.recurringDetails?.frequency}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {expense.category}
                    </p>
                    {expense.recurringDetails && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Next payment: {formatDate(expense.recurringDetails.nextDate)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatCurrency(expense.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      per {expense.recurringDetails?.frequency.slice(0, -2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

