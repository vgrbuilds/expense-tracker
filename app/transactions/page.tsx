import { createClient } from '@/lib/supabase/server';
import { getCustomOptions } from '@/app/actions/custom-option-actions';
import TransactionsClient from './TransactionsClient';
import { Expense } from '@/types';

export default async function TransactionsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch all user expenses ordered by date descending
  const { data: rawExpenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  const expenses: Expense[] = rawExpenses || [];

  // Fetch custom user options
  const { categories, vendors, spentForOptions } = await getCustomOptions();

  return (
    <TransactionsClient
      allExpenses={expenses}
      userCustomCategories={categories}
      userCustomVendors={vendors}
      userCustomSpentForOptions={spentForOptions}
    />
  );
}
