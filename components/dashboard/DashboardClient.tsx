'use client';

import { useState } from 'react';
import ExpenseForm from '@/components/dashboard/ExpenseForm';
import ExpenseList from '@/components/dashboard/ExpenseList';
import CategoryPieChart from '@/components/dashboard/CategoryPieChart';
import PaymentMethodBarChart from '@/components/dashboard/PaymentMethodBarChart';
import SummaryCards from '@/components/dashboard/SummaryCards';
import { Expense } from '@/types';
import { Sparkles } from 'lucide-react';

interface DashboardClientProps {
  userName: string;
  allExpenses: Expense[];
  userCustomCategories: string[];
  userCustomVendors: string[];
}

export default function DashboardClient({
  userName,
  allExpenses,
  userCustomCategories,
  userCustomVendors,
}: DashboardClientProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Recurring Business Logic:
  // Expense is active in current month if created in current month OR (is_recurring AND created <= current month)
  const currentMonthExpenses = allExpenses.filter((e) => {
    const expenseDate = new Date(e.date);
    const expYear = expenseDate.getFullYear();
    const expMonth = expenseDate.getMonth();

    const isSameMonth = expYear === currentYear && expMonth === currentMonth;
    const isPastOrCurrentMonthRecurring =
      e.is_recurring &&
      (expYear < currentYear || (expYear === currentYear && expMonth <= currentMonth));

    return isSameMonth || isPastOrCurrentMonthRecurring;
  });

  function handleEditClick(expense: Expense) {
    setEditingExpense(expense);
    window.scrollTo({ top: 150, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingExpense(null);
  }

  return (
    <div className="space-y-8">
      {/* Welcome Greeting Header */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-700 rounded-3xl p-8 text-white shadow-lg shadow-sky-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-sky-100 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> Monthly Finance Overview
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            SpendWise says: Hello, {userName}! 👋
          </h1>
          <p className="text-sky-100 text-sm mt-1 max-w-xl">
            Here is your spending report for {now.toLocaleString('default', { month: 'long', year: 'numeric' })}. Recurring expenses automatically roll over each month.
          </p>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <SummaryCards expenses={currentMonthExpenses} />

      {/* Expense Addition & Editing Form */}
      <ExpenseForm
        editingExpense={editingExpense}
        onCancelEdit={handleCancelEdit}
        userCustomCategories={userCustomCategories}
        userCustomVendors={userCustomVendors}
      />

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart expenses={currentMonthExpenses} />
        <PaymentMethodBarChart expenses={currentMonthExpenses} />
      </div>

      {/* Expenses Table */}
      <ExpenseList
        expenses={allExpenses}
        onEditExpense={handleEditClick}
      />
    </div>
  );
}
