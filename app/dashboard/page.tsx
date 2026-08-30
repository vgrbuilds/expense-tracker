import { createClient } from '@/lib/supabase/server';
import ExpenseForm from '@/components/dashboard/ExpenseForm';
import ExpenseList from '@/components/dashboard/ExpenseList';
import CategoryPieChart from '@/components/dashboard/CategoryPieChart';
import PaymentMethodBarChart from '@/components/dashboard/PaymentMethodBarChart';
import SummaryCards from '@/components/dashboard/SummaryCards';
import { Expense } from '@/types';
import { Sparkles } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const userName = profile?.full_name || user.email?.split('@')[0] || 'User';

  // Fetch user expenses ordered by date descending
  const { data: rawExpenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  const expenses: Expense[] = rawExpenses || [];

  // Filter expenses for current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  return (
    <div className="space-y-8">
      {/* Welcome Greeting Header */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg shadow-sky-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-sky-100 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> Monthly Finance Overview
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Hello, {userName}! 👋
          </h1>
          <p className="text-sky-100 text-sm mt-1 max-w-xl">
            Here is your spending report for {now.toLocaleString('default', { month: 'long', year: 'numeric' })}. Keep track of every dollar with precision.
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <SummaryCards expenses={currentMonthExpenses} />

      {/* Expense Addition Form */}
      <ExpenseForm />

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart expenses={currentMonthExpenses} />
        <PaymentMethodBarChart expenses={currentMonthExpenses} />
      </div>

      {/* Expenses Table */}
      <ExpenseList expenses={expenses} />
    </div>
  );
}
