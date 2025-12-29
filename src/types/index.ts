export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: 'upi' | 'cash' | 'card';
  type: 'one-time' | 'recurring';
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  recurringNextDate?: string | null;
  // Keep backward compatibility with old structure
  recurringDetails?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    nextDate: string;
  };
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  currentSpend: number;
  month: string;
}

export type LoanType = 'home' | 'car' | 'personal' | 'credit_card' | 'other';

export interface Loan {
  id: string;
  name: string;
  type: LoanType;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  startDate: string;
  emiAmount: number;
  remainingPrincipal: number;
  nextEmiDate: string | null;
  isPaidOff: number; // 0 or 1
  createdAt?: string;
}

export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  principalComponent: number;
  interestComponent: number;
  date: string;
  createdAt?: string;
}

// Asset Types
export type AssetType =
  | 'stocks'
  | 'mutual_funds'
  | 'etf'
  | 'gold_physical'
  | 'gold_digital'
  | 'real_estate'
  | 'land'
  | 'cash'
  | 'fd'
  | 'rd'
  | 'esop'
  | 'private_equity'
  | 'ppf'
  | 'epf'
  | 'nps'
  | 'bonds'
  | 'crypto'
  | 'other';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  investedAmount: number;
  currentValue: number;
  units?: number | null;
  purchaseDate: string;
  lastUpdated: string;
  notes?: string | null;
  linkedGoalId?: string | null;
  createdAt?: string;
}

export interface AssetValueHistory {
  id: string;
  assetId: string;
  value: number;
  date: string;
  createdAt?: string;
}

// Goal Types
export type GoalType =
  | 'house'
  | 'car'
  | 'retirement'
  | 'travel'
  | 'education'
  | 'wedding'
  | 'emergency_fund'
  | 'other';

export type GoalPriority = 'high' | 'medium' | 'low';
export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  priority: GoalPriority;
  status: GoalStatus;
  notes?: string | null;
  createdAt?: string;
}

// Net Worth
export interface NetWorthHistory {
  id: string;
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  assetsBreakdown?: string | null; // JSON string
  liabilitiesBreakdown?: string | null; // JSON string
  createdAt?: string;
}

export interface NetWorthBreakdown {
  [category: string]: number;
}

export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Rent',
  'Subscriptions',
  'Others',
] as const;

export const PAYMENT_METHODS = ['upi', 'cash', 'card'] as const;
export const RECURRING_FREQUENCIES = ['daily', 'weekly', 'monthly', 'yearly'] as const;
export const LOAN_TYPES = ['home', 'car', 'personal', 'credit_card', 'other'] as const;

export const ASSET_TYPES: { value: AssetType; label: string; category: string }[] = [
  // Market Investments
  { value: 'stocks', label: 'Stocks', category: 'Market' },
  { value: 'mutual_funds', label: 'Mutual Funds', category: 'Market' },
  { value: 'etf', label: 'ETFs', category: 'Market' },
  // Gold
  { value: 'gold_physical', label: 'Physical Gold', category: 'Gold' },
  { value: 'gold_digital', label: 'Digital Gold', category: 'Gold' },
  // Real Estate
  { value: 'real_estate', label: 'Real Estate', category: 'Property' },
  { value: 'land', label: 'Land', category: 'Property' },
  // Fixed Income
  { value: 'fd', label: 'Fixed Deposit', category: 'Fixed Income' },
  { value: 'rd', label: 'Recurring Deposit', category: 'Fixed Income' },
  { value: 'ppf', label: 'PPF', category: 'Fixed Income' },
  { value: 'epf', label: 'EPF', category: 'Fixed Income' },
  { value: 'nps', label: 'NPS', category: 'Fixed Income' },
  { value: 'bonds', label: 'Bonds', category: 'Fixed Income' },
  // Alternative
  { value: 'esop', label: 'ESOPs', category: 'Alternative' },
  { value: 'private_equity', label: 'Private Equity', category: 'Alternative' },
  { value: 'crypto', label: 'Cryptocurrency', category: 'Alternative' },
  // Cash
  { value: 'cash', label: 'Cash & Savings', category: 'Cash' },
  { value: 'other', label: 'Other', category: 'Other' },
];

export const GOAL_TYPES: { value: GoalType; label: string; icon: string }[] = [
  { value: 'house', label: 'Buy a House', icon: '🏠' },
  { value: 'car', label: 'Buy a Car', icon: '🚗' },
  { value: 'retirement', label: 'Retirement', icon: '🏖️' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'education', label: 'Education', icon: '🎓' },
  { value: 'wedding', label: 'Wedding', icon: '💒' },
  { value: 'emergency_fund', label: 'Emergency Fund', icon: '🛡️' },
  { value: 'other', label: 'Other Goal', icon: '🎯' },
];
