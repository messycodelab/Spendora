import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { formatCurrency } from '@/lib/utils'
import { type Budget } from '@/types'
import { CATEGORIES } from '@/types'
import { TrendingUp, AlertTriangle } from 'lucide-react'

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
    if (percentage >= 100) return 'text-destructive'
    if (percentage >= 80) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Management</CardTitle>
        <CardDescription>
          Set and track your monthly spending limits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-limit">Monthly Limit (₹)</Label>
              <Input
                id="budget-limit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Set Budget
          </Button>
        </form>

        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">
            Current Month Budgets
          </h3>
          {currentMonthBudgets.length === 0 ? (
            <p className="text-center text-muted-foreground py-4 text-sm">
              No budgets set for this month
            </p>
          ) : (
            currentMonthBudgets.map((budget) => {
              const percentage = getPercentage(budget)
              const statusColor = getStatusColor(percentage)

              return (
                <div
                  key={budget.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{budget.category}</h4>
                    <div className="flex items-center gap-2">
                      {percentage >= 80 && (
                        <AlertTriangle className={`h-4 w-4 ${statusColor}`} />
                      )}
                      <span className={`font-bold ${statusColor}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Spent</span>
                      <span className="font-medium">
                        {formatCurrency(budget.currentSpend)} / {formatCurrency(budget.monthlyLimit)}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          percentage >= 100
                            ? 'bg-destructive'
                            : percentage >= 80
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Remaining: {formatCurrency(Math.max(0, budget.monthlyLimit - budget.currentSpend))}
                    </span>
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

