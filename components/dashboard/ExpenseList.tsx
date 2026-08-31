'use client';

import { useState, useMemo } from 'react';
import { Expense } from '@/types';
import { deleteExpense } from '@/app/actions/expense-actions';
import { formatINR, exportExpensesToCSV } from '@/lib/utils';
import {
  Trash2,
  Edit3,
  Calendar,
  CreditCard,
  Tag,
  User,
  Repeat,
  AlertCircle,
  CheckCircle2,
  Store,
  Search,
  Download,
  Filter,
  X,
} from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onEditExpense?: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, onEditExpense }: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<string>('ALL');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('ALL');

  // Extract unique categories in current expense list for filtering
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    expenses.forEach((e) => {
      if (e.category) cats.add(e.category);
    });
    return Array.from(cats).sort();
  }, [expenses]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      // Search match
      const query = searchQuery.toLowerCase().trim();
      const matchSearch =
        !query ||
        e.category.toLowerCase().includes(query) ||
        (e.description && e.description.toLowerCase().includes(query)) ||
        (e.title && e.title.toLowerCase().includes(query)) ||
        (e.vendor && e.vendor.toLowerCase().includes(query)) ||
        (e.spent_for && e.spent_for.toLowerCase().includes(query));

      // Category match
      const matchCategory = selectedCategory === 'ALL' || e.category === selectedCategory;

      // Payment Method match
      const matchPayment = selectedPayment === 'ALL' || e.payment_method === selectedPayment;

      // Frequency match
      const matchFreq =
        selectedFrequency === 'ALL' ||
        (selectedFrequency === 'RECURRING' && e.is_recurring) ||
        (selectedFrequency === 'ONETIME' && !e.is_recurring);

      return matchSearch && matchCategory && matchPayment && matchFreq;
    });
  }, [expenses, searchQuery, selectedCategory, selectedPayment, selectedFrequency]);

  async function handleDelete(id: string) {
    if (!confirm('SpendWise says: Are you sure you want to delete this expense transaction?')) return;

    setDeletingId(id);
    setNotification(null);
    const result = await deleteExpense(id);
    setDeletingId(null);

    if (result?.error) {
      setNotification({ type: 'error', text: result.error });
    } else {
      setNotification({ type: 'success', text: result?.message || 'SpendWise says: Expense deleted.' });
    }
  }

  function handleExportCSV() {
    exportExpensesToCSV(filteredExpenses);
  }

  function clearFilters() {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedPayment('ALL');
    setSelectedFrequency('ALL');
  }

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'ALL' ||
    selectedPayment !== 'ALL' ||
    selectedFrequency !== 'ALL';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* Header & Controls Bar */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">Expense Transactions</h3>
          <p className="text-xs text-slate-400 font-medium">
            Showing {filteredExpenses.length} of {expenses.length} records
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={filteredExpenses.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl transition border border-slate-200 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-slate-50/60 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="lg:col-span-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search category, vendor, description..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs outline-none text-slate-800 bg-white"
          />
        </div>

        {/* Category Filter */}
        <div className="lg:col-span-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs outline-none text-slate-800 bg-white font-medium"
          >
            <option value="ALL">All Categories</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Filter */}
        <div className="lg:col-span-2">
          <select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs outline-none text-slate-800 bg-white font-medium"
          >
            <option value="ALL">All Payments</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>
        </div>

        {/* Frequency Filter */}
        <div className="lg:col-span-2">
          <select
            value={selectedFrequency}
            onChange={(e) => setSelectedFrequency(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-xs outline-none text-slate-800 bg-white font-medium"
          >
            <option value="ALL">All Types</option>
            <option value="RECURRING">Recurring</option>
            <option value="ONETIME">One-time</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="lg:col-span-1 flex items-center justify-end">
            <button
              onClick={clearFilters}
              title="Clear active filters"
              className="p-2 text-slate-400 hover:text-slate-700 bg-white border border-slate-200 rounded-xl transition text-xs flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Reset
            </button>
          </div>
        )}
      </div>

      {notification && (
        <div
          className={`m-4 p-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium ${
            notification.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {filteredExpenses.length === 0 ? (
        <div className="p-8 text-center bg-white">
          <p className="text-slate-500 font-semibold text-sm">
            {expenses.length === 0
              ? 'SpendWise says: No expense records found.'
              : 'SpendWise says: No expenses match your current filters.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-2 text-xs font-semibold text-sky-600 hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Vendor</th>
                <th className="px-5 py-3.5">Spent For</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold">
                      <Tag className="w-3.5 h-3.5" />
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-extrabold text-slate-900 tracking-tight">
                    {formatINR(Number(expense.amount))}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {expense.date}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-800 max-w-[200px] truncate">
                    {expense.description || expense.title || <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {expense.vendor ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                        <Store className="w-3.5 h-3.5 text-slate-400" />
                        {expense.vendor}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
                      <User className="w-3 h-3 text-slate-400" />
                      {expense.spent_for || 'Self'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                      <CreditCard className="w-3 h-3" />
                      {expense.payment_method || 'Online'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {expense.is_recurring ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
                        <Repeat className="w-3 h-3" />
                        Recurring
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                        One-time
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {onEditExpense && (
                        <button
                          onClick={() => onEditExpense(expense)}
                          title="Edit expense"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(expense.id)}
                        disabled={deletingId === expense.id}
                        title="Delete expense"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
