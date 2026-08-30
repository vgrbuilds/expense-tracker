export type ExpenseCategory =
  | 'Grocery'
  | 'Utilities'
  | 'Rent'
  | 'Dining Out'
  | 'Transportation'
  | 'Entertainment'
  | 'Healthcare'
  | 'Shopping'
  | 'Others'
  | string;

export type PaymentMethod = 'Online' | 'Offline';

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  payment_method: PaymentMethod;
  spent_for: string;
  is_recurring: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlyUserSummary {
  userId: string;
  email: string;
  fullName: string;
  totalSpent: number;
  transactionCount: number;
  topCategory: string;
}
