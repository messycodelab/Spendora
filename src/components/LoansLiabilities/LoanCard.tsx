import { Landmark, Calendar, Clock, Percent, DollarSign, TrendingDown, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { type Loan } from '@/types'
import { Button } from '@/components/ui/button'
import { AddPaymentDialog } from './AddPaymentDialog'
import { Progress } from '@/components/ui/progress'

interface LoanCardProps {
  loan: Loan
  onDelete: (id: string) => void
  onAddPayment: (payment: any) => void
}

export function LoanCard({ loan, onDelete, onAddPayment }: LoanCardProps) {
  const paidAmount = loan.principalAmount - loan.remainingPrincipal
  const progressPercent = (paidAmount / loan.principalAmount) * 100

  return (
    <div className="modern-card p-6 rounded-[2.5rem] group relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-indigo-100/50">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl gradient-blue flex items-center justify-center text-white shadow-lg shadow-cyan-100 transition-transform group-hover:scale-110">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">{loan.name}</h3>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{loan.type.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AddPaymentDialog loan={loan} onAddPayment={onAddPayment} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(loan.id)}
            className="h-7 w-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Principal</span>
            <p className="text-base font-bold text-slate-700">{formatCurrency(loan.principalAmount)}</p>
          </div>
          <div className="space-y-1 text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">EMI</span>
            <p className="text-base font-bold text-indigo-600">{formatCurrency(loan.emiAmount)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Repayment Progress</span>
            <span className="text-xs font-bold text-emerald-600">{progressPercent.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full gradient-green rounded-full transition-all duration-1000" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
            <span>PAID: {formatCurrency(paidAmount)}</span>
            <span>LEFT: {formatCurrency(loan.remainingPrincipal)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50">
          <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-50/50">
            <Percent className="h-3 w-3 text-orange-400 mb-1" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Rate</span>
            <span className="text-[11px] font-bold text-slate-700">{loan.interestRate}%</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-50/50">
            <Clock className="h-3 w-3 text-blue-400 mb-1" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Tenure</span>
            <span className="text-[11px] font-bold text-slate-700">{loan.tenureMonths}m</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-50/50">
            <Calendar className="h-3 w-3 text-indigo-400 mb-1" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Next EMI</span>
            <span className="text-[11px] font-bold text-slate-700">{loan.nextEmiDate ? new Date(loan.nextEmiDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

