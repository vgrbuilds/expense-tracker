'use client';

import { useState, useMemo } from 'react';
import ExpenseForm from '@/components/dashboard/ExpenseForm';
import ExpenseList from '@/components/dashboard/ExpenseList';
import CategoryPieChart from '@/components/dashboard/CategoryPieChart';
import PaymentMethodBarChart from '@/components/dashboard/PaymentMethodBarChart';
import SummaryCards from '@/components/dashboard/SummaryCards';
import CategoryVendorModal from '@/components/dashboard/CategoryVendorModal';
import { Expense } from '@/types';
import { Sparkles, Calendar as CalendarIcon, Settings2 } from 'lucide-react';

interface DashboardClientProps {
  userName: string;
  allExpenses: Expense[];
  userCustomCategories: string[];
  userCustomVendors: string[];
  hiddenCategories?: string[];
  hiddenVendors?: string[];
}

export default function DashboardClient({
  userName,
  allExpenses,
  userCustomCategories,
  userCustomVendors,
  hiddenCategories = [],
  hiddenVendors = [],
}: DashboardClientProps) {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  // Period Selector State: 'CURRENT_MONTH' | 'PREV_MONTH' | 'ALL_TIME' | string ('YYYY-MM')
  const [selectedPeriod, setSelectedPeriod] = useState<string>('CURRENT_MONTH');

  const now = new Date();

  // Compute available months list from user's expense dates
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(currentKey);

    allExpenses.forEach((e) => {
      if (e.date) {
        const d = new Date(e.date);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthSet.add(key);
        }
      }
    });

    return Array.from(monthSet).sort().reverse();
  }, [allExpenses]);

  // Determine target Year & Month based on selectedPeriod
  const { targetYear, targetMonth, periodLabel } = useMemo(() => {
    if (selectedPeriod === 'ALL_TIME') {
      return { targetYear: null, targetMonth: null, periodLabel: 'All-Time Financial Overview' };
    }

    let targetDate = new Date();
    if (selectedPeriod === 'PREV_MONTH') {
      targetDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    } else if (selectedPeriod !== 'CURRENT_MONTH') {
      const [y, m] = selectedPeriod.split('-').map(Number);
      if (y && m) {
        targetDate = new Date(y, m - 1, 1);
      }
    }

    const y = targetDate.getFullYear();
    const m = targetDate.getMonth();
    const label = targetDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    return { targetYear: y, targetMonth: m, periodLabel: `${label} Financial Overview` };
  }, [selectedPeriod]);

  // Filter expenses for selected period (including Recurring logic!)
  const filteredPeriodExpenses = useMemo(() => {
    if (targetYear === null || targetMonth === null) {
      return allExpenses;
    }

    return allExpenses.filter((e) => {
      const expenseDate = new Date(e.date);
      const expYear = expenseDate.getFullYear();
      const expMonth = expenseDate.getMonth();

      const isExactMonth = expYear === targetYear && expMonth === targetMonth;
      const isRecurringActive =
        e.is_recurring &&
        (expYear < targetYear || (expYear === targetYear && expMonth <= targetMonth));

      return isExactMonth || isRecurringActive;
    });
  }, [allExpenses, targetYear, targetMonth]);

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
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-sky-900/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide text-sky-100 mb-3 border border-white/15">
            <Sparkles className="w-3.5 h-3.5" /> {periodLabel}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Hello, {userName}
          </h1>
          <p className="text-sky-100 text-sm mt-1.5 max-w-xl">
            Track expenses, manage recurring monthly budgets, and analyze spending patterns cleanly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto">
          {/* Manage Categories & Vendors Button */}
          <button
            onClick={() => setIsOptionsModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
          >
            <Settings2 className="w-4 h-4 text-sky-200" />
            <span>Manage Options</span>
          </button>

          {/* Period Selector Dropdown */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-2xl flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-sky-200 ml-2" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-white font-semibold text-xs py-1.5 pr-4 outline-none cursor-pointer text-slate-900"
              style={{ color: 'white' }}
            >
              <option value="CURRENT_MONTH" className="text-slate-900 font-medium">
                📅 Current Month ({now.toLocaleString('default', { month: 'short' })})
              </option>
              <option value="PREV_MONTH" className="text-slate-900 font-medium">
                ⏪ Previous Month
              </option>
              <option value="ALL_TIME" className="text-slate-900 font-medium">
                🌐 All-Time Summary
              </option>
              <optgroup label="Select Specific Month" className="text-slate-900 font-bold">
                {availableMonths.map((mKey) => {
                  const [y, m] = mKey.split('-').map(Number);
                  const d = new Date(y, m - 1, 1);
                  const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
                  return (
                    <option key={mKey} value={mKey} className="text-slate-900 font-medium">
                      {label}
                    </option>
                  );
                })}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <SummaryCards expenses={filteredPeriodExpenses} />

      {/* Expense Addition & Editing Form */}
      <ExpenseForm
        editingExpense={editingExpense}
        onCancelEdit={handleCancelEdit}
        userCustomCategories={userCustomCategories}
        userCustomVendors={userCustomVendors}
      />

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart expenses={filteredPeriodExpenses} />
        <PaymentMethodBarChart expenses={filteredPeriodExpenses} />
      </div>

      {/* Expenses Table */}
      <ExpenseList
        expenses={allExpenses}
        onEditExpense={handleEditClick}
      />

      {/* Options Management Modal */}
      <CategoryVendorModal
        isOpen={isOptionsModalOpen}
        onClose={() => setIsOptionsModalOpen(false)}
        userCustomCategories={userCustomCategories}
        userCustomVendors={userCustomVendors}
        hiddenCategories={hiddenCategories}
        hiddenVendors={hiddenVendors}
      />
    </div>
  );
}
