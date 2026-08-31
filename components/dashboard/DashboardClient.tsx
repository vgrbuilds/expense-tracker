'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ExpenseList from '@/components/dashboard/ExpenseList';
import CategoryPieChart from '@/components/dashboard/CategoryPieChart';
import PaymentMethodBarChart from '@/components/dashboard/PaymentMethodBarChart';
import SummaryCards from '@/components/dashboard/SummaryCards';
import { Expense } from '@/types';
import { Sparkles, Calendar as CalendarIcon, ArrowRight, PlusCircle } from 'lucide-react';

interface DashboardClientProps {
  userName: string;
  allExpenses: Expense[];
}

export default function DashboardClient({
  userName,
  allExpenses,
}: DashboardClientProps) {
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

  // Last 10 Transactions preview
  const last10Expenses = useMemo(() => {
    return allExpenses.slice(0, 10);
  }, [allExpenses]);

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
          {/* Quick Add Expense Link */}
          <Link
            href="/transactions"
            className="bg-white text-sky-700 hover:bg-sky-50 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-sky-600" />
            <span>Add Transaction</span>
          </Link>

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

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart expenses={filteredPeriodExpenses} />
        <PaymentMethodBarChart expenses={filteredPeriodExpenses} />
      </div>

      {/* Last 10 Transactions Section Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Recent Transactions</h2>
            <p className="text-xs text-slate-400 font-medium">Previewing your last 10 expense records</p>
          </div>
          <Link
            href="/transactions"
            className="flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-700 transition px-3 py-1.5 rounded-xl hover:bg-sky-50"
          >
            <span>View All Transactions</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ExpenseList expenses={last10Expenses} />
      </div>
    </div>
  );
}
