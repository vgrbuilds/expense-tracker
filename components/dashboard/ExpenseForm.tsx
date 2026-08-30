'use client';

import { useState, useRef, useEffect } from 'react';
import { addExpense, updateExpense } from '@/app/actions/expense-actions';
import { ExpenseCategory, PaymentMethod, Expense } from '@/types';
import { PlusCircle, Edit3, AlertCircle, CheckCircle2, X } from 'lucide-react';

const PRESET_CATEGORIES: ExpenseCategory[] = [
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

const PAYMENT_METHODS: PaymentMethod[] = ['Online', 'Offline'];

interface ExpenseFormProps {
  editingExpense?: Expense | null;
  onCancelEdit?: () => void;
}

export default function ExpenseForm({ editingExpense, onCancelEdit }: ExpenseFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Form Field States
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Grocery');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Online');
  const [spentFor, setSpentFor] = useState<string>('Self');
  const [isRecurring, setIsRecurring] = useState<boolean>(true); // Default is recurring

  // Populate form when editingExpense changes
  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setDate(editingExpense.date);
      if (PRESET_CATEGORIES.includes(editingExpense.category)) {
        setSelectedCategory(editingExpense.category);
        setCustomCategory('');
      } else {
        setSelectedCategory('Others');
        setCustomCategory(editingExpense.category);
      }
      setPaymentMethod(editingExpense.payment_method || 'Online');
      setSpentFor(editingExpense.spent_for || 'Self');
      setIsRecurring(editingExpense.is_recurring ?? true);
      setNotification(null);
    } else {
      resetForm();
    }
  }, [editingExpense]);

  function resetForm() {
    setTitle('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedCategory('Grocery');
    setCustomCategory('');
    setPaymentMethod('Online');
    setSpentFor('Self');
    setIsRecurring(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('amount', amount);
    formData.append('date', date);
    formData.append('payment_method', paymentMethod);
    formData.append('spent_for', spentFor);
    formData.append('is_recurring', isRecurring ? 'true' : 'false');

    // Calculate final category
    const finalCategory =
      selectedCategory === 'Others'
        ? customCategory.trim() !== ''
          ? customCategory.trim()
          : 'Others'
        : selectedCategory;
    formData.append('category', finalCategory);

    let result;
    if (editingExpense) {
      result = await updateExpense(editingExpense.id, formData);
    } else {
      result = await addExpense(formData);
    }

    setLoading(false);

    if (result?.error) {
      setNotification({ type: 'error', text: result.error });
    } else {
      setNotification({
        type: 'success',
        text: result?.message || (editingExpense ? 'SpendWise says: Expense updated successfully!' : 'SpendWise says: Expense saved successfully!'),
      });

      if (editingExpense && onCancelEdit) {
        setTimeout(() => {
          onCancelEdit();
        }, 800);
      } else {
        resetForm();
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          {editingExpense ? (
            <>
              <Edit3 className="w-5 h-5 text-amber-600" />
              Edit Expense Transaction
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5 text-sky-600" />
              Add New Expense
            </>
          )}
        </h2>

        {editingExpense && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <X className="w-4 h-4" /> Cancel Edit
          </button>
        )}
      </div>

      {notification && (
        <div
          className={`mb-4 p-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium ${
            notification.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Title Field */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Monthly Rent, Electricity Bill, Groceries"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50"
            />
          </div>

          {/* Amount Field (Rupees) */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Amount (Rupees / ₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50"
            />
          </div>

          {/* Date Field */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50"
            />
          </div>

          {/* Category Field */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50"
            >
              {PRESET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Field (Online / Offline) */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
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

          {/* Spent For Field */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Spent For
            </label>
            <input
              type="text"
              value={spentFor}
              onChange={(e) => setSpentFor(e.target.value)}
              required
              placeholder="e.g. Self, Family, Home, Friend"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none text-slate-800 bg-slate-50/50"
            />
          </div>

          {/* Frequency / Recurring Toggle (Default: Recurring) */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Expense Frequency
            </label>
            <div className="flex items-center gap-4 py-2">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="radio"
                  name="recurringRadio"
                  checked={isRecurring}
                  onChange={() => setIsRecurring(true)}
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <span>Recurring (Every Month)</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="radio"
                  name="recurringRadio"
                  checked={!isRecurring}
                  onChange={() => setIsRecurring(false)}
                  className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <span>One-time</span>
              </label>
            </div>
          </div>
        </div>

        {/* Custom Category input if 'Others' selected */}
        {selectedCategory === 'Others' && (
          <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-100 animate-fadeIn">
            <label className="block text-xs font-semibold uppercase text-sky-700 mb-1">
              Custom Category Name
            </label>
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Type your custom category (e.g. Subscriptions, Gifts, Insurance)..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-sky-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm outline-none text-slate-800 bg-white"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          {editingExpense && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition border border-slate-200"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 text-white font-medium rounded-xl transition shadow-sm text-sm disabled:opacity-50 flex items-center gap-2 ${
              editingExpense
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-100'
                : 'bg-sky-600 hover:bg-sky-700 shadow-sky-100'
            }`}
          >
            {loading
              ? editingExpense
                ? 'Updating Expense...'
                : 'Saving Expense...'
              : editingExpense
              ? 'Update Expense'
              : 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
