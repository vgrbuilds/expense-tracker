'use client';

import { useState, useRef } from 'react';
import { addExpense } from '@/app/actions/expense-actions';
import { ExpenseCategory, PaymentMethod } from '@/types';
import { PlusCircle, AlertCircle } from 'lucide-react';

const CATEGORIES: ExpenseCategory[] = [
  'Grocery',
  'Utilities',
  'Rent',
  'Dining Out',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Others',
];

const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'Credit Card', 'UPI'];

export default function ExpenseForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayDate] = useState(() => new Date().toISOString().split('T')[0]);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = await addExpense(formData);
    setLoading(false);

    if (result?.error) {
      setError(result.error);
    } else {
      formRef.current?.reset();
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-sky-600" />
        Add New Expense
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Expense Description
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Weekly Groceries"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Amount ($)
          </label>
          <input
            type="number"
            name="amount"
            step="0.01"
            min="0.01"
            required
            placeholder="0.00"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            defaultValue={todayDate}
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Category
          </label>
          <select
            name="category"
            defaultValue="Grocery"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
            Payment Method
          </label>
          <select
            name="payment_method"
            defaultValue="Credit Card"
            required
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50"
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2 lg:col-span-6 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-medium rounded-xl transition shadow-sm shadow-sky-100 flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? 'Adding Expense...' : 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
