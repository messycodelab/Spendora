import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { type Expense } from '@/types'
import { Trash2, CreditCard, Banknote, Smartphone, Repeat } from 'lucide-react'

interface ExpenseListProps {
  expenses: Expense[]
  onDeleteExpense: (id: string) => void
}

const paymentIcons = {
  upi: Smartphone,
  cash: Banknote,
  card: CreditCard,
}

export function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Expenses</CardTitle>
        <CardDescription>
          Your latest transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedExpenses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No expenses recorded yet. Add your first expense!
            </p>
          ) : (
            sortedExpenses.map((expense) => {
              const PaymentIcon = paymentIcons[expense.paymentMethod]
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      <PaymentIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{expense.description}</h4>
                        {expense.type === 'recurring' && (
                          <Repeat className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {expense.category} • {formatDate(expense.date)}
                      </p>
                      {expense.type === 'recurring' && expense.recurringDetails && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Repeats {expense.recurringDetails.frequency}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-lg">
                      {formatCurrency(expense.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteExpense(expense.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

