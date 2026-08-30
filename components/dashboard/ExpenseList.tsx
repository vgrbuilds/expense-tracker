'use client';

import { useState } from 'react';
import { Expense } from '@/types';
import { deleteExpense } from '@/app/actions/expense-actions';
import { Trash2, Calendar, CreditCard, Tag, AlertCircle } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
}

export default function ExpenseList({ expenses }: ExpenseListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    setDeletingId(id);
    setError(null);
    const result = await deleteExpense(id);
    setDeletingId(null);

    if (result?.error) {
      setError(result.error);
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <p className="text-slate-500 font-medium">No expense records found.</p>
        <p className="text-slate-400 text-sm mt-1">
          Add your first expense above to start tracking.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-base font-bold text-slate-800">Recent Expense Transactions</h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full">
          {expenses.length} Records
        </span>
      </div>

      {error && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
            <tr>
              <th className="px-5 py-3.5">Title</th>
              <th className="px-5 py-3.5">Category</th>
              <th className="px-5 py-3.5">Payment Method</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5 text-right">Amount</th>
              <th className="px-5 py-3.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {expenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-slate-50/80 transition">
                <td className="px-5 py-4 font-medium text-slate-900">{expense.title}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-semibold">
                    <Tag className="w-3.5 h-3.5" />
                    {expense.category}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold">
                    <CreditCard className="w-3.5 h-3.5" />
                    {expense.payment_method}
                  </span>
                </td>
                <td className="px-5 py-4 text-slate-500">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {expense.date}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-bold text-slate-900">
                  ₹{Number(expense.amount).toFixed(2)}
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={deletingId === expense.id}
                    title="Delete expense"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
