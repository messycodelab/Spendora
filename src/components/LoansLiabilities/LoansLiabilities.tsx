import { useState, useEffect, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'
import { type Loan, type LoanPayment } from '@/types'
import { Landmark, AlertCircle, PieChart as PieChartIcon, TrendingDown, ArrowDownRight, Activity } from 'lucide-react'
import { AddLoanDialog } from './AddLoanDialog'
import { LoanCard } from './LoanCard'

export function LoansLiabilities() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  const loadLoans = useCallback(async () => {
    try {
      const loadedLoans = await window.electron.getLoans()
      setLoans(loadedLoans)
    } catch (error) {
      console.error('Error loading loans:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLoans()
  }, [loadLoans])

  const handleAddLoan = async (loanData: any) => {
    try {
      const newLoan = {
        ...loanData,
        id: crypto.randomUUID(),
        remainingPrincipal: loanData.principalAmount,
        isPaidOff: 0,
      }
      await window.electron.addLoan(newLoan)
      loadLoans()
    } catch (error) {
      console.error('Error adding loan:', error)
    }
  }

  const handleDeleteLoan = async (id: string) => {
    if (confirm('Are you sure you want to delete this loan? All payment history will be lost.')) {
      try {
        await window.electron.deleteLoan(id)
        loadLoans()
      } catch (error) {
        console.error('Error deleting loan:', error)
      }
    }
  }

  const handleAddPayment = async (paymentData: any) => {
    try {
      const newPayment = {
        ...paymentData,
        id: crypto.randomUUID(),
      }
      await window.electron.addLoanPayment(newPayment)
      
      // Update next EMI date (simple logic: +1 month)
      const loan = loans.find(l => l.id === paymentData.loanId)
      if (loan && loan.nextEmiDate) {
        const nextDate = new Date(loan.nextEmiDate)
        nextDate.setMonth(nextDate.getMonth() + 1)
        await window.electron.updateLoan(loan.id, { 
          nextEmiDate: nextDate.toISOString().slice(0, 10) 
        })
      }
      
      loadLoans()
    } catch (error) {
      console.error('Error adding payment:', error)
    }
  }

  const totalMonthlyObligation = loans.reduce((sum, loan) => sum + (loan.isPaidOff ? 0 : loan.emiAmount), 0)
  const totalOutstandingPrincipal = loans.reduce((sum, loan) => sum + loan.remainingPrincipal, 0)
  const totalPrincipal = loans.reduce((sum, loan) => sum + loan.principalAmount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Activity className="h-8 w-8 text-indigo-500 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="modern-card p-6 rounded-[2rem] group relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-2xl gradient-purple flex items-center justify-center text-white shadow-lg shadow-indigo-100 transition-transform group-hover:scale-110">
              <TrendingDown className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly EMI</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{formatCurrency(totalMonthlyObligation)}</h3>
            <p className="text-xs font-medium text-slate-400">Total recurring obligation</p>
          </div>
        </div>

        <div className="modern-card p-6 rounded-[2rem] group relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-2xl gradient-orange flex items-center justify-center text-white shadow-lg shadow-orange-100 transition-transform group-hover:scale-110">
              <Landmark className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Outstanding</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">{formatCurrency(totalOutstandingPrincipal)}</h3>
            <p className="text-xs font-medium text-slate-400">Total remaining principal</p>
          </div>
        </div>

        <div className="modern-card p-6 rounded-[2rem] group relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-2xl gradient-green flex items-center justify-center text-white shadow-lg shadow-emerald-100 transition-transform group-hover:scale-110">
              <PieChartIcon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Debt Equity</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
              {totalPrincipal > 0 ? ((totalOutstandingPrincipal / totalPrincipal) * 100).toFixed(0) : 0}%
            </h3>
            <p className="text-xs font-medium text-slate-400">Principal remaining ratio</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Loans</h2>
          <p className="text-xs font-medium text-slate-400">Track and manage your liabilities</p>
        </div>
        <AddLoanDialog onAddLoan={handleAddLoan} />
      </div>

      {loans.length === 0 ? (
        <div className="modern-card p-12 rounded-[2.5rem] border-dashed border-2 border-slate-100 text-center">
          <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Landmark className="h-8 w-8 text-slate-200" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Loans Tracked</h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto mb-6">Start tracking your home, car, or personal loans to manage your EMIs better.</p>
          <AddLoanDialog onAddLoan={handleAddLoan} />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {loans.map((loan) => (
            <LoanCard 
              key={loan.id} 
              loan={loan} 
              onDelete={handleDeleteLoan}
              onAddPayment={handleAddPayment}
            />
          ))}
        </div>
      )}

      {/* EMI Calendar Hint */}
      {loans.length > 0 && (
        <div className="modern-card p-4 rounded-2xl bg-indigo-50/50 border-none flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-indigo-500 mt-0.5" />
          <div className="text-xs text-indigo-700 font-medium leading-relaxed">
            <span className="font-bold uppercase tracking-wider block mb-1">Pro Tip:</span>
            Log your EMI payments monthly to track principal vs interest split and see your debt reduction over time. The next EMI date is automatically updated upon logging.
          </div>
        </div>
      )}
    </div>
  )
}

