'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { deleteExpense } from '@/app/actions/expense-actions';
import { Trash2, Edit3, Calendar, CreditCard, Tag, User, Repeat, AlertCircle, CheckCircle2, Store } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onEditExpense?: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, onEditExpense }: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

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

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <p className="text-slate-500 font-medium">SpendWise says: No expense records found.</p>
        <p className="text-slate-400 text-sm mt-1">
          Add your first expense above to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-800">Expense Transactions</h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
          {expenses.length} Records
        </span>
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
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-slate-50/80 transition">
                <td className="px-5 py-4 font-semibold text-slate-900">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    {expense.category}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-bold text-slate-900">
                  ₹{Number(expense.amount).toFixed(2)}
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
    </div>
  );
}
