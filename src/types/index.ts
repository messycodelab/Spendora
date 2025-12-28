export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: 'upi' | 'cash' | 'card';
  type: 'one-time' | 'recurring';
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

