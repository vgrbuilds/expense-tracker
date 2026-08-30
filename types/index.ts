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
  category: string;
  amount: number;
  date: string;
  description?: string | null;
  title?: string | null; // Backwards compatibility fallback
  vendor?: string | null;
  payment_method: PaymentMethod;
  spent_for: string;
  is_recurring: boolean;
  created_at: string;
}

export interface CustomOption {
  id: string;
  user_id: string;
  field_name: 'category' | 'vendor';
  option_value: string;
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
